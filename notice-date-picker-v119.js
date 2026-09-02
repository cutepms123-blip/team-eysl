/* TEAM EYSL notice date poll calendar v120 */
(()=>{
  if(window.__NOTICE_DATE_PICKER_V120__)return;
  window.__NOTICE_DATE_PICKER_V120__=true;

  const pad=n=>String(n).padStart(2,'0');
  const iso=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
  const parseDate=s=>{const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(Number(m[1]),Number(m[2])-1,Number(m[3])):null};

  const oldStyle=document.getElementById('NOTICE_DATE_PICKER_V119_STYLE');
  if(oldStyle)oldStyle.remove();
  const style=document.createElement('style');
  style.id='NOTICE_DATE_PICKER_V120_STYLE';
  style.textContent=`
    .pollDatePickerBtnV119{width:100%;border:0;background:#fff;border-radius:12px;padding:14px 15px;margin:0 0 9px;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:800;color:#444;text-align:left}
    .pollDatePickerBtnV119 small{font-size:10px;color:#999;font-weight:700}
    .pollDateModeV119 .pollOptionAdd{display:none!important}
    .pollDateModeV119 .pollOptionRow input[type=date]{pointer-events:none;background:#fff!important;font-weight:750;color:#333!important;-webkit-text-fill-color:#333;opacity:1}
    .pollCalendarOverlayV119{position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.42);display:flex;align-items:flex-end;justify-content:center;overscroll-behavior:contain}
    .pollCalendarSheetV119{width:100%;max-width:640px;background:#fff;border-radius:22px 22px 0 0;padding:22px 26px max(24px,env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.12)}
    .pollCalHeadV119{display:grid;grid-template-columns:48px 1fr 48px;align-items:center;margin-bottom:26px}.pollCalHeadV119 button{border:0;background:transparent;font-size:34px;line-height:1;padding:4px;color:#111}.pollCalTitleV119{text-align:center;font-size:20px;font-weight:850;color:#222}
    .pollCalWeekV119,.pollCalGridV119{display:grid;grid-template-columns:repeat(7,1fr);text-align:center}.pollCalWeekV119{font-size:12px;color:#555;margin-bottom:10px}.pollCalGridV119{row-gap:7px}.pollCalDayV119{aspect-ratio:1/1;max-width:48px;width:100%;justify-self:center;border:0;border-radius:50%;background:transparent;font-size:17px;color:#111;display:grid;place-items:center;padding:0;touch-action:manipulation}.pollCalDayV119.other{color:#c9c9c9}.pollCalDayV119.selected{background:#1479e8;color:#fff;font-weight:850}.pollCalDayV119.today:not(.selected){color:#1479e8;font-weight:850}
    .pollCalActionsV119{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:28px}.pollCalActionsV119 button{border:0;border-radius:12px;padding:17px 10px;font-size:15px;font-weight:850}.pollCalCancelV119{background:#f0f0f0;color:#222}.pollCalConfirmV119{background:#ffe000;color:#111}.pollCalHintV119{text-align:center;font-size:10px;color:#969696;margin-top:-12px;margin-bottom:14px}
    @media(max-width:430px){.pollCalendarSheetV119{padding-left:18px;padding-right:18px}.pollCalDayV119{font-size:16px;max-width:44px}}
  `;
  document.head.appendChild(style);

  let selected=new Set();
  let viewYear=(new Date()).getFullYear();
  let viewMonth=(new Date()).getMonth();
  let enhancing=false;
  let enhanceQueued=false;

  function mount(){return document.getElementById('noticePollComposerMount')}
  function dateMode(){
    const m=mount();if(!m)return false;
    const active=[...m.querySelectorAll('.pollTypeTabs button')].find(b=>b.classList.contains('active'));
    return !!active&&String(active.textContent||'').includes('날짜');
  }
  function readDates(){
    return [...(mount()?.querySelectorAll('#pollV115Options input[data-poll-option-id]')||[])].map(i=>i.value).filter(v=>/^\d{4}-\d{2}-\d{2}$/.test(v));
  }
  function enhance(){
    if(enhancing)return;
    enhancing=true;
    try{
      const m=mount();if(!m)return;
      const isDate=dateMode();
      if(m.classList.contains('pollDateModeV119')!==isDate)m.classList.toggle('pollDateModeV119',isDate);
      const old=m.querySelector('#pollDatePickerBtnV119');
      if(!isDate){if(old)old.remove();return}
      const opts=m.querySelector('#pollV115Options');if(!opts)return;
      let btn=old;
      if(!btn){
        btn=document.createElement('button');btn.type='button';btn.id='pollDatePickerBtnV119';btn.className='pollDatePickerBtnV119';
        btn.addEventListener('click',openCalendar,{passive:true});
        opts.parentNode.insertBefore(btn,opts);
      }
      const n=readDates().length;
      const wanted=`<span>📅 날짜 선택</span><small>${n?`${n}개 선택됨`:'여러 날짜를 한 번에 선택'}</small>`;
      if(btn.innerHTML!==wanted)btn.innerHTML=wanted;
      m.querySelectorAll('#pollV115Options input[type=date]').forEach(i=>{
        if(!i.readOnly)i.readOnly=true;
        if(i.getAttribute('aria-label')!=='선택된 투표 날짜')i.setAttribute('aria-label','선택된 투표 날짜');
      });
    }finally{enhancing=false}
  }
  function scheduleEnhance(){
    if(enhanceQueued)return;
    enhanceQueued=true;
    requestAnimationFrame(()=>{enhanceQueued=false;enhance()});
  }

  function openCalendar(){
    if(!dateMode())return;
    if(document.getElementById('pollCalendarOverlayV119'))return;
    selected=new Set(readDates());
    const first=[...selected].sort()[0];
    const base=parseDate(first)||new Date();
    viewYear=base.getFullYear();viewMonth=base.getMonth();
    const overlay=document.createElement('div');
    overlay.id='pollCalendarOverlayV119';overlay.className='pollCalendarOverlayV119';
    overlay.innerHTML='<div class="pollCalendarSheetV119" role="dialog" aria-modal="true"></div>';
    overlay.addEventListener('click',e=>{if(e.target===overlay)closeCalendar()});
    document.body.appendChild(overlay);
    renderCalendar();
  }
  function closeCalendar(){document.getElementById('pollCalendarOverlayV119')?.remove()}
  function moveMonth(delta){viewMonth+=delta;if(viewMonth<0){viewMonth=11;viewYear--}else if(viewMonth>11){viewMonth=0;viewYear++}renderCalendar()}
  function toggleDay(key){selected.has(key)?selected.delete(key):selected.add(key);renderCalendar()}
  function renderCalendar(){
    const sheet=document.querySelector('#pollCalendarOverlayV119 .pollCalendarSheetV119');if(!sheet)return;
    const first=new Date(viewYear,viewMonth,1);const start=new Date(viewYear,viewMonth,1-first.getDay());
    const today=new Date();const todayKey=iso(today.getFullYear(),today.getMonth(),today.getDate());
    const weekdays=['일','월','화','수','목','금','토'];
    let days='';
    for(let i=0;i<42;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);
      const key=iso(d.getFullYear(),d.getMonth(),d.getDate());
      const other=d.getMonth()!==viewMonth;
      days+=`<button type="button" class="pollCalDayV119 ${other?'other':''} ${selected.has(key)?'selected':''} ${key===todayKey?'today':''}" onclick="pollDateV119Toggle('${key}')">${d.getDate()}</button>`;
    }
    sheet.innerHTML=`
      <div class="pollCalHeadV119"><button type="button" onclick="pollDateV119Move(-1)">‹</button><div class="pollCalTitleV119">${viewYear}년 ${viewMonth+1}월</div><button type="button" onclick="pollDateV119Move(1)">›</button></div>
      <div class="pollCalHintV119">원하는 날짜를 여러 개 선택해주세요 · ${selected.size}개 선택</div>
      <div class="pollCalWeekV119">${weekdays.map(x=>`<div>${x}</div>`).join('')}</div>
      <div class="pollCalGridV119">${days}</div>
      <div class="pollCalActionsV119"><button type="button" class="pollCalCancelV119" onclick="pollDateV119Close()">취소</button><button type="button" class="pollCalConfirmV119" onclick="pollDateV119Confirm()">확인</button></div>`;
  }

  function setInputs(values){
    const rows=[...(mount()?.querySelectorAll('#pollV115Options .pollOptionRow')||[])];
    rows.forEach((r,i)=>{const input=r.querySelector('input[data-poll-option-id]');if(input)input.value=values[i]||''});
  }
  function applyDates(){
    const values=[...selected].sort();
    if(values.length<2){if(typeof toast==='function')toast('날짜를 2개 이상 선택해주세요.');return}
    let rows=[...(mount()?.querySelectorAll('#pollV115Options .pollOptionRow')||[])];
    setInputs(values);
    let guard=0;
    while(rows.length<values.length&&guard++<50){
      if(typeof window.pollV115AddOption!=='function')break;
      window.pollV115AddOption();
      rows=[...(mount()?.querySelectorAll('#pollV115Options .pollOptionRow')||[])];
      setInputs(values);
    }
    guard=0;
    while(rows.length>values.length&&rows.length>2&&guard++<50){
      const row=rows[rows.length-1];const input=row.querySelector('input[data-poll-option-id]');const id=input?.dataset?.pollOptionId;
      if(!id||typeof window.pollV115DeleteOption!=='function')break;
      window.pollV115DeleteOption(id);
      rows=[...(mount()?.querySelectorAll('#pollV115Options .pollOptionRow')||[])];
      setInputs(values);
    }
    setInputs(values);
    closeCalendar();
    scheduleEnhance();
  }

  window.pollDateV119Toggle=toggleDay;
  window.pollDateV119Move=moveMonth;
  window.pollDateV119Close=closeCalendar;
  window.pollDateV119Confirm=applyDates;

  const baseSetType=window.pollV115SetType;
  if(typeof baseSetType==='function'){
    window.pollV115SetType=function(type){
      const r=baseSetType.apply(this,arguments);
      requestAnimationFrame(()=>{enhance();if(type==='date')openCalendar()});
      return r;
    };
  }
  const baseEnable=window.pollV115Enable;
  if(typeof baseEnable==='function')window.pollV115Enable=function(){const r=baseEnable.apply(this,arguments);scheduleEnhance();return r};
  const baseAdd=window.pollV115AddOption;
  if(typeof baseAdd==='function')window.pollV115AddOption=function(){const r=baseAdd.apply(this,arguments);scheduleEnhance();return r};
  const baseDelete=window.pollV115DeleteOption;
  if(typeof baseDelete==='function')window.pollV115DeleteOption=function(){const r=baseDelete.apply(this,arguments);scheduleEnhance();return r};

  const observer=new MutationObserver(records=>{
    const m=mount();
    if(!m){
      if(records.some(r=>[...r.addedNodes].some(n=>n?.nodeType===1&&(n.id==='noticePollComposerMount'||n.querySelector?.('#noticePollComposerMount')))))scheduleEnhance();
      return;
    }
    if(records.some(r=>m.contains(r.target)||[...r.addedNodes].some(n=>n?.nodeType===1&&m.contains(n))))scheduleEnhance();
  });
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleEnhance);else scheduleEnhance();
})();