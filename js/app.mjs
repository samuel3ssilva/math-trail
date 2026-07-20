// Math Trail — UI layer: i18n, rendering, daily plan and session flow.
// Persistence lives in storage.mjs; domain rules live in engine.mjs;
// local-calendar time lives in time.mjs. This file only wires them to the DOM.
import { ACTIVITIES, CAT_LABEL, COMPOSITION_IDS, MINS, MILESTONES, WINDOWS } from './activities.mjs';
import { defaultState, getLevel, applyLog, replayState, rewardObservation,
         evaluateTemporalRules, milestoneProgress, currentFocus, weightedPick,
         hashStr, mulberry32, scoreActivities } from './engine.mjs';
import { localDateKey, sessionDayKey, addDays, fmtElapsed, finishSession } from './time.mjs';
import { makeRepo, migrateStore, importBackup, buildExport, appendLog, SCHEMA_VERSION } from './storage.mjs';
import { I18N } from './i18n.mjs';
import { logTimestampFor, pendingRestore, canStartSession, discardPending, promotedWindow } from './session.mjs';
import { generateDemoData, DEMO_PROFILE } from './demo.mjs';

// The app assumes common household manipulatives (interlocking cubes, small toy
// counters, dice, paper and pen) — see the activity catalog for what each uses.

const repo = makeRepo(localStorage);

// ─────────────────────────────────────────────────────
// I18N — PT / EN interface language
// ─────────────────────────────────────────────────────
let LANG=repo.getLang()||'pt';

function t(k){ const d=I18N[LANG]||I18N.en; return (d[k]!==undefined?d[k]:(I18N.en[k]!==undefined?I18N.en[k]:k)); }
// Milestones carry English fallbacks in data; the interface prefers i18n keys.
const msLabel=m=>{ const v=t('ms_'+m.id); return v!=='ms_'+m.id?v:m.label; };
const msDetail=m=>{ const v=t('msd_'+m.id); return v!=='msd_'+m.id?v:m.detail; };
function setLang(l){ LANG=l; repo.saveLang(l); applyLang(); }
function applyLang(){
  document.documentElement.lang = LANG==='pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML=t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.setAttribute('placeholder',t(el.getAttribute('data-i18n-ph'))); });
  // Accessible names are interface text too — they follow the language.
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label',t(el.getAttribute('data-i18n-aria'))); });
  const bp=document.getElementById('lang-pt'), be=document.getElementById('lang-en');
  if(bp&&be){ bp.classList.toggle('on',LANG==='pt'); be.classList.toggle('on',LANG==='en'); }
  buildActivitySelect(); buildPlanPickers(); renderHeader(); renderBanners(); renderWeekCard();
  renderLogList(); renderAnalytics(); renderSessionBar(); renderPendingNote();
  if(editingId!==null) document.getElementById('saveBtn').textContent=t('btn_update');
}

// Data migration from older key layouts happens via the standard backup
// import flow (Settings → Import JSON), never via hard-coded legacy keys —
// see docs/privacy.md ("no personal identifiers in code") and docs/decisions.md §5.
function migrate(){ try{ migrateStore(localStorage); }catch(e){} }

const getLogs=()=>repo.getLogs();
const saveLogs=(l)=>repo.saveLogs(l);

const DEFAULT_PROFILE={ name:'', birth:'2023-06', chapter:0 };
const getProfile=()=>repo.getProfile(DEFAULT_PROFILE);
const saveProfile=(p)=>repo.saveProfile(p);

// Effective state = historical state + temporal rules evaluated "now".
// The historical state on disk is never silently rewritten by the clock.
function getState(){
  const raw=Object.assign(defaultState(), repo.getStateRaw()||{});
  return evaluateTemporalRules(raw, new Date());
}
const saveState=(s)=>repo.saveState(s);

// ─────────────────────────────────────────────────────
// ENGINE v2 — apply one log to state (rolling-window rules)
// ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────
// GOAL / MILESTONE PROGRESS
// ─────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────
// SMART PICKER — weight × chapter × gap × recency
// ─────────────────────────────────────────────────────
let currentWindow=null, currentPick=null;

function doneTodayIds(){
  const today=localDateKey();
  return new Set(getLogs().filter(l=>sessionDayKey(l)===today).map(l=>l.activity));
}

