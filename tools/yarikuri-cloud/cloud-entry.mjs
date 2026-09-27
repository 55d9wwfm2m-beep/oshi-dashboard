import {createClient} from '@supabase/supabase-js';
import {KEYS,clone,equal,validDocument,mergeDocuments,observeBalances,mergeObservations,migrateLexusRoadmap,savingsSelection} from './cloud-core.mjs';

// Build-time public configuration. Never use a secret/service-role key here.
const client=createClient(process.env.YARIKURI_PUBLIC_SUPABASE_URL,process.env.YARIKURI_PUBLIC_SUPABASE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'yarikuri-astra-auth-v1'}
});
let userId=null, base=null, working=null, revision=0, pending=null, sending=false, blocked=false, running=false, timer, remoteWaiting=false, localSerial=0, authEpoch=0;
let resolveReady;
const ready = new Promise(resolve=>{resolveReady=resolve;});
let workerSafe = !('serviceWorker' in navigator);
const outboxKey = ()=>'yarikuri-pending-v1:'+userId;
const message=document.getElementById('cloud-message'), gate=document.getElementById('cloud-gate'), status=document.getElementById('cloud-status');
const retry=document.getElementById('cloud-retry'), review=document.getElementById('cloud-conflict'), migration=document.getElementById('cloud-migration'), login=document.getElementById('cloud-login');
const say = text => {message.textContent=text;status.textContent=text;};
function lock(){document.documentElement.classList.add('cloud-locked');if(!running){document.getElementById('cloud-export').hidden=true;document.getElementById('cloud-export-legacy').hidden=true;document.getElementById('cloud-signout').hidden=true;}}
function unlock(){document.documentElement.classList.remove('cloud-locked');}
function localRead(key){const raw=localStorage.getItem(key);return raw===null?undefined:JSON.parse(raw);}
function setStored(key,value){localStorage.setItem(key,JSON.stringify(value));}
function readOriginal(){const values={}; for(const k of KEYS){const v=localRead(k);if(v!==undefined) values[k]=v;}return {version:1,values};}
function safeError(error){return error?.code==='40001'?'別の端末で変更されています。内容を確認してください。':'クラウドに接続できません。データは上書きせず、再接続を待っています。';}
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function isEditing(){return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||Array.from(document.querySelectorAll('.overlay')).some(el=>!el.hidden);}
function savePending(){
  pending={version:1,userId,baseRevision:revision,base:clone(base),document:clone(working),savedAt:new Date().toISOString()};
  try{setStored(outboxKey(),pending);}catch(error){blocked=true;say('端末に未送信データを保存できません。バックアップを保存してから再読み込みしてください。');review.hidden=false;throw error;}
}
function queue(){clearTimeout(timer);timer=setTimeout(flush,700);}
window.YarikuriCloud={ready,
  prepareRoadmap:migrateLexusRoadmap,
  targetBalance(roadmap,accounts){return savingsSelection({'oshi-money-roadmap':roadmap,'oshi-money-accounts':accounts}).amount;},
  read(key,fallback){return working && working.values[key]!==undefined?clone(working.values[key]):fallback;},
  write(key,value){
    if(!running||!userId||!KEYS.includes(key)) throw new Error('ログインを確認してください');
    working.values[key]=clone(value);localSerial++;savePending();say(blocked?'変更が競合しています。バックアップと確認が必要です。':'保存中…');queue();
  }
};
async function getRemote(){const {data,error}=await client.from('yarikuri_documents').select('payload,revision,updated_at').eq('user_id',userId).maybeSingle();if(error)throw error;if(data&&!validDocument(data.payload))throw new Error('データ形式を確認してください');return data;}
async function writeRemote(doc,expected){const observed=observeBalances(doc);const {data,error}=await client.rpc('yarikuri_write_document',{expected_revision:expected,document:observed});if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row||!validDocument(row.payload)||!Number.isInteger(Number(row.revision)))throw new Error('保存結果を確認できません');return row;}
function conflict(remote){blocked=true;remoteWaiting=!!remote;review.hidden=false;say('別の端末と変更が重なりました。未送信分をバックアップして、クラウドの内容を確認してください。');}
async function flush(){
  if(!pending||sending||blocked||!userId||!navigator.onLine)return;
  sending=true; const epoch=authEpoch, sendSerial=localSerial, sent=clone(working), expected=revision;
  try{
    const row=await writeRemote(sent,expected);if(epoch!==authEpoch)return;
    base=clone(row.payload);revision=Number(row.revision);
    if(sendSerial===localSerial){working=clone(base);pending=null;localStorage.removeItem(outboxKey());say('Astraと同期済み');}
    else{working.observations=mergeObservations(working.observations,base.observations);savePending();queue();}
  }catch(error){
    if(epoch!==authEpoch)return;
    if(error.code==='40001'){
      try{
        const row=await getRemote();if(!row)return conflict(null);
        const merged=mergeDocuments(base,working,row.payload);
        if(merged.conflicts.length)return conflict(row);
        // Old UI globals must not continue writing stale arrays after a remote merge.
        if(!equal(merged.document.values,working.values)){return conflict(row);}
        working=merged.document;base=clone(row.payload);revision=Number(row.revision);savePending();queue();
      }catch(e){say(safeError(e));}
    }else{say(safeError(error));retry.hidden=false;}
  }finally{sending=false;}
}
async function refresh(){
  if(!running||!userId||sending||pending||blocked)return;
  const epoch=authEpoch;
  try{const row=await getRemote();if(epoch!==authEpoch||pending||sending)return;
    if(!row){conflict(null);return;}
    if(Number(row.revision)!==revision){remoteWaiting=true;say('別の端末の更新があります。編集中の画面を閉じて「最新を読み込む」を押してください。');document.getElementById('cloud-refresh').hidden=false;if(!isEditing())location.reload();}
  }catch(e){say('最新データを確認できませんでした。表示中の情報は前回取得分です。');retry.hidden=false;}
}
function start(row){base=clone(row.payload);working=clone(base);revision=Number(row.revision);running=true;unlock();resolveReady();say('Astraと同期済み');
  if(!working.observations?.goalTargetBalance){savePending();queue();}
  client.channel('yarikuri:'+userId).on('postgres_changes',{event:'*',schema:'public',table:'yarikuri_documents',filter:'user_id=eq.'+userId},()=>refresh()).subscribe();
  setInterval(()=>{flush();refresh();},15000);
}
async function loadAccount(){
  const epoch=authEpoch;
  retry.hidden=true;login.hidden=true;migration.hidden=true;review.hidden=true;blocked=false;lock();say('クラウドのデータを確認しています…');
  try{
    if(!workerSafe) { await ensureSafeWorker(); workerSafe=true; }
    const {data,error}=await client.auth.getUser();if(epoch!==authEpoch)return;if(error||!data.user){login.hidden=false;say('Astraと同じメールアドレス・パスワードでログインしてください。');return;}
    userId=data.user.id;
    document.getElementById('cloud-export').hidden=false;document.getElementById('cloud-signout').hidden=false;
    document.getElementById('cloud-export-legacy').hidden=!KEYS.some(key=>localStorage.getItem(key)!==null);
    const row=await getRemote();if(epoch!==authEpoch)return;
    const stored=localRead(outboxKey());
    if(stored){
      if(stored.userId!==userId||!validDocument(stored.document)||!validDocument(stored.base))throw new Error('未送信データを確認してください');
      pending=stored;working=clone(stored.document);base=clone(stored.base);revision=stored.baseRevision;
      if(!row){conflict(null);return;}
      if(Number(row.revision)!==revision){
        const merged=mergeDocuments(base,working,row.payload);if(merged.conflicts.length){conflict(row);return;}
        working=merged.document;base=clone(row.payload);revision=Number(row.revision);savePending();
      }
      // Before showing editable UI, safely replay the exact account-bound outbox.
      const saved=await writeRemote(working,revision);if(epoch!==authEpoch)return;localStorage.removeItem(outboxKey());pending=null;start(saved);return;
    }
    if(row){start(row);return;}
    migration.hidden=false;
    const old=readOriginal();if(!validDocument(old))throw new Error('この端末のデータ形式を確認できません');
    const count=Object.keys(old.values).length;document.getElementById('cloud-import').disabled=count===0;
    say(count?'この端末の家計簿をクラウドへ移行できます。元データは削除しません。':'クラウドに家計簿がまだありません。空の状態から始められます。');
  }catch(error){say(safeError(error));retry.hidden=false;}
}
async function migrate(empty){
  const epoch=authEpoch;
  const button=empty?document.getElementById('cloud-empty'):document.getElementById('cloud-import');
  if(empty&&!confirm('空の家計簿をクラウドに作成します。元の端末データは削除しません。よろしいですか？'))return;
  button.disabled=true;
  try{const original=readOriginal();if(!validDocument(original))throw new Error('データ形式を確認してください');
    const backupKey='yarikuri-migration-backup-v1:'+userId;if(!localStorage.getItem(backupKey))setStored(backupKey,{createdAt:new Date().toISOString(),document:original});
    const doc=empty?{version:1,values:{}}:original;
    const row=await writeRemote(doc,0);if(epoch!==authEpoch)return;setStored('yarikuri-migrated-v1:'+userId,{at:new Date().toISOString()});migration.hidden=true;start(row);
  }catch(e){say(safeError(e));retry.hidden=false;}finally{button.disabled=false;}
}
document.getElementById('cloud-import').onclick=()=>migrate(false);
document.getElementById('cloud-empty').onclick=()=>migrate(true);
document.getElementById('cloud-export').onclick=()=>{if(!userId)return;try{download(working||readOriginal(),'yarikuri-backup-'+new Date().toISOString().slice(0,10)+'.json');}catch(e){say('バックアップを読み取れませんでした。元データは削除していません。');}};
document.getElementById('cloud-export-legacy').onclick=()=>{if(!userId)return;try{download(readOriginal(),'yarikuri-before-cloud-'+new Date().toISOString().slice(0,10)+'.json');}catch(e){say('元データを読み取れませんでした。データは削除していません。');}};
document.getElementById('cloud-use-remote').onclick=async()=>{
  if(!confirm('未送信の変更をこの端末から取り下げ、クラウドの内容を読み直します。先にバックアップを保存してください。'))return;
  try{const row=await getRemote();if(!row)throw new Error('クラウドデータがありません');localStorage.removeItem(outboxKey());location.reload();}catch(e){say(safeError(e));}
};
document.getElementById('cloud-refresh').onclick=()=>{if(pending||isEditing()){if(!confirm('編集中の入力があります。保存していないフォーム入力を破棄して読み直しますか？'))return;}if(pending){say('未送信の変更があります。先に同期または競合の確認をしてください。');return;}location.reload();};
document.getElementById('cloud-signout').onclick=async()=>{
  if(pending&&!confirm('未送信の変更はこのアカウント専用に端末へ保管されます。ログアウトしますか？'))return;
  authEpoch++;running=false;lock();say('ログアウト中…');await client.removeAllChannels();const {error}=await client.auth.signOut({scope:'local'});if(error){say('ログアウトできませんでした。再読み込みしてお試しください。');return;}location.reload();
};
login.addEventListener('submit',async event=>{event.preventDefault();const submit=login.querySelector('button');submit.disabled=true;say('ログインしています…');
  try{const {error}=await client.auth.signInWithPassword({email:document.getElementById('cloud-email').value.trim(),password:document.getElementById('cloud-password').value});document.getElementById('cloud-password').value='';if(error){say('ログインできませんでした。メールアドレスとパスワードを確認してください。');return;}await loadAccount();}
  catch(e){say(safeError(e));}finally{submit.disabled=false;}
});
retry.onclick=()=>{if(running){flush();refresh();}else loadAccount();};
client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||(userId&&session&&session.user.id!==userId)){authEpoch++;running=false;userId=null;lock();location.reload();}});
window.addEventListener('online',()=>{flush();refresh();});
window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
window.addEventListener('beforeunload',e=>{if(pending){e.preventDefault();e.returnValue='';}});
// Do not let a legacy cache-all worker intercept authenticated GETs before upgrade.
async function ensureSafeWorker(){
  if(!('serviceWorker' in navigator))return;
  const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
  await registration.update();
  const safe=()=>new Promise(resolve=>{
    const worker=navigator.serviceWorker.controller;
    if(!worker){resolve(false);return;}
    const channel=new MessageChannel();const timeout=setTimeout(()=>{channel.port1.close();resolve(false);},700);
    channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();resolve(event.data==='yarikuri-cloud-static-v7');};
    worker.postMessage({type:'YARIKURI_CACHE_POLICY'},[channel.port2]);
  });
  const deadline=Date.now()+12000;
  do {if(await safe())return;await new Promise(resolve=>setTimeout(resolve,200));}while(Date.now()<deadline);
  throw new Error('安全なキャッシュ更新を確認できませんでした');
}
loadAccount();
