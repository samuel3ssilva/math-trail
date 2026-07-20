// Math Trail — adaptive engine.
// Pure functions only: no DOM, no storage, no wall clock, no ambient randomness.
// Architecture (see docs/adr/0002-clock-injection.md):
//   historicalState = replayState(logs)            — clock-free fold over the log
//   effectiveState  = evaluateTemporalRules(s, now) — time-dependent rules applied at read time
// The same logs + the same `now` always produce exactly the same result.

import { ACTIVITIES, COMPOSITION_IDS, MILESTONES } from './activities.mjs';

/** Hours a composition ("part-part-whole") cooldown lasts. */
export const COOLDOWN_HOURS = 48;

/** @returns {object} the initial adaptive state */
export function defaultState(){
  return { camouflageActive:false, camouflageLeft:0, cooldownActive:false, cooldownUntil:null,
           diceMastered:false, levels:{}, easyStreak:{}, masteredActs:{} };
}

/**
 * Current difficulty level (1–3) for an activity.
 * @param {object} state adaptive state
 * @param {string} actId activity id
 */
export function getLevel(state, actId){
  if(state.levels && state.levels[actId]) return state.levels[actId];
  return ACTIVITIES[actId]?.startLevel || 1;
}

/**
 * Fold one session log into the adaptive state. Pure and clock-free:
 * every timestamp used comes from the log itself, never from the wall clock.
 * A log without a timestamp cannot start a cooldown (documented limitation).
 *
 * @param {object} s        state before this log
 * @param {object} log      the session being applied
 * @param {object[]} priorLogs logs that came before `log`, in order
 * @returns {object} the state after this log
 */
export function applyLog(s, log, priorLogs){
  const ns=JSON.parse(JSON.stringify(s));
  ns.levels=ns.levels||{}; ns.easyStreak=ns.easyStreak||{}; ns.masteredActs=ns.masteredActs||{};
  const act=ACTIVITIES[log.activity];

  // Camouflage: burn a session if active and engagement improved
  if(ns.camouflageActive && log.engagement!=='resisted'){
    ns.camouflageLeft=Math.max(0,ns.camouflageLeft-1);
    if(ns.camouflageLeft===0) ns.camouflageActive=false;
  }
  // Trigger camouflage: ≥2 resisted within the last 3 sessions (incl. this one)
  const last3=[...priorLogs.slice(-2), log];
  if(last3.filter(l=>l.engagement==='resisted').length>=2){
    ns.camouflageActive=true; ns.camouflageLeft=3;
  }

  // Level auto-adjust for the played activity
  if(act){
    const id=log.activity;
    const lvl=getLevel(ns,id);
    if(log.ease==='too_easy' && log.completion!=='refused'){
      ns.easyStreak[id]=(ns.easyStreak[id]||0)+1;
      if(ns.easyStreak[id]>=2){
        if(lvl<3){ ns.levels[id]=lvl+1; ns.easyStreak[id]=0; }
        else { ns.masteredActs[id]=true; ns.easyStreak[id]=0; }
      }
    } else if(log.ease==='too_hard'){
      ns.easyStreak[id]=0;
      if(lvl>1){ ns.levels[id]=lvl-1; }
      else if(act.category==='composition' && log.timestamp){
        // Already at the floor → rest the whole category, anchored to the log's own time
        const u=new Date(log.timestamp); u.setHours(u.getHours()+COOLDOWN_HOURS);
        ns.cooldownActive=true; ns.cooldownUntil=u.toISOString();
      }
    } else {
      ns.easyStreak[id]=0;
    }
    // Unlock gate: Two-Dice Count-On requires Dice Flash MASTERY —
    // i.e. level 3 plus two consecutive valid "too easy" sessions.
    // See docs/adr/0001-two-dice-unlock-rule.md.
    if(ns.masteredActs['dice_flash']) ns.diceMastered=true;
  }

  return ns;
}

/**
 * Full deterministic replay — used after edits/deletes/imports.
 * Clock-free: replaying the same logs on any day yields an identical state.
 */
export function replayState(logs){
  let s=defaultState();
  logs.forEach((log,i)=>{ s=applyLog(s, log, logs.slice(0,i)); });
  return s;
}

/**
 * Apply time-dependent rules to a historical state at a given instant.
 * Today that means expiring cooldowns. Never mutates the input.
 *
 * @param {object} state historical state from replayState
 * @param {Date} now the instant to evaluate at (must be injected)
 * @returns {object} effective state at `now`
 */
export function evaluateTemporalRules(state, now){
  const ns=JSON.parse(JSON.stringify(state));
  if(ns.cooldownActive && ns.cooldownUntil && now > new Date(ns.cooldownUntil)){
    ns.cooldownActive=false; ns.cooldownUntil=null;
  }
  return ns;
}

