import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionClock} from '../public/motion-clock.mjs';
import {createCombatSequence,sampleCombat,worldPoint} from '../public/combat-sequence.mjs';
import {GUARD} from '../public/fighter-rig.mjs';
import {Battle,fighterFor,freshState,MARTIAL_ARTS,WEAPONS} from '../public/engine.mjs';
const f=fighterFor(freshState());
function event(overrides={}){const b=new Battle({...f,weapons:[]},{...f,weapons:[]},()=>.5);return{...b.step(),...overrides};}
function layout(width=800){const size=width<500?90:126,height=size*260/240;return{width,height:354,fighters:[{x:width*.18+size*.25,top:300-height,width:size,height},{x:width*.82-size*.25,top:300-height,width:size,height}],ground:{x:width/2,y:294}};}
function driver(){let now=0,id=0;const q=new Map();return{now:()=>now,request:fn=>{q.set(++id,fn);return id;},cancel:id=>q.delete(id),advance(ms){now+=ms;const callbacks=[...q.values()];q.clear();callbacks.forEach(fn=>fn(now));},get pending(){return q.size;}};}
test('One clock freezes a strike exactly, resumes without a jump, and changes speed without restarting',()=>{
 const d=driver(),hits=[],positions=[];let finishes=0;const c=createMotionClock({duration:2200,rate:1,cues:[{time:880,part:1},{time:1166,part:2},{time:1474,part:'transfer'}],driver:d,onFrame:t=>positions.push(t),onCue:x=>hits.push(x.part),onFinish:()=>finishes++});
 d.advance(700);assert.equal(c.elapsed,700);c.pause();d.advance(5000);assert.equal(c.elapsed,700);assert.deepEqual(hits,[]);assert.equal(d.pending,0);
 c.resume();d.advance(100);assert.equal(c.elapsed,800);c.setRate(2);assert.equal(c.elapsed,800);d.advance(50);assert.equal(c.elapsed,900);assert.deepEqual(hits,[1]);
 c.pause();c.setRate(3);d.advance(5000);assert.equal(c.elapsed,900);c.resume();d.advance(100);assert.equal(c.elapsed,1200);assert.deepEqual(hits,[1,2]);d.advance(500);assert.deepEqual(hits,[1,2,'transfer']);assert.equal(finishes,1);assert.equal(d.pending,0);d.advance(1000);assert.equal(finishes,1);
 assert.ok(positions.every((v,i)=>!i||v>=positions[i-1]));
});
test('A skipped or canceled action cannot later hit, transfer a weapon or finish twice',()=>{
 const d=driver();let calls=0;const c=createMotionClock({duration:1000,cues:[{time:400}],driver:d,onCue:()=>calls++,onFinish:()=>calls++});d.advance(200);c.cancel();c.resume();c.setRate(3);d.advance(5000);assert.equal(calls,0);assert.equal(d.pending,0);
});
test('All combat poses remain continuous and finite over full desktop/mobile sequences in both directions',()=>{
 const moves=[...MARTIAL_ARTS.map(a=>a.move),...WEAPONS.map(w=>w.move).filter(Boolean),'slash','smash','double-slash','slam','throw','discard','pickup','grab','disarm'];
 for(const width of [360,800,1400])for(const actor of [0,1])for(const move of moves){const kind=['throw','discard','pickup'].includes(move)?move:'martial',e=event({actor,target:1-actor,kind,move,hits:['combo','twin-palm','staff-spin','spin-kick','double-slash'].includes(move)?2:1}),s=createCombatSequence(e,layout(width));let before=null;
  for(let t=0;t<=s.t.duration;t+=1000/60){const v=sampleCombat(s,t);for(const n of [...Object.values(v.pose),v.position.x,v.position.y,v.targetPosition.x])assert.ok(Number.isFinite(n));if(before){assert.ok(Math.abs(v.position.x-before.position.x)<width*.055,`${width}/${move}: movement jumped`);for(const k of Object.keys(GUARD))assert.ok(Math.abs(v.pose[k]-before.pose[k])<48,`${move}/${k}: limb jumped`);}before=v;}
  const end=sampleCombat(s,s.t.duration);assert.ok(Math.abs(end.position.x)<1e-9);assert.ok(Math.abs(end.position.y)<1e-9);for(const k of Object.keys(GUARD))assert.ok(Math.abs(k==='body'?end.pose[k]%360:end.pose[k]-GUARD[k])<1e-6,`End pose ${move}/${k}`);
 }
});
test('Hand and foot strikes make contact at the scheduled hit, including mirrored opponents',()=>{
 for(const actor of [0,1])for(const move of ['punch','combo','palm','sweep','flying-kick','flip-kick','spin-kick']){const s=createCombatSequence(event({actor,target:1-actor,move,kind:'martial'}),layout()),v=sampleCombat(s,s.t.impact),point=worldPoint(s.A,v.pose,s.part,v.position,s.dir);assert.ok(Math.abs(point.x-v.hitPoint.x)<1,move+' horizontal contact');assert.ok(Math.abs(point.y-v.hitPoint.y)<22,move+' vertical contact');}
});
test('Throw trajectory starts at the moving hand and arrives on the exact damage frame',()=>{
 const e=event({kind:'throw',move:'throw',weapon:'bamboo',weaponEvent:{kind:'throw',weapon:'bamboo',from:0,to:'spent'}}),s=createCombatSequence(e,layout()),release=sampleCombat(s,s.t.duration*.29),hit=sampleCombat(s,s.t.impact);
 assert.ok(Math.hypot(release.projectile.x-release.actorHand.x,release.projectile.y-release.actorHand.y)<.001);assert.equal(release.handVisible[0],false);assert.ok(Math.hypot(hit.projectile.x-hit.hitPoint.x,hit.projectile.y-hit.hitPoint.y)<.001);assert.equal(s.cues.find(c=>c.kind==='transfer').time,s.t.impact);
});
test('A second hit does not reset the defender; damage and shield labels are split once',()=>{
 const s=createCombatSequence(event({move:'combo',kind:'martial',hits:2,damage:31,absorbed:9}),layout());const a=sampleCombat(s,s.t.second-.01),b=sampleCombat(s,s.t.second+.01);assert.ok(Math.abs(a.targetPose.body-b.targetPose.body)<.01);const labels=sampleCombat(s,s.t.second+100).labels.map(l=>l.text);assert.ok(labels.includes('−16')&&labels.includes('−15'));assert.ok(labels.includes('格挡 5')&&labels.includes('格挡 4'));
});
test('An armed stunned fighter retains its weapon and no projectile is created',()=>{const e=event({kind:'stunned',move:undefined,weapon:undefined}),s=createCombatSequence(e,layout());for(const t of [0,400,800,1000]){const v=sampleCombat(s,t);assert.deepEqual(v.handVisible,[true,true]);assert.equal(v.projectile,null);assert.equal(v.position.x,0);}});

test('A cue and frame at the same timestamp draw once while all simultaneous cues still fire',()=>{
 const d=driver(),frames=[],cues=[];const clock=createMotionClock({duration:1000,driver:d,cues:[{time:400,kind:'impact'},{time:400,kind:'transfer'}],onFrame:time=>frames.push(time),onCue:cue=>cues.push(cue.kind)});
 d.advance(400);assert.deepEqual(frames,[0,400]);assert.deepEqual(cues,['impact','transfer']);clock.pause();clock.setRate(3);assert.deepEqual(frames,[0,400]);clock.resume();d.advance(100);assert.deepEqual(frames,[0,400,700]);clock.cancel();
});