// Plan tab pickers — one dropdown per window, done-today items locked
function buildPlanPickers(){
  const done=doneTodayIds();
  const today=localDateKey();
  const todayLogs=getLogs().filter(l=>sessionDayKey(l)===today);
  const plan=getDailyPlan();
  // One window carries the composition; the others stay available but quiet.
  const promoted=promotedWindow(new Date().getHours(), todayLogs.map(l=>l.window));
  Object.keys(WINDOWS).forEach(winKey=>{
    const block=document.getElementById('plan-'+winKey)?.closest('.winblock');
    if(block) block.classList.toggle('is-now', winKey===promoted);
    const more=document.getElementById('more-'+winKey);
    if(more) more.open = (winKey===promoted);
    const chip=document.getElementById('done-'+winKey);
    if(chip){
      const n=todayLogs.filter(l=>l.window===winKey).length;
      const act=getActive();
      if(act && act.window===winKey){
        chip.classList.remove('hidden'); chip.textContent='▶ '+t('chip_started');
      } else {
        chip.classList.toggle('hidden',!n);
        chip.textContent=t('done_win');
      }
    }
    const pb=document.getElementById('plan-'+winKey);
    if(pb){
      const a=ACTIVITIES[plan[winKey]];
      // Surface WHY this was picked: top reason from the live scoring pass.
      let reason='';
      if(a){
        const entry=scorePool(winKey,null).find(x=>x.id===plan[winKey]);
        if(entry&&entry.reasons.length) reason=`<span class="pwhy">${entry.reasons[0]}</span>`;
      }
      pb.innerHTML=a?`
        <span class="pcat" style="color:var(--c-${a.category})">${t('plan_pick')} · ${t('cat_'+a.category)}</span>
        <span class="pname">${a.name}</span>
        <span class="pmeta">${a.materials} · ~${MINS[plan[winKey]]||4} ${t('min_suffix')}</span>${reason}`
        :`<span class="pmeta">${t('no_pick')}</span>`;
    }
    const sel=document.getElementById('pick-'+winKey);
    if(!sel) return;
    const state=getState();
    const groups={};
    WINDOWS[winKey].pool.forEach(id=>{
      const a=ACTIVITIES[id]; if(!a) return;
      if(id==='two_dice_counton' && !state.diceMastered) return;
      (groups[a.category]=groups[a.category]||[]).push(id);
    });
    sel.innerHTML='<option value="">'+t('choose_act')+'</option>'+
      Object.entries(groups).map(([cat,ids])=>
        `<optgroup label="── ${t('cat_'+cat)} ──">`+
        ids.map(id=>{
          const isDone=done.has(id);
          return `<option value="${id}" ${isDone?'disabled':''}>${ACTIVITIES[id].name}${isDone?t('done_today'):''}</option>`;
        }).join('')+`</optgroup>`).join('');
  });
}
function pickFromList(winKey){
  const sel=document.getElementById('pick-'+winKey);
  const actId=sel.value; if(!actId) return;
  currentWindow=winKey; currentPick=actId;
  renderBlueprint(actId, winKey, [t('your_pick')]);
}


function scorePool(winKey, excludeId){
  return scoreActivities({
    pool:[...WINDOWS[winKey].pool], state:getState(), logs:getLogs(),
    profile:getProfile(), doneToday:doneTodayIds(), excludeId, tr:t
  });
}

function generateBlueprint(winKey){
  currentWindow=winKey;
  const sel=document.getElementById('pick-'+winKey); if(sel) sel.value='';
  const scored=scorePool(winKey, null);
  if(!scored.length) return;
  const pick=weightedPick(scored, Math.random); // UI layer: ambient RNG is explicit
  currentPick=pick.id;
  renderBlueprint(pick.id, winKey, pick.reasons);
}
function reroll(){
  if(!currentWindow) return;
  const scored=scorePool(currentWindow, currentPick);
  if(!scored.length) return;
  const pick=weightedPick(scored, Math.random);
  currentPick=pick.id;
  renderBlueprint(pick.id, currentWindow, pick.reasons);
}
function getDailyPlan(){
  const today=localDateKey(); // local calendar: the plan stays stable until local midnight
  let plan=repo.getPlan();
  if(plan.date!==today){
    plan={date:today};
    Object.keys(WINDOWS).forEach(w=>{
      const scored=scorePool(w,null);
      const rng=mulberry32(hashStr(today+'|'+w));
      plan[w]=scored.length?weightedPick(scored,rng).id:null;
    });
    repo.savePlan(plan);
  }
  return plan;
}
function swapPlan(winKey){
  const plan=getDailyPlan();
  const scored=scorePool(winKey, plan[winKey]);
  if(!scored.length) return;
  const pick=weightedPick(scored, Math.random);
  plan[winKey]=pick.id;
  repo.savePlan(plan);
  buildPlanPickers();
  currentWindow=winKey; currentPick=pick.id;
  renderBlueprint(pick.id, winKey, pick.reasons);
}
function viewPlan(winKey){
  const plan=getDailyPlan();
  if(!plan[winKey]) return;
  const scored=scorePool(winKey,null);
  const entry=scored.find(x=>x.id===plan[winKey]);
  currentWindow=winKey; currentPick=plan[winKey];
  renderBlueprint(plan[winKey], winKey, entry?entry.reasons:[]);
}

// ─────────────────────────────────────────────────────
// ACTIVE SESSION — start, live timer, finish into the log
// ─────────────────────────────────────────────────────
let sessTick=null;
const getActive=()=>repo.getActive();
const setActive=(a)=>repo.setActive(a);

// ── pending session: finished but not yet saved (persisted, PR review P0) ──
function renderPendingNote(){
  const pn=document.getElementById('pendingNote');
  if(!pn) return;
  const p=repo.getPending();
  if(!p){ pn.style.display='none'; pn.textContent=''; return; }
  pn.textContent='';
  const msg=document.createElement('span');
  msg.textContent=`${t('pending_note')} (${p.mins||1} ${t('min_suffix')}) — `;
  const btn=document.createElement('button');
  btn.type='button';
  btn.textContent=t('pending_discard');
  btn.addEventListener('click', discardPendingSession);
  pn.append(msg, btn);
  pn.style.display='block';
}
function discardPendingSession(){
  // The confirmation is the human step; the controller owns the rule.
  const d=discardPending(confirm(t('pending_discard_confirm')));
  if(!d.clear) return;
  repo.setPending(null);
  renderPendingNote(); buildPlanPickers();
}
function restorePendingIntoForm(){
  const r=pendingRestore(repo.getPending()); if(!r) return false;
  const winSel=document.getElementById('log-window');
  if(winSel && WINDOWS[r.window]) winSel.value=r.window;
  const actSel=document.getElementById('log-activity');
  if(actSel && ACTIVITIES[r.activity]) actSel.value=r.activity;
  renderPendingNote();
  return true;
}