/** Minimum sessions per group before the reward observation may be shown. */
export const REWARD_MIN_PER_GROUP = 5;
/** Minimum difference in resistance share to surface the observation. */
export const REWARD_MIN_DELTA = 0.30;

/**
 * Compare resistance across reward types — deliberately humble statistics.
 * This is a descriptive comparison of proportions in a small personal log:
 * NOT a correlation claim, NOT causal, NOT a diagnosis of any kind.
 *
 * @param {object[]} logs
 * @returns {{status:'insufficient'|'no_signal'|'observation',
 *            treatCount:number, otherCount:number,
 *            treatResistRate:number, otherResistRate:number}}
 */
export function rewardObservation(logs){
  const resisted = l => l.engagement==='resisted' || l.completion==='refused';
  const treat = logs.filter(l=>l.reward==='extrinsic');
  const other = logs.filter(l=>l.reward && l.reward!=='extrinsic'); // play itself or connection
  const base = { treatCount:treat.length, otherCount:other.length };
  if(treat.length < REWARD_MIN_PER_GROUP || other.length < REWARD_MIN_PER_GROUP){
    return { status:'insufficient', treatResistRate:0, otherResistRate:0, ...base };
  }
  const tr = treat.filter(resisted).length / treat.length;
  const or = other.filter(resisted).length / other.length;
  return {
    status: (tr - or) >= REWARD_MIN_DELTA ? 'observation' : 'no_signal',
    treatResistRate: tr, otherResistRate: or, ...base
  };
}

/** Milestone progress: only full sessions that were not "too hard" count. */
export function milestoneProgress(m, logs){
  if(m.pre) return {pct:100, good:0, sessions:0, done:true};
  const rel=logs.filter(l=>m.ids.includes(l.activity));
  const good=rel.filter(l=>l.completion==='full'&&l.ease!=='too_hard').length;
  const pct=Math.min(100,Math.round((good/m.target)*100));
  return {pct, good, sessions:rel.length, done:pct>=100};
}
export function currentFocus(logs){
  for(const m of MILESTONES){
    const p=milestoneProgress(m,logs);
    if(!p.done) return m;
  }
  return MILESTONES[MILESTONES.length-1];
}

/**
 * Weighted random pick. The RNG must be injected for reproducibility;
 * callers that want ambient randomness pass their own source explicitly.
 */
export function weightedPick(scored, rng){
  const total=scored.reduce((s,x)=>s+x.score,0);
  let r=rng()*total;
  for(const x of scored){ r-=x.score; if(r<=0) return x; }
  return scored[scored.length-1];
}

// ─────────────────────────────────────────────────────
// DAILY PLAN — one engine pick per window, stable all day
// ─────────────────────────────────────────────────────
export function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
export function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/**
 * Score a window's activity pool: weight × chapter focus × current gap × recency.
 * Pure: all inputs are explicit. `state` should be the EFFECTIVE state
 * (after evaluateTemporalRules) so cooldowns are honored correctly.
 * `tr` translates reason strings (defaults to identity).
 */
export function scoreActivities({pool, state, logs, profile, doneToday, excludeId, tr}){
  tr = tr || (k=>k);
  if(state.cooldownActive){
    pool=pool.filter(a=>!COMPOSITION_IDS.includes(a));
  }
  if(!state.diceMastered) pool=pool.filter(a=>a!=='two_dice_counton');
  // No repeats within the same day (across ALL windows) — unless nothing would remain
  const fresh=pool.filter(a=>!doneToday.has(a));
  if(fresh.length) pool=fresh;
  if(excludeId) pool=pool.filter(a=>a!==excludeId);

  const focus=currentFocus(logs);
  const lastLog=logs[logs.length-1];
  const recentIds=logs.slice(-3).map(l=>l.activity);

  return pool.map(id=>{
    const a=ACTIVITIES[id]; if(!a) return null;
    let score=a.weight||1;
    const reasons=[];
    if(profile.chapter && a.chapter && a.chapter.includes(Number(profile.chapter))){
      score*=2; reasons.push(tr('r_chapter').replace('{c}',profile.chapter));
    }
    if(focus && focus.ids.includes(id)){
      score*=1.6; reasons.push(tr('r_gap')+' '+focus.label);
    }
    if(lastLog && lastLog.activity===id){ score*=0.15; }
    else if(recentIds.includes(id)){ score*=0.5; }
    else if(lastLog && ACTIVITIES[lastLog.activity] && ACTIVITIES[lastLog.activity].category===a.category){ score*=0.7; }
    else if(logs.length){ reasons.push(tr('r_fresh')); }
    if(state.masteredActs && state.masteredActs[id]){ score*=0.4; }
    return {id, score, reasons};
  }).filter(Boolean);
}
