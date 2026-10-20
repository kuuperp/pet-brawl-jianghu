import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,fighterFor,freshState,MARTIAL_ARTS,WEAPONS,CHAPTERS,stageFor} from '../public/engine.mjs';
import {createCombatSequence} from '../public/combat-sequence.mjs';
import {martialDetails} from '../public/martial-motion.mjs';
import {GUARD,POSES} from '../public/fighter-rig.mjs';
import {BOSS_SKILLS} from '../public/bosses.mjs';
import {duelAnchor} from '../public/duel-rig.mjs';
import {drawCharacter,PET_MATERIALS} from '../public/world-assets.mjs';
import {identity,multiply,geometry} from '../public/mini-gl.mjs';
import {sampleSpectacle,drawCombatSpectacle,drawCinematicScreen,spectacleAnchors} from '../public/combat-spectacle.mjs';
const layout={width:1200,height:640,fighters:[{x:336,top:330,width:150,height:160},{x:864,top:330,width:150,height:160}],ground:{x:600,y:500}};
function event(extra={}){const f=fighterFor(freshState()),b=new Battle(f,f,()=>.5);return{...b.step(),dodged:false,weaponEvent:null,...extra};}
function poses(){return[{x:-1,y:0,z:0,scale:1,pose:POSES.punch},{x:1,y:0,z:0,scale:1,pose:GUARD}];}
function recording(){
 let matrix=identity(),stack=[];const calls=[];
 const transform=m=>{matrix=multiply(matrix,m);};
 const r={push(){stack.push(matrix);matrix=new Float32Array(matrix);},pop(){assert.ok(stack.length);matrix=stack.pop();},
 translate(x=0,y=0,z=0){const m=identity();m[12]=x;m[13]=y;m[14]=z;transform(m);},scale(x=1,y=x,z=x){const m=identity();m[0]=x;m[5]=y;m[10]=z;transform(m);},
 rotateX(a){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;transform(m);},rotateY(a){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;transform(m);},rotateZ(a){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;transform(m);},
 mesh(kind,color,emission,alpha=1,blend,material={}){assert.ok([...matrix,emission||0,alpha].every(Number.isFinite));calls.push({kind,color,emission,alpha,blend,material,matrix:[...matrix],position:[...matrix.slice(12,15)]});}};
 return{r,calls,get stack(){return stack.length;}};
}
test('Duel characters have one visible profile eye and noses pointing toward the opponent',()=>{
 for(const dir of [-1,1]){
  const v=recording();drawCharacter(v.r,{pet:'penguin'},GUARD,{x:dir===1?-3:3,scale:1,facing:dir,profile:'duel',held:null});
  const nose=v.calls.find(c=>c.kind==='cone'&&c.color===PET_MATERIALS.penguin.foot);
  assert.ok(nose);assert.ok(Math.abs(nose.position[0]-(dir===1?-3:3)-dir*.595)<1e-5);assert.ok(Math.abs(nose.position[2])<1e-5);
  assert.equal(v.calls.filter(c=>c.color==='#ffffff').length,1,'Only the side-facing eye has a highlight');assert.equal(v.stack,0);
 }
});
test('Near-hand effect anchors match articulated 3D fists in both directions through all key poses',()=>{
 for(const pose of Object.values(POSES))for(const dir of [-1,1]){
  const options={x:2,y:.4,z:.1,scale:1.7,facing:dir,profile:'duel',held:null},v=recording();drawCharacter(v.r,{pet:'penguin'},pose,options);
  const expected=duelAnchor(pose,'hand',options),nearest=Math.min(...v.calls.filter(c=>c.kind==='sphere'&&c.color===PET_MATERIALS.penguin.body).map(c=>Math.hypot(...c.position.map((x,i)=>x-expected[i]))));
  assert.ok(nearest<1e-5,`Fist anchor mismatch ${nearest}`);
 }
});
test('Hit lights, camera shake and full-screen flashes begin on exact impact cues and reset at the end',()=>{
 const s=createCombatSequence(event({kind:'burst',hits:2,move:'combo'}),layout);
 const charge=sampleSpectacle(s,s.t.duration*.27);assert.ok(charge.exposure<.7&&charge.darkness>.2&&charge.lightPower>0);
 const before=sampleSpectacle(s,s.t.impact-.001);assert.equal(before.impacts.length,0);assert.equal(before.flash,0);assert.deepEqual(before.shake,{x:0,y:0});
 for(const at of [s.t.impact,s.t.second]){const hit=sampleSpectacle(s,at);assert.ok(hit.impacts.length);assert.ok(hit.flash>0&&hit.lightPower>2);assert.ok(Math.hypot(hit.shake.x,hit.shake.y)>0);assert.deepEqual(sampleSpectacle(s,at),hit);}
 const end=sampleSpectacle(s,s.t.duration+2000);assert.equal(end.exposure,1);assert.equal(end.darkness,0);assert.equal(end.flash,0);assert.equal(end.lightPower,0);assert.deepEqual(end.shake,{x:0,y:0});
});
test('Every weapon, martial art, ultimate and chapter boss draws visible volumetric effects in front of its model',()=>{
 const events=[...WEAPONS.map(w=>event({kind:'attack',weapon:w.id,move:w.move||'slash'})),...MARTIAL_ARTS.map(a=>event({kind:'martial',artId:a.id,name:a.name,move:a.move,hits:a.hits||1})),...Object.keys(PET_MATERIALS).map(pet=>{const e=event({kind:'burst'});e.before[e.actor].pet=pet;return e;})];
 for(let i=0;i<CHAPTERS.length;i++){const foe=stageFor(i*40+40),bossSkill=BOSS_SKILLS.find(skill=>skill.id===foe.bossProfile.primary);events.push(event({kind:'boss-skill',bossSkill,name:bossSkill.name,move:bossSkill.move,hits:bossSkill.hits||1}));}
 for(const e of events)for(const actor of [0,1]){
  e.actor=actor;e.target=1-actor;const s=createCombatSequence(e,layout),f=sampleSpectacle(s,s.t.impact+90),v=recording(),p=poses();p[1].scale=1.97;
  const anchor=spectacleAnchors(s,p);drawCombatSpectacle(v.r,s,f,p);assert.equal(v.stack,0);assert.ok(v.calls.length>=20,e.name);
  assert.ok(v.calls.some(c=>c.kind==='arc'&&c.blend==='add'));assert.ok(v.calls.some(c=>c.position[2]>=anchor.depth),'Foreground geometry cannot be hidden inside the fighter');
 }
 const arc=geometry('arc');assert.ok(arc.count>100);assert.ok(arc.positions.every(Number.isFinite));assert.ok(Math.max(...arc.positions.filter((_,i)=>i%3===2))>0);assert.ok(Math.min(...arc.positions.filter((_,i)=>i%3===2))<0);
});
test('Simplified motion preserves essential 3D hits while avoiding shake and full-screen light changes',()=>{
 const s=createCombatSequence(event({kind:'burst'}),layout),f=sampleSpectacle(s,s.t.impact+50,{reduced:true}),v=recording();drawCombatSpectacle(v.r,s,f,poses());
 assert.ok(v.calls.length>0&&v.calls.some(c=>c.kind==='arc'));assert.equal(f.flash,0);assert.equal(f.darkness,0);assert.equal(f.exposure,1);assert.deepEqual(f.shake,{x:0,y:0});
});
test('Dodges and non-damaging actions cannot create hit flashes or camera recoil',()=>{
 for(const extra of [{kind:'attack',dodged:true},{kind:'pickup'},{kind:'discard'},{kind:'stunned'},{kind:'burn'},{kind:'boss-charge'},{kind:'steal'}]){
  const s=createCombatSequence(event(extra),layout),f=sampleSpectacle(s,s.t.impact+10);assert.deepEqual(f.impacts,[]);assert.equal(f.flash,0);assert.deepEqual(f.shake,{x:0,y:0});
 }
});
test('Cinematic output uses broad color and brightness layers and is deterministic for a paused frame',()=>{
 const s=createCombatSequence(event({kind:'burst'}),layout),frame=sampleSpectacle(s,s.t.impact+30),layout2d={width:800,height:450,actor:{x:280,y:260},target:{x:540,y:260}};
 const capture=()=>{const calls=[],ctx=new Proxy({createRadialGradient(...args){calls.push(['gradient',...args]);return{addColorStop(...a){calls.push(['stop',...a]);}};}},{get:(o,k)=>k in o?o[k]:(...args)=>{assert.ok(args.every(v=>typeof v!=='number'||Number.isFinite(v)));calls.push([k,...args]);},set:(o,k,v)=>{o[k]=v;calls.push(['set',k,v]);return true;}});drawCinematicScreen(ctx,frame,layout2d);return calls;};
 const first=capture();assert.equal(JSON.stringify(capture()),JSON.stringify(first));assert.ok(first.some(c=>c[0]==='gradient'));assert.ok(first.some(c=>c[0]==='fillRect'&&c[3]===800&&c[4]===450));assert.ok(first.some(c=>c[0]==='ellipse'));
});