function startSession(winKey){
  if(!canStartSession(repo.getPending()).ok){
    // A finished session is waiting — resolve it before starting another.
    restorePendingIntoForm(); showTab('log'); showToast(t('sess_pending'));
    return;
  }
  if(getActive()){ showToast(t('sess_busy')); return; }
  const plan=getDailyPlan();
  const actId=plan[winKey]; if(!actId) return;
  setActive({window:winKey, activity:actId, startedAt:new Date().toISOString()});
  renderSessionBar(); buildPlanPickers();
  viewPlan(winKey);
  showToast(t('toast_started'));
}
function renderSessionBar(){
  const el=document.getElementById('sessionBar');
  const a=getActive();
  clearInterval(sessTick); sessTick=null;
  if(!a || !ACTIVITIES[a.activity]){ el.innerHTML=''; return; }
  el.innerHTML=`
    <div class="sessionbar fade">
      <div class="si">
        <div class="st1">${t('sess_active')}</div>
        <div class="st2">${WIN_ICON[a.window]||''} ${t('w_'+a.window)} · ${ACTIVITIES[a.activity].name}</div>
      </div>
      <span class="stime" id="sessTimer">${fmtElapsed(a.startedAt)}</span>
      <button onclick="endSession()">${t('sess_end')}</button>
      <button class="ghost" onclick="discardSession()">${t('sess_discard')}</button>
    </div>`;
  sessTick=setInterval(()=>{
    const tEl=document.getElementById('sessTimer');
    const cur=getActive();
    if(tEl&&cur) tEl.textContent=fmtElapsed(cur.startedAt);
  },1000);
}
function endSession(){
  const a=getActive(); if(!a) return;
  // Persist the finished session BEFORE clearing the active one — a reload,
  // OS kill or SW update between here and "save" must not lose the capture.
  repo.setPending(finishSession(a, Date.now()));
  setActive(null); renderSessionBar(); buildPlanPickers();
  restorePendingIntoForm();
  showTab('log');
  showToast(t('toast_prefill'));
}
function discardSession(){
  if(!confirm(t('sess_discard_confirm'))) return;
  setActive(null); renderSessionBar(); buildPlanPickers();
}

// ─────────────────────────────────────────────────────
// BLUEPRINT RENDER
// ─────────────────────────────────────────────────────
function catStyle(cat){
  return `background:var(--c-${cat}-bg);color:var(--c-${cat})`;
}
function renderBlueprint(actId, winKey, reasons){
  const act=ACTIVITIES[actId]; const win=WINDOWS[winKey];
  const state=getState(); const isCamo=state.camouflageActive;
  const script=isCamo?act.camo_script:act.script;
  const lvl=getLevel(state,actId);
  const mastered=state.masteredActs && state.masteredActs[actId];

  const steps=script.map((line,i)=>`
    <div class="step"><span class="stepnum">${i+1}</span><span>${line}</span></div>`).join('');

  const teach=(act.teaches||[]).map(s=>
    `<span class="badge" style="${catStyle(act.category)}">${s}</span>`).join(' ');

  const camoTag=isCamo?`<span class="badge" style="background:var(--amber-bg);color:var(--amber-ink)">${t('b_story')}</span>`:'';
  const masterTag=mastered?`<span class="badge" style="background:var(--brand-bg);color:var(--brand-deep)">${t('b_mastered')}</span>`:'';

  const why=reasons && reasons.length
    ? `<div class="whybox">${t('why_pick')} ${reasons.slice(0,2).join(' · ')}</div>`:'';

  document.getElementById('blueprintOutput').innerHTML=`
    <div class="card blueprint fade" style="--cat:var(--c-${act.category})">
      <span class="eyebrow cat">${t('w_'+winKey)} · ${t('time_'+winKey)} · ${t('cat_'+act.category)}</span>
      <div class="bphead">
        <h3>${act.name}</h3>${camoTag}${masterTag}
      </div>
      <div class="badges">${teach}</div>
      <div class="materials">${act.materials}</div>
      <div class="lvlrow"><span class="txt">${t('level_of').replace('{l}',lvl)} — ${act.levels?act.levels[lvl]:''}</span></div>
      ${why}
      <div style="height:8px"></div>
      <span class="eyebrow">${t('setup_lbl')}</span>
      <div class="ascii" role="img" aria-label="${t('setup_lbl')}">${act.layout}</div>
      <span class="eyebrow">${t('parent_script')}</span>
      <div class="scriptbox">${steps}</div>
      <div class="actrow">
        <button class="primary" onclick="prefillLog('${actId}','${winKey}')">${t('log_btn')}</button>
        <button class="ghostbtn" onclick="reroll()">↻ ${t('btn_reroll')}</button>
      </div>
    </div>`;
  document.getElementById('blueprintOutput').classList.remove('hidden');
  window.scrollTo({top:document.getElementById('blueprintOutput').offsetTop-10,behavior:'smooth'});
}

function prefillLog(actId, winKey){
  const a=getActive();
  if(a && a.activity===actId){ endSession(); return; }
  document.getElementById('log-window').value=winKey;
  document.getElementById('log-activity').value=actId;
  showTab('log');
  showToast(t('toast_prefill'));
}

// ─────────────────────────────────────────────────────
// LOG SAVE / EDIT / DELETE
// ─────────────────────────────────────────────────────
let editingId=null;

