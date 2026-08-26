/* TEAM EYSL v96 — My Page join date from roster source */
(()=>{
  const formatJoin=(v)=>{
    if(!v)return '';
    const s=String(v).trim();
    const m=s.match(/^(\d{2})\.(\d{1,2})\.(\d{1,2})$/);
    if(m)return `20${m[1]}.${String(m[2]).padStart(2,'0')}.${String(m[3]).padStart(2,'0')}`;
    return s;
  };
  async function applyRosterJoinDate(){
    try{
      if(!currentUser?.memberId)return;
      const el=document.getElementById('myJoinText');
      if(!el)return;
      let q=dbClient.from('team_roster').select('join_date_text,real_name,nickname').limit(1);
      if(currentUser.realName)q=q.eq('real_name',currentUser.realName);
      else q=q.eq('nickname',currentUser.nickname);
      const {data,error}=await q.maybeSingle();
      if(error)throw error;
      if(data?.join_date_text)el.textContent=`TEAM EYSL · 가입 ${formatJoin(data.join_date_text)}`;
    }catch(e){console.error('join-date-v96:',e)}
  }
  const oldShow=showPage;
  showPage=function(id){const r=oldShow.apply(this,arguments);if(id==='mypage')setTimeout(applyRosterJoinDate,0);return r;};
  const oldRender=renderMyProfile;
  renderMyProfile=function(){const r=oldRender.apply(this,arguments);setTimeout(applyRosterJoinDate,0);return r;};
  window.addEventListener('load',()=>setTimeout(applyRosterJoinDate,500));
  console.log('TEAM EYSL join date v96 loaded');
})();
