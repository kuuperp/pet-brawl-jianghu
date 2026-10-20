import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombatSequence,sampleCombat} from '../public/combat-sequence.mjs';
import {combatSnapshot,presentationAt,sampleCombatLabels,labelLifetime,presentationDuration} from '../public/combat-presentation.mjs';
import {battleViewport,frontalArenaView,fighterPositions} from '../public/battle-layout.mjs';
import {cameraMatrix,projectPoint} from '../public/mini-gl.mjs';
import {stageFor,fighterFor,freshState} from '../public/engine.mjs';
const layout={width:1200,height:640,fighters:[{x:336,top:330,width:150,height:160},{x:864,top:330,width:150,height:160}],ground:{x:600,y:500}};
function event(extra={}){
 const before=[{hp:50,maxHp:100,shield:0,rage:0,weapons:['bamboo'],weaponUses:[0],held:'bamboo',heldIndex:0,heldUses:0,skills:[]},{hp:100,maxHp:100,shield:9,rage:0,weapons:['brick'],weaponUses:[0],held:'brick',heldIndex:0,heldUses:0,skills:[]}];
 return{actor:0,target:1,kind:'martial',move:'combo',hits:2,damage:31,absorbed:9,heal:11,counter:5,burn:3,before,after:[{...before[0],hp:53},{...before[1],hp:69,shield:0}],groundBefore:[],groundAfter:[],...extra};
}
test('Numbers, HP and shields wait for contact and split the actual two-hit totals',()=>{
 const e=event(),s=createCombatSequence(e,layout);
 assert.deepEqual(sampleCombatLabels(s.labels,s.t.impact-.001),[]);
 assert.deepEqual(combatSnapshot(e,presentationAt(s,s.t.impact-.001).fraction),e.before);
 const first=sampleCombatLabels(s.labels,s.t.impact).map(l=>l.text);
 assert.ok(first.includes('−16')&&first.includes('格挡 5')&&first.includes('+6')&&first.includes('反伤 −3'));
 assert.ok(!first.includes('−31')&&!first.includes('+11'));
 const halfway=combatSnapshot(e,presentationAt(s,s.t.impact).fraction);
 assert.equal(halfway[1].hp,84);assert.equal(halfway[1].shield,4);assert.equal(halfway[0].hp,50);
 const second=sampleCombatLabels(s.labels,s.t.second).map(l=>l.text);
 assert.ok(second.includes('−16')&&second.includes('−15')&&second.includes('格挡 4')&&second.includes('+5'));
 assert.deepEqual(combatSnapshot(e,presentationAt(s,s.t.second).fraction),e.after);
 assert.equal(e.before[1].hp,100,'Presentation cannot mutate the engine snapshots');
});
test('A lethal combo does not reveal revival or the final boss phase on its first hit',()=>{
 const e=event({damage:10,heal:0,burn:0,counter:0,revives:[{who:1,hp:15}]});
 e.before[1]={...e.before[1],hp:10,bossPhase:1};e.after[1]={...e.after[1],hp:15,bossPhase:3,revived:true};
 const s=createCombatSequence(e,layout),first=combatSnapshot(e,.5);
 assert.equal(first[1].hp,5);assert.equal(first[1].bossPhase,1);
 assert.ok(!sampleCombatLabels(s.labels,s.t.second-.01).some(l=>l.text.includes('涅槃')));
 assert.equal(combatSnapshot(e,1)[1].hp,15);
 assert.ok(sampleCombatLabels(s.labels,s.t.second).some(l=>l.text==='涅槃 +15'));
});
test('Weapon and floor changes wait for the projectile transfer cue',()=>{
 const e=event({kind:'disarm',move:'disarm',hits:1,weaponEvent:{kind:'disarm',weapon:'brick',from:1,to:'ground'},groundAfter:[{weapon:'brick'}]});
 e.after[1]={...e.after[1],weapons:[],held:null,heldIndex:-1,weaponUses:[]};
 const s=createCombatSequence(e,layout),hit=presentationAt(s,s.t.impact),arrived=presentationAt(s,s.transferTime);
 assert.equal(hit.transferred,false);assert.equal(combatSnapshot(e,hit.fraction,hit)[1].held,'brick');
 assert.ok(!sampleCombatLabels(s.labels,s.transferTime-.01).some(l=>l.text==='缴械！'));
 assert.equal(combatSnapshot(e,arrived.fraction,arrived)[1].held,null);
 assert.ok(sampleCombatLabels(s.labels,s.transferTime).some(l=>l.text==='缴械！'));
});
test('Stable label IDs stay readable at every speed, fade once and leave no last-frame flash',()=>{
 const s=createCombatSequence(event(),layout);
 for(const rate of [1,1.5,2,3]){
  const lifetime=labelLifetime(rate),end=presentationDuration(s,s.labels,lifetime);
  assert.ok(lifetime/rate>=600);assert.ok(end>=Math.max(...s.labels.map(l=>l.time+lifetime)));
  for(const label of s.labels){
   let opacity=1,lastRise=0;
   for(let age=0;age<lifetime;age+=25){const v=sampleCombatLabels([label],label.time+age,lifetime)[0];assert.equal(v.id,label.id);assert.equal(v.text,label.text);assert.ok(v.opacity<=opacity);assert.ok(v.rise>=lastRise);opacity=v.opacity;lastRise=v.rise;}
   assert.deepEqual(sampleCombatLabels([label],label.time+lifetime,lifetime),[]);
   assert.deepEqual(sampleCombatLabels([label],label.time+lifetime+5000,lifetime),[]);
  }
 }
});
test('Boss charge pose, visible warning and state change share the same 600 ms cue',()=>{
 const s=createCombatSequence(event({kind:'boss-charge',hits:1,damage:0,absorbed:0,burn:0,heal:0,counter:0}),layout);
 assert.equal(s.t.duration,1500);assert.equal(s.t.impact,600);assert.equal(s.distance,0);
 assert.deepEqual(sampleCombatLabels(s.labels,599),[]);
 assert.equal(sampleCombatLabels(s.labels,600)[0].text,'蓄力 · 可打断');
 assert.equal(sampleCombat(s,600).position.x,0);assert.equal(presentationAt(s,599).fraction,0);assert.equal(presentationAt(s,600).fraction,1);
});
test('Frontal eye-level framing keeps both feet aligned and every chapter boss inside the combat viewport',()=>{
 const hero=fighterFor(freshState());
 for(const [width,height]of [[280,370],[343,370],[560,370],[740,450],[960,490],[1200,490]])for(const stage of [1,10,40,80,120,160,200,240,280,320,360,400,440,480,520,560,600,640,680,720,760,800]){
  const fighters=[hero,stageFor(stage)],viewport=battleViewport(width,height),view=frontalArenaView(viewport.width,viewport.height,fighters),matrix=cameraMatrix(view,viewport.width,viewport.height),positions=fighterPositions(fighters),project=p=>projectPoint(matrix,p,viewport.width,viewport.height);
  assert.equal(view.camera[0],0);assert.equal(view.target[0],0);assert.equal(view.camera[1],view.target[1]);
  const feet=positions.map(p=>project([p.x,0,0]));assert.ok(Math.abs(feet[0].y-feet[1].y)<1e-5);
  assert.ok(Math.abs(feet[0].x+feet[1].x-width)<1e-3);
  for(const [i,p]of positions.entries()){
   const top=(fighters[i].pet==='rabbit'?4.05:fighters[i].boss?3.95:3.45)*p.scale;
   assert.ok(project([p.x,top,0]).y>=8,`${width}/${stage} head clipped`);
   for(const x of [-1.1,1.1])assert.ok(project([p.x+x*p.scale,2*p.scale,0]).visible);
   assert.ok(Math.abs(p.x)+.7*p.scale<6.2,'Fighters stand on the deck');
  }
  for(const x of [-6.4,6.4])assert.ok(project([x,-.34,2.6]).visible,'Front stage edge fits the viewport');
 }
});
