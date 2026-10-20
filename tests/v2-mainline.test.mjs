import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,freshState,normalizeState,fighterFor,campaignFighterFor,stageFor,chooseRoute,statsFor,CHAPTERS,WEAPONS,SKILLS} from '../public/engine.mjs';
import {readProtectedSave,writeProtectedSave,SAVE_KEY} from '../public/save-store.mjs';
import {drawCharacter,drawWeapon,drawArena,WEAPON_MODEL_IDS} from '../public/world-assets.mjs';
import {geometry} from '../public/mini-gl.mjs';

test('A visible boss charge can be interrupted by a successful manual disarm',()=>{
 const s=freshState();s.level=80;const b=new Battle(fighterFor(s),stageFor(40),()=>0);
 b.fighters[1].bossCooldown=0;b.actor=1;const charge=b.step();assert.equal(charge.kind,'boss-charge');assert.ok(b.fighters[1].bossCharge);assert.equal(charge.damage,0);
 b.actor=0;assert.ok(b.requestTactic('disarm'));const hit=b.step();assert.ok(hit.tacticSuccess);assert.ok(hit.interrupted);assert.equal(b.fighters[1].bossCharge,null);assert.ok(b.ground.length>0);
});
test('Every chapter boss releases its own damaging skill and changes phase at low health',()=>{
 const skills=new Set();
 for(let chapter=0;chapter<20;chapter++){
  const s=freshState();s.level=300;const hero={...fighterFor(s),hp:100000,skills:[]},foe=stageFor(chapter*40+40),b=new Battle(hero,foe,()=>.3);
  const boss=b.fighters[1];boss.bossCharge=boss.bossProfile.primary;boss.bossCooldown=0;b.actor=1;const cast=b.step();skills.add(cast.bossSkill.id);assert.equal(cast.kind,'boss-skill');assert.ok(cast.damage>0);assert.ok(cast.after.every(f=>Number.isFinite(f.hp)&&f.hp>=0&&f.hp<=f.maxHp));
  boss.hp=Math.round(boss.maxHp*.2);b.actor=0;b.fighters[0].atk=1;const changed=b.step();assert.equal(boss.bossPhase,3);assert.ok(changed.phaseChanges.some(p=>p.who===1));
 }
 assert.equal(skills.size,20);
});
test('Chapter routes affect combat without modifying permanent stats or unlocking future chapters',()=>{
 const s=freshState(),base=statsFor(s);assert.equal(chooseRoute(s,1,'pursuit').ok,false);assert.ok(chooseRoute(s,0,'pursuit').ok);
 assert.equal(campaignFighterFor(s,stageFor(1)).atk,Math.round(base.atk*1.08));assert.deepEqual(statsFor(s),base);assert.equal(campaignFighterFor(s,{mode:'arena'}).atk,base.atk);
 const restored=normalizeState(s);assert.equal(restored.chapterChoices[0],'pursuit');
});
test('Corrupt saves remain protected and a valid rolling backup recovers progress',()=>{
 const items=new Map(),storage={getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v)};
 items.set(SAVE_KEY,'damaged original');const broken=readProtectedSave(storage);assert.ok(broken.blocked);assert.equal(writeProtectedSave(storage,freshState(),{blocked:broken.blocked}),false);assert.equal(items.get(SAVE_KEY),'damaged original');
 const original=freshState();original.contentVersion=2;original.stage=201;original.level=80;original.cdkClaims=['wuji-seal'];original.relicEquipped=true;items.set(SAVE_KEY+'-backup',JSON.stringify(original));
 const recovered=readProtectedSave(storage);assert.ok(recovered.recovered);assert.equal(recovered.state.stage,201);assert.equal(recovered.state.relicEquipped,true);assert.ok(recovered.state.skills.includes('comboheart'));assert.ok(writeProtectedSave(storage,recovered.state));assert.equal(items.get(SAVE_KEY+'-damaged'),'damaged original');
});
test('Twenty mesh arenas and all sixty weapon models have finite transforms and balanced scene graphs',()=>{
 let stack=0,draws=0;const values=(...x)=>assert.ok(x.every(Number.isFinite)),r={push(){stack++},pop(){assert.ok(--stack>=0)},translate:values,scale:values,rotateX:values,rotateY:values,rotateZ:values,mesh(){draws++}};
 for(const chapter of CHAPTERS)drawArena(r,chapter,1.2);
 for(const pet of ['penguin','panda','cat','rabbit'])drawCharacter(r,{pet,boss:true,chapter:19,chapterBoss:true,weapons:['heaven-seal']},{},{scale:1.95,facing:-1,time:1.2});
 for(const w of WEAPONS){assert.ok(WEAPON_MODEL_IDS.includes(w.id));drawWeapon(r,w.id);if(w.tier>=3)assert.ok(w.proc);}
 assert.equal(stack,0);assert.ok(draws>1500);
 for(const kind of ['sphere','box','cylinder','cone','torus','disc','wedge']){const g=geometry(kind);assert.ok(g.count>3);assert.equal(g.count%3,0);assert.equal(g.positions.length,g.normals.length);assert.ok(g.positions.every(Number.isFinite));assert.ok(g.normals.every(Number.isFinite));}
 assert.equal(SKILLS.length,40);
});
