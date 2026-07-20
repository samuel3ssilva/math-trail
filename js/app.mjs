// Math Trail — UI layer: i18n, rendering, daily plan and session flow.
// Persistence lives in storage.mjs; domain rules live in engine.mjs;
// local-calendar time lives in time.mjs. This file only wires them to the DOM.
import { ACTIVITIES, CAT_LABEL, COMPOSITION_IDS, MINS, MILESTONES, WINDOWS } from './activities.mjs';
import { defaultState, getLevel, applyLog, replayState, rewardObservation,
         evaluateTemporalRules, milestoneProgress, currentFocus, weightedPick,
         hashStr, mulberry32, scoreActivities } from './engine.mjs';
import { localDateKey, sessionDayKey, addDays, fmtElapsed } from './time.mjs';
import { makeRepo, migrateStore, importBackup, buildExport, SCHEMA_VERSION } from './storage.mjs';
import { generateDemoData, DEMO_PROFILE } from './demo.mjs';

// The app assumes common household manipulatives (interlocking cubes, small toy
// counters, dice, paper and pen) — see the activity catalog for what each uses.

const repo = makeRepo(localStorage);

// ─────────────────────────────────────────────────────
// I18N — PT / EN interface language
// ─────────────────────────────────────────────────────
let LANG=repo.getLang()||'pt';
const I18N={
en:{
tab_plan:'Plan',tab_log:'Log',tab_history:'History',tab_stats:'Stats',
plan_title:"Today's sessions",
plan_sub:'These are possible opportunities, not three daily obligations — pick one, several, or none. A short activity already counts.',
wh_morning:'Morning · ~8–11 AM',wd_morning:'Low pressure · breakfast table',
wh_afternoon:'Afternoon · ~12–5 PM',wd_afternoon:'Full focus · all activities',
wh_bedtime:'Bedtime · ~8 PM',wd_bedtime:'Quick & calm · 3 min max',
w_morning:'Morning',w_afternoon:'Afternoon',w_bedtime:'Bedtime',
time_morning:'~8–11 AM',time_afternoon:'~12–5 PM',time_bedtime:'~8 PM',
btn_reroll:'Different activity',
log_title:'Log this session',edit_note:'Editing a saved session',cancel:'cancel',
lbl_window:'Session window',lbl_activity:'Activity done',lbl_completion:'How did it go?',
lbl_mood:"Child's mood",lbl_ease:'How was the challenge?',lbl_reward:'What sustained the activity?',lbl_notes:'Notes (optional)',
more_details:'More details (optional)',
ph_notes:'E.g. "Counted 4 strawberries without help."',
opt_morning:'Morning (~8–11 AM)',opt_afternoon:'Afternoon (~12–5 PM)',opt_bedtime:'Bedtime (~8 PM)',
v_full:'Full',v_partial:'Partial',v_refused:'Refused',
v_excited:'Excited',v_neutral:'Neutral',v_resisted:'Resisted',
v_too_easy:'Too easy',v_just_right:'Just right',v_too_hard:'Too hard',
v_intrinsic:'Play itself',v_connection:'Connection',v_extrinsic:'Treat',
btn_save:'Save session',btn_update:'Update session',
st_trail:'Experience trail',st_trail_sub:'Doorways into early math — pace varies from child to child, and this is not an assessment.',
ms_count5:'Counting 1–5',ms_sub34:'Spotting 3–4 at a glance',ms_count10:'Counting 6–10, one by one',
ms_sub56:'Spotting 5–6 at a glance',ms_oml:'One more / one less',ms_frames:'Five & ten frames · counting on',
ms_ppw:'Part-part-whole up to 6',ms_compare:'More · fewer · equal',ms_stories:'Joining & taking-away stories',
ms_patshapes:'Patterns & shapes',
msd_count5:'One-to-one, steady',msd_sub34:'Sees small groups instantly',msd_count10:'No skips, no double-counts',
msd_sub56:'Dice faces & clusters at a glance',msd_oml:'Predicts without recounting',msd_frames:'6–9 as "5 and some more"',
msd_ppw:'Numbers hide inside numbers',msd_compare:'Including equal — and zero',msd_stories:'Acting out change with objects',
msd_patshapes:'The variety track',
st_adaptive:'How suggestions adapt',st_goal:'Goal Progress',st_mood:'Mood over time',
set_title:'Settings',set_name:"Child's name",set_birth:'Birth month',
set_chapter:'Current Kate Snow chapter (boosts matching activities)',
ch0:'No chapter focus',ch1:'Ch 1 · Counting & number concept',ch4:'Ch 4 · Numbers 6–10',ch5:'Ch 5 · Written numerals 0–10',ch6:'Ch 6 · Comparing quantities',ch7:'Ch 7 · Addition & subtraction stories',
set_save:'Save',set_close:'Close',set_backup:'Data backup',set_export:'Export JSON',set_import:'Import JSON',set_clear:'Delete all sessions',
wc_sessions:'Sessions · 7d',wc_streak:'Day streak',wc_excited:'Excited',wc_focus:'Exploring now',
hs_exc_n:'excited sessions',hs_exc_1:'excited session',
chip_normal:'Normal',chip_story:'Story',chip_cool:'Cool-Down',
banner_story:'Story Mode ON — {n} session(s) left. Scripts reframed as adventures!',
banner_cool:'Cool-Down: Part-Part-Whole paused ~{h}h. Serving other skills only.',
banner_reward:'In the few sessions logged so far ({t} with a treat, {o} without), resistance was more frequent when a treat was used. Not enough data for a conclusion — just something to notice.',
choose_act:'— choose activity —',done_today:' · ✓ done today',
your_pick:'Your pick — chosen by you',
r_chapter:'Kate Snow ch. {c} focus',r_gap:'Fills the current gap:',r_fresh:'Fresh — not played recently',
why_pick:'Why this pick:',b_story:'Story Mode',b_mastered:'Mastered',
level_of:'Level {l} of 3',parent_script:'Parent script',log_btn:'Log this session',
toast_prefill:'Activity pre-filled!',toast_updated:'Session updated!',
toast_lvlup:'Level up! {a} → Level {l}',toast_lvldown:"Stepped down to Level {l} — that's how it should work!",
toast_saved:'Session saved!',confirm_del:'Delete this session?',toast_deleted:'Session deleted.',
confirm_clear:'Delete ALL sessions? This cannot be undone.\nTip: Export a JSON backup first.',
toast_cleared:'All sessions cleared.',
empty_history:'No sessions yet.<br/>Pick a window in Plan and log your first one!',
today:'Today',yesterday:'Yesterday',session:'session',sessions:'sessions',
cat_subitizing:'Subitizing',cat_counting:'Counting 6–10',cat_one_more_less:'One More / One Less',cat_composition:'Part-Part-Whole',cat_stories:'Number Stories',cat_counting_on:'Counting On · Frames',cat_comparison:'Comparison',cat_patterns:'Patterns',cat_shapes:'Shapes & Sorting',cat_workbook:'Workbook',
ms_calibrated:'starting point',ms_mastered:'Mastered',ms_strong:'strong sessions',
as_story:'Story / Camouflage Mode',as_story_on:'{n} sessions remaining',as_inactive:'Inactive',
as_cool:'Part-Part-Whole Cool-Down (48h)',as_until:'Until ~',
as_dice:'Dice Mastery → Count-On unlocked',as_dice_on:'Two-Dice Count-On is in the pool.',as_dice_off:'Reach Level 3 on Dice Flash + 2× "Too Easy"',
as_treat:'Reward observation',
as_treat_on:'{t} treat / {o} other sessions: resistance was more frequent with treats. Small sample — no conclusion.',
as_treat_off:'{t} treat / {o} other sessions: no notable difference so far.',
as_treat_low:'Not enough sessions to compare rewards yet ({t} treat / {o} other — needs 5 of each).',
obs_disclaimer:'Describes this log only. Not a diagnosis, recommendation or causal claim.',
as_lvl:'Level adjustments',
gp_mastered:'Explored',gp_prog:'Progressing',gp_notstarted:'Not yet visited',gp_building:'Building',gp_strong:'good',
mood_empty:'Log sessions to see the mood line.',
stat_total:'Total sessions',stat_excited:'Excited sessions',stat_full:'Full sessions',stat_miles:'Trail stops explored',
toast_settings:'Settings saved!',toast_export:'Backup exported!',
confirm_import:'Import {n} sessions? This replaces current data.',toast_import:'Backup imported!',
alert_badfile:'This file is not a valid Math Trail backup.',
btn_suggest:'Suggest',done_win:'✓ done today',set_lang:'Language',
hs_week:'this week',hs_days:'day streak',hs_excited:'excited',
hs_empty:'A fresh week — one playful moment already counts.',
setup_lbl:'Table setup',
btn_start:'Start',btn_swap:'Swap',plan_pick:"Today's pick",
comp_hint:'Pick the closest fit — there is no "bad" result.',
sess_active:'Session in progress',sess_end:'Finish & log',sess_discard:'discard',
sess_discard_confirm:'Discard this session without logging it?',
sess_busy:'Finish the current session first.',toast_started:'Session started — have fun!',
min_suffix:'min',
app_tagline:'Small moments, real progress',
skip_link:"Skip to today's plan",
chip_started:'in progress',no_pick:'No suggestion right now — pick one from the list below.',
pending_note:'Session finished — save it below to keep the record.',
off_toast:'No internet — everything keeps working on this device.',
on_toast:'Back online.',
upd_toast:'A new version is ready — reload to use it.',
st_adaptive_sub:'A peek at how the app adjusts to your sessions — nothing here is a judgment.',
demo_on:'Demo mode — synthetic sample data loaded. Clear it in Settings.',
btn_rest:'Not a good moment today',rest_done:'Noted — rest is part of learning too 💚',
rest_chip:'rest day',
imp_invalid:'This file is not a valid backup (missing or invalid fields). Nothing was changed.',
imp_future:'This backup comes from a newer version of the app. Update the app first. Nothing was changed.',
imp_fail:'Import failed — your previous data was restored automatically.'
},
pt:{
tab_plan:'Plano',tab_log:'Registrar',tab_history:'Histórico',tab_stats:'Progresso',
plan_title:'Sessões de hoje',
plan_sub:'Estas são oportunidades possíveis, não três obrigações diárias — escolha uma, várias ou nenhuma. Uma atividade curta já é uma vitória.',
wh_morning:'Manhã · 8–11h',wd_morning:'Leve · na mesa do café',
wh_afternoon:'Tarde · 12–17h',wd_afternoon:'Foco total · todas as atividades',
wh_bedtime:'Noite · ~20h',wd_bedtime:'Rápido e calmo · máx. 3 min',
w_morning:'Manhã',w_afternoon:'Tarde',w_bedtime:'Noite',
time_morning:'8–11h',time_afternoon:'12–17h',time_bedtime:'~20h',
btn_reroll:'Outra atividade',
log_title:'Registrar esta sessão',edit_note:'Editando uma sessão salva',cancel:'cancelar',
lbl_window:'Janela da sessão',lbl_activity:'Atividade realizada',lbl_completion:'Como foi?',
lbl_mood:'Humor da criança',lbl_ease:'Como estava o desafio?',lbl_reward:'O que sustentou a atividade?',lbl_notes:'Notas (opcional)',
more_details:'Mais detalhes (opcional)',
ph_notes:'Ex.: "Contou 4 morangos sem ajuda."',
opt_morning:'Manhã (8–11h)',opt_afternoon:'Tarde (12–17h)',opt_bedtime:'Noite (~20h)',
v_full:'Completa',v_partial:'Parcial',v_refused:'Recusou',
v_excited:'Animada',v_neutral:'Neutra',v_resisted:'Resistiu',
v_too_easy:'Muito fácil',v_just_right:'Na medida',v_too_hard:'Muito difícil',
v_intrinsic:'Brincadeira',v_connection:'Conexão',v_extrinsic:'Docinho',
btn_save:'Salvar sessão',btn_update:'Atualizar sessão',
st_trail:'Trilha de experiências',st_trail_sub:'Portas de entrada da matemática — o ritmo varia de criança para criança, e isto não é uma avaliação.',
ms_count5:'Contagem 1–5',ms_sub34:'Reconhecer 3–4 de relance',ms_count10:'Contagem 6–10, um a um',
ms_sub56:'Reconhecer 5–6 de relance',ms_oml:'Um a mais / um a menos',ms_frames:'Molduras de 5 e 10 · contar a partir de',
ms_ppw:'Parte-parte-todo até 6',ms_compare:'Mais · menos · igual',ms_stories:'Histórias de juntar e tirar',
ms_patshapes:'Padrões e formas',
msd_count5:'Um a um, com segurança',msd_sub34:'Vê grupos pequenos na hora',msd_count10:'Sem pular nem repetir',
msd_sub56:'Faces de dado e grupinhos de relance',msd_oml:'Antecipa sem recontar',msd_frames:'6–9 como "5 e mais alguns"',
msd_ppw:'Números escondidos dentro de números',msd_compare:'Incluindo igual — e zero',msd_stories:'Encenando mudanças com objetos',
msd_patshapes:'A trilha da variedade',
st_adaptive:'Como as sugestões se adaptam',st_goal:'Experiências em construção',st_mood:'Humor ao longo do tempo',
set_title:'Configurações',set_name:'Nome da criança',set_birth:'Mês de nascimento',
set_chapter:'Capítulo atual da Kate Snow (prioriza atividades do capítulo)',
ch0:'Sem foco de capítulo',ch1:'Cap. 1 · Contagem e conceito de número',ch4:'Cap. 4 · Números 6–10',ch5:'Cap. 5 · Numerais escritos 0–10',ch6:'Cap. 6 · Comparando quantidades',ch7:'Cap. 7 · Histórias de adição e subtração',
set_save:'Salvar',set_close:'Fechar',set_backup:'Backup de dados',set_export:'Exportar JSON',set_import:'Importar JSON',set_clear:'Apagar todas as sessões',
wc_sessions:'Sessões · 7d',wc_streak:'Dias seguidos',wc_excited:'Animada',wc_focus:'Explorando agora',
hs_exc_n:'sessões animadas',hs_exc_1:'sessão animada',
chip_normal:'Normal',chip_story:'História',chip_cool:'Pausa',
banner_story:'Modo História ATIVO — {n} sessão(ões) restante(s). Roteiros viram aventuras!',
banner_cool:'Pausa: Parte-Parte-Todo pausado por ~{h}h. Sugerindo outras habilidades.',
banner_reward:'Nos poucos registros disponíveis ({t} com docinho, {o} sem), houve mais resistência nas sessões com docinho. Ainda não há dados suficientes para uma conclusão — é só um ponto de atenção.',
choose_act:'— escolher atividade —',done_today:' · ✓ feita hoje',
your_pick:'Sua escolha',
r_chapter:'Foco no cap. {c} (Kate Snow)',r_gap:'Preenche a lacuna atual:',r_fresh:'Novidade — não jogada recentemente',
why_pick:'Por que esta escolha:',b_story:'Modo História',b_mastered:'Dominada',
level_of:'Nível {l} de 3',parent_script:'Roteiro para o adulto',log_btn:'Registrar esta sessão',
toast_prefill:'Atividade preenchida!',toast_updated:'Sessão atualizada!',
toast_lvlup:'Subiu de nível! {a} → Nível {l}',toast_lvldown:'Voltou para o Nível {l} — é assim que deve funcionar!',
toast_saved:'Sessão salva!',confirm_del:'Apagar esta sessão?',toast_deleted:'Sessão apagada.',
confirm_clear:'Apagar TODAS as sessões? Isso não pode ser desfeito.\nDica: exporte um backup JSON antes.',
toast_cleared:'Todas as sessões foram apagadas.',
empty_history:'Nenhuma sessão ainda.<br/>Escolha uma janela no Plano e registre a primeira!',
today:'Hoje',yesterday:'Ontem',session:'sessão',sessions:'sessões',
cat_subitizing:'Subitização',cat_counting:'Contagem 6–10',cat_one_more_less:'Um a mais / a menos',cat_composition:'Parte-Parte-Todo',cat_stories:'Histórias numéricas',cat_counting_on:'Contar a partir de · Molduras',cat_comparison:'Comparação',cat_patterns:'Padrões',cat_shapes:'Formas e classificação',cat_workbook:'Livro de exercícios',
ms_calibrated:'ponto de partida',ms_mastered:'Dominado',ms_strong:'sessões fortes',
as_story:'Modo História / Camuflagem',as_story_on:'{n} sessões restantes',as_inactive:'Inativo',
as_cool:'Pausa de Parte-Parte-Todo (48h)',as_until:'Até ~',
as_dice:'Domínio do dado → Contar a partir de liberado',as_dice_on:'Dois Dados: Contar a partir de está disponível.',as_dice_off:'Chegue ao Nível 3 no Dice Flash + 2× "Fácil demais"',
as_treat:'Observação sobre recompensas',
as_treat_on:'{t} sessões com docinho / {o} sem: houve mais resistência com docinho. Amostra pequena — sem conclusão.',
as_treat_off:'{t} sessões com docinho / {o} sem: nenhuma diferença notável até agora.',
as_treat_low:'Ainda não há sessões suficientes para comparar recompensas ({t} com docinho / {o} sem — precisa de 5 de cada).',
obs_disclaimer:'Descreve apenas este registro. Não é diagnóstico, recomendação nem relação causal.',
as_lvl:'Ajustes de nível',
gp_mastered:'Explorado',gp_prog:'Progredindo',gp_notstarted:'Ainda não visitado',gp_building:'Construindo',gp_strong:'boas',
mood_empty:'Registre sessões para ver a linha de humor.',
stat_total:'Sessões totais',stat_excited:'Sessões animadas',stat_full:'Sessões completas',stat_miles:'Trilhos explorados',
toast_settings:'Configurações salvas!',toast_export:'Backup exportado!',
confirm_import:'Importar {n} sessões? Isso substitui os dados atuais.',toast_import:'Backup importado!',
alert_badfile:'Este arquivo não é um backup válido do Math Trail.',
btn_suggest:'Sugerir',done_win:'✓ feita hoje',set_lang:'Idioma',
hs_week:'esta semana',hs_days:'dias seguidos',hs_excited:'animada',
hs_empty:'Semana nova — um único momento de brincadeira já conta.',
setup_lbl:'Montagem na mesa',
btn_start:'Iniciar',btn_swap:'Trocar',plan_pick:'Escolha de hoje',
comp_hint:'Escolha a opção mais próxima — não existe resultado "ruim".',
sess_active:'Sessão em andamento',sess_end:'Encerrar e registrar',sess_discard:'descartar',
sess_discard_confirm:'Descartar esta sessão sem registrar?',
sess_busy:'Encerre a sessão atual primeiro.',toast_started:'Sessão iniciada — divirtam-se!',
min_suffix:'min',
app_tagline:'Pequenos momentos, progresso de verdade',
skip_link:'Ir direto para o plano de hoje',
chip_started:'em andamento',no_pick:'Sem sugestão agora — escolha uma da lista abaixo.',
pending_note:'Sessão encerrada — salve abaixo para guardar o registro.',
off_toast:'Sem internet — tudo continua funcionando neste aparelho.',
on_toast:'Conexão de volta.',
upd_toast:'Uma nova versão está pronta — recarregue para usar.',
st_adaptive_sub:'Uma espiada em como o app se ajusta às suas sessões — nada aqui é julgamento.',
demo_on:'Modo demonstração — dados sintéticos carregados. Apague em Configurações.',
btn_rest:'Hoje não é um bom momento',rest_done:'Anotado — descansar também faz parte 💚',
rest_chip:'dia de pausa',
imp_invalid:'Este arquivo não é um backup válido (campos ausentes ou inválidos). Nada foi alterado.',
imp_future:'Este backup vem de uma versão mais nova do app. Atualize o app primeiro. Nada foi alterado.',
imp_fail:'A importação falhou — seus dados anteriores foram restaurados automaticamente.'
}
};
function t(k){ const d=I18N[LANG]||I18N.en; return (d[k]!==undefined?d[k]:(I18N.en[k]!==undefined?I18N.en[k]:k)); }
// Milestones carry English fallbacks in data; the interface prefers i18n keys.
const msLabel=m=>{ const v=t('ms_'+m.id); return v!=='ms_'+m.id?v:m.label; };
const msDetail=m=>{ const v=t('msd_'+m.id); return v!=='msd_'+m.id?v:m.detail; };
function setLang(l){ LANG=l; repo.saveLang(l); applyLang(); }
function applyLang(){
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.innerHTML=t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.setAttribute('placeholder',t(el.getAttribute('data-i18n-ph'))); });
  const bp=document.getElementById('lang-pt'), be=document.getElementById('lang-en');
  if(bp&&be){ bp.classList.toggle('on',LANG==='pt'); be.classList.toggle('on',LANG==='en'); }
  buildActivitySelect(); buildPlanPickers(); renderHeader(); renderBanners(); renderWeekCard();
  renderLogList(); renderAnalytics(); renderSessionBar();
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
  Object.keys(WINDOWS).forEach(winKey=>{
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
  const pick=weightedPick(scored);
  currentPick=pick.id;
  renderBlueprint(pick.id, winKey, pick.reasons);
}
function reroll(){
  if(!currentWindow) return;
  const scored=scorePool(currentWindow, currentPick);
  if(!scored.length) return;
  const pick=weightedPick(scored);
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
let sessTick=null, pendingMins=null;
const getActive=()=>repo.getActive();
const setActive=(a)=>repo.setActive(a);

function startSession(winKey){
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
// A forgotten timer must not record an absurd duration (audit F3).
const MAX_SESSION_MINS = 120;

function endSession(){
  const a=getActive(); if(!a) return;
  pendingMins=Math.min(MAX_SESSION_MINS, Math.max(1,Math.round((Date.now()-new Date(a.startedAt))/60000)));
  setActive(null); renderSessionBar(); buildPlanPickers();
  document.getElementById('log-window').value=a.window;
  document.getElementById('log-activity').value=a.activity;
  // The session is over but not yet recorded — keep that visible until saved (audit A4).
  const pn=document.getElementById('pendingNote');
  if(pn){ pn.style.display='block'; pn.textContent=t('pending_note'); }
  showTab('log');
  showToast(t('toast_prefill'));
}
function discardSession(){
  if(!confirm(t('sess_discard_confirm'))) return;
  setActive(null); pendingMins=null; renderSessionBar(); buildPlanPickers();
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
  if(pendingMins!==null && editingId===null){ entry.mins=pendingMins; pendingMins=null; }
  const pn=document.getElementById('pendingNote'); if(pn) pn.style.display='none';
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
    entry.id=Date.now(); entry.timestamp=new Date().toISOString();
    const ns=applyLog(state, entry, logs);
    logs.push(entry); saveLogs(logs); saveState(ns);
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
// It never reduces any metric; the streak treats it as continuity (see renderWeekCard).
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
  if(!logs.length){
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

  el.innerHTML=Object.entries(byDay).map(([day,dayLogs])=>{
    let label=day;
    if(day===today) label=t('today');
    else if(day===yest) label=t('yesterday');
    else if(day!=='unknown') label=new Date(day+'T12:00:00').toLocaleDateString(LANG==='pt'?'pt-BR':'en-GB',{weekday:'short',day:'numeric',month:'short'});

    const cards=dayLogs.map(l=>{
      const act=ACTIVITIES[l.activity];
      const name=act?act.name:l.activity;
      const cat=act?act.category:'';
      const tm=l.timestamp?new Date(l.timestamp).toLocaleTimeString(LANG==='pt'?'pt-BR':'en-US',{hour:'2-digit',minute:'2-digit'}):'';
      const teach=act?(act.teaches||[]).map(x=>`<span style="font-size:11px;font-weight:800;color:var(--c-${cat})">${x}</span>`).join('<span style="color:var(--line)"> · </span>'):'';
      return `
      <div class="sesscard" style="--cat:var(--c-${cat||'counting'})">
        <div class="sess-top">
          <span class="sessmeta">${WIN_ICON[l.window]||''} ${t('w_'+l.window)} · ${tm}${l.mins?` · ${l.mins} ${t('min_suffix')}`:''}</span>
          <span class="sessacts">
            <button class="iconbtn" onclick="editLog(${l.id})" aria-label="Edit">✏️</button>
            <button class="iconbtn del" onclick="deleteLog(${l.id})" aria-label="Delete">🗑️</button>
          </span>
        </div>
        <div class="sessname">${name}</div>
        <div style="margin-bottom:8px">${teach}</div>
        <div class="pills">
          <span class="pill" style="background:var(--paper);color:var(--ink-soft)">${ENG_ICON[l.engagement]||'😐'} ${t('v_'+l.engagement)}</span>
          <span class="pill" style="background:var(--paper);color:var(--ink-soft)">${COMP_ICON[l.completion]||''} ${t('v_'+l.completion)}</span>
          <span class="pill" style="background:var(--paper);color:var(--ink-soft)">${EASE_ICON[l.ease]||''} ${t('v_'+l.ease)}</span>
          <span class="pill" style="${l.reward==='extrinsic'?'background:var(--c-patterns-bg);color:var(--c-patterns)':'background:var(--brand-bg);color:var(--brand-deep)'}">${l.reward==='extrinsic'?'🍬':l.reward==='connection'?'🤗':'💚'} ${t('v_'+l.reward)}</span>
        </div>
        ${l.notes?`<p class="sessnote">“${l.notes}”</p>`:''}
      </div>`;
    }).join('');

    return `<div class="card">
      <div class="daytop">
        <span class="dl">${label}</span>
        <span class="dc">${dayLogs.length} ${dayLogs.length>1?t('sessions'):t('session')}</span>
      </div>
      ${cards}
    </div>`;
  }).join('');
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
  // Day streak — a gentle secondary signal, never the headline metric.
  // A logged rest day ("not a good moment today") preserves continuity: it
  // neither breaks the streak nor inflates it with a fake session.
  const days=new Set(logs.map(l=>sessionDayKey(l)));
  const countsForStreak=k=>days.has(k)||restDays.has(k);
  let streak=0; let d=now;
  if(!countsForStreak(localDateKey(d))) d=addDays(d,-1);
  while(countsForStreak(localDateKey(d))){ if(days.has(localDateKey(d))) streak++; d=addDays(d,-1); }
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
    el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Mood over the last ${n} sessions">
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
  document.getElementById('modalBg').classList.add('open');
}
function closeSettings(){ document.getElementById('modalBg').classList.remove('open'); }
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
      closeSettings(); showToast(t('toast_import'));
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

// Inline onclick handlers live in index.html — expose the API they need.
Object.assign(window, { setLang, showTab, openSettings, closeSettings, saveSettings,
  exportData, importData, clearLogs, saveLog, editLog, deleteLog, cancelEdit,
  startSession, endSession, discardSession, swapPlan, viewPlan, pickFromList,
  generateBlueprint, reroll, prefillLog, markRestDay });

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
