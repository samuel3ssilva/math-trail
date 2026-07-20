// Math Trail — adaptive engine. Pure functions only: no DOM, no storage.
// State transitions are deterministic so history can be replayed after edits.

import { ACTIVITIES, COMPOSITION_IDS, MILESTONES } from './activities.mjs';

export function defaultState(){
  return { camouflageActive:false, camouflageLeft:0, cooldownActive:false, cooldownUntil:null,
           diceMastered:false, levels:{}, easyStreak:{}, masteredActs:{} };
}

export function getLevel(state, actId){
  if(state.levels && state.levels[actId]) return state.levels[actId];
  return ACTIVITIES[actId]?.startLevel || 1;
}

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
      else if(act.category==='composition'){
        // Already at the floor → rest the whole category for 48h
        const u=new Date(log.timestamp||Date.now()); u.setHours(u.getHours()+48);
        ns.cooldownActive=true; ns.cooldownUntil=u.toISOString();
      }
    } else {
      ns.easyStreak[id]=0;
    }
    // Dice mastery gate → unlocks Two-Dice Count-On
    if(ns.masteredActs['dice_flash'] || (id==='dice_flash' && getLevel(ns,'dice_flash')>=3 && log.ease==='too_easy'))
      ns.diceMastered=true;
  }

  if(ns.cooldownActive && ns.cooldownUntil && new Date()>new Date(ns.cooldownUntil)){
    ns.cooldownActive=false; ns.cooldownUntil=null;
  }
  return ns;
}

// Full deterministic replay — used after edits/deletes/imports
export function replayState(logs){
  let s=defaultState();
  logs.forEach((log,i)=>{ s=applyLog(s, log, logs.slice(0,i)); });
  return s;
}

export function checkRewardAlert(logs){
  if(logs.length<5) return false;
  const ext=logs.filter(l=>l.reward==='extrinsic');
  const intr=logs.filter(l=>l.reward!=='extrinsic'); // play itself or connection
  if(ext.length<3) return false;
  const er=ext.filter(l=>l.engagement==='resisted'||l.completion==='refused').length/ext.length;
  const ir=intr.length?intr.filter(l=>l.engagement==='resisted'||l.completion==='refused').length/intr.length:0;
  return er-ir>=0.30;
}

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

export function weightedPick(scored, rng){
  rng=rng||Math.random;
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

// Score a window's activity pool: weight x chapter focus x current gap x recency.
// Pure: all inputs are explicit; `tr` translates reason strings (defaults to key).
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
