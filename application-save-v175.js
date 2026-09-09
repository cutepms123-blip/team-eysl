/* TEAM EYSL v177 — generic application save compatible with member/roster partial unique indexes */
(()=>{if(window.__EYSL_APPLICATION_SAVE_V177__)return;window.__EYSL_APPLICATION_SAVE_V177__=true;
async function resolveMemberId(){
 let id=window.currentUser?.memberId||null;
 try{
  const {data}=await dbClient.auth.getSession();
  const authId=data?.session?.user?.id||null;
  if(authId){const {data:m}=await dbClient.from('members').select('id,nickname').eq('auth_user_id',authId).eq('status','approved').maybeSingle();if(m?.id){id=m.id;if(window.currentUser){currentUser.memberId=m.id;if(!currentUser.nickname&&m.nickname)currentUser.nickname=m.nickname}}}
 }catch(_){}
 return id;
}
window.saveActivityApplication=async function(activityId,type='participant',details={},waitOrder=null){
 const memberId=await resolveMemberId();if(!memberId)return {ok:false,error:'회원 정보를 찾을 수 없습니다.'};
 const now=new Date().toISOString();
 try{
  const {data:existing,error:readError}=await dbClient.from('activity_applications').select('id').eq('activity_id',activityId).eq('member_id',memberId).maybeSingle();
  if(readError)throw readError;
  const values={application_type:type,wait_order:type==='waitlist'?waitOrder:null,details:details||{},updated_at:now};
  let error;
  if(existing?.id){({error}=await dbClient.from('activity_applications').update(values).eq('id',existing.id))}
  else{({error}=await dbClient.from('activity_applications').insert({activity_id:activityId,member_id:memberId,...values}))}
  if(error)throw error;
  const {data:verified,error:verifyError}=await dbClient.from('activity_applications').select('id,application_type,wait_order').eq('activity_id',activityId).eq('member_id',memberId).maybeSingle();
  if(verifyError||!verified||verified.application_type!==type)throw verifyError||new Error('application verification failed');
  return {ok:true,data:verified};
 }catch(error){console.error('v177 application save',error);window.toast?.('신청 저장에 실패했습니다.');return {ok:false,error}}
};
})();