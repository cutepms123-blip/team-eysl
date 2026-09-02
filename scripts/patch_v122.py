from pathlib import Path
import re

index_path=Path('index.html')
sw_path=Path('sw.js')
index=index_path.read_text(encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f'missing anchor: {label}')
    return text.replace(old, new, 1)

# 1) Race schedules do not use start/end time fields.
old_time='<div class="grid2"><div class="formrow"><label>시작 시간</label><input id="aStart" type="time"></div><div class="formrow"><label>종료 시간</label><input id="aEnd" type="time"></div></div>'
new_time='<div id="scheduleTimeFields" class="grid2"><div class="formrow"><label>시작 시간</label><input id="aStart" type="time"></div><div class="formrow"><label>종료 시간</label><input id="aEnd" type="time"></div></div>'
index=replace_once(index,old_time,new_time,'schedule time fields')

old_render="""function renderAdminFields(){
 const type=document.getElementById('aType'),kind=type.value;
 document.getElementById('trainingFields').style.display=kind==='training'?'block':'none';
 if(!isAdminUser()&&kind!=='event'){type.value='event';document.getElementById('trainingFields').style.display='none'}
}"""
new_render="""function renderAdminFields(){
 const type=document.getElementById('aType');let kind=type.value;
 if(!isAdminUser()&&kind!=='event'){type.value='event';kind='event'}
 document.getElementById('trainingFields').style.display=kind==='training'?'block':'none';
 const timeFields=document.getElementById('scheduleTimeFields');
 if(timeFields)timeFields.style.display=kind==='race'?'none':'grid';
 if(kind==='race'){
  const s=document.getElementById('aStart'),e=document.getElementById('aEnd');
  if(s)s.value='';if(e)e.value='';
 }
}"""
index=replace_once(index,old_render,new_render,'renderAdminFields')

old_register="""async function registerSchedule(){
 const title=document.getElementById('aTitle').value.trim(),date=document.getElementById('aDate').value,start=document.getElementById('aStart').value,end=document.getElementById('aEnd').value,place=document.getElementById('aPlace').value.trim(),type=document.getElementById('aType').value;
 if(!title||!date||!start||!end||!place)return toast('필수 항목을 입력해주세요');"""
new_register="""async function registerSchedule(){
 const type=document.getElementById('aType').value,title=document.getElementById('aTitle').value.trim(),date=document.getElementById('aDate').value,start=type==='race'?'':document.getElementById('aStart').value,end=type==='race'?'':document.getElementById('aEnd').value,place=document.getElementById('aPlace').value.trim();
 if(!title||!date||!place||(type!=='race'&&(!start||!end)))return toast('필수 항목을 입력해주세요');"""
index=replace_once(index,old_register,new_register,'registerSchedule validation')

old_payload="const payload={kind:type,title,activity_date:date,start_time:start,end_time:end,place,capacity:type==='training'?parseCapacityText(lane):null,details,updated_at:new Date().toISOString()};"
new_payload="const payload={kind:type,title,activity_date:date,start_time:type==='race'?null:start,end_time:type==='race'?null:end,place,capacity:type==='training'?parseCapacityText(lane):null,details,updated_at:new Date().toISOString()};"
index=replace_once(index,old_payload,new_payload,'race null time payload')

# 2) Race application applicant identity/contact fields at the top.
old_race_start='<section id="raceApply" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'raceList\')">←</button><h1>대회 신청</h1><span></span></div><div class="formrow"><label>그룹</label>'
new_race_start='<section id="raceApply" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'raceList\')">←</button><h1>대회 신청</h1><span></span></div><div class="formrow"><label>이름</label><input id="raceApplicantName" autocomplete="name" placeholder="이름 입력"></div><div class="formrow"><label>생년월일</label><input id="raceApplicantBirth" type="date"></div><div class="formrow"><label>전화번호</label><input id="raceApplicantPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"></div><div class="formrow"><label>그룹</label>'
index=replace_once(index,old_race_start,new_race_start,'race applicant fields')

