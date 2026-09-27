import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {KEYS,clone,equal,validDocument,mergeDocuments,observeBalances,mergeObservations,savingsSelection} from './cloud-core.mjs';
import {periodOfDate,periodByKey,periodKeyOf} from './period.mjs';
const doc=values=>({version:1,values});
const siteURL=file=>new URL((new URL('.',import.meta.url).pathname.endsWith('/tools/yarikuri-cloud/')?'../../site/':'./site/')+file,import.meta.url);
test('only exact original keys permitted, malformed arrays rejected',()=>{
  assert.ok(validDocument(doc({})));assert.ok(validDocument(doc({'oshi-money-accounts':[]})));
  assert.equal(validDocument(doc({income:1})),false);assert.equal(validDocument(doc({'oshi-money-accounts':{}})),false);
});
test('three-way merges disjoint keys but blocks overlapping balances',()=>{
  const base=doc({'oshi-money-payday':25,'oshi-money-accounts':[{id:'a',amount:'100'}]});
  const local=clone(base);local.values['oshi-money-payday']=26;
  const remote=clone(base);remote.values['oshi-money-accounts'][0].amount='200';
  const merged=mergeDocuments(base,local,remote);assert.deepEqual(merged.conflicts,[]);assert.equal(merged.document.values['oshi-money-payday'],26);assert.equal(merged.document.values['oshi-money-accounts'][0].amount,'200');
  local.values['oshi-money-accounts'][0].amount='300';assert.deepEqual(mergeDocuments(base,local,remote).conflicts,['oshi-money-accounts']);
});
test('payday period includes holiday-adjusted day and uses midpoint key',()=>{
  assert.deepEqual(periodOfDate(new Date(2026,8,27),25),{key:'2026-10',start:'2026-09-25',end:'2026-10-22'});
  assert.equal(periodKeyOf('2026-09-24',25),'2026-09');
  assert.deepEqual(periodByKey('2026-10',25),periodOfDate(new Date(2026,8,27),25));
  assert.equal(periodOfDate(new Date(2026,8,27),0).key,'2026-09');
});
function harness({user={id:'test-user'},remote=null,legacy={},outbox=null,withWorker=false}={}){
  const elems=new Map(),timers=[],storage=new Map(Object.entries(legacy).map(([k,v])=>[k,JSON.stringify(v)]));let db=clone(remote),reloads=0,authChange,authReads=0,workerAcknowledged=false;
  if(outbox)storage.set('yarikuri-pending-v1:'+user.id,JSON.stringify(outbox));
  const element=id=>{if(!elems.has(id))elems.set(id,{hidden:true,textContent:'',value:'',disabled:false,tagName:'DIV',addEventListener(type,fn){this[type]=fn;},querySelector(){return element(id+'-button');}});return elems.get(id);};
  const classes=new Set(['cloud-locked']);
  const context={KEYS,clone,equal,validDocument,mergeDocuments,observeBalances,mergeObservations,console,Promise,JSON,Number,Date,Array,Object,Error,Set,process:{env:{YARIKURI_PUBLIC_SUPABASE_URL:'https://test.invalid',YARIKURI_PUBLIC_SUPABASE_KEY:'test-only'}},
    createClient:()=>({auth:{getUser:async()=>{authReads++;if(withWorker)assert.equal(workerAcknowledged,true);return{data:{user},error:null};},onAuthStateChange:fn=>{authChange=fn;},signInWithPassword:async()=>({error:null}),signOut:async()=>{authChange('SIGNED_OUT',null);return{error:null};}},
      from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:clone(db),error:null})})})}),
      rpc:async(name,args)=>{if(args.expected_revision!==(db?.revision||0))return{data:null,error:{code:'40001'}};db={payload:clone(args.document),revision:(db?.revision||0)+1};return{data:clone(db),error:null};},
      channel:()=>({on(){return this;},subscribe(){return this;}}),removeAllChannels:async()=>{}}),
    document:{getElementById:element,documentElement:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},activeElement:{tagName:'BODY'},querySelectorAll:()=>[],addEventListener(){},hidden:false},
    localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    navigator:{onLine:true},location:{reload:()=>{reloads++;}},setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},setInterval(){},addEventListener(){},confirm:()=>true,Blob,URL};
  context.window=context;
  if(withWorker){
    context.MessageChannel=class{constructor(){this.port1={close(){}};this.port2={target:this.port1};}};
    context.navigator.serviceWorker={register:async()=>({update:async()=>{}}),controller:{postMessage(data,ports){assert.equal(data.type,'YARIKURI_CACHE_POLICY');workerAcknowledged=true;ports[0].target.onmessage({data:'yarikuri-cloud-static-v7'});}}};
  }
  const code=readFileSync(new URL('./cloud-entry.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  vm.runInNewContext(code,context);
  return {context,element,storage,classes,timers,db:()=>db,reloads:()=>reloads,authChange:()=>authChange,authReads:()=>authReads};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('logged-out bootstrap never exposes legacy data or runs original app',async()=>{
  const h=harness({user:null,legacy:{'oshi-money-accounts':[{id:'a',amount:'100'}]}});await settle();
  assert.ok(h.classes.has('cloud-locked'));assert.equal(h.element('cloud-login').hidden,false);assert.equal(h.element('cloud-export').hidden,true);assert.equal(h.db(),null);
});
test('explicit migration retains original local data and creates backup once',async()=>{
  const legacy={'oshi-money-accounts':[{id:'a',name:'savings',amount:'100',budget:false}]};const h=harness({legacy});await settle();assert.equal(h.db(),null);
  await h.element('cloud-import').onclick();await h.context.YarikuriCloud.ready;
  assert.deepEqual(h.db().payload.values,legacy);assert.equal(h.db().payload.observations.accounts.a.highest,100);assert.equal(h.classes.has('cloud-locked'),false);assert.ok(h.storage.has('yarikuri-migration-backup-v1:test-user'));assert.deepEqual(JSON.parse(h.storage.get('oshi-money-accounts')),legacy['oshi-money-accounts']);
});
test('write uses account-bound outbox, CAS saves then clears pending without touching legacy',async()=>{
  const h=harness({remote:{payload:doc({'oshi-money-payday':25}),revision:1}});await h.context.YarikuriCloud.ready;
  h.context.YarikuriCloud.write('oshi-money-payday',26);assert.ok(h.storage.has('yarikuri-pending-v1:test-user'));assert.equal(h.storage.has('oshi-money-payday'),false);
  await h.timers.at(-1)();assert.equal(h.db().payload.values['oshi-money-payday'],26);assert.equal(h.db().revision,2);assert.equal(h.storage.has('yarikuri-pending-v1:test-user'),false);
});
test('pending replay conflicts do not overwrite cloud or reveal editing UI',async()=>{
  const b=doc({'oshi-money-payday':25});const pending={userId:'test-user',baseRevision:1,base:b,document:doc({'oshi-money-payday':26})};
  const h=harness({remote:{payload:doc({'oshi-money-payday':27}),revision:2},outbox:pending});await settle();
  assert.equal(h.db().payload.values['oshi-money-payday'],27);assert.equal(h.element('cloud-conflict').hidden,false);assert.ok(h.classes.has('cloud-locked'));assert.ok(h.storage.has('yarikuri-pending-v1:test-user'));
});
test('sign-out event immediately hides private app',async()=>{
  const h=harness({remote:{payload:doc({}),revision:1}});await h.context.YarikuriCloud.ready;h.authChange()('SIGNED_OUT',null);assert.ok(h.classes.has('cloud-locked'));assert.equal(h.element('cloud-export').hidden,true);assert.equal(h.reloads(),1);
});
test('service worker excludes every non-static API and authorization request',()=>{
  const code=readFileSync(siteURL('sw.js'),'utf8');assert.match(code,/url\.origin!==self\.location\.origin/);assert.match(code,/!ALLOWED\.has\(url\.pathname\)/);assert.match(code,/headers\.has\('authorization'\)/);assert.doesNotMatch(code,/ignoreSearch/);
});
test('observed high-water survives lower balances and distinct funds never combine',()=>{
  const initial=doc({'oshi-money-accounts':[{id:'b',amount:'100',budget:false},{id:'a',amount:'200',budget:false}],'oshi-money-roadmap':{source:'accounts',accountIds:[]}});
  const first=observeBalances(initial,'2026-09-27T12:00:00.000Z');
  assert.equal(first.observations.activeSavingsScope,'accounts:["a","b"]');assert.equal(first.observations.savings['accounts:["a","b"]'].highest,300);
  first.values['oshi-money-accounts'][0].amount='10';
  const lower=observeBalances(first,'2026-09-27T13:00:00.000Z');assert.equal(lower.observations.accounts.b.highest,100);assert.equal(lower.observations.accounts.b.current,10);assert.equal(lower.observations.savings['accounts:["a","b"]'].highestAt,'2026-09-27T12:00:00.000Z');
  lower.values['oshi-money-roadmap'].accountIds=['b'];const changed=observeBalances(lower,'2026-09-27T14:00:00.000Z');
  assert.equal(changed.observations.activeSavingsScope,'accounts:["b"]');assert.equal(changed.observations.savings['accounts:["b"]'].highest,10);assert.equal(changed.observations.savings['accounts:["a","b"]'].highest,300);
});
test('manual and account scopes differ, missing balances are not zero observations',()=>{
  const initial=doc({'oshi-money-accounts':[{id:'a',amount:'',budget:false}],'oshi-money-roadmap':{source:'accounts',accountIds:['a','missing']}});
  const observed=observeBalances(initial,'2026-09-27T12:00:00Z');assert.deepEqual(observed.observations.accounts,{});assert.deepEqual(observed.observations.savings,{});
  observed.values['oshi-money-roadmap']={source:'manual',manual:'500'};const manual=observeBalances(observed,'2026-09-27T13:00:00Z');assert.equal(manual.observations.savings.manual.highest,500);
  manual.values['oshi-money-roadmap'].manual='0';assert.equal(observeBalances(manual).observations.savings.manual.highest,500);
  manual.values['oshi-money-roadmap'].manual='';assert.equal(savingsSelection(manual.values).amount,null);
});
test('metadata merges greatest committed peak and no salary planning becomes observed savings',()=>{
  const low=observeBalances(doc({'oshi-money-accounts':[{id:'a',amount:'100'}]}),'2026-09-27T12:00:00Z');
  const high=observeBalances(doc({'oshi-money-accounts':[{id:'a',amount:'200'}]}),'2026-09-27T13:00:00Z');
  assert.equal(mergeObservations(high.observations,low.observations).accounts.a.highest,200);
  const unknown=observeBalances(doc({'oshi-money-budget':{income:'300000',savingGoal:'50000',savedActual:'40000'}}));
  assert.deepEqual(unknown.observations.accounts,{});assert.deepEqual(unknown.observations.savings,{});
});
test('cloud persistence records highest only in successful CAS, then retains peak after reduction',async()=>{
  const h=harness({remote:{payload:doc({'oshi-money-accounts':[{id:'a',amount:'100',budget:false}],'oshi-money-roadmap':{source:'accounts',accountIds:['a']}}),revision:1}});
  await h.context.YarikuriCloud.ready;h.context.YarikuriCloud.write('oshi-money-accounts',[{id:'a',amount:'200',budget:false}]);
  assert.equal(h.db().payload.observations,undefined);await h.timers.at(-1)();assert.equal(h.db().payload.observations.accounts.a.highest,200);
  h.context.YarikuriCloud.write('oshi-money-accounts',[{id:'a',amount:'50',budget:false}]);await h.timers.at(-1)();assert.equal(h.db().payload.observations.accounts.a.current,50);assert.equal(h.db().payload.observations.accounts.a.highest,200);
});
test('authenticated getUser waits until upgraded static-only worker acknowledges policy',async()=>{
  const h=harness({withWorker:true,remote:{payload:doc({}),revision:1}});assert.equal(h.authReads(),0);await h.context.YarikuriCloud.ready;assert.equal(h.authReads(),1);
});
test('existing inline application remains syntactically valid and is bootstrapped only after ready',()=>{
  const html=readFileSync(siteURL('index.html'),'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);assert.equal(scripts.length,1);new vm.Script(scripts[0]);
  assert.match(scripts[0],/window\.YarikuriCloud\.ready\.then\(function/);
  assert.doesNotMatch(scripts[0],/localStorage\.(?:getItem|setItem)/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.equal(new Set(ids).size,ids.length);
});
