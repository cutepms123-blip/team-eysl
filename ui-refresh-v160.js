/* TEAM EYSL v160 — event visual refresh + purple accent + detail-only status + unified training counts */
(()=>{
 if(window.__EYSL_UI_V160__)return;window.__EYSL_UI_V160__=true;
 const PURPLE='#9b8acb', PALE='#f2effa', PALE2='#e9e3f6', DARK='#65548f';
 const css=document.createElement('style');css.textContent=`
:root{--eysl-purple:${PURPLE};--eysl-purple-pale:${PALE};--eysl-purple-soft:${PALE2};--eysl-purple-dark:${DARK}}
/* restrained purple accent */
.link,.good{color:var(--eysl-purple-dark)!important}.filters button.active,.recordTabs button.active,.chatTabs button.active,.bigChoice.on{background:var(--eysl-purple-dark)!important;border-color:var(--eysl-purple-dark)!important}.tag.ok{background:var(--eysl-purple-pale)!important;color:var(--eysl-purple-dark)!important}.day.selected{background:var(--eysl-purple-dark)!important}.dot{background:var(--eysl-purple)!important}
/* event hub */
#eventMenu .menuCard,#eventMenu .row,#events .menuCard,#events .row{position:relative;overflow:hidden;transition:.15s}
.eysl-event-icon{width:44px;height:44px;border-radius:14px;background:var(--eysl-purple-pale);display:grid;place-items:center;font-size:21px;flex:0 0 44px;margin-right:12px}
.eysl-event-row{display:flex!important;align-items:center!important}.eysl-event-row .eysl-chevron{margin-left:auto;color:#aaa;font-size:20px}
/* detail-only application status */
.statusCard>.actions button[data-eysl-status-hidden="1"]{display:none!important}
`;document.head.appendChild(css);
 const icons={'출석왕':'🏊','지각왕':'⏰','단축왕':'⚡','PB 수집왕':'🏅','대회왕':'🏆','영법별 랭킹':'📊'};
 function decorateEvents(){const root=document.getElementById('eventMenu')||document.getElementById('events');if(!root)return;root.querySelectorAll('.row,.menuCard').forEach(card=>{if(card.dataset.eyslDecorated)return;const label=[...card.querySelectorAll('b,h3')].find(x=>icons[(x.textContent||'').trim()]);if(!label)return;card.dataset.eyslDecorated='1';card.classList.add('eysl-event-row');const ic=document.createElement('div');ic.className='eysl-event-icon';ic.textContent=icons[label.textContent.trim()];card.insertBefore(ic,card.firstChild);});}
 function hideListStatus(){document.querySelectorAll('.statusCard>.actions').forEach(actions=>{[...actions.querySelectorAll('button')].forEach(b=>{if(/신청현황/.test((b.textContent||'').trim()))b.dataset.eyslStatusHidden='1';});});}
 function unifiedTrainingCounts(){for(const a of (window.activities||[])){if(a.kind!=='training')continue;const n=Array.isArray(a.details?.participants)?a.details.participants.length:null;if(n==null)continue;const cap=Number(a.capacity)||n;document.querySelectorAll('.statusCard').forEach(card=>{if(!card.textContent.includes(a.title||'')||!card.textContent.includes(a.activity_date||''))return;[...card.querySelectorAll('p,span,div')].filter(x=>!x.children.length).forEach(el=>{const t=(el.textContent||'').trim();if(/^\d+\/\d+\s*·/.test(t))el.textContent=t.replace(/^\d+\/\d+/,`${n}/${cap}`);});});}}
 function apply(){decorateEvents();hideListStatus();unifiedTrainingCounts();}
 const obs=new MutationObserver(()=>requestAnimationFrame(apply));const start=()=>{apply();obs.observe(document.body,{childList:true,subtree:true});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();