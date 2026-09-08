/* TEAM EYSL v164 — records UI polish */
(()=>{if(window.__EYSL_RECORDS_V164__)return;window.__EYSL_RECORDS_V164__=true;
const s=document.createElement('style');s.textContent=`
/* Records: neutral labels, lavender selected only */
#myRecords button,#records button,.recordTabs button{color:#17181b!important;background:#fff!important;border-color:#dfe2e7!important;box-shadow:none!important}
#myRecords button.active,#records button.active,.recordTabs button.active,#myRecords button[aria-pressed="true"],#records button[aria-pressed="true"]{background:#705aa0!important;border-color:#705aa0!important;color:#fff!important}
/* distance filter must follow the same selected state; remove old black */
#myRecords button[style*="background: rgb(0"],#records button[style*="background: rgb(0"],#myRecords button[style*="background:#000"],#records button[style*="background:#000"]{background:#705aa0!important;border-color:#705aa0!important;color:#fff!important}
/* PB cards: subtle premium treatment */
.eysl-pb-card{position:relative!important;overflow:hidden!important;border:1px solid #e7e1f2!important;background:linear-gradient(145deg,#fff 0%,#faf8fe 100%)!important;box-shadow:0 8px 24px rgba(74,58,108,.06)!important}
.eysl-pb-card:after{content:'PB';position:absolute;right:16px;top:14px;font-size:10px;font-weight:800;letter-spacing:.12em;color:#8e7ab9;background:#f1edf9;border-radius:999px;padding:5px 7px}
.eysl-pb-card .eysl-pb-value{letter-spacing:-.02em}
`;document.head.appendChild(s);
function paint(){const root=document.getElementById('myRecords')||document.getElementById('records')||document.body;if(!/MY PB/.test(root.innerText||''))return;
// turn every non-selected blue filter label black; selected stays white
root.querySelectorAll('button').forEach(b=>{const cs=getComputedStyle(b),bg=cs.backgroundColor;const selected=b.classList.contains('active')||b.getAttribute('aria-pressed')==='true'||bg==='rgb(0, 0, 0)'||bg==='rgb(112, 90, 160)'||bg==='rgb(101, 84, 143)';b.style.setProperty('color',selected?'#fff':'#17181b','important');if(bg==='rgb(0, 0, 0)')b.style.setProperty('background','#705aa0','important')});
// identify four PB cards from the MY PB heading area
const headings=[...root.querySelectorAll('h1,h2,h3,h4')];const h=headings.find(x=>/MY PB/.test(x.textContent||''));if(h){let p=h.nextElementSibling;let guard=0;while(p&&guard++<4){if(p.querySelectorAll){const candidates=[p,...p.querySelectorAll('div')];candidates.forEach(c=>{const txt=(c.textContent||'').trim();if(/^(자유형|배영|평영|접영)\s*\d{2}\.\d{2}$/.test(txt.replace(/\s+/g,' '))||((/자유형|배영|평영|접영/.test(txt))&&/\d{2}\.\d{2}/.test(txt)&&c.children.length<=3)){c.classList.add('eysl-pb-card');const val=[...c.querySelectorAll('*')].find(x=>/^\d{2}\.\d{2}$/.test((x.textContent||'').trim()));val?.classList.add('eysl-pb-value')}})}p=p.nextElementSibling}}
}
const o=new MutationObserver(()=>requestAnimationFrame(paint));const start=()=>{paint();o.observe(document.body,{childList:true,subtree:true})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();