function setRadio(name,val){
  const el=document.querySelector(`input[name="${name}"][value="${val}"]`);
  if(el) el.checked=true;
}
function saveLog(e){
  e.preventDefault();
  let logs=getLogs();
  const entry={
    window:document.getElementById('log-window').value,
    activity:document.getElementById('log-activity').value,
    completion:document.querySelector('input[name="completion"]:checked')?.value||'partial',
    engagement:document.querySelector('input[name="engagement"]:checked')?.value||'neutral',
    ease:document.querySelector('input[name="ease"]:checked')?.value||'just_right',
    reward:document.querySelector('input[name="reward"]:checked')?.value||'intrinsic',
    notes:document.getElementById('log-notes').value.trim()
  };
  // Only a NEW entry may consume the pending session (editing never does).
  const pending = editingId===null ? repo.getPending() : null;
  if(pending && typeof pending.mins==='number') entry.mins=pending.mins;
  const state=getState();
  const prevLvl=getLevel(state, entry.activity);

  if(editingId!==null){
    const i=logs.findIndex(l=>l.id===editingId);
    if(i>-1) logs[i]=Object.assign({},logs[i],entry);
    saveLogs(logs);
    saveState(replayState(logs));
    cancelEdit();
    showToast(t('toast_updated'));
  } else {
    // The log belongs to the instant the session ENDED, not to the moment the
    // parent got around to saving it — a session finished at 23:50 and saved at
    // 00:10 stays on the day it happened. Manual entries use the clock.
    entry.id=Date.now(); entry.timestamp=logTimestampFor(pending, new Date());
    const ns=applyLog(state, entry, logs);
    // appendLog clears the pending session only after a successful write;
    // on failure it restores the previous logs and keeps the pending session.
    const res=appendLog(localStorage, entry, { nextState: ns });
    if(!res.ok){ showToast(t('save_fail')); return; }
    renderPendingNote();
    const newLvl=getLevel(ns, entry.activity);
    if(newLvl>prevLvl) showToast(t('toast_lvlup').replace('{a}',ACTIVITIES[entry.activity].name).replace('{l}',newLvl));
    else if(newLvl<prevLvl) showToast(t('toast_lvldown').replace('{l}',newLvl));
    else showToast(t('toast_saved'));
  }
  document.getElementById('log-notes').value='';
  setRadio('completion','partial'); setRadio('engagement','neutral');
  setRadio('ease','just_right'); setRadio('reward','intrinsic');
  renderBanners(); renderWeekCard(); buildPlanPickers();
}
function editLog(id){
  const l=getLogs().find(x=>x.id===id); if(!l) return;
  editingId=id;
  document.getElementById('log-window').value=l.window;
  document.getElementById('log-activity').value=l.activity;
  setRadio('completion',l.completion); setRadio('engagement',l.engagement);
  setRadio('ease',l.ease); setRadio('reward',l.reward);
  document.getElementById('log-notes').value=l.notes||'';
  // When the saved session used the optional fields, show them expanded.
  const more=document.getElementById('logMore');
  if(more) more.open = (l.reward && l.reward!=='intrinsic') || !!l.notes;
  document.getElementById('editNote').style.display='block';
  document.getElementById('saveBtn').textContent=t('btn_update');
  showTab('log');
}
function cancelEdit(){
  editingId=null;
  document.getElementById('editNote').style.display='none';
  document.getElementById('saveBtn').textContent=t('btn_save');
  document.getElementById('log-notes').value='';
}
function deleteLog(id){
  if(!confirm(t('confirm_del'))) return;
  const logs=getLogs().filter(l=>l.id!==id);
  saveLogs(logs); saveState(replayState(logs));
  renderLogList(); renderBanners(); renderWeekCard(); buildPlanPickers();
  showToast(t('toast_deleted'));
}
function clearLogs(){
  if(!confirm(t('confirm_clear'))) return;
  repo.saveLogs([]); repo.saveState(defaultState()); repo.saveRestDays([]);
  renderLogList(); renderBanners(); renderWeekCard(); renderAnalytics(); buildPlanPickers(); closeSettings();
  showToast(t('toast_cleared'));
}

// "Not a good moment today" — a rest day is a first-class, penalty-free entry.
// It never reduces any metric; it simply appears as a calm ☾ in the week strip.
function markRestDay(){
  const today=localDateKey();
  const days=repo.getRestDays();
  if(!days.includes(today)){ days.push(today); repo.saveRestDays(days); }
  renderWeekCard(); buildPlanPickers();
  showToast(t('rest_done'));
}

// ─────────────────────────────────────────────────────
// HISTORY — grouped by day, with edit/delete
// ─────────────────────────────────────────────────────
const ENG_ICON={excited:'🌟',neutral:'😐',resisted:'😤'};
const EASE_ICON={too_easy:'😴',just_right:'🎯',too_hard:'🧠'};
const COMP_ICON={full:'✅',partial:'⚡',refused:'🚫'};
const WIN_ICON={morning:'🌅',afternoon:'☀️',bedtime:'🌙'};

