export const KEYS = ['accounts','balance','fixedcosts','month','payday','history','budget','budget-history','expenses','roadmap'].map(k => 'oshi-money-' + k);
export const clone = value => JSON.parse(JSON.stringify(value));
export const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
export function migrateLexusRoadmap(roadmap,at=new Date().toISOString()) {
  if(!roadmap||!Array.isArray(roadmap.milestones))return {roadmap,changed:false};
  const result=clone(roadmap), migrationKey='lexusSharedGoalV1';
  if(result.migrations?.[migrationKey])return {roadmap:result,changed:false};
  const linked=result.milestones.filter(m=>m?.sharedKey==='lexus-nx');
  if(linked.length>1)return {roadmap:result,changed:false,needsReview:true};
  if(linked.length===1){result.migrations={...result.migrations,[migrationKey]:{at,sharedGoalId:linked[0].id,archivedMilestones:[]}};return {roadmap:result,changed:true};}
  // Prefer the user's already-edited 800万円 NX goal, preserving id/title/date.
  const existing=result.milestones.filter(m=>m&&m.kind==='goal'&&m.amount===8000000&&/(?:lexus|レクサス).*nx/i.test(m.name||''));
  if(existing.length>1)return {roadmap:result,changed:false,needsReview:true};
  let shared, archived=[];
  if(existing.length===1){shared=existing[0];shared.sharedKey='lexus-nx';}
  else {
    const legacy=result.milestones.filter(m=>m&&m.kind==='event'&&m.month==='2031-04'&&m.name==='レクサス購入'&&m.amount===3000000&&m.after===1475000);
    if(legacy.length>1)return {roadmap:result,changed:false,needsReview:true};
    shared={id:legacy[0]?.id||'lexus-nx-shared-goal-v1',sharedKey:'lexus-nx',name:'新型LEXUS NX購入資金',kind:'goal',amount:8000000,month:'2029-10',after:null};
    if(legacy.length===1){archived=[clone(legacy[0])];result.milestones=result.milestones.map(m=>m.id===legacy[0].id?shared:m);}
    else if(result.milestones.some(m=>m.id===shared.id))return {roadmap:result,changed:false,needsReview:true};
    else result.milestones.push(shared);
  }
  result.migrations={...result.migrations,[migrationKey]:{at,sharedGoalId:shared.id,archivedMilestones:archived}};
  return {roadmap:result,changed:true};
}
export function validDocument(doc) {
  if (!doc || doc.version !== 1 || !doc.values || Array.isArray(doc.values) || typeof doc.values !== 'object') return false;
  if (Object.keys(doc.values).some(k => !KEYS.includes(k))) return false;
  if (JSON.stringify(doc).length > 4500000) return false;
  for (const key of ['accounts','fixedcosts','history','budget-history','expenses']) {
    const v = doc.values['oshi-money-' + key];
    if (v !== undefined && !Array.isArray(v)) return false;
  }
  for (const key of ['budget','roadmap']) {
    const v = doc.values['oshi-money-' + key];
    if (v !== undefined && (!v || Array.isArray(v) || typeof v !== 'object')) return false;
  }
  if (doc.observations !== undefined && !validObservations(doc.observations)) return false;
  return true;
}
function validPoint(point) {
  return point && Number.isSafeInteger(point.current) && point.current>=0 && Number.isSafeInteger(point.highest) && point.highest>=point.current && typeof point.highestAt==='string' && Number.isFinite(Date.parse(point.highestAt)) && typeof point.observedAt==='string' && Number.isFinite(Date.parse(point.observedAt));
}
export function validObservations(o) {
  const pointer=o?.goalTargetBalance;
  const validPointer=pointer===undefined||(pointer&&(pointer.scope===null||typeof pointer.scope==='string')&&['ready','missing'].includes(pointer.state)&&typeof pointer.observedAt==='string'&&Number.isFinite(Date.parse(pointer.observedAt)));
  return !!o && o.version===1 && validPointer && (o.activeSavingsScope===null||typeof o.activeSavingsScope==='string') && ['accounts','savings'].every(k=>o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])&&Object.values(o[k]).every(validPoint));
}
function numericAmount(raw) {
  if (typeof raw!=='string'||!/^\d+$/.test(raw)) return null;
  const n=Number(raw);return Number.isSafeInteger(n)&&n>=0?n:null;
}
export function savingsSelection(values) {
  const roadmap=values['oshi-money-roadmap'];
  if(!roadmap||typeof roadmap!=='object')return {scope:null,amount:null};
  if(roadmap.source==='manual')return {scope:'manual',amount:numericAmount(roadmap.manual)};
  const accounts=values['oshi-money-accounts'];
  if(!Array.isArray(accounts))return {scope:null,amount:null};
  const selected=Array.isArray(roadmap.accountIds)&&roadmap.accountIds.length>0
    ? [...new Set(roadmap.accountIds.filter(id=>typeof id==='string'))].sort()
    : accounts.filter(a=>a&&a.budget===false&&typeof a.id==='string').map(a=>a.id).sort();
  const ids=[...new Set(selected)];
  if(!ids.length)return {scope:null,amount:null};
  const scope='accounts:'+JSON.stringify(ids);
  const amounts=ids.map(id=>numericAmount(accounts.find(a=>a?.id===id)?.amount));
  if(amounts.some(n=>n===null))return {scope,amount:null};
  const amount=amounts.reduce((sum,n)=>sum+n,0);
  return {scope,amount:Number.isSafeInteger(amount)?amount:null};
}
export function mergeObservations(...items) {
  const out={version:1,accounts:{},savings:{},activeSavingsScope:null};
  for(const item of items){
    if(!validObservations(item))continue;
    out.activeSavingsScope=item.activeSavingsScope;
    if(item.goalTargetBalance&&(!out.goalTargetBalance||Date.parse(item.goalTargetBalance.observedAt)>=Date.parse(out.goalTargetBalance.observedAt)))out.goalTargetBalance=clone(item.goalTargetBalance);
    for(const group of ['accounts','savings']) for(const [key,value] of Object.entries(item[group])) {
      const previous=Object.hasOwn(out[group],key)?out[group][key]:null;
      let merged=clone(value);
      if(previous){
        const latest=Date.parse(previous.observedAt)>Date.parse(value.observedAt)?previous:value;
        const peak=previous.highest>value.highest || (previous.highest===value.highest&&Date.parse(previous.highestAt)<Date.parse(value.highestAt))?previous:value;
        merged={current:latest.current,observedAt:latest.observedAt,highest:peak.highest,highestAt:peak.highestAt};
      }
      Object.defineProperty(out[group],key,{value:merged,enumerable:true,configurable:true,writable:true});
    }
  }
  return out;
}
// Observations describe entered balances, never salary flows or planned monthly savings.
// Called immediately before CAS; only the returned committed payload is authoritative.
export function observeBalances(doc,at=new Date().toISOString()) {
  if(!validDocument(doc)||!Number.isFinite(Date.parse(at)))throw new Error('観測する残高を確認できません');
  const result=clone(doc), o=mergeObservations(doc.observations);
  const record=(group,key,current)=>{
    if(current===null)return;
    const old=Object.hasOwn(o[group],key)?o[group][key]:null;
    const higher=!old||current>old.highest;
    Object.defineProperty(o[group],key,{value:{current,highest:higher?current:old.highest,highestAt:higher?at:old.highestAt,observedAt:at},enumerable:true,configurable:true,writable:true});
  };
  for(const account of doc.values['oshi-money-accounts']||[]){if(account&&typeof account.id==='string')record('accounts',account.id,numericAmount(account.amount));}
  const savings=savingsSelection(doc.values);o.activeSavingsScope=savings.scope;
  if(savings.scope)record('savings',savings.scope,savings.amount);
  o.goalTargetBalance={scope:savings.scope,state:savings.scope!==null&&savings.amount!==null?'ready':'missing',observedAt:at};
  result.observations=o;return result;
}
// Merge only disjoint top-level original keys; overlapping changes need explicit review.
export function mergeDocuments(base, local, remote) {
  if (![base,local,remote].every(validDocument)) throw new Error('保存データの形式を確認できません');
  const values = clone(remote.values), conflicts = [];
  for (const key of KEYS) {
    const b=base.values[key], l=local.values[key], r=remote.values[key];
    if (equal(l,b)) continue;
    if (!equal(r,b) && !equal(r,l)) { conflicts.push(key); continue; }
    if (l === undefined) delete values[key]; else values[key] = clone(l);
  }
  const document={version:1,values};
  if(local.observations||remote.observations){document.observations=mergeObservations(local.observations,remote.observations);document.observations.activeSavingsScope=savingsSelection(values).scope;}
  return {document,conflicts};
}
