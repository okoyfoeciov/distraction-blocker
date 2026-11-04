"use strict";

const HACKER_NEWS_RULE_ID = 1001;
const HACKER_NEWS_ALARM = "hacker-news-schedule";
const BLOCK_START_HOUR = 10;
const BLOCK_END_HOUR = 22;

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

/**
 * The window is [10:00, 22:00) in the browser's local time zone.
 */
function isBlockWindow(date = new Date()) {
  const hour = date.getHours();
  return hour >= BLOCK_START_HOUR && hour < BLOCK_END_HOUR;
}

/**
 * Find the next time the block state should change.
 */
function nextTransition(from = new Date()) {
  const candidates = [];

  for (const dayOffset of [0, 1]) {
    for (const hour of [BLOCK_START_HOUR, BLOCK_END_HOUR]) {
      const candidate = new Date(from);
      candidate.setDate(candidate.getDate() + dayOffset);
      candidate.setHours(hour, 0, 0, 0);

      if (candidate.getTime() > from.getTime()) {
        candidates.push(candidate);
      }
    }
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0];
}

async function scheduleNextTransition(now) {
  const next = nextTransition(now);
  await chrome.alarms.create(HACKER_NEWS_ALARM, { when: next.getTime() });
}

let syncInProgress = null;

function syncHackerNews(now = new Date()) {
  if (syncInProgress) return syncInProgress;

  syncInProgress = (async () => {
    const shouldBlock = isBlockWindow(now);
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleExists = rules.some((rule) => rule.id === HACKER_NEWS_RULE_ID);

    if (shouldBlock && !ruleExists) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [HACKER_NEWS_RULE_ID],
        addRules: [HACKER_NEWS_RULE],
      });
    } else if (!shouldBlock && ruleExists) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [HACKER_NEWS_RULE_ID],
      });
    }

    await scheduleNextTransition(now);
  })().finally(() => {
    syncInProgress = null;
  });

  return syncInProgress;
}

chrome.runtime.onInstalled.addListener(() => {
  void syncHackerNews();
});

chrome.runtime.onStartup.addListener(() => {
  void syncHackerNews();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === HACKER_NEWS_ALARM) {
    void syncHackerNews();
  }
});

void syncHackerNews();
