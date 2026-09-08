/* TEAM EYSL v172 — shared canonical UI/data rendering */
(()=>{if(window.__EYSL_CANONICAL_V172__)return;window.__EYSL_CANONICAL_V172__=true;
const SEP19='a606d356-fb6b-424b-b4f8-b7226233ed6b';
const css=document.createElement('style');css.textContent=`
:root{--eysl-purple:#705aa0;--eysl-purple-pale:#f1ebfb;--eysl-open-bg:#e8f7ec;--eysl-open-fg:#2f8050;--eysl-closed-bg:#fff2c9;--eysl-closed-fg:#7a5b00;--eysl-cancel:#f3a1a1}
button,.btn{color:#111318}.btn.outline{background:#fff!important;color:#111318!important}.btn.primary,.btn.amber{color:#fff!important}.btn.amber{background:var(--eysl-cancel)!important;border-color:var(--eysl-cancel)!important}
.statusPill,.tag{width:auto!important;min-width:0!important;height:28px!important;padding:0 10px!important;border-radius:999px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important}
.eysl-open{background:var(--eysl-open-bg)!important;color:var(--eysl-open-fg)!important;border-color:#d7efdf!important}.eysl-closed{background:var(--eysl-closed-bg)!important;color:var(--eysl-closed-fg)!important;border-color:#f4e3ab!important}.eysl-applied{background:var(--eysl-purple-pale)!important;color:#65548f!important;border-color:#e4d7f8!important}.eysl-done{background:#f0f1f3!important;color:#8b9097!important;border-color:#e6e8eb!important}
.day .dot:not(.race):not(.event){background:#70a99e!important}.day .dot.race{background:#9b8acb!important}.day .dot.event{background:#d6a26f!important}
.screenshotPbGrid{position:relative}.screenshotPbGrid:before{content:'🎉';position:absolute;right:4px;top:-38px;font-size:23px}.screenshotPbGrid .screenshotPb{border-color:#d9cdef!important;background:linear-gradient(145deg,#fff,#f4effb)!important;box-shadow:0 8px 22px rgba(91,69,132,.10)!important}
`;
document.head.appendChild(css);
const short=n=>String(n||'').split('/')[0].trim();
async function canonicalSep19(){try{const {data,error}=await dbClient.rpc('get_activity_application_people',{p_activity_id:SEP19});if(error)throw error;const p=(data||[]).filter(x=>x.application_type==='participant');const t=window.trainings?.[SEP19];if(t){t.participants=p.map(x=>x.nickname).filter(Boolean);t.capacity=20}return p.length}catch(e){console.error('v172 sep19',e);return null}}
function statusPaint(){document.querySelectorAll('.statusPill,.tag').forEach(el=>{const t=(el.textContent||'').trim();el.classList.remove('eysl-open','eysl-closed','eysl-applied','eysl-done');if(t==='신청 가능')el.classList.add('eysl-open');else if(t==='신청 마감')el.classList.add('eysl-closed');else if(t==='신청완료'||t==='신청 완료')el.classList.add('eysl-applied');else if(t==='종료')el.classList.add('eysl-done')})}
async function redrawTraining(){const n=await canonicalSep19();if(n===null)return;const t=window.trainings?.[SEP19];if(!t)return;const page=document.getElementById('trainingList');if(page?.classList.contains('active'))window.renderTrainingList?.();if(document.getElementById('home')?.classList.contains('active'))window.renderHome?.();}
const baseRTL=window.renderTrainingList;if(typeof baseRTL==='function')window.renderTrainingList=function(){const r=baseRTL.apply(this,arguments);requestAnimationFrame(statusPaint);return r};
const baseOpen=window.openTraining;if(typeof baseOpen==='function')window.openTraining=function(){const r=baseOpen.apply(this,arguments);requestAnimationFrame(statusPaint);return r};
const baseRace=window.renderRaceList;if(typeof baseRace==='function')window.renderRaceList=function(){const r=baseRace.apply(this,arguments);requestAnimationFrame(statusPaint);return r};
const baseHome=window.renderHome;if(typeof baseHome==='function')window.renderHome=function(){const r=baseHome.apply(this,arguments);requestAnimationFrame(statusPaint);return r};
const baseLoad=window.loadPersistentContent;if(typeof baseLoad==='function')window.loadPersistentContent=async function(){const r=await baseLoad.apply(this,arguments);await canonicalSep19();return r};
function fixScheduleNavigation(){document.querySelectorAll('#home .link').forEach(el=>{if(el.textContent.trim()!=='전체보기'||el.dataset.v172)return;el.dataset.v172='1';el.onclick=e=>{e?.preventDefault?.();window.showPage?.('schedule')}})}
function apply(){statusPaint();fixScheduleNavigation()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>{apply();redrawTraining()},{once:true}):(apply(),redrawTraining());
})();