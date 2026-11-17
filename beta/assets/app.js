import {submitContact} from './contact.js';
const form=document.querySelector('#contact-form');
if(form){
 const config=JSON.parse(document.querySelector('#support-config').textContent), button=form.querySelector('button[type=submit]'), error=document.querySelector('#error'), fields=[...form.querySelectorAll('input,select,textarea')];
 let busy=false,challenge='';
 const valid=()=>form.checkValidity()&&config.enabled&&(!config.challengeSiteKey||challenge);
 const refresh=()=>{button.disabled=busy||!valid();};
 form.addEventListener('input',refresh);form.addEventListener('change',refresh);refresh();
 if(config.challengeSiteKey){
  window.poimaChallengeReady=()=>window.turnstile.render('#challenge',{sitekey:config.challengeSiteKey,action:'support',callback:token=>{challenge=token;refresh();},'expired-callback':()=>{challenge='';refresh();},'error-callback':()=>{challenge='';refresh();error.textContent='送信の確認を読み込めませんでした。再読み込みしてください。';}});
  const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=poimaChallengeReady&render=explicit';script.async=true;document.head.append(script);
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!valid())return;busy=true;error.textContent='';button.textContent='送信中…';fields.forEach(f=>f.disabled=true);refresh();
  try{
   const data=await submitContact(config,{email:form.elements.email.value,category:form.elements.category.value,body:form.elements.body.value,accepted:form.elements.accepted.checked,website:form.elements.website.value,challenge});
   document.querySelector('#receipt').textContent=data.receipt;
   form.hidden=true;const complete=document.querySelector('#complete');complete.hidden=false;complete.focus();
  }catch(e){
   const messages={invalid_request:'入力内容を確認してください。',too_many_requests:'短時間に複数のお問い合わせを受け付けました。時間をおいてお試しください。',notice_changed:'プライバシーポリシーが更新されました。再読み込みして確認してください。',storage_unavailable:'送信の準備を保存できません。ブラウザーの設定を確認してください。',challenge_required:'送信の確認をやり直してください。',connection:'受付を確認できませんでした。内容を残しています。もう一度送信してください。',unavailable:'お問い合わせの受付準備中です。'};
   error.textContent=messages[e.code]||messages.connection;error.focus();
  }finally{busy=false;fields.forEach(f=>f.disabled=false);button.textContent='送信する';if(config.challengeSiteKey&&window.turnstile){challenge='';window.turnstile.reset();}refresh();}
 });
}
