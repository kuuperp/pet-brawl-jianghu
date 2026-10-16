import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {freshState,normalizeState,statsFor,fighterFor,stageFor,rivalsFor,WEAPONS,Battle,seeded} from '../public/engine.mjs';
import {RELIC,hasRelic,redeemCdk,sha256Ascii,normalizeCdk} from '../public/relics.mjs';
const valid=process.env.CDK_TEST_CODE;
test('Old saves have no relic; malformed and wrong codes never mutate progress',async()=>{
 const state=freshState(),old={...state};delete old.cdkClaims;delete old.relicEquipped;
 assert.equal(hasRelic(normalizeState(old)),false);assert.equal(statsFor(normalizeState(old)).evasion,0);
 const before=JSON.stringify(state);
 for(const code of ['', '<img src=x>', 'A'.repeat(80), 'NOT-A-REAL-CODE'])assert.equal((await redeemCdk(state,code)).ok,false);
 assert.equal(JSON.stringify(state),before);
});
test('Valid redemption, duplicate protection, save roundtrip and exact equipped bonuses',{skip:!valid},async()=>{
 const s=freshState(),baseline=statsFor(s);
 assert.equal((await redeemCdk(s,'  '+valid.toLowerCase()+'  ')).ok,true);
 for(const k of ['atk','def','evasion'])assert.equal(statsFor(s)[k]-baseline[k],50000,k);
 assert.equal(statsFor(s).agi,baseline.agi);assert.equal(statsFor(s).hp,baseline.hp);
 const before=JSON.stringify(s);assert.equal((await redeemCdk(s,valid)).ok,false);assert.equal(JSON.stringify(s),before);
 const restored=normalizeState(JSON.parse(JSON.stringify(s)));assert.deepEqual(statsFor(restored),statsFor(s));assert.equal(hasRelic(restored),true);
 restored.relicEquipped=false;assert.deepEqual(statsFor(restored),baseline);
 for(const stance of ['fierce','nimble']){restored.stance=stance;const naked=statsFor(restored);restored.relicEquipped=true;for(const k of ['atk','def','evasion'])assert.equal(statsFor(restored)[k]-naked[k],50000);restored.relicEquipped=false;}
 const other=freshState(),results=await Promise.all([redeemCdk(other,valid),redeemCdk(other,valid)]);assert.equal(results.filter(r=>r.ok).length,1);
});
test('The relic is absent from shops, level rewards, opponents and all 200 boss reward tables',()=>{
 assert.equal(WEAPONS.some(w=>w.id===RELIC.id),false);
 for(let n=1;n<=200;n++){const e=stageFor(n);assert.notEqual(e.reward,RELIC.id);assert.ok(!e.weapons.includes(RELIC.id));}
 assert.ok(rivalsFor(freshState(),23).every(f=>!f.relic));
});
test('Relic stats affect actual damage, defense and evasion; weapon removal cannot strip the relic',{skip:!valid},async()=>{
 const s=freshState();await redeemCdk(s,valid);const equipped=fighterFor(s);s.relicEquipped=false;const plain=fighterFor(s);
 const enemy={...plain,hp:1000000,weapons:[],skills:[],def:25};
 function hit(att,def){const b=new Battle({...att,skills:[],weapons:[]},{...def,skills:[],weapons:[]},()=>.5);b.autoBurst=false;b.actor=0;return b.step();}
 assert.ok(hit(equipped,enemy).damage>hit(plain,enemy).damage*100);
 const attacking={...enemy,atk:1000};assert.equal(hit(attacking,equipped).dodged,true);assert.equal(hit(attacking,plain).dodged,false);
 const b=new Battle({...attacking,weapons:[]},{...equipped,weapons:[]},()=>0);b.actor=0;const weak=b.step();assert.ok(weak.damage<5);assert.equal(weak.dodged,false);
 const remove=new Battle(equipped,enemy,()=>.5);const original=remove.fighters[0].def;remove.removeHeld(remove.fighters[0]);assert.equal(remove.fighters[0].def,original);assert.equal(remove.fighters[0].relic,RELIC.id);
 const duel=new Battle(equipped,stageFor(200),seeded(92));while(!duel.done)duel.step();assert.equal(duel.winner,0);assert.ok(duel.steps<=160);
});

test('Portable digest matches independent SHA-256 for standard vectors and all CDK-sized block boundaries',()=>{
 for(const text of ['', 'abc', ...Array.from({length:130},(_,i)=>'A-9'.repeat(i).slice(0,i))])assert.equal(sha256Ascii(text),createHash('sha256').update(text).digest('hex'));
 assert.throws(()=>sha256Ascii('中文'));
 assert.equal(normalizeCdk(' “abcd — efgh–1234\n” '),'ABCD-EFGH-1234');
});
test('Correct codes redeem without Web Crypto or TextEncoder, including clipboard variants',{skip:!valid},async()=>{
 const descriptors=Object.fromEntries(['crypto','TextEncoder'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 try{
  for(const k of Object.keys(descriptors))Object.defineProperty(globalThis,k,{value:undefined,configurable:true});
  const variants=[valid,' '+valid.toLowerCase()+' ',valid.replaceAll('-',' — '),valid.replaceAll('-','\n–\u200B'), '“'+valid+'”',valid.replace(/[A-Z0-9-]/g,c=>String.fromCharCode(c.charCodeAt(0)+0xFEE0))];
  for(const code of variants){const state=freshState();assert.equal((await redeemCdk(state,code)).ok,true);assert.equal(statsFor(state).atk-statsFor(freshState()).atk,50000);assert.equal((await redeemCdk(state,code)).ok,false);}
  assert.equal((await redeemCdk(freshState(),valid.slice(0,-1)+'Z')).ok,false);
 }finally{for(const [k,desc]of Object.entries(descriptors)){if(desc)Object.defineProperty(globalThis,k,desc);else delete globalThis[k];}}
});