function renderLogList(){
  const logs=getLogs();
  const el=document.getElementById('logList');
  el.textContent='';
  if(!logs.length){
    // trusted, code-controlled template — no user data
    el.innerHTML='<div class="card" style="text-align:center;color:var(--ink-faint);font-weight:700;font-size:13.5px;padding:38px 16px">🦕<br/><br/>'+t('empty_history')+'</div>';
    return;
  }
  const byDay={};
  [...logs].reverse().forEach(l=>{
    const day=sessionDayKey(l); // local calendar day of the session
    (byDay[day]=byDay[day]||[]).push(l);
  });
  const now=new Date();
  const today=localDateKey(now);
  const yest=localDateKey(addDays(now,-1));

  // Stored/imported data is UNTRUSTED: every user-influenced value below is
  // rendered via textContent and every handler is a real listener — nothing
  // from a log ever lands inside markup or an attribute (threat model T3).
  const mk=(tag,cls,text)=>{ const n=document.createElement(tag); if(cls) n.className=cls; if(text!==undefined) n.textContent=text; return n; };

  for(const [day,dayLogs] of Object.entries(byDay)){
    let label=day;
    if(day===today) label=t('today');
    else if(day===yest) label=t('yesterday');
    else if(day!=='unknown') label=new Date(day+'T12:00:00').toLocaleDateString(LANG==='pt'?'pt-BR':'en-GB',{weekday:'short',day:'numeric',month:'short'});

    const card=mk('div','card');
    const daytop=mk('div','daytop');
    daytop.append(mk('span','dl',label), mk('span','dc',`${dayLogs.length} ${dayLogs.length>1?t('sessions'):t('session')}`));
    card.append(daytop);

    for(const l of dayLogs){
      const act=ACTIVITIES[l.activity];
      const cat=act && CAT_LABEL[act.category] ? act.category : 'counting'; // validated against the catalog
      const sess=mk('div','sesscard');
      sess.style.setProperty('--cat',`var(--c-${cat})`);

      const top=mk('div','sess-top');
      const tm=l.timestamp?new Date(l.timestamp).toLocaleTimeString(LANG==='pt'?'pt-BR':'en-US',{hour:'2-digit',minute:'2-digit'}):'';
      const mins=typeof l.mins==='number'?` · ${Math.round(l.mins)} ${t('min_suffix')}`:'';
      const winLabel=WIN_ICON[l.window]!==undefined?`${WIN_ICON[l.window]} ${t('w_'+l.window)}`:'—';
      top.append(mk('span','sessmeta',`${winLabel} · ${tm}${mins}`));

      const acts=mk('span','sessacts');
      const edit=mk('button','iconbtn','✏️');
      edit.type='button'; edit.setAttribute('aria-label',t('al_edit'));
      edit.addEventListener('click',()=>editLog(l.id));
      const del=mk('button','iconbtn del','🗑️');
      del.type='button'; del.setAttribute('aria-label',t('al_delete'));
      del.addEventListener('click',()=>deleteLog(l.id));
      acts.append(edit,del);
      top.append(acts);
      sess.append(top);

      sess.append(mk('div','sessname', act?act.name:String(l.activity)));

      if(act && (act.teaches||[]).length){
        const teach=mk('div','sessteach');
        act.teaches.forEach((x,i)=>{
          if(i) teach.append(mk('span','tsep',' · '));
          const s=mk('span','tskill',x);
          s.style.color=`var(--c-${cat})`;
          teach.append(s);
        });
        sess.append(teach);
      }

      const pills=mk('div','pills');
      const pill=(text,extra)=>{ const p=mk('span','pill',text); p.classList.add(extra); return p; };
      pills.append(
        pill(`${ENG_ICON[l.engagement]||'😐'} ${t('v_'+l.engagement)}`,'pill-soft'),
        pill(`${COMP_ICON[l.completion]||''} ${t('v_'+l.completion)}`,'pill-soft'),
        pill(`${EASE_ICON[l.ease]||''} ${t('v_'+l.ease)}`,'pill-soft'),
        pill(`${l.reward==='extrinsic'?'🍬':l.reward==='connection'?'🤗':'💚'} ${t('v_'+l.reward)}`, l.reward==='extrinsic'?'pill-treat':'pill-brand')
      );
      sess.append(pills);

      if(typeof l.notes==='string' && l.notes) sess.append(mk('p','sessnote',`\u201C${l.notes}\u201D`));
      card.append(sess);
    }
    el.append(card);
  }
}

// ─────────────────────────────────────────────────────
// BANNERS + MODE CHIP + WEEK CARD + HEADER
// ─────────────────────────────────────────────────────
function renderBanners(){
  const state=getState(); const logs=getLogs();
  const zone=document.getElementById('bannerZone');
  zone.innerHTML='';
  if(state.camouflageActive && state.camouflageLeft>0)
    zone.innerHTML+=`<div class="banner" style="background:#A5730F"><span class="pulse">●</span> ${t('banner_story').replace('{n}',state.camouflageLeft)}</div>`;
  if(state.cooldownActive && state.cooldownUntil){
    const h=Math.max(0,Math.ceil((new Date(state.cooldownUntil)-new Date())/3600000));
    zone.innerHTML+=`<div class="banner" style="background:#2E6FBF"><span class="pulse">●</span> ${t('banner_cool').replace('{h}',h)}</div>`;
  }
  const obs=rewardObservation(logs);
  if(obs.status==='observation')
    zone.innerHTML+=`<div class="banner" style="background:#1E5B41">${t('banner_reward').replace('{t}',obs.treatCount).replace('{o}',obs.otherCount)}</div>`;

  const chip=document.getElementById('modeChip');
  if(state.camouflageActive){ chip.classList.remove('hidden'); chip.textContent=t('chip_story'); chip.style.cssText='background:var(--amber-bg);color:var(--amber-ink)'; }
  else if(state.cooldownActive){ chip.classList.remove('hidden'); chip.textContent=t('chip_cool'); chip.style.cssText='background:var(--day-bg);color:var(--day)'; }
  else { chip.classList.add('hidden'); }
}

function ageString(){
  const p=getProfile();
  const [y,m]=(p.birth||DEFAULT_PROFILE.birth).split('-').map(Number);
  const now=new Date();
  let months=(now.getFullYear()-y)*12+(now.getMonth()+1-m);
  if(months<0) months=0;
  return LANG==='pt'?`${Math.floor(months/12)}a ${months%12}m`:`Age ${Math.floor(months/12)}y ${months%12}m`;
}
function renderHeader(){
  const p=getProfile();
  const title = p.name ? (LANG==='pt' ? `Matemática da ${p.name}` : `${p.name}'s Math Trail`) : 'Math Trail';
  document.getElementById('appTitle').textContent = title;
  // Book-chapter focus is configuration, not identity — it lives in Settings only.
  document.getElementById('headerSub').textContent = p.name ? ageString() : t('app_tagline');
}

