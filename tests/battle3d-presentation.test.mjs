import test from 'node:test';
import assert from 'node:assert/strict';
import {mountScene3D,playCombatMotion,destroyScene3D} from '../public/battle3d.mjs';
import {Battle,fighterFor,freshState} from '../public/engine.mjs';

// Records the production renderer's DOM and GPU API writes, without browser QA claims.
test('3D labels mount hidden, update only on contact, retain their nodes and freeze with the action',()=>{
 let now=0,id=0;const pending=new Map(),writes=[];
 const driver={now:()=>now,request:fn=>{pending.set(++id,fn);return id;},cancel:key=>pending.delete(key),advance(ms){now+=ms;const q=[...pending.values()];pending.clear();q.forEach(fn=>fn(now));}};
 const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(o,k)=>k in o?o[k]:(...args)=>writes.push([k,...args])});
 class Node{
  constructor(){this.style={setProperty(key,value){this[key]=value;}};this.children=[];this.classList={add(){},remove(){}};this.width=0;this.height=0;}
  getContext(){return gl;}
  getBoundingClientRect(){return{left:0,top:0,width:800,height:450};}
  setAttribute(){}
  append(node){assert.equal(node.style.opacity,'0','Invisible before insertion into the document');this.children.push(node);node.parent=this;}
  prepend(node){this.children.unshift(node);node.parent=this;}
  appendChild(node){this.prepend(node);}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
 }
 const scene=new Node(),layer=new Node(),root={querySelector:s=>s==='#scene'?scene:null},state=freshState(),hero=fighterFor(state),battle=new Battle(hero,hero,()=>.5),base=battle.step();
 const e={...base,kind:'martial',move:'combo',hits:2,damage:31,absorbed:9,heal:0,counter:0,burn:0,weaponEvent:null,crit:false,dodged:false};
 const original=Object.fromEntries(['document','requestAnimationFrame','cancelAnimationFrame','performance'].map(k=>[k,globalThis[k]]));
 let motion;
 try{
  globalThis.document={visibilityState:'visible',querySelector:s=>s==='#combat-fx'?layer:s==='#scene'?scene:null,createElement:()=>new Node()};
  globalThis.requestAnimationFrame=driver.request;globalThis.cancelAnimationFrame=driver.cancel;globalThis.performance={now:()=>now};
  mountScene3D(root,state,{display:e.before,selected:{mode:'tower',chapter:0}});
  assert.equal(scene.children.length,1,'The real 3D path mounted a canvas');
  const hits=[];motion=playCombatMotion(e,{driver,speed:1,onImpact:f=>hits.push(f)});
  const nodes=[...layer.children];assert.ok(nodes.length>=4);assert.ok(nodes.every(n=>n.style.opacity==='0'));
  driver.advance(879);assert.deepEqual(hits,[]);assert.ok(nodes.every(n=>n.style.opacity==='0'));
  driver.advance(1);assert.deepEqual(hits,[.5]);assert.equal(nodes.find(n=>n.textContent==='−16').style.opacity,'1');assert.equal(nodes.find(n=>n.textContent==='−15').style.opacity,'0');
  const firstLeft=nodes.find(n=>n.textContent==='−16').style.left;assert.ok(firstLeft.endsWith('px'),'Floats use the camera projection');
  motion.pause();const frozen=nodes.map(n=>JSON.stringify(n.style));driver.advance(5000);assert.deepEqual(nodes.map(n=>JSON.stringify(n.style)),frozen);
  motion.setMotion('reduced');assert.deepEqual(hits,[.5]);motion.resume();driver.advance(286);
  assert.deepEqual(hits,[.5,1]);assert.deepEqual(layer.children,nodes,'The second hit cannot replace or reset first-hit DOM nodes');
  assert.equal(nodes.find(n=>n.textContent==='−16').style.opacity,'1');assert.equal(nodes.find(n=>n.textContent==='−15').style.opacity,'1');
  motion.setRate(3);driver.advance(1000);assert.equal(layer.children.length,0);assert.deepEqual(hits,[.5,1]);assert.ok(writes.some(w=>w[0]==='drawArrays'));
 }finally{motion?.();destroyScene3D();for(const [key,value]of Object.entries(original))globalThis[key]=value;}
});
