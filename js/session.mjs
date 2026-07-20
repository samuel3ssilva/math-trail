// Pending-session controller — PURE decisions about a finished-but-unsaved
// capture. No DOM, no storage, no clock of its own: every input is passed in,
// so the whole lifecycle is testable without a browser (PR review P1-1).
//
// The one rule that matters: a session belongs to the instant it ENDED, not to
// the instant the parent got around to saving it. Ending a session at 23:50 and
// saving it at 00:10 must still file it under the day it happened (P0-1).

import { ACTIVITIES, WINDOWS } from './activities.mjs';

// Derived from the canonical catalog rather than re-typed, and named uniquely:
// the standalone bundle concatenates every module into one scope.
const SESSION_WINDOWS = new Set(Object.keys(WINDOWS));
const SESSION_MINS_MAX = 1440; // same ceiling as storage.MINS_MAX (kept local to avoid an import cycle)

/**
 * The timestamp a new log must carry.
 * @param {object|null} pending the pending session being saved, if any
 * @param {Date} now injected clock — used ONLY for a manual entry with no pending session
 * @returns {string} ISO instant
 */
export function logTimestampFor(pending, now){
  const ended = pending && pending.endedAt;
  if (typeof ended === 'string' && Number.isFinite(Date.parse(ended))) return ended;
  return now.toISOString();
}

/**
 * What the UI must do on start-up when a pending session exists.
 * @returns {null|{tab:string, window:string, activity:string, mins:number|undefined, notice:true}}
 */
export function pendingRestore(pending){
  if (!pending || typeof pending !== 'object') return null;
  return {
    tab: 'log',
    window: pending.window,
    activity: pending.activity,
    mins: typeof pending.mins === 'number' ? pending.mins : undefined,
    notice: true
  };
}

/**
 * May a new session start? Not while a capture is still waiting to be saved —
 * starting one would strand the earlier capture.
 * @returns {{ok:true}|{ok:false, reason:'pending_unsaved'}}
 */
export function canStartSession(pending){
  return pending ? { ok:false, reason:'pending_unsaved' } : { ok:true };
}

/**
 * Discarding is destructive and always needs an explicit confirmation.
 * @param {boolean} confirmed result of the human confirmation step
 */
export function discardPending(confirmed){
  return confirmed ? { ok:true, clear:true } : { ok:false, reason:'not_confirmed', clear:false };
}

/**
 * Validate + normalize a pending session arriving from an imported backup.
 * Allowlist only: extra fields (including `__proto__` tricks) never survive.
 * @returns {{ok:true, pending:object}|{ok:false, reason:string}}
 */
export function validatePendingSession(p){
  if (!p || typeof p !== 'object' || Array.isArray(p)) return { ok:false, reason:'pending_not_object' };
  if (!SESSION_WINDOWS.has(p.window)) return { ok:false, reason:'pending_invalid_window' };
  if (typeof p.activity !== 'string' || !(p.activity in ACTIVITIES)) return { ok:false, reason:'pending_unknown_activity' };

  const started = typeof p.startedAt === 'string' ? Date.parse(p.startedAt) : NaN;
  const ended = typeof p.endedAt === 'string' ? Date.parse(p.endedAt) : NaN;
  if (!Number.isFinite(started)) return { ok:false, reason:'pending_invalid_startedAt' };
  if (!Number.isFinite(ended)) return { ok:false, reason:'pending_invalid_endedAt' };
  if (ended < started) return { ok:false, reason:'pending_ends_before_start' };
  if (typeof p.mins !== 'number' || !Number.isFinite(p.mins) || p.mins < 0 || p.mins > SESSION_MINS_MAX){
    return { ok:false, reason:'pending_invalid_mins' };
  }
  return { ok:true, pending: {
    window: p.window, activity: p.activity,
    startedAt: p.startedAt, endedAt: p.endedAt, mins: p.mins
  } };
}

/**
 * Decide what an import should do with the backup's pending session.
 * Never silently overwrites: a capture the parent has not saved yet is theirs,
 * and the backup's copy is not automatically more correct (PR review P0-2).
 *
 * @param {object|undefined} backupPending raw value from the backup
 * @param {object|null} localPending this device's current pending session
 * @returns {{action:'none'|'restore'|'conflict'|'reject', pending?:object, reason?:string}}
 */
export function reconcilePendingSession(backupPending, localPending){
  if (backupPending === undefined || backupPending === null) return { action:'none' };
  const check = validatePendingSession(backupPending);
  if (!check.ok) return { action:'reject', reason: check.reason };
  if (localPending) return { action:'conflict', reason:'local_pending_kept', pending: check.pending };
  return { action:'restore', pending: check.pending };
}
