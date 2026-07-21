// Math Trail — synthetic demo-data generator.
// 100% SYNTHETIC by construction: every value is derived from the injected
// seeded RNG and base date. No real child, session, note or profile is used.
// The committed reference artifact lives in demo/generated/ (see
// scripts/generate-demo.mjs); the in-app `?demo=1` mode calls this directly.

import { WINDOWS } from './activities.mjs';

/** The demo child is a fictional placeholder, clearly not a real person. */
export const DEMO_PROFILE = Object.freeze({ name: '', birth: '2023-06', chapter: 4 });

/**
 * Version of the synthetic demo dataset. Bumped when the demo's shape changes
 * so returning `?demo=1` visitors get a safe, scoped migration instead of stale
 * state. v1 shipped a named placeholder ("Alex"); v2 shows the product name.
 */
export const DEMO_DATA_VERSION = 2;

// The exact v1 demo profile. Only this fingerprint is normalized — anything
// else is left untouched, so a real profile is never altered.
const DEMO_V1_PROFILE = { name: 'Alex', birth: '2023-06', chapter: 4 };

/**
 * Migrate a stale synthetic demo profile so the header shows the product name.
 * PURE and conservative: it only rewrites the recognizable v1 demo profile
 * (name "Alex" + the demo's exact birth/chapter), and only the name. A real
 * profile — or an already-current one — is returned unchanged. Runs solely in
 * `?demo=1` mode; it never clears logs, settings or any real data.
 *
 * @param {object|null} profile the stored profile
 * @param {number|string|null} storedVersion the persisted demoDataVersion
 * @returns {{profile: object, version: number, changed: boolean}}
 */
export function migrateDemoProfile(profile, storedVersion){
  const v = Number(storedVersion) || 0;
  if (v >= DEMO_DATA_VERSION) return { profile, version: v, changed: false };
  const isV1Demo = !!profile
    && profile.name === DEMO_V1_PROFILE.name
    && profile.birth === DEMO_V1_PROFILE.birth
    && Number(profile.chapter) === DEMO_V1_PROFILE.chapter;
  if (isV1Demo){
    return { profile: { ...profile, name: '' }, version: DEMO_DATA_VERSION, changed: true };
  }
  return { profile, version: DEMO_DATA_VERSION, changed: false };
}

/**
 * Generate ~3 weeks of synthetic session logs.
 * Deterministic: the same `baseDate` and `rng` always produce the same output.
 *
 * @param {{baseDate: Date, rng: () => number, days?: number}} opts
 * @returns {{logs: object[], profile: object, synthetic: true}}
 */
export function generateDemoData({ baseDate, rng, days = 21 }){
  const winKeys = ['morning', 'afternoon', 'bedtime'];
  const logs = [];
  for (let d = days - 1; d >= 0; d--){
    const nSess = rng() < 0.25 ? 0 : (rng() < 0.6 ? 1 : 2);
    for (let k = 0; k < nSess; k++){
      const win = winKeys[Math.floor(rng() * 3)];
      const pool = WINDOWS[win].pool.filter(id => id !== 'two_dice_counton');
      const act = pool[Math.floor(rng() * pool.length)];
      const date = new Date(baseDate.getTime() - d * 86400000 - (k ? 3600000 * (2 + k) : 0));
      const r = rng();
      logs.push({
        id: date.getTime(), timestamp: date.toISOString(), window: win, activity: act,
        completion: r < 0.62 ? 'full' : r < 0.9 ? 'partial' : 'refused',
        engagement: r < 0.55 ? 'excited' : r < 0.88 ? 'neutral' : 'resisted',
        ease: rng() < 0.2 ? 'too_easy' : rng() < 0.12 ? 'too_hard' : 'just_right',
        reward: rng() < 0.75 ? 'intrinsic' : rng() < 0.6 ? 'connection' : 'extrinsic',
        mins: 2 + Math.floor(rng() * 6),
        notes: ''
      });
    }
  }
  return { logs, profile: { ...DEMO_PROFILE }, synthetic: true };
}
