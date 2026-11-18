/* Team EYSL records / report enhancement. Existing records remain source of truth. */
(function(){
'use strict';
const strokes=['자유형','배영','평영','접영','개인혼영'];
let mode='all',pool='25',stroke='자유형',distance=50,reportPool='25',allRows=[],loading=false;
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const secs=r=>typeof recordSeconds==='function'?recordSeconds(r.result):null;
const date=r=>String(r.event_date||'').slice(0,10);
const fmt=n=>Number.isFinite(n)?n.toFixed(2)+'초':'—';
const kinds=r=>personalStrokeKind(r,effectiveRecordCategory(r));
const rows=()=>allRows.filter(r=>r.subcategory!=='relay'&&validStoredRecord(r));
const scoped=(p)=>rows().filter(r=>p==='all'||recordPoolMeters(r)===Number(p));
const relevant=(p,k,d)=>scoped(p).filter(r=>effectiveRecordCategory(r)!=='fin'&&kinds(r)===k&&recordDistance(r)===d);
function best(rs){return rs.slice().sort((a,b)=>secs(a)-secs(b))[0]}
function goals(){try{return JSON.parse(localStorage.getItem('eysl_record_goals_v233')||'{}')}catch{return {}}}
function goalKey(){return [currentUser?.memberId,reportPool,stroke,distance].join('|')}
function title(){return stroke+' '+distance+'m 기록 리포트'}
function refreshSummary(){
 const el=$('eyslRecordSummary');if(!el)return;
 const y=new Date().getFullYear();
 const yearRows=rows().filter(r=>date(r).startsWith(String(y)));
 const meets=new Set(yearRows.filter(r=>effectiveRecordCategory(r)!=='other').map(r=>date(r)+'|'+r.event_name));
 const keys=new Set(rows().filter(r=>Number.isFinite(secs(r))&&recordPoolMeters(r)>0).map(r=>[recordPoolMeters(r),effectiveRecordCategory(r),kinds(r),recordDistance(r)].join('|')));
 const improved=rows().filter(r=>{const older=rows().filter(x=>x!==r&&date(x)<date(r)&&recordPoolMeters(x)===recordPoolMeters(r)&&effectiveRecordCategory(x)===effectiveRecordCategory(r)&&kinds(x)===kinds(r)&&recordDistance(x)===recordDistance(r));return older.length&&secs(r)<Math.min(...older.map(secs))}).filter(r=>date(r).startsWith(String(y)));
 el.innerHTML='<h3>▥ '+y+'년 기록 집계</h3><div class="eyslKpis"><div>🏆 <small>참가 대회</small><b>'+meets.size+'회</b></div><div>⌁ <small>보유 PB</small><b>'+keys.size+'개</b></div><div>🏅 <small>PB 갱신</small><b>'+improved.length+'회</b></div></div>';
}
function swimSvg(kind){
 const poses={
 '자유형':'<path d="M4 20l8-5 8 1 7-5 8 2M13 15l-2-7 9 2M24 15l6 7 9 1"/>',
 '배영':'<path d="M4 19l10 1 9-6 12 3M14 20l-2-9-6-4M24 15l7-8 8-2"/>',
 '평영':'<path d="M4 20l11-4 9 3 11-4M16 16l-4-7-7 1M24 19l5 7 9-1"/>',
 '접영':'<path d="M3 19l12-5 10 5 12-5M15 14l-8-8M25 19l8-11"/>'
 };
 return '<svg viewBox="0 0 44 32" width="34" height="26" fill="none" stroke="#ff705b" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="21" cy="7" r="3" fill="#ff705b" stroke="none"/>'+(poses[kind]||poses['자유형'])+'<path d="M3 28q5-3 10 0t10 0t10 0t9 0" stroke-width="1.5"/></svg>';
}
function refreshPb(){
 const el=$('eyslStrokePB');if(!el)return;
 const p=pool;
 if(typeof recordCurrentType!=='undefined'&&recordCurrentType==='relay'){
 el.innerHTML='<h3>▥ 종목별 PB</h3><div class="eyslPbGrid">'+strokes.slice(0,4).map(k=>'<div><span class="eyslSwimIcon" aria-hidden="true">'+swimSvg(k)+'</span><small>'+k+'</small><b>—</b></div>').join('')+'</div>';return;
 }
 el.innerHTML='<h3>▥ 종목별 PB</h3><div class="eyslPbGrid">'+strokes.slice(0,4).map(k=>{
 const category=typeof recordMajor==='string'?recordMajor:'meet';
 const v=best(relevant(p,k,50).filter(r=>effectiveRecordCategory(r)===category));
 return '<div><span class="eyslSwimIcon" aria-hidden="true">'+swimSvg(k)+'</span><small>'+k+'</small><b>'+fmt(v?secs(v):NaN)+'</b>'+(p==='all'&&v?'<em>'+recordPoolMeters(v)+'m 풀</em>':'')+'</div>';
 }).join('')+'</div>';
}
function syncPool(){
 const tabs=$('recordPoolTabs');if(!tabs)return;
 tabs.querySelectorAll('button').forEach(b=>{b.textContent=b.dataset.pool==='all'?'종합':b.dataset.pool+'m';b.classList.toggle('active',b.dataset.pool===pool)});
}
function updateAll(){
 refreshSummary();refreshPb();syncPool();
}
function reportData(){return relevant(reportPool,stroke,distance).sort((a,b)=>date(a).localeCompare(date(b)))}
function report(){
 const el=$('eyslRecordReport');if(!el)return;
 const rs=reportData(),first=rs[0],pb=best(rs),g=goals()[goalKey()]||{},target=Number(g.seconds),hasGoal=Number.isFinite(target)&&target>0;
 const series=rs.filter(r=>Number.isFinite(secs(r)));
 const start=first?secs(first):NaN,current=pb?secs(pb):NaN;
 const diff=hasGoal&&pb?current-target:NaN;
 const days=(g.date||'2026-12-20')?Math.ceil((new Date((g.date||'2026-12-20')+'T00:00:00')-new Date())/86400000):null;
 const elapsed=series.length>1?(new Date(date(series[series.length-1]))-new Date(date(series[0])))/86400000/30.4375:0;
 const speed=elapsed>0?(start-current)/elapsed:NaN;
 const sw=strokes.map(s=>'<button data-report-stroke="'+s+'" class="'+(s===stroke?'active':'')+'">'+s+'</button>').join('');
 const pools=['25','50'].map(p=>'<button data-report-pool="'+p+'" class="'+(p===reportPool?'active':'')+'">'+p+'m</button>').join('');
 const distances=(stroke==='개인혼영'?[100,200]:[50,100]).map(d=>'<button data-report-distance="'+d+'" class="'+(distance===d?'active':'')+'">'+d+'m</button>').join('');
 el.innerHTML='<div class="eyslFilterRow">'+sw+'</div><div class="eyslFilterRow">'+pools+'</div><div class="eyslFilterRow">'+distances+'</div><h3>▥ '+safe(title())+'</h3>'+
 '<div class="eyslReportKpis"><div><small>첫 기록</small><b>'+fmt(start)+'</b><small>'+safe(first?date(first):'')+'</small></div><div class="focus"><small>현재 PB</small><b>'+fmt(current)+'</b><small>'+safe(pb?date(pb):'')+'</small></div><div><small>목표 기록</small><b>'+fmt(hasGoal?target:NaN)+'</b></div></div>'+
 '<div class="eyslReportCard"><div class="eyslCardHead"><b>↗ 기록 변화 추이</b><span>'+series.length+'개 기록</span></div>'+chart(series,hasGoal?target:null)+'</div>'+
 '<div class="eyslReportCard eyslMetrics"><div><small>목표일까지</small><strong>'+(days===null?'미설정':days>=0?'D-'+days:'D+'+Math.abs(days))+'</strong><small>'+safe(g.date||'2026-12-20')+'</small></div><div><p>목표까지 차이 <b>'+fmt(diff)+'</b></p><p>첫 기록 대비 단축 <b>'+fmt(first&&pb?start-current:NaN)+'</b></p><p>평균 개선 속도 <b>'+fmt(speed)+'/월</b></p></div></div>'+
 '<div class="eyslReportCard"><b>▥ 분석 한마디</b><p>'+ (series.length<2?'비교할 기록이 충분하지 않아요. 같은 조건의 기록이 추가되면 변화를 확인할 수 있어요.':start>current?'첫 기록보다 '+fmt(start-current)+' 단축했어요. 목표 달성 가능성은 기록 추이와 남은 기간을 함께 확인해 주세요.':'기록 변화 추이를 확인하고 다음 목표를 설정해 보세요.')+'</p></div>'+
 '<div class="eyslReportCard"><b>목표 설정</b><div class="eyslGoalInputs"><label>목표 기록 (초)<input id="eyslGoalSeconds" inputmode="decimal" type="number" min="1" step="0.01" value="'+(hasGoal?target:'')+'" placeholder="예: 38.00"></label><label>목표일<input id="eyslGoalDate" type="date" value="'+safe(g.date||'')+'"></label><button id="eyslGoalSave">저장</button></div><small>이 기기 브라우저에 저장되는 목표입니다.</small></div>';
}
function chart(rs,target){
 if(!rs.length)return '<p class="eyslEmpty">선택한 조건에 기록이 없습니다.</p>';
 const vals=rs.map(secs),min=Math.min(...vals,...(target?[target]:[])),max=Math.max(...vals,...(target?[target]:[])),low=min-Math.max(.4,(max-min)*.12),high=max+Math.max(.4,(max-min)*.12),w=340,h=185;
 const x=i=>32+(rs.length===1?138:i*280/(rs.length-1)),y=v=>12+(high-v)/(high-low)*143;
 const points=vals.map((v,i)=>x(i)+','+y(v)).join(' ');
 return '<svg viewBox="0 0 340 185" role="img" aria-label="기록 변화 그래프"><line x1="32" y1="155" x2="320" y2="155" stroke="#59616d"/>'+(target?'<line x1="32" y1="'+y(target)+'" x2="320" y2="'+y(target)+'" stroke="#f5aa6a" stroke-dasharray="5 4"/>':'')+'<polyline points="'+points+'" fill="none" stroke="#ff705b" stroke-width="3"/>'+vals.map((v,i)=>'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="4" fill="#ff705b"/><text x="'+x(i)+'" y="'+Math.max(11,y(v)-10)+'" fill="#ffb19d" font-size="10" text-anchor="middle">'+v.toFixed(2)+'</text>').join('')+'</svg>';
}
function activate(next){mode=next;$('eyslRecordAll').hidden=next!=='all';$('eyslRecordReport').hidden=next!=='report';document.querySelectorAll('[data-eysl-record-tab]').forEach(b=>b.classList.toggle('active',b.dataset.eyslRecordTab===next));if(next==='report')report()}
function mountHomeBanner(){const home=$('home');if(!home||$('eyslHomeBrandBanner'))return;const banner=document.createElement('div');banner.id='eyslHomeBrandBanner';banner.setAttribute('role','img');banner.setAttribute('aria-label','TEAM EYSL SWIMMING TEAM');banner.innerHTML='<div class="eyslBannerSwimmer">◠</div><div class="eyslBannerTitle">TEAM <span>EYSL</span></div><div class="eyslBannerSubtitle">S W I M M I N G &nbsp; T E A M</div>';home.insertBefore(banner,home.firstElementChild)}
function mount(){mountHomeBanner();
 const section=$('records');if(!section||$('eyslRecordTabs'))return;
 const head=section.querySelector('.pagehead');
 head.insertAdjacentHTML('afterend','<div id="eyslRecordTabs" class="eyslTopTabs"><button class="active" data-eysl-record-tab="all">전체 기록</button><button data-eysl-record-tab="report">기록 리포트</button></div><div id="eyslRecordAll"><div id="eyslRecordSummary"></div><div id="eyslRecordTopPool"></div><div id="eyslRecordPB"></div><div id="eyslRecordExisting"></div></div><div id="eyslRecordReport" hidden></div>');
 const all=$('eyslRecordAll');
 const existing=$('eyslRecordExisting');
 const poolSection=section.querySelector('.recordPoolSection');
 $('eyslRecordTopPool').appendChild(poolSection);
 $('eyslRecordPB').innerHTML='<div id="eyslStrokePB"></div>';
 $('eyslRecordTopPool').append(section.querySelector('#recordMajor'),section.querySelector('#recordMinor'));
 existing.append(section.querySelector('#recordBody'));
 section.querySelector('#recordMajor').addEventListener('click',()=>setTimeout(refreshPb,0));
 section.addEventListener('click',e=>{
  const tab=e.target.closest('[data-eysl-record-tab]');if(tab){activate(tab.dataset.eyslRecordTab);return}
  const s=e.target.closest('[data-report-stroke]');if(s){stroke=s.dataset.reportStroke;distance=stroke==='개인혼영'?100:50;report();return}
  const p=e.target.closest('[data-report-pool]');if(p){reportPool=p.dataset.reportPool;report();return}
  const d=e.target.closest('[data-report-distance]');if(d){distance=Number(d.dataset.reportDistance);report();return}
  if(e.target.id==='eyslGoalSave'){const seconds=Number($('eyslGoalSeconds').value),day=$('eyslGoalDate').value;if(!Number.isFinite(seconds)||seconds<=0){alert('올바른 목표 기록을 입력해 주세요.');return}const g=goals();g[goalKey()]={seconds,date:day};localStorage.setItem('eysl_record_goals_v233',JSON.stringify(g));report()}
 });
 updateAll();
}
async function fetchRows(){
 if(loading||!currentUser?.memberId)return;
 loading=true;
 try{const {data,error}=await dbClient.from('records').select('id,category,subcategory,stroke,event_name,result,event_date,metadata,created_at').eq('member_id',currentUser.memberId).order('event_date',{ascending:false});if(error)throw error;allRows=data||[];updateAll();if(mode==='report')report()}catch(e){console.warn('Record report data:',e)}finally{loading=false}
}
const originalShowPage=window.showPage;
window.showPage=function(id){const result=originalShowPage.apply(this,arguments);if(id==='records'){mount();activate('all');fetchRows()}return result};
try{showPage=window.showPage}catch(_){}
const originalPool=window.setRecordPoolFilter;
window.setRecordPoolFilter=function(value,btn){pool=String(value);const result=originalPool.apply(this,arguments);updateAll();return result};
try{setRecordPoolFilter=window.setRecordPoolFilter}catch(_){}
const originalShowRecord=window.showRecord;
window.showRecord=async function(){const result=await originalShowRecord.apply(this,arguments);refreshPb();return result};
try{showRecord=window.showRecord}catch(_){}
const originalFiltered=window.renderRecordFilteredContent;
window.renderRecordFilteredContent=function(){const result=originalFiltered.apply(this,arguments);const pb=$('recordBody')?.querySelector('.recordScreenHead');if(pb)pb.remove();const grid=$('recordBody')?.querySelector('.screenshotPbGrid');if(grid)grid.remove();return result};
try{renderRecordFilteredContent=window.renderRecordFilteredContent}catch(_){}
const css=document.createElement('style');css.textContent=`
#eyslHomeBrandBanner{background:linear-gradient(145deg,#15191f,#0a0b0e 68%);border:1px solid #3b414b;border-radius:15px;padding:15px 8px 18px;text-align:center;margin:8px 0 14px;min-height:112px;position:relative;overflow:hidden}
#eyslHomeBrandBanner:before,#eyslHomeBrandBanner:after{content:"";position:absolute;width:90px;height:7px;background:repeating-linear-gradient(90deg,#ff705b 0 14px,#262a31 14px 22px);transform:rotate(-30deg)}
#eyslHomeBrandBanner:before{left:-18px;top:12px}#eyslHomeBrandBanner:after{right:-18px;bottom:12px}
#eyslHomeBrandBanner .eyslBannerSwimmer{font-size:22px;color:#ff705b;height:25px;line-height:22px}
#eyslHomeBrandBanner .eyslBannerTitle{font-size:29px;letter-spacing:-1px;font-weight:900;font-style:italic;color:#fff;line-height:1.2}
#eyslHomeBrandBanner .eyslBannerTitle span{color:#ff705b}
#eyslHomeBrandBanner .eyslBannerSubtitle{font-size:9px;letter-spacing:2px;color:#b8bdc6;margin-top:5px}
#records .eyslTopTabs{display:flex;gap:0;margin:12px 0 18px;background:#1b1e23;border:1px solid #474b52;border-radius:22px;overflow:hidden}
#records .eyslTopTabs button{flex:1;background:transparent;color:#f4f5f7;border:0;padding:12px 3px;font-weight:700}
#records .eyslTopTabs button.active{background:#ff715c;color:#fff;border-radius:22px}
#records #eyslRecordSummary h3,#records #eyslStrokePB h3,#records #eyslRecordReport h3{font-size:15px;color:#f4f5f7;margin:15px 0 10px}
#records .eyslKpis,#records .eyslPbGrid,#records .eyslReportKpis{display:grid;gap:7px;grid-template-columns:repeat(3,minmax(0,1fr))}
#records .eyslKpis>div,#records .eyslPbGrid>div,#records .eyslReportKpis>div{background:#202329;border:1px solid #41454e;border-radius:12px;padding:10px 5px;text-align:center;color:#f6f6f6;min-width:0}
#records .eyslKpis small,#records .eyslPbGrid small,#records .eyslReportKpis small{display:block;color:#c6cbd1;font-size:11px}
#records .eyslKpis b,#records .eyslPbGrid b,#records .eyslReportKpis b{display:block;color:#fff;font-size:17px}
#records .eyslPbGrid{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:16px}
#records .eyslSwimIcon{display:flex;align-items:center;justify-content:center;color:#ff705b;height:28px}
#records .eyslPbGrid em{font-size:10px;color:#aeb8c4;font-style:normal}
#records .recordPoolSection{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0!important}
#records #recordPoolTabs{display:flex;gap:8px;margin:12px 0;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
#records #recordPoolTabs button{flex:1;background:#14161a!important;border:1px solid #545963!important;color:#9da5b0!important;border-radius:22px!important;min-height:36px}
#records #recordPoolTabs button.active{background:#14161a!important;border:2px solid #ff705b!important;color:#ff705b!important}
#records #recordMajor button.active,#records #recordMinor button.active,#records #recordDetailTabs button.active,#records #recordDistanceTabs button.active{color:#ff705b!important}
#records #eyslRecordReport .eyslFilterRow{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
#records #eyslRecordReport .eyslFilterRow button{background:#17191e;color:#bec4cb;border:1px solid #525761;border-radius:22px;padding:8px 10px;font-size:12px}
#records #eyslRecordReport .eyslFilterRow button.active{color:#ff705b;border-color:#ff705b}
#records .eyslReportKpis{margin-bottom:14px}
#records .eyslReportKpis .focus{border-color:#ff705b;background:#382629}
#records .eyslReportCard{border:1px solid #43464e;background:#1c1e23;border-radius:15px;padding:14px;margin:12px 0;color:#f3f4f6}
#records .eyslReportCard svg{width:100%;height:auto;display:block}
#records .eyslCardHead{display:flex;justify-content:space-between;align-items:center}
#records .eyslCardHead span{font-size:11px;color:#c6cbd1}
#records .eyslMetrics{display:grid;grid-template-columns:40% 60%;gap:6px}
#records .eyslMetrics>div:first-child{border-right:1px solid #555;display:flex;flex-direction:column;justify-content:center;align-items:center}
#records .eyslMetrics strong{font-size:33px;color:#ff705b}
#records .eyslMetrics small{font-size:11px;color:#cbd1d9}
#records .eyslMetrics p{display:flex;justify-content:space-between;margin:6px 8px;font-size:12px;gap:8px}
#records .eyslGoalInputs{display:flex;gap:6px;align-items:end;flex-wrap:wrap}
#records .eyslGoalInputs label{font-size:11px;flex:1;min-width:90px}
#records .eyslGoalInputs input{display:block;max-width:100%;width:100%;font-size:16px;background:#11151a;color:white;border:1px solid #646b75;border-radius:8px;padding:8px}
#records .eyslGoalInputs button{background:#ff705b;color:#fff;border:0;border-radius:8px;padding:10px}
#records .eyslEmpty{color:#b7c1cc;font-size:12px}
#records #recordBody .historyCard{background:#f8f9fb!important;color:#14171c!important;border:1px solid #d7dbe0!important;border-radius:13px!important;min-height:65px!important;padding:12px!important;margin:8px 0!important;display:flex;align-items:center;gap:8px}
#records #recordBody .historyCard b,#records #recordBody .historyCard .historyMeet{color:#14171c!important;font-weight:800!important}
#records #recordBody .historyCard p{color:#555d67!important;font-size:11px!important;margin:4px 0 0!important}
#records #recordBody .historyCard .improve{color:#22844b!important}
#records #recordBody .historyCard .slower{color:#e4543e!important}
#records #recordBody .historyCard>span:last-child{font-size:12px!important;white-space:nowrap}
#records #recordBody .historyCard>div{flex:1;min-width:0}
#records #recordBody .relayFilteredList .recordRow{background:#f8f9fb!important;color:#14171c!important;border:1px solid #d7dbe0!important;border-radius:13px!important;padding:12px!important;margin:8px 0!important}
#records #recordBody .relayFilteredList .recordRow b,#records #recordBody .relayFilteredList .recordRow strong{color:#14171c!important}
#records #recordBody .relayFilteredList .recordRow p,#records #recordBody .relayFilteredList .recordRow small{color:#555d67!important}
`;document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();