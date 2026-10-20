import {createMeshRenderer} from './mini-gl.mjs?v=2.4.0';
import {drawCharacter,drawWeapon,drawArena,arenaTheme} from './world-assets.mjs?v=2.4.0';
import {CHAPTERS,weapon} from './engine.mjs?v=2.4.0';
import {GUARD} from './fighter-rig.mjs?v=2.4.0';
import {createCombatSequence,sampleCombat} from './combat-sequence.mjs?v=2.4.0';
import {createMotionClock} from './motion-clock.mjs?v=2.4.0';
import {combatSnapshot,presentationAt,sampleCombatLabels,labelLifetime,presentationDuration} from './combat-presentation.mjs?v=2.4.0';
import {battleViewport,frontalArenaView,fighterPositions,animateFighterPositions,combatCameraFocus,ARENA_HALF_WIDTH} from './battle-layout.mjs?v=2.4.0';
import {sampleSpectacle,drawCombatSpectacle,spectacleAnchors,createCinematicLayer} from './combat-spectacle.mjs?v=2.4.0';
import {playCombatMotion as legacyMotion} from './combat-motion.mjs?v=2.4.0';
const PI=Math.PI,TAU=PI*2,cap=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
let current=null,previewRenderer=null,previewDisabled=false;
const imageCache=new Map();
function primitive(r,kind,color,x,y,z,sx,sy=sx,sz=sx,alpha=1,emission=0,rot=0){r.push();r.translate(x,y,z);if(rot)r.rotateZ(rot);r.scale(sx,sy,sz);r.mesh(kind,color,emission,alpha);r.pop();}
function ring(r,color,x,y,z,radius,alpha=1,rotation=0,thin=1){r.push();r.translate(x,y,z);r.rotateY(rotation);r.scale(radius,thin,radius);r.mesh('torus',color,.45,alpha);r.pop();}
function beam(r,a,b,radius,color,alpha=1){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||.001;r.push();r.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);r.rotateY(Math.atan2(dx,dz));r.rotateX(Math.acos(cap(dy/len,-1,1)));r.scale(radius,len/2,radius);r.mesh('cylinder',color,.7,alpha);r.pop();}
function transport3D(r,e,p,poses,sequence){
 const {actor:part,target,depth,dir,A}=spectacleAnchors(sequence,poses),impact=sequence.t.impact/sequence.t.duration,transfer=sequence.transferTime/sequence.t.duration;
 if(e.kind==='throw'&&p>=.29&&p<=impact){const t=cap((p-.29)/(impact-.29)),x=mix(part[0],target[0],t),y=mix(part[1],target[1],t)+Math.sin(t*PI)*1.4;r.push();r.translate(x,y,depth);r.rotateZ(-p*22*dir);drawWeapon(r,e.weapon,{scale:.65*A.scale});r.pop();}
 if(e.kind==='discard'&&p>=impact&&p<.78){const t=cap((p-impact)/(.78-impact)),x=mix(part[0],-dir*(ARENA_HALF_WIDTH+1.2),t),y=mix(part[1],-.4,t)+Math.sin(t*PI);r.push();r.translate(x,y,depth);r.rotateZ(dir*t*PI*4);drawWeapon(r,e.weapon,{scale:.6*A.scale*(1-t*.65)});r.pop();}
 if(e.weaponEvent&&['disarm','steal','pickup'].includes(e.weaponEvent.kind)&&p>=impact&&p<transfer){const kind=e.weaponEvent.kind,t=cap((p-impact)/(transfer-impact)),item=e.weaponEvent.weapon,from=kind==='pickup'?[0,.12,1]:target,to=kind==='disarm'?[0,.12,1]:part;r.push();r.translate(mix(from[0],to[0],t),mix(from[1],to[1],t)+Math.sin(t*PI),depth);r.rotateZ(t*PI*3);drawWeapon(r,item,{scale:.5});r.pop();}
}
function basePositions(fighters){return fighterPositions(fighters).map((position,i)=>({...position,pose:GUARD,hit:0,dead:fighters[i].hp===0?1:0,held:fighters[i].held===undefined?fighters[i].weapons?.[0]:fighters[i].held}));}
function virtualLayout(fighters){return{width:1200,height:640,fighters:fighters.map((f,i)=>{const scale=f.modelScale||1;return{x:i?1080:120,top:490-160*scale,width:150*scale,height:160*scale};}),ground:{x:600,y:500}};}
function drawWorld(w,time,event=null,sequence=null,reduced=false){
 if(w.disposed)return;
 const r=w.r,rect=w.scene.getBoundingClientRect(),width=rect.width||900,height=rect.height||480,dpr=Math.min(1.6,globalThis.devicePixelRatio||1),theme=arenaTheme(w.chapter),viewport=battleViewport(width,height);
 const fighters=event?event.before:w.fighters,poses=basePositions(fighters),status=event?presentationAt(sequence,time):null,shown=event?combatSnapshot(event,status.fraction,status):fighters,worldTime=event?w.idleTime+time:time;
 w.canvas.style.top=viewport.y+'px';w.canvas.style.height=viewport.height+'px';
 w.scene.style.setProperty('--arena-sky',theme.sky);
 let sample=null,p=0;
 if(event&&sequence){
  sample=sampleCombat(sequence,time);p=sample.progress;animateFighterPositions(poses,event,sequence,sample,{reduced});
  poses.forEach((pose,i)=>{if(status.transferred||status.finished)pose.held=shown[i].held;if(!sample.handVisible[i])pose.held=null;});
 }
 const spectacle=event?sampleSpectacle(sequence,time,{reduced}):null,view=frontalArenaView(viewport.width,viewport.height,fighters,event&&!reduced?combatCameraFocus(poses,event,p):{});
 if(spectacle){view.camera[0]+=spectacle.shake.x;view.target[0]+=spectacle.shake.x;view.camera[1]+=spectacle.shake.y;view.target[1]+=spectacle.shake.y;view.fov*=1-spectacle.zoom;}
 r.begin({width:viewport.width*dpr,height:viewport.height*dpr,background:theme.sky,...view});
 drawArena(r,w.chapter,worldTime/1000);
 for(let i=0;i<2;i++){
  const f=fighters[i],v=poses[i],visible=shown[i];
  const pose=event?v.pose:(!v.dead&&fighters[1-i].hp===0?{...GUARD,af:-145,ef:-45,body:Math.sin(time*.003)*3}:{...GUARD,body:Math.sin(time*.0018+i)*1.4});
  drawCharacter(r,{...f,bossPhase:visible.bossPhase},pose,{...v,facing:i?-1:1,time:worldTime/1000,held:v.held,profile:'duel'});
  if(visible.shield>0){primitive(r,'sphere','#b8d9e2',v.x,1.6*v.scale,.02,.83*v.scale,1.65*v.scale,.65*v.scale,.095,.1);ring(r,'#e5ddb0',v.x,.12,.04,.98*v.scale,.55,worldTime*.0004,.15);}
  if(visible.bossCharge&&!event){ring(r,visible.bossProfile?.color||'#ffc58c',v.x,.12,0,1.2*v.scale,.8,worldTime*.001,.22);}
  if(visible.burnTurns>0)for(let j=0;j<4;j++)primitive(r,'cone',j%2?'#ffad6f':'#ffda96',v.x+Math.sin(j*2.4)*.5*v.scale,.24+Math.sin(worldTime*.003+j)*.08,.2+Math.cos(j*2.4)*.35,.08,.23,.08,.75,.5,Math.sin(j));
 }
 const floor=event?(status.transferred||status.finished?event.groundAfter:event.groundBefore):w.ground;
 for(const [j,item]of (floor||[]).slice(0,8).entries()){r.push();r.translate((j-3.5)*.48,.12,1.15+(j%2)*.28);r.rotateZ(PI/2);r.rotateY(j*.6);drawWeapon(r,item.weapon,{scale:.28});r.pop();}
 let anchors=null;
 if(event){anchors=drawCombatSpectacle(r,sequence,spectacle,poses);transport3D(r,event,p,poses,sequence);r.lighting({exposure:spectacle.exposure,power:spectacle.lightPower,color:spectacle.profile.color,position:anchors.lightPosition});}
 r.flush();
 return{width,height,viewport,poses,progress:p,spectacle,anchors,project:point=>{const screen=r.project(point,viewport.width,viewport.height);return{...screen,y:screen.y+viewport.y};}};
}
export function destroyScene3D(){if(!current)return;current.disposed=true;cancelAnimationFrame(current.raf);current.r.destroy();current.canvas.remove();current=null;}
function startIdle(w){cancelAnimationFrame(w.raf);let last=performance.now();const loop=now=>{if(w.disposed||w.playing||document.visibilityState==='hidden')return;if(now-last>30){w.idleTime+=Math.min(80,now-last);drawWorld(w,w.idleTime);last=now;}w.raf=requestAnimationFrame(loop);};w.raf=requestAnimationFrame(loop);}
export function mountScene3D(root,state,ui){
 const scene=root?.querySelector?.('#scene');if(!scene||typeof requestAnimationFrame!=='function'||!scene.appendChild)return;
 if(current?.scene===scene){current.fighters=ui.display||ui.battle?.fighters||current.fighters;return;}
 destroyScene3D();const canvas=document.createElement('canvas');if(typeof canvas.getContext!=='function')return;
 try{
  const r=createMeshRenderer(canvas),fighters=ui.display||ui.battle?.fighters||[ui.player||null,ui.selected];
  if(!fighters[0]){r.destroy();return;}
  canvas.className='world-canvas';canvas.setAttribute('aria-label','三维擂台与角色');canvas.setAttribute('role','img');scene.prepend(canvas);scene.classList.add('is-3d');
  const index=ui.selected?.mode==='tower'?ui.selected.chapter:Math.min(19,Math.floor((state.stage-1)/40));
  current={r,scene,canvas,chapter:CHAPTERS[index]||CHAPTERS[0],fighters,ground:ui.displayGround||[],raf:0,disposed:false,playing:false,idleTime:0};
  drawWorld(current,0);startIdle(current);
 }catch{canvas.remove();scene.classList.remove('is-3d');}
}
export function resumeScene3D(){if(current&&!current.playing)startIdle(current);}
export function syncScene3D(fighters,ground=[]){if(!current||current.playing)return;current.fighters=fighters;current.ground=ground;drawWorld(current,current.idleTime);}
export function playCombatMotion(event,options={}){
 if(!current||current.disposed)return legacyMotion(event,options);
 const w=current;w.playing=true;cancelAnimationFrame(w.raf);let reduced=options.motion==='reduced',cleaned=false;
 const sequence=createCombatSequence(event,virtualLayout(event.before)),cinematic=createCinematicLayer(w.scene);
 let lifetime=labelLifetime(options.speed||1);
 const layer=document.querySelector('#combat-fx'),labels=sequence.labels.map(label=>{
  const node=layer?.append?document.createElement('span'):null;
  if(node){node.className='world-float '+({heal:'healing',shield:'ward',tactic:'warning',evade:'warning'}[label.kind]||label.kind);node.textContent=label.text;node.style.opacity='0';layer.append(node);}
  return{label,node,lifetime:null};
 });
 const updateLabels=(time,frame)=>{
  if(!frame)return;
  for(const entry of labels){
   const {label,node}=entry;if(!node)continue;
   if(time>=label.time&&entry.lifetime===null)entry.lifetime=lifetime;
   const value=sampleCombatLabels([label],time,entry.lifetime||lifetime)[0];
   if(!value){node.style.opacity='0';continue;}
   const pose=frame.poses[label.who],point=frame.project([pose.x,pose.y+2.5*pose.scale,.8]);
   node.style.left=cap(point.x+(label.part?22:-12),48,frame.width-48)+'px';
   node.style.top=cap(point.y+label.lane*24+label.part*22-value.rise,frame.viewport.y+18,frame.height-52)+'px';
   node.style.opacity=String(value.opacity);
  }
 };
 const clear=finish=>{if(cleaned)return;cleaned=true;for(const entry of labels)entry.node?.remove();cinematic.destroy();if(w.disposed)return;w.playing=false;w.idleTime+=clock.elapsed;w.fighters=finish?event.after:event.before;w.ground=finish?event.groundAfter:event.groundBefore;drawWorld(w,w.idleTime);startIdle(w);};
 const clock=createMotionClock({duration:presentationDuration(sequence,sequence.labels,lifetime),rate:options.speed||1,cues:sequence.cues,driver:options.driver,onFrame(time){const frame=drawWorld(w,time,event,sequence,reduced);updateLabels(time,frame);if(frame)cinematic.render(frame.spectacle,frame);},onCue(cue){if(cue.kind==='impact')options.onImpact?.(event.hits>1&&!event.dodged&&cue.part===1?.5:1);else options.onTransfer?.();},onFinish(){clear(true);options.onFinish?.();}});
 const cancel=()=>{clock.cancel();clear(false);};cancel.pause=()=>clock.pause();cancel.resume=()=>clock.resume();cancel.setRate=rate=>{lifetime=labelLifetime(rate);clock.extendTo(Math.max(sequence.t.duration,...labels.map(entry=>entry.label.time+(entry.lifetime||lifetime))));clock.setRate(rate);};cancel.setMotion=m=>{reduced=m==='reduced';const frame=drawWorld(w,clock.elapsed,event,sequence,reduced);updateLabels(clock.elapsed,frame);if(frame)cinematic.render(frame.spectacle,frame);};Object.defineProperty(cancel,'elapsed',{get:()=>clock.elapsed});return cancel;
}
function artwork(key,draw,{kind='pet'}={}){
 if(imageCache.has(key))return imageCache.get(key);if(previewDisabled)return null;
 try{
  if(!previewRenderer){const canvas=document.createElement('canvas');previewRenderer=createMeshRenderer(canvas,{preserve:true});}
  const r=previewRenderer,arena=kind==='arena';r.begin({width:arena?640:256,height:arena?310:280,background:arena?'#c8dcd3':'#eef0e4',...(arena?frontalArenaView(640,310):{camera:[0,1.65,8],target:[0,1.65,0],span:4.9})});draw(r);r.flush();const url=r.canvas.toDataURL('image/png');imageCache.set(key,url);return url;
 }catch{previewDisabled=true;return null;}
}
export function paintArtwork(root,state,ui){
 if(!root?.querySelectorAll||typeof document.createElement!=='function')return;
 const images=root.querySelectorAll('.pet-hero-art .pet-art,.summary-art .pet-art,.pet-choice .pet-art,.stage-preview>.pet-art,.result-art .pet-art');
 for(const node of images){const svg=node.outerHTML||'',pet=svg.includes('桃桃玉兔')?'rabbit':svg.includes('糯米熊猫')?'panda':svg.includes('橘子猫侠')?'cat':'penguin',boss=node.closest?.('.stage-preview')&&ui?.towerStage%10===0,chapter=ui?.towerStage?Math.floor((ui.towerStage-1)/40):0,key='pet:'+pet+':'+!!boss+':'+(boss?chapter:0),url=artwork(key,r=>drawCharacter(r,{pet,boss:!!boss,chapter,chapterBoss:ui?.towerStage%40===0},GUARD,{scale:boss?.90:1,time:0,held:boss?CHAPTERS[chapter].bosses[Math.floor(((ui.towerStage-1)%40)/10)][2]:null}));if(url){const image=document.createElement('img');image.src=url;image.className='pet-art model-art';image.alt=node.getAttribute?.('aria-label')||'江湖小侠';node.replaceWith(image);}}
 for(const button of root.querySelectorAll('.weapon-preview')){const id=button.dataset.value,node=button.querySelector('.weapon-art'),url=artwork('weapon:'+id,r=>{r.translate(0,.85,0);r.rotateZ(-.35);drawWeapon(r,id,{scale:.95});},{kind:'weapon'});if(node&&url){const image=document.createElement('img');image.src=url;image.alt=weapon(id).name;image.className='weapon-art model-art';node.replaceWith(image);}}
 for(const target of root.querySelectorAll('[data-weapon-model]')){const id=target.dataset.weaponModel,url=artwork('weapon:'+id,r=>{r.translate(0,.85,0);r.rotateZ(-.35);drawWeapon(r,id,{scale:.95});},{kind:'weapon'});if(url){const image=document.createElement('img');image.src=url;image.alt=weapon(id).name;image.className='weapon-art model-art';target.replaceChildren(image);}}
 for(const target of root.querySelectorAll('[data-art-arena]')){const index=cap(Number(target.dataset.artArena)||0,0,19),url=artwork('arena:'+index,r=>drawArena(r,CHAPTERS[index],0),{kind:'arena'});if(url){target.style.backgroundImage=`url("${url}")`;target.classList.add('painted');}}
 mountScene3D(root,state,ui);
}
