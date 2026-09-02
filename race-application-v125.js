/* TEAM EYSL race application v125 */
(()=>{
  if(window.__RACE_APPLICATION_V125__)return;
  window.__RACE_APPLICATION_V125__=true;

  const baseOpenRaceApply=window.openRaceApply;

  function ensureGroupInput(){
    let el=document.getElementById('raceGroup');
    if(!el)return null;
    if(el.tagName==='INPUT')return el;
    const input=document.createElement('input');
    input.id='raceGroup';
    input.type='text';
    input.placeholder='예: 3그룹';
    input.autocomplete='off';
    input.value=window.raceApplication?.group||el.value||'';
    el.replaceWith(input);
    return input;
  }

  function ensureOtherField(){
    const submit=document.getElementById('raceSubmit');
    if(!submit)return null;
    let wrap=document.getElementById('raceOtherWrapV125');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='raceOtherWrapV125';
      wrap.className='formrow';
      wrap.innerHTML='<label>기타</label><input id="raceOther" type="text" placeholder="기타 전달사항을 입력해주세요">';
      submit.parentElement.insertBefore(wrap,submit);
    }
    return document.getElementById('raceOther');
  }

  function uniq(arr){return [...new Set((arr||[]).map(x=>String(x||'').trim()).filter(Boolean))]}

  function inferRelayOptions(info){
    const text=String(info||'');
    const out=[];
    const each=text.match(/(?:각|각각)\s*(\d+)\s*m/i);
    const defaultDist=each?.[1]||'';
    const add=(label,regex)=>{
      const m=text.match(regex);
      if(!m)return;
      const dist=m[1]||defaultDist||'200';
      out.push(`${label} ${dist}m`);
    };
    add('혼성계영',/혼성계영\s*(\d+)?\s*m?/i);
    add('혼계영',/(?:^|[^성])혼계영\s*(\d+)?\s*m?/i);
    add('계영',/(?:^|[\s:/,(])계영\s*(\d+)?\s*m?/i);
    return uniq(out);
  }

  async function resolveRelayOptions(){
    let options=uniq(window.race?.relays);
    if(options.length)return options;
    try{
      if(!window.race?.id)return [];
      const {data,error}=await dbClient.from('activities').select('details').eq('id',race.id).single();
      if(error)throw error;
      const details=(data?.details&&typeof data.details==='object')?data.details:{};
      options=uniq(details.relays);
      if(!options.length)options=inferRelayOptions(details.info||details.detail||'');
      if(options.length){
        race.relays=options;
      }
    }catch(err){
      console.error('race relay options v125:',err);
    }
    return options;
  }

  function renderRelayOptions(options){
    const box=document.getElementById('relayChoices');
    if(!box)return;
    const selected=Array.isArray(window.raceApplication?.relays)?raceApplication.relays:[];
    box.innerHTML=options.map(r=>`<button type="button" class="bigChoice ${selected.includes(r)?'on':''}" onclick="toggleRelay(this)">${escHtml(r)}</button>`).join('');
    const noRelay=document.getElementById('noRelay');
    if(noRelay)noRelay.classList.toggle('on',!!window.raceApplication?.noRelay);
  }

  window.openRaceApply=async function(){
    if(typeof baseOpenRaceApply==='function')baseOpenRaceApply.apply(this,arguments);
    const group=ensureGroupInput();
    if(group)group.value=window.raceApplication?.group||group.value||'';
    const other=ensureOtherField();
    if(other)other.value=window.raceApplication?.other||'';
    const options=await resolveRelayOptions();
    renderRelayOptions(options);
  };

  window.submitRace=async function(){
    const applicantName=(document.getElementById('raceApplicantName')?.value||'').trim();
    const birthDate=(document.getElementById('raceApplicantBirth')?.value||'').trim();
    const phone=(document.getElementById('raceApplicantPhone')?.value||'').trim();
    const group=(document.getElementById('raceGroup')?.value||'').trim();
    const s1=(document.getElementById('raceS1')?.value||'').trim();
    const s2=(document.getElementById('raceS2')?.value||'').trim();
    const other=(document.getElementById('raceOther')?.value||'').trim();
    if(applicantName.length<2||!birthDate||!phone)return toast('이름, 생년월일, 전화번호를 입력해주세요');
    if(!group)return toast('그룹을 입력해주세요');
    const noRelay=document.getElementById('noRelay')?.classList.contains('on')||false;
    const relays=noRelay?[]:[...document.querySelectorAll('#relayChoices .bigChoice.on')].map(b=>b.textContent.trim()).filter(Boolean);
    const details={applicantName,birthDate,phone,group,s1,s2,relays,noRelay,other};
    if(!(await saveActivityApplication(race.id,'participant',details,null)).ok)return;
    await reloadApplicationsUI();
    renderMyStatus('race');
    toast('대회 신청 내용이 저장됐습니다');
  };
})();
