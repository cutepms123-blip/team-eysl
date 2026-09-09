/* TEAM EYSL v175 — generic application save, including waitlists */
(()=>{if(window.__EYSL_APPLICATION_SAVE_V175__)return;window.__EYSL_APPLICATION_SAVE_V175__=true;
window.saveActivityApplication=async function(activityId,type='participant',details={},waitOrder=null){
 if(!window.currentUser?.memberId)return {ok:false,error:'회원 정보를 찾을 수 없습니다.'};
 const memberId=currentUser.memberId,now=new Date().toISOString();
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
 }catch(error){console.error('v175 application save',error);window.toast?.('신청 저장에 실패했습니다.');return {ok:false,error}}
};
})();