import test from 'node:test';
import assert from 'node:assert/strict';
import {playCombatMotion} from '../public/combat-motion.mjs';
import {fighterArt} from '../public/fighter-rig.mjs';
import {Battle,fighterFor,freshState,normalizeState} from '../public/engine.mjs';

// Exercise the production DOM renderer and real rig selectors, not only the pose sampler.
// This adapter records DOM writes; it does not stand in for browser rendering/performance QA.
function fixture(systemReduced=true){
 const canvasCalls=[];const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:(...args)=>canvasCalls.push([k,...args]),set:(o,k,v)=>{o[k]=v;return true;}});
 class Element{
  constructor(box={}){this.style={};this.attrs={};this.children=[];this.selectors=new Map();this.box=box;this.className='';this.textContent='';this.innerHTML='';this.classList={add(){},remove(){}};}
  getContext(){return ctx;}
  querySelector(selector){return this.selectors.get(selector)||null;}
  getBoundingClientRect(){return this.box;}
  setAttribute(key,value){this.attrs[key]=value;}
  append(n){this.children.push(n);n.parent=this;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
 }
 const nodes=new Map(),scene=new Element({left:0,top:0,width:800,height:354}),layer=new Element(),fighters=[],joints=[];
 nodes.set('#scene',scene);nodes.set('#combat-fx',layer);nodes.set('#ground-weapons',new Element({left:0,top:275,width:800,height:36}));
 for(let i=0;i<2;i++){
  const fighter=new Element({left:i?560:110,top:164,width:126,height:137}),binding={};
  for(const [,name]of fighterArt('penguin',{index:i,held:'bamboo'}).matchAll(/data-joint="([^"]+)"/g)){binding[name]=new Element();fighter.selectors.set(`[data-joint="${name}"]`,binding[name]);}
  assert.equal(Object.keys(binding).length,10);
  fighter.selectors.set('.fighter-inner',new Element());fighter.selectors.set('.rig-shadow',new Element());
  nodes.set('#fighter-'+i,fighter);nodes.set('#held-'+i,new Element());fighters.push(fighter);joints.push(binding);
 }
 let now=0,id=0;const pending=new Map(),driver={now:()=>now,request:fn=>{pending.set(++id,fn);return id;},cancel:id=>pending.delete(id),advance(ms){now+=ms;const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(now));}};
 const original={document:globalThis.document,window:globalThis.window};
 globalThis.document={querySelector:s=>nodes.get(s)||null,createElement:()=>new Element()};
 globalThis.window={matchMedia:()=>({matches:systemReduced}),addEventListener(){},removeEventListener(){}};
 return{fighters,joints,layer,driver,canvasCalls,restore(){globalThis.document=original.document;globalThis.window=original.window;}};
}
function event(overrides={}){const f=fighterFor(freshState()),b=new Battle(f,f,()=>.5);b.actor=0;return{...b.step(),...overrides};}
test('Full combat animates actual positions and SVG limbs even when the system requests reduced motion',()=>{
 const f=fixture(true);let motion;
 try{
  motion=playCombatMotion(event({kind:'martial',move:'flying-kick'}),{driver:f.driver});
  const start=f.fighters[0].style.transform,limb=f.joints[0].lf.attrs.transform;
  f.driver.advance(600);
  assert.notEqual(f.fighters[0].style.transform,start,'The actor must visibly move across the arena');
  assert.notEqual(f.joints[0].lf.attrs.transform,limb,'The actual SVG leg must change pose');
  motion.pause();const frozen=JSON.stringify([f.fighters[0].style,f.joints[0]]);f.driver.advance(5000);assert.equal(JSON.stringify([f.fighters[0].style,f.joints[0]]),frozen);
  motion.resume();f.driver.advance(100);assert.notEqual(JSON.stringify([f.fighters[0].style,f.joints[0]]),frozen);
 }finally{motion?.();f.restore();}
});
test('Full combat shows a flying weapon, and changing motion mode preserves elapsed time and impact count',()=>{
 const f=fixture(true);let motion,impacts=0;
 try{
  motion=playCombatMotion(event({kind:'throw',move:'throw',weapon:'bamboo',weaponEvent:{kind:'throw',weapon:'bamboo',from:0,to:'spent'}}),{driver:f.driver,onImpact:()=>impacts++});
  f.driver.advance(720);const projectile=f.layer.children.find(n=>n.className.includes('flying-weapon'));
  assert.equal(projectile.style.display,'block');
  const elapsed=motion.elapsed;motion.setMotion('reduced');assert.equal(projectile.style.display,'none');assert.equal(motion.elapsed,elapsed);
  motion.setMotion('full');assert.equal(projectile.style.display,'block');assert.equal(motion.elapsed,elapsed);
  f.driver.advance(160);assert.equal(impacts,1);f.driver.advance(1400);assert.equal(impacts,1);assert.equal(f.layer.children.length,0);
 }finally{motion?.();f.restore();}
});
test('Existing saves enable full combat and preserve a deliberate simplified-animation choice',()=>{
 const old=freshState();delete old.settings.motion;old.gold=981;old.name='旧存档';
 assert.equal(normalizeState(old).settings.motion,'full');assert.equal(normalizeState(old).gold,981);
 old.settings.motion='reduced';assert.equal(normalizeState(old).settings.motion,'reduced');
 old.settings.motion='unknown';assert.equal(normalizeState(old).settings.motion,'full');
});

test('Production effects canvas shares pause/resume/rate, reduced mode and cancellation with the fighter clock',()=>{
 const f=fixture();let motion;
 try{
  motion=playCombatMotion(event({kind:'martial',artId:'dragon-elbow',move:'elbow'}),{driver:f.driver});
  const canvas=f.layer.children.find(n=>n.className==='battle-vfx');assert.ok(canvas);
  f.driver.advance(720);const calls=f.canvasCalls.length;assert.ok(calls>100);
  motion.pause();const frozen=f.canvasCalls.length;f.driver.advance(3000);assert.equal(f.canvasCalls.length,frozen);
  motion.setRate(3);motion.resume();f.driver.advance(50);assert.equal(motion.elapsed,870);assert.ok(f.canvasCalls.length>calls);
  motion.setMotion('reduced');assert.equal(f.canvasCalls.at(-1)[0],'clearRect');
  const at=motion.elapsed;motion.setMotion('full');assert.equal(motion.elapsed,at);assert.notEqual(f.canvasCalls.at(-1)[0],'clearRect');
  motion();const canceled=f.canvasCalls.length;f.driver.advance(8000);assert.equal(f.canvasCalls.length,canceled);assert.equal(f.layer.children.length,0);
 }finally{motion?.();f.restore();}
});
