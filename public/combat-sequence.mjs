import {GUARD,POSES,rigFrames,canonicalMove} from './fighter-rig.mjs?v=2.0.1';
import {createCombatLabels,sampleCombatLabels} from './combat-presentation.mjs?v=2.0.1';
const cap=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=t=>{t=cap(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>Object.fromEntries(Object.keys(GUARD).map(k=>[k,mix(a[k],b[k],t)]));
const rotate=(x,y,deg)=>{const r=deg*Math.PI/180;return{x:x*Math.cos(r)-y*Math.sin(r),y:x*Math.sin(r)+y*Math.cos(r)};};
export function motionTiming(event,speed=1){const rate=cap(Number(speed)||1,1,3),duration=['stunned','burn'].includes(event.kind)?1000:event.kind==='boss-charge'?1500:['burst','boss-skill'].includes(event.kind)?2400:2200;return{duration:duration/rate,impact:duration*.4/rate,second:duration*.53/rate,transfer:duration*.67/rate,rate,ranged:event.kind==='throw'};}
export function contactDistance(actor,target){return Math.max(0,Math.abs(target.x-actor.x)-(actor.width+(target.width??actor.width))*.21);}
// Forward kinematics: effect anchors follow actual hands and feet, including mirrored opponents.
export function rigPoint(pose,part='hand'){
 let p;
 if(part==='elbow'){const arm=rotate(0,29,pose.af);p={x:138+arm.x,y:132+arm.y};
 }else if(part==='hand'||part==='back-hand'){
  const front=part==='hand',k=front?'f':'b',fore=rotate(0,28,pose['e'+k]),arm=rotate(fore.x,29+fore.y,pose['a'+k]);p={x:(front?138:86)+arm.x,y:132+arm.y};
 }else if(part==='foot'||part==='back-foot'){
  const front=part==='foot',k=front?'f':'b',shin=rotate(23,34,pose['k'+k]),leg=rotate(shin.x,28+shin.y,pose['l'+k]);p={x:(front?126:99)+leg.x,y:178+leg.y};
 }else p=part==='head'?{x:125,y:78}:part==='low'?{x:122,y:207}:{x:121,y:149};
 const q=rotate(p.x-116,p.y-178,pose.body);return{x:116+q.x,y:178+pose.y+q.y};
}
export function worldPoint(box,pose,part,offset={x:0,y:0},facing=1){const p=rigPoint(pose,part),scale=Math.min(box.width/240,box.height/260);return{x:box.x+offset.x+facing*(p.x-120)*scale,y:box.top+offset.y+(box.height-260*scale)/2+p.y*scale};}
function track(keys,p){let i=1;while(i<keys.length&&p>keys[i][0])i++;if(i===keys.length)return keys.at(-1)[1];const [ta,a]=keys[i-1],[tb,b]=keys[i];return mix(a,b,ease((p-ta)/(tb-ta)));}
function keyedPose(frames,p){let i=1;while(i<frames.length&&p>frames[i].offset)i++;if(i===frames.length)return frames.at(-1).pose;const a=frames[i-1],b=frames[i];return blend(a.pose,b.pose,ease((p-a.offset)/(b.offset-a.offset)));}
function runPose(p,returning=false){const wave=Math.sin(p*Math.PI*2),pose={...GUARD,body:returning?-5:10,y:-Math.abs(wave)*3,head:returning?3:-7,af:48*wave,ef:-75,ab:-48*wave,eb:-75,lf:-43*wave,kf:12+Math.max(0,wave)*65,lb:43*wave,kb:12+Math.max(0,-wave)*65};return pose;}
export function actionPose(sequence,p){
 const {event,frames,stationary}=sequence;let pose=keyedPose(frames,p);
 if(event.kind==='boss-charge')return{...GUARD,body:Math.sin(p*Math.PI)*-5,af:GUARD.af-20*Math.sin(p*Math.PI)};
 if(['stunned','burn'].includes(event.kind))return{...GUARD,body:Math.sin(p*Math.PI*6)*7*Math.sin(p*Math.PI),head:-Math.sin(p*Math.PI*6)*9*Math.sin(p*Math.PI)};
 if(!stationary){
  const approach=ease((p-.015)/.045)*(1-ease((p-.235)/.085)),retreat=ease((p-.67)/.065)*(1-ease((p-.895)/.095));
  if(approach>0)pose=blend(pose,runPose((p-.04)*10),approach);
  if(retreat>0){const run=runPose((p-.67)*9,true);if(event.move==='flip-kick')run.body-=360;pose=blend(pose,run,retreat);}
 }
 return pose;
}
export function createCombatSequence(event,layout){
 const A=layout.fighters[event.actor],B=layout.fighters[event.target],dir=event.actor===0?1:-1,move=canonicalMove(event.move||'punch'),t=motionTiming(event);
 const status=['stunned','burn'].includes(event.kind),stationary=status||['throw','discard','boss-charge'].includes(event.kind),pickup=event.kind==='pickup';
 const frames=rigFrames(event.move||move),sequence={event,layout,A,B,dir,move,t,frames,stationary,status,pickup};
 const part=move==='combo'?'hand':['kick','sweep','flying-kick','flip-kick','spin-kick','low-kick','crane-kick'].includes(move)?'foot':move==='elbow'?'elbow':['shoulder','slam'].includes(move)?'body':'hand';
 sequence.part=part;sequence.aim=['sweep','low-kick'].includes(move)?'low':['kick','flying-kick','flip-kick','spin-kick','crane-kick'].includes(move)?'head':'body';
 const target=worldPoint(B,GUARD,sequence.aim,{x:0,y:0},-dir),reach=worldPoint(A,keyedPose(frames,.4),part,{x:0,y:0},dir);
 const maxDistance=Math.abs(B.x-A.x)+Math.min(A.width,B.width)*.1;
 sequence.distance=stationary?0:pickup?Math.max(0,dir*(layout.ground.x-reach.x)):cap(dir*(target.x-reach.x),0,maxDistance);
 const secondPart=['combo','twin-palm'].includes(move)?'back-hand':move==='spin-kick'?'back-foot':part;
 const reach2=worldPoint(A,keyedPose(frames,.53),secondPart,{x:0,y:0},dir);
 sequence.secondDistance=event.hits>1?cap(dir*(target.x-reach2.x),0,maxDistance):sequence.distance;
 const air=['flying-kick','flip-kick','spin-kick','crane-kick','slam'].includes(move);
 sequence.air=air;sequence.height=air?Math.min(A.height*.52,Math.max(10,reach.y-target.y)):0;
 sequence.transferTime=['throw','discard'].includes(event.weaponEvent?.kind)?t.impact:t.transfer;
 sequence.cues=[{time:t.impact,kind:'impact',part:1}];
 if(event.hits>1&&!event.dodged)sequence.cues.push({time:t.second,kind:'impact',part:2});
 if(event.weaponEvent)sequence.cues.push({time:sequence.transferTime,kind:'transfer'});
 sequence.labels=createCombatLabels(sequence);
 return sequence;
}
function offsets(s,p){const d=s.distance,d2=s.secondDistance,stationary=s.stationary;
 const x=stationary?0:track([[0,0],[.055,-Math.min(7,d*.04)],[.33,d],[.4,d],[.53,d2],[.64,d2],[.96,0],[1,0]],p)*s.dir;
 const y=s.air?track([[0,0],[.22,0],[.32,-Math.max(s.height,24)],[.4,s.move==='slam'?0:-s.height],[.53,s.move==='slam'?0:-s.height*.35],[.64,0],[1,0]],p):0;
 return{x,y};
}
function pulse(p,at,width){if(p<at||p>at+width)return 0;const t=(p-at)/width;return t<.15?ease(t/.15):1-ease((t-.15)/.85);}
export function sampleCombat(sequence,elapsed){
 const s=sequence,{event:e,A,B,dir}=s,p=cap(elapsed/s.t.duration),pose=actionPose(s,p),position=offsets(s,p);
 const strikes=e.hits>1&&!e.dodged?[.4,.53]:[.4],reacts=!s.status&&!['pickup','discard','boss-charge'].includes(e.kind);
 let reaction=reacts?Math.max(...strikes.map(at=>pulse(p,e.dodged?at-.065:at,.18))):0;
 const targetPose=blend(GUARD,e.dodged?POSES.dodge:POSES.recoil,reaction),targetPosition={x:dir*(e.dodged?27:9)*reaction,y:0};
 const knocked=e.after?.[e.target]?.hp===0?ease((p-.6)/.35):0;
 const actorKnocked=e.after?.[e.actor]?.hp===0?ease((p-.6)/.35):0;
 const actorHand=worldPoint(A,pose,'hand',position,dir),targetHand=worldPoint(B,targetPose,'hand',targetPosition,-dir),hitPoint=worldPoint(B,targetPose,s.aim,targetPosition,-dir);
 const state={progress:p,pose,position,targetPose,targetPosition,actorTilt:-16*actorKnocked,targetTilt:-16*knocked,actorHand,targetHand,hitPoint,projectile:null,handVisible:[true,true],sparks:[],labels:[],aura:null};
 const w=e.weaponEvent;
 if(['burst','martial'].includes(e.kind)&&e.before[e.actor].held)state.handVisible[e.actor]=p<.12||p>.87;
 if(e.kind==='throw'){
  state.handVisible[e.actor]=p<.29;
  if(p>=.29&&p<.415){const q=cap((p-.29)/.11),releasePose=actionPose(s,.29),start=worldPoint(A,releasePose,'hand',offsets(s,.29),dir),end=worldPoint(B,GUARD,s.aim,{x:0,y:0},-dir);state.projectile={x:mix(start.x,end.x,q),y:mix(start.y,end.y,q)-Math.sin(q*Math.PI)*35,angle:dir*q*410,opacity:1,weapon:e.weapon,size:A.width*.48};}
 }else if(e.kind==='discard'){
  state.handVisible[e.actor]=p<.4;
  if(p>=.4&&p<.72){const q=cap((p-.4)/.32),start=worldPoint(A,actionPose(s,.4),'hand',{x:0,y:0},dir);state.projectile={x:start.x+dir*24*q,y:mix(start.y,s.layout.ground.y,q),angle:110*q,opacity:1-ease((q-.65)/.35),weapon:e.weapon,size:42};}
 }else if(w){
  const startAt=w.kind==='pickup'?.4:.4,endAt=.67;
  if(w.kind!=='pickup'&&p>=startAt&&p<endAt)state.handVisible[w.from]=false;
  if(p>=startAt&&p<endAt){const q=(p-startAt)/(endAt-startAt),hitPose=actionPose(s,startAt),start=w.from==='ground'?s.layout.ground:worldPoint(w.from===e.actor?A:B,w.from===e.actor?hitPose:GUARD,'hand',w.from===e.actor?offsets(s,startAt):{x:0,y:0},w.from===e.actor?dir:-dir),end=w.to==='ground'?s.layout.ground:actorHand;state.projectile={x:mix(start.x,end.x,q),y:mix(start.y,end.y,q)-Math.sin(q*Math.PI)*(w.kind==='disarm'?35:22),angle:dir*q*(w.kind==='disarm'?300:110),opacity:1,weapon:w.weapon,size:42};}
 }
 if(['burst','martial'].includes(e.kind)){const fade=Math.sin(cap((p-.12)/.57)*Math.PI);state.aura={x:A.x+position.x,y:A.top+A.height*.58+position.y,size:A.width*1.5,opacity:fade*.4};}
 for(let i=0;i<strikes.length;i++){
  const at=strikes[i],age=(p-at)*s.t.duration;
  if(reacts&&age>=0&&age<330&&!e.dodged)state.sparks.push({x:hitPoint.x,y:hitPoint.y,age,size:e.kind==='burst'?94:62,opacity:1-age/330,angle:dir*(age/8-30)});
 }
 state.labels=sampleCombatLabels(s.labels,elapsed);
 return state;
}
