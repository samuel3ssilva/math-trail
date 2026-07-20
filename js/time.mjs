// Math Trail — local calendar time, centralized.
// "Today", streaks, day grouping and the daily-plan seed are all LOCAL-calendar
// concepts. Never derive them from `toISOString()` (UTC) — in America/Sao_Paulo
// that flips the date at 21:00 local and corrupts every daily feature.

/**
 * Local calendar date key, e.g. "2026-07-20".
 * @param {Date} [date] the instant to key (defaults to now — UI callers only;
 *                      domain code should always pass an explicit Date)
 */
export function localDateKey(date = new Date()){
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** The local calendar day a session belongs to (keyed by its timestamp). */
export function sessionDayKey(log){
  return log && log.timestamp ? localDateKey(new Date(log.timestamp)) : 'unknown';
}

/** `date` shifted by n whole days (local calendar, DST-safe via Date math on noon). */
export function addDays(date, n){
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + n, 12, 0, 0);
  return d;
}

/** True if two instants fall on the same local calendar day. */
export function isSameLocalDay(a, b){
  return localDateKey(a) === localDateKey(b);
}

/**
 * Whole minutes between session start and end, clamped to [1, maxMins].
 * A forgotten timer must never record an absurd duration.
 */
export function clampSessionMinutes(startIso, endMs, maxMins = 120){
  return Math.min(maxMins, Math.max(1, Math.round((endMs - new Date(startIso).getTime()) / 60000)));
}

/**
 * Turn an active session into a pending (finished-but-unsaved) session record.
 * Pure: the end instant is injected. Works across local midnight — the log's
 * own timestamps decide day grouping later, not this function.
 */
export function finishSession(active, endMs, maxMins = 120){
  return {
    window: active.window,
    activity: active.activity,
    startedAt: active.startedAt,
    endedAt: new Date(endMs).toISOString(),
    mins: clampSessionMinutes(active.startedAt, endMs, maxMins)
  };
}

/** mm:ss elapsed between two instants (for the session timer display). */
export function fmtElapsed(startIso, now = new Date()){
  const s = Math.max(0, Math.floor((now - new Date(startIso)) / 1000));
  const m = Math.floor(s / 60), r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}