function renderWeekCard(){
  const logs=getLogs();
  const now=new Date();
  const todayKey=localDateKey(now);
  const weekKeys=new Set([...Array(7)].map((_,i)=>localDateKey(addDays(now,-(6-i)))));
  const week=logs.filter(l=>weekKeys.has(sessionDayKey(l)));
  const restDays=new Set(repo.getRestDays());
  // No streak exists in this product — presence is shown by the week strip,
  // and a rest day appears there as a gentle ☾, nothing more.
  const exc=week.filter(l=>l.engagement==='excited').length;
  const focus=currentFocus(logs);
  const fp=milestoneProgress(focus,logs);

  // 7-day snap-cube strip (last 7 local days, today last)
  const byDay={};
  logs.forEach(l=>{ const k=sessionDayKey(l); if(k!=='unknown') byDay[k]=(byDay[k]||0)+1; });
  const strip=[...Array(7)].map((_,i)=>{
    const dd=addDays(now,-(6-i));
    const k=localDateKey(dd);
    const n=byDay[k]||0;
    const rest=!n&&restDays.has(k);
    const wl=dd.toLocaleDateString(LANG==='pt'?'pt-BR':'en-GB',{weekday:'narrow'});
    return `<div class="wday${k===todayKey?' today':''}"><span class="cube big${n?' on':''}${rest?' rest':''}" title="${rest?t('rest_chip'):''}">${n||(rest?'☾':'')}</span><span class="wl">${wl}</span></div>`;
  }).join('');

  // Counts, not percentages or streaks — rhythm is visible in the strip;
  // numbers here describe, they don't grade (audit V4).
  const parts=[];
  parts.push(`<b>${week.length}</b> ${week.length===1?t('session'):t('sessions')} ${t('hs_week')}`);
  if(exc) parts.push(`<b>${exc}</b> ${exc===1?t('hs_exc_1'):t('hs_exc_n')}`);
  const statline=week.length?parts.join(' &nbsp;·&nbsp; '):t('hs_empty');

  const target=focus.target||0;
  const focusCubes=[...Array(target)].map((_,i)=>`<span class="cube${i<Math.min(fp.good,target)?' on':''}"></span>`).join('')
    +(target?`<span class="ct">${fp.good}/${target}</span>`:'');

  const dateChip=now.toLocaleDateString(LANG==='pt'?'pt-BR':'en-GB',{weekday:'long',day:'numeric',month:'long'});
  document.getElementById('weekCard').innerHTML=`
    <span class="datechip">${dateChip}</span>
    <div class="hero-grid">
      <div>
        <span class="eyebrow">${LANG==='pt'?'Esta semana':'This week'}</span>
        <div class="weekstrip">${strip}</div>
        <div class="statline">${statline}</div>
      </div>
      <div class="focusline">
        <span class="eyebrow" style="color:var(--brand-deep)">${t('wc_focus')}</span>
        <div class="fl">${msLabel(focus)}</div>
        <div class="cubes">${focusCubes}</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────
function renderAnalytics(){
  const logs=getLogs(); const state=getState();

  // Skill trail (signature)
  let nowFound=false;
  document.getElementById('skillTrail').innerHTML=MILESTONES.map(m=>{
    const p=milestoneProgress(m,logs);
    let cls='next', icon='', extra=msDetail(m);
    if(p.done){ cls='done'; icon='✓'; extra=m.pre?msDetail(m)+' · '+t('ms_calibrated'):t('ms_mastered')+' — '+p.good+' '+t('ms_strong'); }
    else if(!nowFound){ cls='now'; icon='🦕'; nowFound=true; extra=`${p.good}/${m.target} ${t('ms_strong')} · ${msDetail(m)}`; }
    return `<div class="tstop ${cls}"><span class="dot">${icon}</span>
      <div class="tl">${msLabel(m)}</div><div class="td">${extra}</div></div>`;
  }).join('');

  // Adaptive state
  const items=[
    {label:t('as_story'), on:state.camouflageActive,
     detail:state.camouflageActive?t('as_story_on').replace('{n}',state.camouflageLeft):t('as_inactive'), c:'#96660F', bg:'#FBF0DC'},
    {label:t('as_cool'), on:state.cooldownActive,
     detail:state.cooldownActive?t('as_until')+new Date(state.cooldownUntil).toLocaleString(LANG==='pt'?'pt-BR':'en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):t('as_inactive'), c:'#2E6FBF', bg:'#E7F0FA'},
    {label:t('as_dice'), on:state.diceMastered,
     detail:state.diceMastered?t('as_dice_on'):t('as_dice_off'), c:'#0E7266', bg:'#E4F2F0'},
    (()=>{ // reward observation — humble by design: sample sizes always shown
      const obs=rewardObservation(logs);
      const key=obs.status==='insufficient'?'as_treat_low':obs.status==='observation'?'as_treat_on':'as_treat_off';
      const detail=t(key).replace('{t}',obs.treatCount).replace('{o}',obs.otherCount)+' '+t('obs_disclaimer');
      return {label:t('as_treat'), on:obs.status==='observation', detail, c:'#1E5B41', bg:'#E4F0E8'};
    })()
  ];
  // level ups summary
  const lvlUps=Object.entries(state.levels||{}).filter(([id,l])=>ACTIVITIES[id]&&l!==(ACTIVITIES[id].startLevel||1));
  if(lvlUps.length) items.push({label:t('as_lvl'), on:true,
    detail:lvlUps.map(([id,l])=>`${ACTIVITIES[id].name} → L${l}`).join(' · '), c:'#54499E', bg:'#ECE9F7'});

  document.getElementById('stateStatus').innerHTML=items.map(it=>`
    <div class="srow" style="background:${it.bg};border:1px solid ${it.c}22">
      <div><div class="st" style="color:${it.c}">${it.label}</div>
      <div class="sd" style="color:${it.c}">${it.detail}</div></div>
      <div class="sdot ${it.on?'pulse':''}" style="${it.on?`background:${it.c}`:''}"></div>
    </div>`).join('');

  // Goal progress — snap-cube cells: one cube per strong session needed
  document.getElementById('goalProgress').innerHTML=MILESTONES.filter(m=>!m.pre).map(m=>{
    const p=milestoneProgress(m,logs);
    const badge=p.done?'✓ '+t('gp_mastered'):p.pct>=60?t('gp_prog'):p.sessions===0?t('gp_notstarted'):t('gp_building');
    const color=p.done?'var(--brand-deep)':p.sessions===0?'var(--ink-faint)':'var(--dawn)';
    const cubes=[...Array(m.target)].map((_,i)=>`<span class="cube${i<Math.min(p.good,m.target)?' on':''}"></span>`).join('');
    return `<div class="goalrow">
      <div class="goaltop"><span class="gl">${msLabel(m)}</span><span class="gb" style="color:${color}">${badge}</span></div>
      <div class="cubes">${cubes}<span class="ct">${p.good}/${m.target} ${t('gp_strong')}</span></div>
      <div class="gd">${p.sessions} ${p.sessions===1?t('session'):t('sessions')}</div>
    </div>`;
  }).join('');

  // Mood chart — hand-drawn SVG (no library)
  const recent=logs.slice(-12);
  const el=document.getElementById('moodChart');
  if(!recent.length){ el.innerHTML='<p style="font-size:13px;color:var(--ink-faint);font-weight:600">'+t('mood_empty')+'</p>'; }
  else{
    const W=320,H=120,pad=18;
    const map={excited:3,neutral:2,resisted:1};
    const n=recent.length;
    const x=i=>n===1?W/2:pad+i*(W-2*pad)/(n-1);
    const y=v=>H-pad-(v-1)*(H-2*pad)/2;
    const pts=recent.map((l,i)=>({x:x(i),y:y(map[l.engagement]||2),v:map[l.engagement]||2,
      d:l.timestamp?new Date(l.timestamp).toLocaleDateString(LANG==='pt'?'pt-BR':'en-GB',{day:'numeric',month:'short'}):''}));
    const line=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
    const area=`M${pts[0].x} ${H-pad} `+pts.map(p=>`L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')+` L${pts[n-1].x} ${H-pad} Z`;
    const chartLabel=t('chart_label').replace('{n}',n).replace('{from}',pts[0].d||'—').replace('{to}',pts[n-1].d||'—');
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="${chartLabel}">
      ${[1,2,3].map(v=>`<line x1="${pad}" y1="${y(v)}" x2="${W-pad}" y2="${y(v)}" stroke="rgba(46,125,91,.14)" stroke-width="1" stroke-dasharray="3 4"/>`).join('')}
      <text x="2" y="${y(3)+4}" font-size="10">🌟</text><text x="2" y="${y(2)+4}" font-size="10">😐</text><text x="2" y="${y(1)+4}" font-size="10">😤</text>
      <path d="${area}" fill="rgba(46,125,91,.09)"/>
      <path d="${line}" fill="none" stroke="#2E7D5B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${p.v===3?'#2E7D5B':p.v===1?'#C24040':'#75817A'}" stroke="#FFFDF8" stroke-width="1.5"/>`).join('')}
      ${pts.map((p,i)=>(n<=6||i%2===0)?`<text x="${p.x}" y="${H-3}" font-size="8" text-anchor="middle" fill="#75817A" font-weight="700">${p.d}</text>`:'').join('')}
    </svg>`;
  }

  // Stat cells — plain counts; percentages read like grades on tiny samples
  const total=logs.length;
  const excN=logs.filter(l=>l.engagement==='excited').length;
  const fullN=logs.filter(l=>l.completion==='full').length;
  const doneMs=MILESTONES.filter(m=>milestoneProgress(m,logs).done).length;
  document.getElementById('statsGrid').innerHTML=[
    {v:total,k:t('stat_total'),c:'#1E5B41',bg:'#E4F0E8',b:'#CBE4D4'},
    {v:excN,k:t('stat_excited'),c:'#96660F',bg:'#FBF0DC',b:'#F1DFBE'},
    {v:fullN,k:t('stat_full'),c:'#2E6FBF',bg:'#E7F0FA',b:'#CFE0F2'},
    {v:doneMs+'/'+MILESTONES.length,k:t('stat_miles'),c:'#54499E',bg:'#ECE9F7',b:'#D8D3EE'}
  ].map(s=>`<div class="cell" style="background:${s.bg};border-color:${s.b}">
      <div class="v" style="color:${s.c}">${s.v}</div>
      <div class="k" style="color:${s.c}">${s.k}</div></div>`).join('');
}

