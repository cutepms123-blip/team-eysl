from pathlib import Path

p=Path('index.html')
s=p.read_text()

old_hydrate="""async function hydrateMemberAvatarsInBackground(){
 const rows=members.filter(m=>m.avatarPath&&!m.avatarUrl);
 if(rows.length)await Promise.all(rows.map(async m=>{try{m.avatarUrl=await signedProfileImage(m.avatarPath)}catch(_){}}));
 if(document.getElementById('memberAdmin')?.classList.contains('active'))renderMembersFromCurrentData();
 if(document.getElementById('memberDirectory')?.classList.contains('active'))void renderMemberDirectory();
 if(document.getElementById('applyStatus')?.classList.contains('active'))void renderApplyStatus();
 if(document.getElementById('chat')?.classList.contains('active')){try{renderGroup();renderDmList()}catch(_){}}
 if(document.getElementById('dmChat')?.classList.contains('active')){try{renderDm()}catch(_){}}
}"""
new_hydrate="""async function hydrateMemberAvatarsInBackground(){
 const rows=members.filter(m=>m.avatarPath&&!m.avatarUrl);
 if(!rows.length)return;
 await Promise.all(rows.map(async m=>{try{m.avatarUrl=await signedProfileImage(m.avatarPath)}catch(_){}}));
 if(document.getElementById('memberAdmin')?.classList.contains('active'))renderMembersFromCurrentData();
 if(document.getElementById('memberDirectory')?.classList.contains('active'))void renderMemberDirectory();
 if(document.getElementById('applyStatus')?.classList.contains('active'))void renderApplyStatus();
 if(document.getElementById('chat')?.classList.contains('active')){try{renderGroup();renderDmList()}catch(_){}}
 if(document.getElementById('dmChat')?.classList.contains('active')){try{renderDm()}catch(_){}}
}"""
if s.count(old_hydrate)!=1:
    raise SystemExit(f'hydrate block count={s.count(old_hydrate)}')
s=s.replace(old_hydrate,new_hydrate,1)

old_refresh="""  members=(data||[]).map(m=>({
   id:m.id,name:m.nickname,realName:m.real_name||'',birthYear:m.birth_year||null,birth:m.birth_year?String(m.birth_year).slice(-2):'-',
   gender:m.gender||'-',join:m.join_date_text||(m.created_at?String(m.created_at).slice(0,10).replaceAll('-','.'):'-'),joinDate:m.created_at||null,
   blocked:m.status==='blocked',status:m.status,role:m.role||'member',avatarPath:m.avatar_path||null,avatarUrl:'',
   teamRole:m.team_role||'',shortName:m.short_name||'',joinReason:m.join_reason||'',birthDateText:m.birth_date_text||'',
   lessonLevel:m.lesson_level||'',swimExperience:m.swim_experience||'',notes:m.notes||'',location:m.location||'',
   att:Number(m.historical_attendance_count||0),late:Number(m.historical_late_count||0),pb:{},races:[],trains:[]
  }));"""
new_refresh="""  const previousMembers=new Map(members.map(x=>[x.id,x]));
  members=(data||[]).map(m=>{
   const previous=previousMembers.get(m.id),nextAvatarPath=m.avatar_path||null;
   return ({
    id:m.id,name:m.nickname,realName:m.real_name||'',birthYear:m.birth_year||null,birth:m.birth_year?String(m.birth_year).slice(-2):'-',
    gender:m.gender||'-',join:m.join_date_text||(m.created_at?String(m.created_at).slice(0,10).replaceAll('-','.'):'-'),joinDate:m.created_at||null,
    blocked:m.status==='blocked',status:m.status,role:m.role||'member',avatarPath:nextAvatarPath,
    avatarUrl:previous?.avatarPath===nextAvatarPath?(previous.avatarUrl||''):'',
    teamRole:m.team_role||'',shortName:m.short_name||'',joinReason:m.join_reason||'',birthDateText:m.birth_date_text||'',
    lessonLevel:m.lesson_level||'',swimExperience:m.swim_experience||'',notes:m.notes||'',location:m.location||'',
    att:Number(m.historical_attendance_count||0),late:Number(m.historical_late_count||0),pb:{},races:[],trains:[]
   });
  });"""
if s.count(old_refresh)!=1:
    raise SystemExit(f'refresh block count={s.count(old_refresh)}')
s=s.replace(old_refresh,new_refresh,1)

old_row="""  return `<div class=\"memberSimpleRow\"><div class=\"memberFallback\">${escHtml(String(r.short_name||r.nickname||'?').slice(0,1))}</div><div class=\"grow\"><b>${escHtml(r.nickname)}</b><p>${sub}</p></div>${linked?'<span class=\"tag ok\">앱 가입</span>':'<span class=\"tag done\">앱 미가입</span>'}</div>`;"""
new_row="""  const avatar=r._member?.avatarUrl
   ?`<img class=\"memberAvatar\" src=\"${escAttr(r._member.avatarUrl)}\" alt=\"${escAttr(r.nickname)}\">`
   :`<div class=\"memberFallback\">${escHtml(String(r.short_name||r.nickname||'?').slice(0,1))}</div>`;
  return `<div class=\"memberSimpleRow\">${avatar}<div class=\"grow\"><b>${escHtml(r.nickname)}</b><p>${sub}</p></div>${linked?'<span class=\"tag ok\">앱 가입</span>':'<span class=\"tag done\">앱 미가입</span>'}</div>`;"""
if s.count(old_row)!=1:
    raise SystemExit(f'member directory row count={s.count(old_row)}')
s=s.replace(old_row,new_row,1)

# Bump installed-app registration query so the new HTML release is easy to identify.
s=s.replace('/sw.js?v=final181-waitlist-sync','/sw.js?v=final182-avatar-sync')

for needle in ["if(!rows.length)return;","previousMembers=new Map","r._member?.avatarUrl","final182-avatar-sync"]:
    if needle not in s: raise SystemExit(f'missing expected result: {needle}')

p.write_text(s)
print('avatar directory v182 assertions passed')