test('Sculpted heroes keep hand and foot contacts attached through hip turns and recovery',()=>{
 for(const pet of Object.keys(PET_MATERIALS))for(const move of ['combo','crane-kick','double-slash'])for(const dir of [-1,1])for(const p of [.34,.4,.418,.53,.61]){
  const e=event({move,kind:'martial',hits:2}),s=createCombatSequence(e,layout),base=s.frames.reduce((a,b)=>Math.abs(b.offset-p)<Math.abs(a.offset-p)?b:a).pose,pose=martialDetails(s,p,base),v=recording(),options={x:1,y:.3,z:.1,scale:1.8,facing:dir,profile:'duel',held:null};
  drawCharacter(v.r,{pet},pose,options);
  for(const part of ['hand','foot']){const expected=duelAnchor(pose,part,options),nearest=Math.min(...v.calls.filter(c=>c.kind==='sphere'&&c.color===PET_MATERIALS[pet][part==='hand'?'body':'foot']).map(c=>Math.hypot(...c.position.map((x,i)=>x-expected[i]))));assert.ok(nearest<1e-5,`${pet}/${move}/${p}/${part}: ${nearest}`);}
  assert.equal(v.stack,0);assert.ok(v.calls.some(c=>c.material.roughness>.8));assert.ok(v.calls.some(c=>c.material.metalness>.6));
 }
});
test('New sculpted surfaces have finite outward normals, separate cloth and smooth silhouettes',()=>{
 for(const kind of ['hero-head','tunic','sleeve','boot','rabbit-ear','cat-ear','cloth']){const g=geometry(kind);assert.ok(g.count>=400,kind);assert.ok([...g.positions,...g.normals].every(Number.isFinite));for(let i=0;i<g.normals.length;i+=3)assert.ok(Math.hypot(...g.normals.slice(i,i+3))>.9,kind);if(kind!=='cloth'){const i=Array.from({length:g.count},(_,i)=>i).filter(i=>Math.abs(g.positions[i*3+1])<.02).reduce((a,b)=>g.positions[b*3]>g.positions[a*3]?b:a);assert.ok(g.normals[i*3]>.5,kind+' faces outward');}}
});