// ─────────────────────────────────────────────────────
// SETTINGS + EXPORT / IMPORT
// ─────────────────────────────────────────────────────
function openSettings(){
  const p=getProfile();
  document.getElementById('set-name').value=p.name;
  document.getElementById('set-birth').value=p.birth;
  document.getElementById('set-chapter').value=String(p.chapter||0);
  const d=document.getElementById('settingsDialog');
  d.showModal(); // native: Escape closes, Tab is contained, focus returns to the opener
  document.getElementById('set-name').focus();
}
function closeSettings(){ document.getElementById('settingsDialog').close(); }
function saveSettings(){
  const p=getProfile();
  p.name=document.getElementById('set-name').value.trim();
  p.birth=document.getElementById('set-birth').value||p.birth;
  p.chapter=Number(document.getElementById('set-chapter').value)||0;
  saveProfile(p);
  renderHeader(); renderWeekCard(); closeSettings();
  showToast(t('toast_settings'));
}
function exportData(){
  const now=new Date();
  const data=buildExport(repo,{ now });
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`math-trail-backup-${localDateKey(now)}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  showToast(t('toast_export'));
}
function importData(input){
  const f=input.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=e=>{
    let d;
    try{ d=JSON.parse(e.target.result); }
    catch{ alert(t('imp_invalid')); input.value=''; return; }
    if(!confirm(t('confirm_import').replace('{n}',Array.isArray(d?.logs)?d.logs.length:0))){ input.value=''; return; }
    // importBackup validates first, snapshots current data, and restores it on failure.
    const res=importBackup(localStorage, d, { replay: replayState });
    if(res.ok){
      renderHeader(); renderBanners(); renderWeekCard(); renderLogList(); renderAnalytics(); buildPlanPickers();
      renderPendingNote();
      closeSettings(); showToast(t('toast_import'));
      // An unsaved session inside the backup is never dropped in silence.
      const pa=res.pending && res.pending.action;
      if(pa==='restore') alert(t('imp_pending_restored'));
      else if(pa==='conflict') alert(t('imp_pending_conflict'));
      else if(pa==='reject') alert(t('imp_pending_invalid'));
    } else {
      alert(res.reason==='future_version'?t('imp_future'):res.reason==='write_failed'?t('imp_fail'):t('imp_invalid'));
    }
    input.value='';
  };
  r.readAsText(f);
}

// ─────────────────────────────────────────────────────
// TABS / TOAST / SELECT BUILD / INIT
// ─────────────────────────────────────────────────────
function showTab(name){
  ['plan','log','history','analytics'].forEach(t=>{
    document.getElementById(`tab-content-${t}`).classList.add('hidden');
    const b=document.getElementById(`tab-${t}`);
    b.classList.remove('on'); b.removeAttribute('aria-current');
  });
  const c=document.getElementById(`tab-content-${name}`);
  c.classList.remove('hidden'); c.classList.add('fade');
  const btn=document.getElementById(`tab-${name}`);
  btn.classList.add('on'); btn.setAttribute('aria-current','page');
  if(name==='plan') buildPlanPickers();
  if(name==='history') renderLogList();
  if(name==='analytics') renderAnalytics();
}
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.opacity='1';
  clearTimeout(t._h); t._h=setTimeout(()=>t.style.opacity='0',2600);
}
function buildActivitySelect(){
  const groups={};
  Object.entries(ACTIVITIES).forEach(([id,a])=>{
    (groups[a.category]=groups[a.category]||[]).push([id,a]);
  });
  document.getElementById('log-activity').innerHTML=
    Object.entries(groups).map(([cat,acts])=>
      `<optgroup label="── ${t('cat_'+cat)} ──">`+
      acts.map(([id,a])=>`<option value="${id}">${a.name}</option>`).join('')+
      `</optgroup>`).join('');
}

// DEMO MODE — ?demo=1 seeds ~3 weeks of sample data (only when storage is empty)
// Data generation lives in demo.mjs (pure, seeded, 100% synthetic — see
// scripts/generate-demo.mjs for the committed reference artifact).
function seedDemo(){
  const { logs, profile } = generateDemoData({ baseDate: new Date(), rng: mulberry32(42) });
  saveLogs(logs);
  saveProfile(profile);
  saveState(replayState(logs));
}

// INIT
migrate();
if(new URLSearchParams(location.search).get('demo')==='1' && !getLogs().length){
  seedDemo();
  setTimeout(()=>showToast(t('demo_on')), 400);
}
applyLang();

// A finished-but-unsaved session survives reloads, PWA restarts and SW
// updates — surface it immediately so it gets saved or discarded on purpose.
if(restorePendingIntoForm()) showTab('log');

// Inline onclick handlers live in index.html — expose the API they need.
Object.assign(window, { setLang, showTab, openSettings, closeSettings, saveSettings,
  exportData, importData, clearLogs, saveLog, editLog, deleteLog, cancelEdit,
  startSession, endSession, discardSession, swapPlan, viewPlan, pickFromList,
  generateBlueprint, reroll, prefillLog, markRestDay });

// Backdrop click closes settings (clicks on the ::backdrop land on the
// dialog element itself; the inner .modal swallows content clicks).
document.getElementById('settingsDialog').addEventListener('click', (e)=>{
  if(e.target===e.currentTarget) closeSettings();
});

// System status the parent can trust: offline is a mode, not a failure;
// updates announce themselves instead of applying silently mid-use.
window.addEventListener('offline', ()=>showToast(t('off_toast')));
window.addEventListener('online', ()=>showToast(t('on_toast')));

if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.addEventListener('updatefound', ()=>{
      const w=reg.installing;
      if(w) w.addEventListener('statechange', ()=>{
        if(w.state==='installed' && navigator.serviceWorker.controller) showToast(t('upd_toast'));
      });
    });
  }).catch(()=>{});
}
