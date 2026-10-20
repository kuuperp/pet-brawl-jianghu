import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,fighterFor,freshState,seeded,stageFor} from '../public/engine.mjs';
import {createCombatSequence,sampleCombat} from '../public/combat-sequence.mjs';
import {GUARD} from '../public/fighter-rig.mjs';
import {fighterPositions,animateFighterPositions,combatCameraFocus,frontalArenaView,battleViewport,ARENA_HALF_WIDTH} from '../public/battle-layout.mjs';
import {cameraMatrix,projectPoint} from '../public/mini-gl.mjs';
import {combatSnapshot} from '../public/combat-presentation.mjs';
import {pocketsView,tacticsView} from '../public/views.mjs';
const hero={...fighterFor(freshState()),hp:100000,skills:[],weapons:['bamboo']};
const layout=fighters=>({width:1200,height:640,fighters:fighters.map((f,i)=>({x:i?1080:120,top:490-160*(f.modelScale||1),width:150*(f.modelScale||1),height:160*(f.modelScale||1)})),ground:{x:600,y:500}});

test('Both fighters receive independent 3, 4 and 5-use copies and retire by a balanced random choice',()=>{
 const rng=seeded(20261020),limits=[0,0,0],outcomes=[{throw:0,discard:0},{throw:0,discard:0}];
 for(let i=0;i<1500;i++){
  const b=new Battle(hero,hero,rng);
  for(const [side,f]of b.fighters.entries()){
   assert.ok([3,4,5].includes(f.heldLimit));limits[f.heldLimit-3]++;f.weaponUses[0]=f.heldLimit;b.setHeld(f,0);b.actor=side;
   const v=b.step();assert.ok(['throw','discard'].includes(v.kind));outcomes[side][v.kind]++;assert.equal(f.weapons.length,0);assert.equal(b.discarded.at(-1).limit,v.before[side].heldLimit);
  }
 }
 assert.ok(limits.every(n=>n>850&&n<1150),JSON.stringify(limits));
 for(const counts of outcomes)assert.ok(counts.throw>650&&counts.throw<850,JSON.stringify(counts));
 const b=new Battle({...hero,weapons:['bamboo','bamboo','bamboo']},hero,rng),snapshot=b.snapshot();snapshot[0].weaponLimits[0]=99;assert.notEqual(b.fighters[0].weaponLimits[0],99,'Snapshots cannot mutate physical copy quotas');
});
test('Quota changes and the next weapon become visible only when the old weapon leaves the hand',()=>{
 const b=new Battle({...hero,weapons:['bamboo','pan']},hero,()=>.5),f=b.fighters[0];f.weaponLimits=[3,5];f.weaponUses=[3,1];b.setHeld(f,0);b.actor=0;
 const e=b.step();assert.equal(e.kind,'discard');assert.equal(e.after[0].held,'pan');assert.equal(e.after[0].heldLimit,5);assert.equal(e.after[0].heldUses,1);
 const beforeTransfer=combatSnapshot(e,1,{transferred:false}),afterTransfer=combatSnapshot(e,1,{transferred:true});
 assert.equal(beforeTransfer[0].held,'bamboo');assert.deepEqual(beforeTransfer[0].weaponLimits,[3,5]);assert.equal(beforeTransfer[0].heldLimit,3);
 assert.equal(afterTransfer[0].held,'pan');assert.deepEqual(afterTransfer[0].weaponLimits,[5]);assert.equal(afterTransfer[0].heldLimit,5);
 assert.ok(pocketsView(e.before).includes('3/3'));assert.ok(pocketsView(e.after).includes('1/5'));assert.ok(!tacticsView(b).includes('data-action="disposal"'));assert.ok(tacticsView(b).includes('各50%'));
});
test('The longer ring more than doubles normal approach distance and restores resting positions after each action',()=>{
 const b=new Battle(hero,hero,()=>.5),e={...b.step(),actor:0,target:1,kind:'attack',move:'punch',hits:1},s=createCombatSequence(e,layout(e.before));
 const rest=fighterPositions(e.before),start=rest[0].x;assert.ok(Math.abs(rest[1].x-start)>11);assert.ok(ARENA_HALF_WIDTH>10);
 const hit=rest.map(p=>({...p,pose:GUARD}));animateFighterPositions(hit,e,s,sampleCombat(s,s.t.impact));assert.ok(hit[0].x-start>4.74*2);assert.ok(Math.abs(hit[1].x-hit[0].x)<1.5);
 const end=rest.map(p=>({...p,pose:GUARD}));animateFighterPositions(end,e,s,sampleCombat(s,s.t.duration));assert.equal(end[0].x,start);assert.deepEqual(combatCameraFocus(end,e,1),{focus:0,closeup:0});
 assert.ok(s.t.impact>1000,'The longer run has more time before contact');
});
test('The frontal camera follows combat smoothly and keeps ordinary and giant fighters in view on narrow screens',()=>{
 for(const [width,height]of [[280,370],[343,370],[740,450],[960,490]])for(const stage of [1,40,400,800])for(const actor of [0,1]){
  const b=new Battle(hero,stageFor(stage),()=>.5);b.actor=actor;const e={...b.step(),kind:'martial',move:'punch',hits:1},s=createCombatSequence(e,layout(e.before)),vp=battleViewport(width,height);let previous=null;
  for(let time=0;time<=s.t.duration;time+=20){
   const sample=sampleCombat(s,time),positions=fighterPositions(e.before).map(p=>({...p,pose:GUARD}));animateFighterPositions(positions,e,s,sample);
   const focus=combatCameraFocus(positions,e,sample.progress),view=frontalArenaView(vp.width,vp.height,e.before,focus),matrix=cameraMatrix(view,vp.width,vp.height);
   assert.equal(view.camera[0],view.target[0]);assert.equal(view.camera[1],view.target[1]);
   for(const p of positions)assert.ok(projectPoint(matrix,[p.x,p.y+1.6*p.scale,0],vp.width,vp.height).visible,`${width}/${stage}/${actor}/${time}`);
   if(previous){assert.ok(Math.abs(view.camera[0]-previous.camera[0])<.45);assert.ok(Math.abs(view.fov-previous.fov)<.04);}previous=view;
  }
 }
});
test('Pickup runs stop at the central weapon pile while a throw stays at the far starting position',()=>{
 const b=new Battle(hero,hero,()=>.5);
 for(const actor of [0,1])for(const kind of ['pickup','throw']){
  const e={...b.step(),actor,target:1-actor,kind,move:kind},s=createCombatSequence(e,layout(e.before)),positions=fighterPositions(e.before).map(p=>({...p,pose:GUARD}));
  const start=positions[actor].x;animateFighterPositions(positions,e,s,sampleCombat(s,s.t.impact));
  if(kind==='pickup')assert.ok(Math.abs(positions[actor].x)<1);else assert.equal(positions[actor].x,start);
 }
});
