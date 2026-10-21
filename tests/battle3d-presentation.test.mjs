import test from 'node:test';
import assert from 'node:assert/strict';
import {mountScene3D,playCombatMotion,destroyScene3D,parkScene3D} from '../public/battle3d.mjs';
import {Battle,fighterFor,freshState} from '../public/engine.mjs';

// Records the production renderer's DOM and GPU API writes, without browser QA claims.
test('3D labels mount hidden, update only on contact, retain their nodes and freeze with the action',()=>{
 let now=0,id=0;const pending=new Map(),writes=[];
 const driver={now:()=>now,request:fn=>{pending.set(++id,fn);return id;},cancel:key=>pending.delete(key),advance(ms){now+=ms;const q=[...pending.values()];pending.clear();q.forEach(fn=>fn(now));}};
 const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(o,k)=>k in o?o[k]:(...args)=>writes.push([k,...args])});
 const screenWrites=[],ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:(...args)=>screenWrites.push([k,...args]),set:(o,k,v)=>{o[k]=v;return true;}});
 class Node{
  constructor(){this.style={setProperty(key,value){this[key]=value;}};this.children=[];this.classList={add(){},remove(){}};this.width=0;this.height=0;}
  getContext(type){return type==='2d'?ctx:gl;}
  getBoundingClientRect(){return{left:0,top:0,width:800,height:450};}
  setAttribute(){}
  append(node){assert.equal(node.style.opacity,'0','Invisible before insertion into the document');this.children.push(node);node.parent=this;}
  prepend(node){this.children.unshift(node);node.parent=this;}
  appendChild(node){this.prepend(node);}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
 }
 const scene=new Node(),layer=new Node(),body=new Node(),root={querySelector:s=>s==='#scene'?scene:null},state=freshState(),hero=fighterFor(state),battle=new Battle(hero,hero,()=>.5),base=battle.step();
 const e={...base,kind:'martial',move:'combo',hits:2,damage:31,absorbed:9,heal:0,counter:0,burn:0,weaponEvent:null,crit:false,dodged:false};
 const original=Object.fromEntries(['document','requestAnimationFrame','cancelAnimationFrame','performance','innerWidth','innerHeight'].map(k=>[k,globalThis[k]]));
 let motion;
 try{
  globalThis.innerWidth=1200;globalThis.innerHeight=780;
  globalThis.document={body,visibilityState:'visible',querySelector:s=>s==='#combat-fx'?layer:s==='#scene'?scene:null,createElement:()=>new Node()};
  globalThis.requestAnimationFrame=driver.request;globalThis.cancelAnimationFrame=driver.cancel;globalThis.performance={now:()=>now};
  mountScene3D(root,state,{display:e.before,selected:{mode:'tower',chapter:0}});
  assert.equal(scene.children.length,1,'The real 3D path mounted a canvas');
  const hits=[];motion=playCombatMotion(e,{driver,speed:1,onImpact:f=>hits.push(f)});
  const nodes=[...layer.children];assert.ok(nodes.length>=4);assert.ok(nodes.every(n=>n.style.opacity==='0'));
  driver.advance(600);assert.ok(writes.some(w=>w[0]==='uniform1f'&&w[1]==='uExposure'&&w[2]<1));const screen=body.children.find(n=>n.className.includes('viewport-cinematic'));assert.ok(screen);assert.equal(screen.width,1200);assert.equal(screen.height,780);assert.equal(scene.children.length,1,'Viewport effects escape the clipped arena');globalThis.innerWidth=1320;globalThis.innerHeight=820;
  driver.advance(519);assert.equal(screen.width,1320);assert.equal(screen.height,820);assert.deepEqual(hits,[]);assert.ok(nodes.every(n=>n.style.opacity==='0'));
  driver.advance(1);assert.deepEqual(hits,[.5]);assert.equal(nodes.find(n=>n.textContent==='−16').style.opacity,'1');assert.equal(nodes.find(n=>n.textContent==='−15').style.opacity,'0');
  const firstLeft=nodes.find(n=>n.textContent==='−16').style.left;assert.ok(firstLeft.endsWith('px'),'Floats use the camera projection');
  assert.ok(writes.some(w=>w[0]==='uniform1f'&&w[1]==='uPointPower'&&w[2]>0));assert.ok(screenWrites.some(w=>w[0]==='ellipse'));
  motion.pause();const frozen=nodes.map(n=>JSON.stringify(n.style)),pausedWrites=screenWrites.length;driver.advance(5000);assert.deepEqual(nodes.map(n=>JSON.stringify(n.style)),frozen);assert.equal(screenWrites.length,pausedWrites);
  motion.setMotion('reduced');assert.deepEqual(hits,[.5]);motion.resume();driver.advance(364);
  assert.deepEqual(hits,[.5,1]);assert.deepEqual(layer.children,nodes,'The second hit cannot replace or reset first-hit DOM nodes');
  assert.equal(nodes.find(n=>n.textContent==='−16').style.opacity,'1');assert.equal(nodes.find(n=>n.textContent==='−15').style.opacity,'1');
  motion.setRate(3);driver.advance(1000);assert.equal(layer.children.length,0);assert.deepEqual(hits,[.5,1]);assert.ok(writes.some(w=>w[0]==='drawArrays'));
  assert.equal(body.children.length,0,'The viewport lighting layer is removed after the action');
  const retainedCanvas=scene.children[0];parkScene3D();assert.equal(scene.children.length,0);
  const nextScene=new Node();mountScene3D({querySelector:s=>s==='#scene'?nextScene:null},state,{display:e.after,selected:{mode:'tower',chapter:19}});
  assert.equal(nextScene.children[0],retainedCanvas,'Changing pages reuses the canvas, shader programs and GPU geometry');
 }finally{motion?.();destroyScene3D();for(const [key,value]of Object.entries(original))globalThis[key]=value;}
});
