import {createBattleVfx} from './combat-vfx.mjs?v=2.2.0';
import {weaponArt} from './art.mjs?v=2.2.0';
import {GUARD,handArt,bindRig,applyRigPose} from './fighter-rig.mjs?v=2.2.0';
import {createMotionClock} from './motion-clock.mjs?v=2.2.0';
import {sampleSpectacle,createCinematicLayer} from './combat-spectacle.mjs?v=2.2.0';
import {sampleCombatLabels,labelLifetime,presentationDuration} from './combat-presentation.mjs?v=2.2.0';
import {createCombatSequence,sampleCombat,motionTiming,contactDistance} from './combat-sequence.mjs?v=2.2.0';
export {motionTiming,contactDistance};
const STAR='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="m50 1 11 31 29-17-15 29 25 10-30 10 13 29-27-20-15 27-5-34L3 72l20-26L1 26l33 4z" fill="currentColor"/><path d="m50 25 5 19 19 5-19 6-5 20-6-20-18-6 18-5z" fill="#fffcdd"/></svg>';
// Everything on screen is sampled from one clock. SVG attributes avoid independent CSS/WAAPI timelines.
export function playCombatMotion(event,{speed=1,motion='full',onImpact=()=>{},onTransfer=()=>{},onFinish=()=>{},driver}={}){
 const scene=document.querySelector('#scene'),layer=document.querySelector('#combat-fx'),fighters=[0,1].map(i=>document.querySelector('#fighter-'+i));
 // Combat is the requested game content. Only the player's explicit in-game choice
 // simplifies it; a system preference must not silently remove every move and projectile.
 let reduced=motion==='reduced';
 const bodies=fighters.map(f=>f?.querySelector('.fighter-inner')),rigs=fighters.map(bindRig),hands=[0,1].map(i=>document.querySelector('#held-'+i)),shadows=fighters.map(f=>f?.querySelector('.rig-shadow'));
 const created=[],fx=(cls,html='')=>{if(!layer)return null;const n=document.createElement('div');n.className='combat-effect '+cls;n.innerHTML=html;n.style.opacity='0';layer.append(n);created.push(n);return n;};
 const projectile=fx('flying-weapon'),aura=fx('ultimate-aura pet-'+event.before[event.actor].pet),sparks=[fx('hit-spark',STAR),fx('hit-spark',STAR)];
 const pickedFloor=event.weaponEvent?.kind==='pickup'?document.querySelector('#ground-weapons')?.querySelector('.floor-weapon'):null;
 let clock,cleaned=false,projectileId=null;
 function layout(){
  const sr=scene?.getBoundingClientRect()||{left:0,top:0,width:800,height:354},width=sr.width??sr.right-sr.left,height=sr.height??sr.bottom-sr.top;
  // Measure resting boxes rather than transformed mid-strike boxes when the viewport changes.
  const prior=fighters.map(f=>f?.style.transform);fighters.forEach(f=>{if(f)f.style.transform='none';});
  const boxes=fighters.map((f,i)=>{const r=f?.getBoundingClientRect()||{left:i?560:110,top:164,width:126,height:137},w=r.width??r.right-r.left,h=r.height??r.bottom-r.top;return{x:r.left-sr.left+w/2,top:r.top-sr.top,width:w,height:h};});
  fighters.forEach((f,i)=>{if(f)f.style.transform=prior[i]||'';});
  const gr=document.querySelector('#ground-weapons')?.getBoundingClientRect();
  return{width,height,fighters:boxes,ground:{x:width*.5,y:gr?gr.top-sr.top+(gr.height??gr.bottom-gr.top)*.5:height-60}};
 }
 const visualEffects=createBattleVfx(layer);
 const cinematic=createCinematicLayer(scene);
 let sequence=createCombatSequence(event,layout());
 const labels=sequence.labels.map(()=>fx('timeline-label')),lifetimes=new Map();let lifetime=labelLifetime(speed);
 const actor=event.actor,target=event.target;
 const initialWeapon=['martial','burst','stunned','burn','pickup'].includes(event.kind)?event.before[actor].held:event.weapon;
 if(hands[actor])hands[actor].innerHTML=handArt(initialWeapon);
 fighters[actor]?.classList.add('motion-active');fighters[target]?.classList.add('motion-target');
 const hide=n=>{if(n)n.style.display='none';};
 function place(n,v,{size=60,angle=0,scale=1,opacity=1}={}){if(!n)return;n.style.display='block';n.style.left='0';n.style.top='0';n.style.width=size+'px';n.style.height=size+'px';n.style.opacity=String(opacity);n.style.transform=`translate(${v.x}px,${v.y}px) translate(-50%,-50%) rotate(${angle}deg) scale(${scale})`;}
 function render(time){
  if(cleaned)return;
  const v=sampleCombat(sequence,time),pose=reduced?GUARD:v.pose,targetPose=reduced?GUARD:v.targetPose;
  v.labels=sequence.labels.flatMap(label=>{if(time>=label.time&&!lifetimes.has(label.id))lifetimes.set(label.id,lifetime);return sampleCombatLabels([label],time,lifetimes.get(label.id)||lifetime);});
  visualEffects.render(sequence,v,time,reduced);
  cinematic.render(sampleSpectacle(sequence,time,{reduced}),{width:sequence.layout.width,height:sequence.layout.height,actor:v.actorHand,target:v.hitPoint});
  applyRigPose(rigs[actor],pose);applyRigPose(rigs[target],targetPose);
  if(fighters[actor])fighters[actor].style.transform=reduced?'':`translate(${v.position.x}px,${v.position.y}px)`;
  if(fighters[target])fighters[target].style.transform=reduced?'':`translate(${v.targetPosition.x}px,0)`;
  if(bodies[actor])bodies[actor].style.transform=`rotate(${v.actorTilt}deg)`;
  if(bodies[target])bodies[target].style.transform=`rotate(${v.targetTilt}deg)`;
  const shadow=shadows[actor];if(shadow){const lift=reduced?0:-v.position.y,scale=Math.max(.55,1-lift/180);shadow.setAttribute('transform',`translate(0 ${lift*260/sequence.A.height}) translate(117 246) scale(${scale}) translate(-117 -246)`);shadow.style.opacity=String(.16-lift/1000);}
  hands.forEach((h,i)=>{if(h)h.style.opacity=v.handVisible[i]?'1':'0';});
  if(pickedFloor)pickedFloor.style.opacity=v.progress>=.4&&v.progress<.67?'0':'1';
  if(v.projectile&&!reduced){if(projectileId!==v.projectile.weapon){if(projectile)projectile.innerHTML=weaponArt(v.projectile.weapon);projectileId=v.projectile.weapon;}place(projectile,v.projectile,{size:v.projectile.size,angle:v.projectile.angle,opacity:v.projectile.opacity});}else hide(projectile);
  if(v.aura&&!reduced)place(aura,v.aura,{size:v.aura.size,opacity:v.aura.opacity});else hide(aura);
  sparks.forEach((n,i)=>{const s=v.sparks[i];if(s&&!reduced)place(n,s,{size:s.size,angle:s.angle,scale:.5+s.age/220,opacity:s.opacity});else hide(n);});
  labels.forEach((n,i)=>{const l=v.labels.find(label=>label.id===i);if(!n)return;if(!l){hide(n);return;}const box=sequence.layout.fighters[l.who],offset=l.who===actor?v.position:v.targetPosition;n.textContent=l.text;n.className='combat-effect timeline-label '+l.kind;place(n,{x:box.x+(reduced?0:offset.x)+(l.part?22:-12),y:box.top+15+l.lane*24+l.part*22-(reduced?0:l.rise)},{size:140,opacity:l.opacity});n.style.height='24px';});
 }
 function clear(){if(cleaned)return;cleaned=true;visualEffects.destroy();cinematic.destroy();if(pickedFloor)pickedFloor.style.opacity='1';for(const n of created)n.remove();fighters.forEach((f,i)=>{f?.classList.remove('motion-active','motion-target');if(f)f.style.transform='';if(bodies[i])bodies[i].style.transform='';applyRigPose(rigs[i],GUARD);if(shadows[i]){shadows[i].setAttribute('transform','');shadows[i].style.opacity='';}if(hands[i])hands[i].style.opacity='1';});window.removeEventListener?.('resize',resize);}
 function resize(){if(cleaned)return;sequence=createCombatSequence(event,layout());render(clock?.elapsed||0);}
 window.addEventListener?.('resize',resize);
 clock=createMotionClock({duration:presentationDuration(sequence,sequence.labels,lifetime),rate:speed,cues:sequence.cues,driver,onFrame:render,onCue(cue){if(cue.kind==='impact')onImpact(event.hits>1&&!event.dodged&&cue.part===1?.5:1);else onTransfer();},onFinish(){clear();onFinish();}});
 const cancel=()=>{clock.cancel();clear();};
 cancel.pause=()=>clock.pause();cancel.resume=()=>clock.resume();cancel.setRate=rate=>{lifetime=labelLifetime(rate);clock.extendTo(Math.max(sequence.t.duration,...sequence.labels.map(label=>label.time+(lifetimes.get(label.id)||lifetime))));clock.setRate(rate);};
 cancel.setMotion=value=>{reduced=value==='reduced';render(clock.elapsed);};
 Object.defineProperty(cancel,'elapsed',{get:()=>clock.elapsed});
 return cancel;
}
