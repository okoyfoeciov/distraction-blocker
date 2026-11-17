"use strict";

importScripts("schedule.js");

const HACKER_NEWS_RULE_ID = 1001;
const SUBSTACK_RULE_ID = 1002;
const SUBSTACK_ALLOW_RULE_ID = 1003;
const HACKER_NEWS_ALARM = "hacker-news-schedule";
const SUBSTACK_ALARM = "substack-schedule";

/**
 * Dynamic mirrors of the static rules in rules.json. Chrome can keep serving
 * a stale static ruleset after an extension reload, but dynamic rule updates
 * take effect immediately.
 */
const ALWAYS_BLOCKED_RULE_ID_MIN = 10000;
const ALWAYS_BLOCKED_RULE_ID_MAX = 10999;

const HACKER_NEWS_RULE = {
  id: HACKER_NEWS_RULE_ID,
  priority: 1,
  action: {
    type: "redirect",
    redirect: {
      extensionPath: "/blocked-hacker-news.html",
    },
  },
  condition: {
    urlFilter: "||news.ycombinator.com^",
    resourceTypes: ["main_frame"],
  },
};

const SUBSTACK_RULE = {
  id: SUBSTACK_RULE_ID,
  priority: 2,
  action: {
    type: "redirect",
    redirect: {
      extensionPath: "/blocked.html",
    },
  },
  condition: {
    urlFilter: "||substack.com^",
    resourceTypes: ["main_frame"],
  },
};

/**
 * A higher-priority allow rule keeps Substack available outside its block
 * window, even if Chrome is still serving an older static redirect after a
 * reload.
 */
const SUBSTACK_ALLOW_RULE = {
  id: SUBSTACK_ALLOW_RULE_ID,
  priority: 2,
  action: {
    type: "allow",
  },
  condition: {
    urlFilter: "||substack.com^",
    resourceTypes: ["main_frame"],
  },
};

const SCHEDULES = [
  {
    alarm: HACKER_NEWS_ALARM,
    hours: HACKER_NEWS_HOURS,
    blockRule: HACKER_NEWS_RULE,
  },
  {
    alarm: SUBSTACK_ALARM,
    hours: SUBSTACK_HOURS,
    blockRule: SUBSTACK_RULE,
    allowRule: SUBSTACK_ALLOW_RULE,
  },
];

async function loadAlwaysBlockedRules() {
  const response = await fetch(chrome.runtime.getURL("rules.json"), {
    cache: "no-store",
  });
  const rules = await response.json();

  return rules.map((rule) => ({
    ...rule,
    id: ALWAYS_BLOCKED_RULE_ID_MIN + rule.id,
  }));
}

async function syncAlwaysBlockedRules() {
  const rules = await loadAlwaysBlockedRules();
  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
  const mirroredRuleIds = dynamicRules
    .map((rule) => rule.id)
    .filter(
      (id) => id >= ALWAYS_BLOCKED_RULE_ID_MIN && id <= ALWAYS_BLOCKED_RULE_ID_MAX,
    );

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: mirroredRuleIds,
    addRules: rules,
  });
}

let syncInProgress = null;

function syncScheduledRules(now = new Date()) {
  if (syncInProgress) return syncInProgress;

  syncInProgress = (async () => {
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = new Set(dynamicRules.map((rule) => rule.id));
    const addRules = [];
    const removeRuleIds = [];

    for (const { hours, blockRule, allowRule } of SCHEDULES) {
      const shouldBlock = isWithinBlockWindow(hours, now);
      const desiredRuleId = shouldBlock ? blockRule.id : allowRule?.id;
      const rules = allowRule ? [blockRule, allowRule] : [blockRule];

      for (const rule of rules) {
        if (rule.id === desiredRuleId) {
          if (!existingRuleIds.has(rule.id)) {
            addRules.push(rule);
          }
        } else if (existingRuleIds.has(rule.id)) {
          removeRuleIds.push(rule.id);
        }
      }
    }

    if (addRules.length > 0 || removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds,
        addRules,
      });
    }

    for (const { alarm, hours } of SCHEDULES) {
      const next = nextWindowTransition(hours, now);
      await chrome.alarms.create(alarm, { when: next.getTime() });
    }
  })().finally(() => {
    syncInProgress = null;
  });

  return syncInProgress;
}

chrome.runtime.onInstalled.addListener(() => {
  void syncScheduledRules();
});

chrome.runtime.onStartup.addListener(() => {
  void syncScheduledRules();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (SCHEDULES.some((schedule) => schedule.alarm === alarm.name)) {
    void syncScheduledRules();
  }
});

void syncAlwaysBlockedRules();
void syncScheduledRules();