old_open="""function openRaceApply(){showPage('raceApply');document.getElementById('relayChoices').innerHTML=race.relays.map(r=>`<button type=\"button\" class=\"bigChoice ${raceApplication?.relays.includes(r)?'on':''}\" onclick=\"toggleRelay(this)\">${r}</button>`).join('');document.getElementById('noRelay').classList.toggle('on',!!raceApplication?.noRelay);if(raceApplication){raceGroup.value=raceApplication.group;raceS1.value=raceApplication.s1;raceS2.value=raceApplication.s2;raceSubmit.textContent='수정 완료'}else raceSubmit.textContent='대회 신청하기'}"""
new_open="""function openRaceApply(){
 showPage('raceApply');
 document.getElementById('relayChoices').innerHTML=race.relays.map(r=>`<button type=\"button\" class=\"bigChoice ${raceApplication?.relays.includes(r)?'on':''}\" onclick=\"toggleRelay(this)\">${r}</button>`).join('');
 document.getElementById('noRelay').classList.toggle('on',!!raceApplication?.noRelay);
 const selfMember=members.find(m=>m.id===currentUser.memberId||m.name===currentUser.nickname);
 raceApplicantName.value=raceApplication?.applicantName||currentUser.realName||selfMember?.realName||'';
 raceApplicantBirth.value=raceApplication?.birthDate||'';
 raceApplicantPhone.value=raceApplication?.phone||'';
 if(raceApplication){raceGroup.value=raceApplication.group;raceS1.value=raceApplication.s1;raceS2.value=raceApplication.s2;raceSubmit.textContent='수정 완료'}else raceSubmit.textContent='대회 신청하기';
}"""
index=replace_once(index,old_open,new_open,'openRaceApply')

old_submit="""async function submitRace(){
 const noRelay=document.getElementById('noRelay').classList.contains('on');
 const details={group:raceGroup.value,s1:raceS1.value,s2:raceS2.value,relays:noRelay?[]:[...document.querySelectorAll('#relayChoices .on')].map(b=>b.textContent),noRelay};
 if(!(await saveActivityApplication(race.id,'participant',details,null)).ok)return;
 await reloadApplicationsUI();renderMyStatus('race');toast('대회 신청 내용이 저장됐습니다');
}"""
new_submit="""async function submitRace(){
 const applicantName=(document.getElementById('raceApplicantName')?.value||'').trim();
 const birthDate=(document.getElementById('raceApplicantBirth')?.value||'').trim();
 const phone=(document.getElementById('raceApplicantPhone')?.value||'').trim();
 if(applicantName.length<2||!birthDate||!phone)return toast('이름, 생년월일, 전화번호를 입력해주세요');
 const noRelay=document.getElementById('noRelay').classList.contains('on');
 const details={applicantName,birthDate,phone,group:raceGroup.value,s1:raceS1.value,s2:raceS2.value,relays:noRelay?[]:[...document.querySelectorAll('#relayChoices .on')].map(b=>b.textContent),noRelay};
 if(!(await saveActivityApplication(race.id,'participant',details,null)).ok)return;
 await reloadApplicationsUI();renderMyStatus('race');toast('대회 신청 내용이 저장됐습니다');
}"""
index=replace_once(index,old_submit,new_submit,'submitRace')

# Admins can see the collected applicant identity/contact info in application status.
old_rows="const rows=people.length?people.map(p=>`<div class=\"applyPerson\">${applicationAvatar(p)}<div class=\"grow\"><b>${escHtml(p.name)}</b><p class=\"meta\">신청완료</p></div></div>`).join(''):'<div class=\"meta\">신청자가 없습니다.</div>';"
new_rows="const rows=people.length?people.map(p=>{const info=kind==='race'&&isAdminUser()?`<br>${escHtml(p.details?.applicantName||'-')} · ${escHtml(p.details?.birthDate||'-')} · ${escHtml(p.details?.phone||'-')}`:'';return `<div class=\"applyPerson\">${applicationAvatar(p)}<div class=\"grow\"><b>${escHtml(p.name)}</b><p class=\"meta\">신청완료${info}</p></div></div>`}).join(''):'<div class=\"meta\">신청자가 없습니다.</div>';"
index=replace_once(index,old_rows,new_rows,'race application admin details')

# Bump service worker so installed iOS PWAs pick up the shell change.
index=re.sub(r"navigator\.serviceWorker\.register\('/sw\.js\?v=[^']+'\)", "navigator.serviceWorker.register('/sw.js?v=final122-race-form')", index, count=1)
sw=re.sub(r"const VERSION='[^']+';", "const VERSION='team-eysl-final122-race-form';", sw, count=1)

index_path.write_text(index,encoding='utf-8')
sw_path.write_text(sw,encoding='utf-8')

assert 'id="scheduleTimeFields"' in index
assert 'raceApplicantName' in index and 'raceApplicantBirth' in index and 'raceApplicantPhone' in index
assert "start_time:type==='race'?null:start" in index
assert "team-eysl-final122-race-form" in sw
assert "final122-race-form" in index
print('v122 race schedule/application patch applied')
