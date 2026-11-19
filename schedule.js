"use strict";

/**
 * Local-time windows for scheduled blocks. A window is [start, end); when
 * start is later than end it wraps past midnight.
 */
const HACKER_NEWS_HOURS = { start: 10, end: 6 };
const SUBSTACK_HOURS = { start: 10, end: 6 };

function isWithinBlockWindow(hours, date = new Date()) {
  const hour = date.getHours();

  if (hours.start < hours.end) {
    return hour >= hours.start && hour < hours.end;
  }

  return hour >= hours.start || hour < hours.end;
}

/**
 * Find the next time the block state for a window should change.
 */
function nextWindowTransition(hours, from = new Date()) {
  const candidates = [];

  for (const dayOffset of [0, 1]) {
    for (const hour of [hours.start, hours.end]) {
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
