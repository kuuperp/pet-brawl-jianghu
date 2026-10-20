import {createMeshRenderer} from './mini-gl.mjs?v=2.0.0';
import {drawCharacter,drawWeapon,drawArena,arenaTheme} from './world-assets.mjs?v=2.0.0';
import {CHAPTERS,MARTIAL_ARTS,weapon} from './engine.mjs?v=2.0.0';
import {ART_FX,BURST_FX} from './combat-vfx.mjs?v=2.0.0';
import {GUARD} from './fighter-rig.mjs?v=2.0.0';
import {createCombatSequence,sampleCombat} from './combat-sequence.mjs?v=2.0.0';
import {createMotionClock} from './motion-clock.mjs?v=2.0.0';
import {playCombatMotion as legacyMotion} from './combat-motion.mjs?v=2.0.0';
const PI=Math.PI,TAU=PI*2,cap=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
let current=null,previewRenderer=null,previewDisabled=false;
const imageCache=new Map();
function primitive(r,kind,color,x,y,z,sx,sy=sx,sz=sx,alpha=1,emission=0,rot=0){r.push();r.translate(x,y,z);if(rot)r.rotateZ(rot);r.scale(sx,sy,sz);r.mesh(kind,color,emission,alpha);r.pop();}
function ring(r,color,x,y,z,radius,alpha=1,rotation=0,thin=1){r.push();r.translate(x,y,z);r.rotateY(rotation);r.scale(radius,thin,radius);r.mesh('torus',color,.45,alpha);r.pop();}
function beam(r,a,b,radius,color,alpha=1){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||.001;r.push();r.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);r.rotateY(Math.atan2(dx,dz));r.rotateX(Math.acos(cap(dy/len,-1,1)));r.scale(radius,len/2,radius);r.mesh('cylinder',color,.7,alpha);r.pop();}
const hash=s=>Array.from(String(s)).reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7);
function signature(e){
 if(e.bossSkill)return{shape:e.bossSkill.kind,color:e.bossSkill.color,name:e.bossSkill.name};
 if(e.kind==='burst')return BURST_FX[e.before[e.actor].pet]||BURST_FX.penguin;
 if(e.artId){const a=MARTIAL_ARTS.find(a=>a.id===e.artId);return ART_FX[e.artId]||{shape:a?.fx||'wind',color:a?.color||'#b2e4e6',name:e.name};}
 const w=weapon(e.weapon);return{shape:w.burn?'fire':w.drain?'lotus':w.shield?'shield':/axe|hammer|cannon/.test(w.id)?'earth':'slash',color:w.burn?'#ff9c69':w.drain?'#a4e6c1':w.shield?'#b9dce8':w.tier>=4?'#f4d58b':'#d8edf0',name:e.name};
}
function effect3D(r,e,p,poses,time,reduced){
 if(!e||reduced)return;const a=e.actor,b=e.target,A=poses[a],B=poses[b],dir=a===0?1:-1,profile=signature(e),color=profile.color;
 const part=[A.x+dir*.65*A.scale,A.y+1.65*A.scale,.38],target=[B.x-dir*.25*B.scale,B.y+1.55*B.scale,.35];
 const charge=cap((p-.06)/.25)*(1-cap((p-.37)/.10));
 const art=['martial','burst','boss-skill'].includes(e.kind),warning=e.kind==='boss-charge';
 if(warning){
  const pulse=.8+.2*Math.sin(time*.015);ring(r,color,A.x,.11,A.z||0,A.scale*(1.1+p*.35),.75,p*PI,.18);
  for(let i=0;i<6;i++){const angle=i*TAU/6+time*.001;beam(r,[A.x+Math.cos(angle)*A.scale,.15,Math.sin(angle)*A.scale],[A.x+Math.cos(angle)*A.scale,1.2*A.scale*pulse,Math.sin(angle)*A.scale],.035,color,.65);}
  return;
 }
 if(art&&charge>.01){
  ring(r,color,A.x,.1,0,(.6+p)*A.scale,charge*.8,p*PI,.2);
  primitive(r,'sphere',color,...part,.17+.24*charge,.17+.24*charge,.17+.24*charge,charge*.55,.7);
  for(let i=0;i<5;i++){const angle=i*TAU/5+p*7;primitive(r,'sphere',color,part[0]+Math.cos(angle)*.55,part[1]+Math.sin(angle)*.55,.38+Math.cos(angle*2)*.3,.055,.055,.055,charge,.9);}
 }
 const strike=p>=.33&&p<=.60,progress=cap((p-.33)/.08);
 if(strike&&!e.dodged&&!['discard','pickup','stunned','burn','disarm','steal'].includes(e.kind)){
  const alpha=cap((.62-p)/.2),kind=profile.shape,fire=/fire|flame|lava|burn|sun/.test(kind),ice=/ice|frost|crane/.test(kind),wind=/wind|cyclone|tornado|cloud|swallow|wing|flurry/.test(kind),earth=/earth|mountain|dragon|roar/.test(kind),star=/star|celestial|seal|bagua|pierce/.test(kind);
  const mid=[mix(part[0],target[0],progress),mix(part[1],target[1],progress),.4];
  if(art){
   if(fire){for(let i=0;i<7;i++){const t=i/6;primitive(r,'sphere',i%2?'#ffe4a8':color,mix(part[0],mid[0],t),mix(part[1],mid[1],t)+Math.sin(t*PI)*.25,.36,.13+.18*t,.15+.2*t,.12+.14*t,alpha*(.4+t*.5),.7);}}
   else if(ice){for(let i=0;i<6;i++)primitive(r,'cone',i%2?'#e9ffff':color,mid[0]+(i-2.5)*.2*dir,mid[1]+Math.sin(i)*.22,.3+(i%2)*.2,.10,.42,.10,alpha,.45,-dir*.6);}
   else if(wind){for(let i=0;i<3;i++){r.push();r.translate(mid[0],mid[1],.3);r.rotateZ(PI/2);r.rotateY(p*10+i*.6);r.scale(.38+i*.18,.7,.38+i*.18);r.mesh('torus',color,.65,alpha*.75);r.pop();}}
   else if(star){beam(r,part,mid,.11,color,alpha*.7);for(let i=0;i<5;i++){const a=i*TAU/5+p*9;primitive(r,'wedge',color,mid[0]+Math.cos(a)*.5,mid[1]+Math.sin(a)*.5,.4,.12,.16,.10,alpha,.85,a);}}
   else if(earth){primitive(r,'sphere',color,...mid,.4,.4,.35,alpha*.7,.6);for(let i=0;i<4;i++)primitive(r,'wedge',color,mid[0]+(i-1.5)*.25,.35,.4,.18,.3+i*.05,.18,alpha,.1,Math.sin(i));}
   else{beam(r,part,mid,.095,color,alpha*.7);ring(r,color,mid[0],mid[1],.35,.42,alpha,p*7,.55);}
  }else{
   // Volumetric weapon trail follows the striking hand, with depth and lighting.
   for(let i=0;i<5;i++){const angle=(p-.31)*10-i*.17,x=A.x+dir*(.55+Math.cos(angle)*.68)*A.scale,y=A.y+(1.55+Math.sin(angle)*.6)*A.scale;beam(r,[x,y,.2],[x+dir*.45,y+.24,.5],.028,color,alpha*(1-i/6)*.65);}
  }
 }
 const impacts=e.hits>1?[.4,.53]:[.4];
 for(const at of impacts){const age=p-at;if(age<0||age>.22||e.dodged||['discard','pickup','stunned','burn','boss-charge'].includes(e.kind))continue;const t=age/.22,alpha=1-t,size=(e.crit?.75:.5)+(art?.3:0);
  primitive(r,'sphere','#fff1c8',...target,size*(1-t*.7),size*(1-t*.7),size*(1-t*.7),alpha*.65,1);
  ring(r,color,B.x,.08,.2,(.2+t*2.3)*Math.max(1,B.scale*.7),alpha*.7,t*3,.18);
  for(let i=0;i<(art?12:7);i++){const seed=(hash(profile.shape)+i*197)%997/997,angle=i*2.39996,rad=(.25+t*1.8)*(1+seed*.6),x=target[0]+Math.cos(angle)*rad,y=target[1]+Math.sin(angle)*rad*(.65+seed*.4)-t*t*.6,z=.3+Math.sin(i*3.1)*rad*.6;primitive(r,art&&i%3===0?'wedge':'sphere',i%3?color:'#fff1ce',x,y,z,.035+(1-t)*.06,.035+(1-t)*.10,.035+(1-t)*.06,alpha,.7,angle+t*4);}
 }
 if(e.kind==='throw'&&p>=.26&&p<=.48){const t=cap((p-.26)/.17),x=mix(part[0],target[0],t),y=mix(part[1],target[1],t)+Math.sin(t*PI)*1.4;r.push();r.translate(x,y,.55);r.rotateZ(-p*22*dir);drawWeapon(r,e.weapon,{scale:.65*A.scale});r.pop();for(let i=1;i<4;i++)primitive(r,'sphere',color,x-dir*i*.2,y,.55,.04,.04,.04,.6-i*.1,.8);}
 if(e.weaponEvent&&['disarm','steal','pickup'].includes(e.kind)&&p>=.4&&p<=.72){const t=cap((p-.4)/.28),item=e.weaponEvent.weapon,from=e.kind==='pickup'?[0,.12,1]:target,to=e.kind==='disarm'?[0,.12,1]:part;r.push();r.translate(mix(from[0],to[0],t),mix(from[1],to[1],t)+Math.sin(t*PI),mix(from[2],to[2],t));r.rotateZ(t*PI*3);drawWeapon(r,item,{scale:.5});r.pop();}
}
function basePositions(fighters){return fighters.map((f,i)=>({x:i?3.3:-3.3,y:0,z:0,scale:f.modelScale||1,pose:GUARD,hit:0,dead:f.hp===0?1:0,held:f.held===undefined?f.weapons?.[0]:f.held}));}
function virtualLayout(fighters){return{width:1200,height:640,fighters:fighters.map((f,i)=>{const scale=f.modelScale||1;return{x:i?864:336,top:490-160*scale,width:150*scale,height:160*scale};}),ground:{x:600,y:500}};}
function drawWorld(w,time,event=null,sequence=null,reduced=false){
 if(w.disposed)return;const r=w.r,rect=w.scene.getBoundingClientRect(),width=rect.width||900,height=rect.height||480,dpr=Math.min(1.6,globalThis.devicePixelRatio||1),theme=arenaTheme(w.chapter);
 r.begin({width:width*dpr,height:height*dpr,background:theme.sky,camera:[5.8,7.2,16],target:[0,2.2,-.4],span:18.8});
 drawArena(r,w.chapter,time/1000);
 const fighters=event?event.before:w.fighters,poses=basePositions(fighters);let sample=null,p=0;
 if(event&&sequence){
  sample=sampleCombat(sequence,time);p=sample.progress;const a=event.actor,b=event.target,A=poses[a],B=poses[b],v=sample,dir=a===0?1:-1;
  if(!reduced){A.pose=v.pose;B.pose=v.targetPose;const approach=Math.abs(sequence.distance)>.01?Math.abs(v.position.x/sequence.distance):0,max=Math.abs(B.x-A.x)-.63*(A.scale+B.scale);A.x+=dir*Math.max(0,max)*approach;A.y=Math.max(0,-v.position.y/80)+Math.max(0,B.scale-A.scale)*1.15*Math.sin(cap((p-.20)/.45)*PI);B.x+=v.targetPosition.x/80;A.dead=cap(-v.actorTilt/16);B.dead=cap(-v.targetTilt/16);B.hit=cap(Math.abs(v.targetTilt)/8)+(.4<=p&&p<.55&&!event.dodged?.4:0);}
  poses.forEach((pose,i)=>{if(!v.handVisible[i])pose.held=null;});
  if(event.kind==='boss-charge'){poses[a].x=a?3.3:-3.3;poses[a].y=0;}
 }
 for(let i=0;i<2;i++){
  const f=fighters[i],v=poses[i],shown=event&&p>.55?event.after[i]:f;
  const pose=event?v.pose:(!v.dead&&fighters[1-i].hp===0?{...GUARD,af:-145,ef:-45,body:Math.sin(time*.003)*3}:{...GUARD,body:Math.sin(time*.0018+i)*1.4});
  drawCharacter(r,{...f,bossPhase:shown.bossPhase},pose,{...v,facing:i?-1:1,time:(event?time:w.idleTime)/1000,held:v.held});
  if(shown.shield>0){primitive(r,'sphere','#b8d9e2',v.x,1.6*v.scale,.02,.83*v.scale,1.65*v.scale,.65*v.scale,.095,.1);ring(r,'#e5ddb0',v.x,.12,.04,.98*v.scale,.55,time*.0004,.15);}
  if(shown.bossCharge&&!event){ring(r,shown.bossProfile?.color||'#ffc58c',v.x,.12,0,1.2*v.scale,.8,time*.001,.22);}
  if(shown.burnTurns>0)for(let j=0;j<4;j++)primitive(r,'cone',j%2?'#ffad6f':'#ffda96',v.x+Math.sin(j*2.4)*.5*v.scale,.24+Math.sin(time*.003+j)*.08,.2+Math.cos(j*2.4)*.35,.08,.23,.08,.75,.5,Math.sin(j));
 }
 const floor=event?(p>.67?event.groundAfter:event.groundBefore):w.ground;
 for(const [j,item]of (floor||[]).slice(0,8).entries()){r.push();r.translate((j-3.5)*.48,.12,1.15+(j%2)*.28);r.rotateZ(PI/2);r.rotateY(j*.6);drawWeapon(r,item.weapon,{scale:.28});r.pop();}
 if(event)effect3D(r,event,p,poses,time,reduced);
 r.flush();
 return{width,height,poses,progress:p};
}
export function destroyScene3D(){if(!current)return;current.disposed=true;cancelAnimationFrame(current.raf);current.r.destroy();current.canvas.remove();current=null;}
function startIdle(w){cancelAnimationFrame(w.raf);let last=0;const loop=now=>{if(w.disposed||w.playing||document.visibilityState==='hidden')return;if(now-last>30){w.idleTime=now;drawWorld(w,now);last=now;}w.raf=requestAnimationFrame(loop);};w.raf=requestAnimationFrame(loop);}
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
 const motionEvent=event.kind==='boss-skill'?{...event,kind:'burst'}:event,sequence=createCombatSequence(motionEvent,virtualLayout(event.before));
 if(event.kind==='boss-charge'){sequence.stationary=true;sequence.distance=0;sequence.secondDistance=0;sequence.t.duration=1500;sequence.cues=[{time:600,kind:'impact',part:1}];}
 const layer=document.querySelector('#combat-fx'),labels=[];
 if(layer?.append){for(let i=0;i<4;i++){const node=document.createElement('span');node.className='world-float';layer.append(node);labels.push(node);}}
 const updateLabels=(time,frame)=>{
  if(!frame)return;const p=frame.progress,at=sequence.t.impact,age=time-at,visible=age>=0&&age<850,alpha=visible?cap(1-age/850):0;
  const values=[event.dodged?'闪避':event.damage?'-'+event.damage:event.absorbed?'格挡':'',event.heal?'+'+event.heal:'',event.absorbed?'护盾 −'+event.absorbed:'',event.interrupted?'打断！':event.kind==='boss-charge'?'蓄力 · 可打断':''];
  labels.forEach((n,i)=>{n.textContent=values[i];n.style.opacity=String(i===3&&event.kind==='boss-charge'?1:alpha);n.style.left=(i===1?event.actor===0?27:73:event.target===0?27:73)+'%';n.style.top=(i===3?31:i===2?43:36)-Math.max(0,age)*.009+'%';n.className='world-float '+(i===1?'healing':i===2?'ward':i===3?'warning':event.crit?'critical':'');});
 };
 const clear=finish=>{if(cleaned)return;cleaned=true;for(const node of labels)node.remove();if(w.disposed)return;w.playing=false;w.fighters=finish?event.after:event.before;w.ground=finish?event.groundAfter:event.groundBefore;drawWorld(w,w.idleTime);startIdle(w);};
 const clock=createMotionClock({duration:sequence.t.duration,rate:options.speed||1,cues:sequence.cues,driver:options.driver,onFrame(time){const frame=drawWorld(w,time,event,sequence,reduced);updateLabels(time,frame);},onCue(cue){if(cue.kind==='impact')options.onImpact?.(event.hits>1&&!event.dodged&&cue.part===1?.5:1);else options.onTransfer?.();},onFinish(){clear(true);options.onFinish?.();}});
 const cancel=()=>{clock.cancel();clear(false);};cancel.pause=()=>clock.pause();cancel.resume=()=>clock.resume();cancel.setRate=r=>clock.setRate(r);cancel.setMotion=m=>{reduced=m==='reduced';const frame=drawWorld(w,clock.elapsed,event,sequence,reduced);updateLabels(clock.elapsed,frame);};Object.defineProperty(cancel,'elapsed',{get:()=>clock.elapsed});return cancel;
}
function artwork(key,draw,{kind='pet'}={}){
 if(imageCache.has(key))return imageCache.get(key);if(previewDisabled)return null;
 try{
  if(!previewRenderer){const canvas=document.createElement('canvas');previewRenderer=createMeshRenderer(canvas,{preserve:true});}
  const r=previewRenderer,arena=kind==='arena';r.begin({width:arena?640:256,height:arena?310:280,background:arena?'#c8dcd3':'#eef0e4',camera:arena?[7,8,15]:[4,3.4,8],target:arena?[0,1,-1]:[0,1.65,0],span:arena?18:4.9});draw(r);r.flush();const url=r.canvas.toDataURL('image/png');imageCache.set(key,url);return url;
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
