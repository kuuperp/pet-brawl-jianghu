import {profileFor} from './combat-vfx.mjs?v=2.6.0';
import {duelAnchor} from './duel-rig.mjs?v=2.6.0';
const PI=Math.PI,TAU=PI*2,cap=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const hash=s=>Array.from(String(s)).reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,17);
const smooth=t=>{t=cap(t);return t*t*(3-2*t);};
export function spectacleFamily(shape=''){
 if(/fire|flame|lava|burn|sun|eruption/.test(shape))return'fire';
 if(/ice|frost|crane|crystal/.test(shape))return'ice';
 if(/wind|cyclone|tornado|cloud|swallow|wing|storm|thunder|lightning/.test(shape))return'storm';
 if(/earth|mountain|dragon|roar|tiger|quake|stone|cleave|fortress/.test(shape))return'earth';
 if(/lotus|petal|flower|koi|rain|poison|mire/.test(shape))return'petal';
 if(/star|celestial|seal|bagua|pierce|meteor|wheel|notes|mirror/.test(shape))return'astral';
 return'force';
}
export function sampleSpectacle(sequence,time,{reduced=false}={}){
 const e=sequence.event,p=cap(time/sequence.t.duration),original=profileFor(e),profile=original.color==='#fff3c2'?{...original,color:'#70d9ff'}:original,art=['martial','burst','boss-skill'].includes(e.kind),ultimate=['burst','boss-skill'].includes(e.kind);
 const attack=!['pickup','discard','stunned','burn','boss-charge','steal'].includes(e.kind),strength=ultimate?2.8:art?1.85:e.crit?1.45:1;
 const charge=(art||e.kind==='boss-charge')?smooth((p-.08)/.19)*(1-smooth((p-.33)/.09)):0;
 const marks=sequence.cues.filter(c=>c.kind==='impact'),impacts=attack&&!e.dodged?marks.map((cue,i)=>({age:time-cue.time,part:i})).filter(v=>v.age>=0&&v.age<650):[];
 const pulse=Math.max(0,...impacts.map(v=>Math.exp(-v.age/170))),shakePower=reduced?0:pulse*strength;
 const strike=attack?smooth((p-.25)/.1)*(1-smooth((p-.55)/.16)):0;
 return{p,time,profile,family:spectacleFamily(profile.shape),seed:hash(e.artId||e.weapon||e.kind),art,ultimate,attack,strength,charge,impacts,strike,reduced,
  travel:smooth((time-sequence.t.impact+sequence.t.duration*.11)/(sequence.t.duration*.11)),
  exposure:reduced?1:cap(1-charge*(ultimate?.53:.35)+pulse*.18,.45,1.2),
  lightPower:reduced?.45*pulse:charge*strength*.85+pulse*strength*1.8,
  darkness:reduced?0:charge*(ultimate?.42:.26)+strike*(ultimate?.16:art?.08:0),
  flash:reduced?0:pulse*(ultimate?.28:art?.18:.08),
  zoom:reduced?0:charge*(ultimate?.025:.012)+pulse*.008,
  shake:shakePower?{x:Math.sin((time-sequence.t.impact)*.093+.9)*shakePower*.055,y:Math.sin((time-sequence.t.impact)*.127+.4)*shakePower*.032}:{x:0,y:0},
 };
}
function mesh(r,kind,color,point,size,alpha=1,emission=.8,rotation=0,add=true){
 r.push();r.translate(...point);if(rotation)r.rotateZ(rotation);r.scale(...(Array.isArray(size)?size:[size,size,size]));r.mesh(kind,color,emission*.5,alpha,add?'add':'normal');r.pop();
}
function link(r,from,to,radius,color,alpha=1){
 const d=to.map((v,i)=>v-from[i]),len=Math.hypot(...d)||.001;
 r.push();r.translate(...from.map((v,i)=>(v+to[i])/2));r.rotateY(Math.atan2(d[0],d[2]));r.rotateX(Math.acos(cap(d[1]/len,-1,1)));r.scale(radius,len/2,radius);r.mesh('cylinder',color,.5,alpha*.7,'add');r.pop();
}
function halo(r,point,radius,color,alpha=1,{ground=false,angle=0,stretch=1}={}){
 r.push();r.translate(...point);if(!ground)r.rotateX(PI/2);r.rotateY(angle);r.scale(radius,.28,radius*stretch);r.mesh('energy-ring',color,.45,alpha*.6,'add');r.pop();
}
function seal(r,point,radius,color,alpha,angle=0,points=8){
 halo(r,point,radius,color,alpha,{angle});halo(r,point,radius*.77,color,alpha*.5,{angle:-angle});
 for(let i=0;i<points;i++){const a=i*TAU/points+angle;mesh(r,'wedge',color,[point[0]+Math.cos(a)*radius*.9,point[1]+Math.sin(a)*radius*.9,point[2]], [.045,radius*.13,.04],alpha,.9,a);}
}
export function spectacleAnchors(sequence,poses){
 const e=sequence.event,A=poses[e.actor],B=poses[e.target],dir=e.actor===0?1:-1;
 const actor=duelAnchor(A.pose,sequence.part||'hand',{...A,facing:dir}),target=duelAnchor(B.pose,sequence.aim||'body',{...B,facing:-dir});
 const depth=Math.max(A.scale,B.scale)*.9+.8;
 return{actor,target,frontActor:[actor[0],actor[1],depth],frontTarget:[target[0],target[1],depth],depth,dir,A,B};
}
export function drawCombatSpectacle(r,sequence,frame,poses){
 const e=sequence.event,f=frame,{A,B,actor,target,frontActor:source,frontTarget:hit,depth,dir}=spectacleAnchors(sequence,poses),color=f.profile.color;
 const scale=cap((A.scale+B.scale)/2,1,1.6),size=f.strength*.4+.8,reduced=f.reduced;
 if(f.charge>.005){
  const q=f.charge,radius=(.55+q*.7)*A.scale;
  seal(r,source,radius,color,q*(reduced?.3:.8),f.p*4,6+f.seed%5);
  halo(r,[A.x,.09,0],radius*1.15,color,q*.6,{ground:true,angle:f.p*5});
  if(!reduced)for(let i=0;i<(f.ultimate?16:10);i++){const a=i*2.399+f.p*5,rad=(2-q*1.35)*A.scale;mesh(r,'sphere',i%3?color:'#fff5d6',[source[0]+Math.cos(a)*rad,source[1]+Math.sin(a)*rad,depth+Math.sin(i)*.2],.055+.025*q,q*.8,1.3);}
 }
 if(f.attack&&f.strike>.005){
  const alpha=f.strike*(e.dodged?.36:1),radius=(f.art?1.25:1.0)*A.scale;
  // Solid crescents stay on the camera side of the characters, including giant bosses.
  for(let i=0;i<(reduced?1:f.art?3:2);i++){
   const a=dir*(.45-f.p*3.6)+i*.19,center=[mix(source[0],hit[0],.32),mix(source[1],hit[1],.35),depth+.12+i*.055];
   const dimensions=[radius*(1+i*.2),radius*(.85+i*.18),.6];
   mesh(r,'arc',color,center,dimensions,alpha*(i?.25:.45),.8,a);
   mesh(r,'arc-core','#fff4d5',[center[0],center[1],center[2]+.04],dimensions,alpha*(i?.12:.25),.8,a);
  }
  if(f.art&&!reduced){
   const lead=source.map((v,i)=>mix(v,hit[i],f.travel));
   if(f.family==='fire'){
    for(let i=0;i<10;i++){const t=i/9,x=mix(source[0],lead[0],t),y=mix(source[1],lead[1],t)+Math.sin(t*PI)*.22;mesh(r,'sphere',i%3?color:'#fff1b3',[x,y,depth+.1],[(.13+t*.3)*size,(.18+t*.25)*size,.18],alpha*(.35+t*.4),1.2);}
   }else if(f.family==='ice'){
    for(let i=0;i<9;i++){const a=(i-4)*.18;mesh(r,'cone',i%2?color:'#dfffff',[lead[0]+dir*(i-4)*.2,lead[1]+Math.sin(i*1.3)*.28,depth+.15], [.13,.55+(i%3)*.1,.12],alpha,.65,-dir*(PI/2+a));}
   }else if(f.family==='storm'){
    link(r,source,lead,.12,color,alpha*.65);
    for(let i=0;i<5;i++){const t=i/4,pt=source.map((v,j)=>mix(v,lead[j],t));halo(r,pt,(.35+t*.35)*size,color,alpha*.65,{angle:f.p*8+i*.5,stretch:1.2});}
   }else if(f.family==='earth'){
    mesh(r,'sphere',color,lead,[.6*size,.6*size,.4],alpha*.55,1);
    for(let i=0;i<7;i++)mesh(r,'wedge',i%2?color:'#ebc98f',[lead[0]+(i-3)*.34,.15+Math.sin(f.p*PI)*.25,depth-.15], [.24,.45+(i%3)*.2,.21],alpha*.75,.1,(i-3)*.2,false);
   }else if(f.family==='petal'){
    for(let i=0;i<12;i++){const a=i*TAU/12+f.p*6,rr=.65+Math.sin(f.p*PI)*.4;mesh(r,'sphere',i%2?color:'#fff0d9',[lead[0]+Math.cos(a)*rr,lead[1]+Math.sin(a)*rr,depth+.2], [.12,.32,.07],alpha*.7,.8,a);}
   }else if(f.family==='astral'){
    link(r,source,lead,.16*size,color,alpha*.7);link(r,source,lead,.045,'#fffbe6',alpha);
    seal(r,lead,.85*size,color,alpha*.8,f.p*5,8+f.seed%5);
   }else{
    for(let i=0;i<5;i++){const t=i/4,point=source.map((v,j)=>mix(v,lead[j],t));point[1]+=Math.sin(i+f.p*9)*.3;mesh(r,'sphere',i%2?color:'#fff3cc',point,[.32,.23,.2],alpha*(.4+t*.4),1);link(r,[point[0]-dir*.55,point[1],depth],point,.045,color,alpha*.8);}
   }
  }
 }
 for(const impact of f.impacts){
  const q=impact.age/650,fade=(1-q)**1.5,radius=(.28+q*2.8)*scale*size;
  mesh(r,'sphere',color,hit,[.45*size*(1-q*.7),.55*size*(1-q*.7),.18],fade*(reduced?.2:.28),.8);
  mesh(r,'sphere','#fff9dc',[hit[0],hit[1],depth+.22],.17*size*(1-q*.8),fade*.55,1);
  halo(r,[hit[0],hit[1],depth+.15],radius,color,fade*.8,{angle:f.p*4,stretch:.8});
  if(!reduced){
   halo(r,[hit[0],hit[1],depth+.3],radius*1.22,'#fff2c9',fade*.4,{angle:-f.p*3,stretch:.7});
   halo(r,[B.x,.08,0],radius*1.25,color,fade*.7,{ground:true,angle:f.p*4});
   const count=f.ultimate?42:f.art?28:16;
   for(let i=0;i<count;i++){
    const seed=((f.seed+i*197)%997)/997,a=i*2.399+f.seed*.01+impact.part*.8,rad=(.2+q*(2.2+seed*1.4))*scale;
    const point=[hit[0]+Math.cos(a)*rad,hit[1]+Math.sin(a)*rad*.8-q*q*.8,depth+.25+Math.sin(i*1.7)*q*.8];
    mesh(r,i%3?'sphere':'wedge',i%4?color:'#fff6cb',point,[.035+(1-q)*.045,.10+(1-q)*.11,.035],fade,1.2,a+f.p*8);
    if(i%4===0)link(r,[point[0]-Math.cos(a)*.35,point[1]-Math.sin(a)*.35,point[2]],point,.018,color,fade*.65);
   }
   if(f.ultimate)seal(r,hit,radius*.75,color,fade*.7,-f.p*3,10);
  }
 }
 if(e.absorbed&&f.impacts.length){const fade=1-f.impacts.at(-1).age/650;seal(r,hit,.95*B.scale,'#bfefff',fade*.8,f.p*2,6);}
 if(e.heal&&f.impacts.length&&!reduced){const q=f.impacts[0].age/650;for(let i=0;i<5;i++){const pt=[A.x+(i-2)*.28,A.y+1.3*A.scale+q*1.2+(i%2)*.2,depth];link(r,[pt[0]-.09,pt[1],pt[2]],[pt[0]+.09,pt[1],pt[2]],.027,'#a4ffc2',1-q);link(r,[pt[0],pt[1]-.09,pt[2]],[pt[0],pt[1]+.09,pt[2]],.027,'#a4ffc2',1-q);}}
 return{actor,target,lightPosition:f.impacts.length?hit:source};
}

function screenGlow(c,x,y,radius,color,alpha){
 if(alpha<=0)return;const gradient=c.createRadialGradient(x,y,0,x,y,radius);
 gradient.addColorStop(0,'#fff8e0');gradient.addColorStop(.12,color);gradient.addColorStop(.42,color+'88');gradient.addColorStop(1,color+'00');
 c.globalAlpha=alpha;c.fillStyle=gradient;c.fillRect(x-radius,y-radius,radius*2,radius*2);
}
export function drawCinematicScreen(c,state,{width,height,actor,target}){
 c.clearRect(0,0,width,height);if(state.reduced)return;
 const color=state.profile.color,center=state.impacts.length?target:actor;
 c.save();c.globalCompositeOperation='source-over';c.globalAlpha=state.darkness;c.fillStyle='#0b1024';c.fillRect(0,0,width,height);
 const shade=cap(state.charge*.25+state.strike*(state.ultimate?.2:.06));
 if(shade>.001){const vignette=c.createRadialGradient(center.x,center.y,Math.min(width,height)*.18,width/2,height/2,Math.max(width,height)*.67);vignette.addColorStop(0,'#10172a00');vignette.addColorStop(1,'#080d20');c.fillStyle=vignette;c.globalAlpha=shade;c.fillRect(0,0,width,height);}
 c.globalCompositeOperation='screen';
 screenGlow(c,center.x,center.y,Math.max(width,height)*(.25+state.strength*.12),color,state.charge*.22+state.flash*1.1);
 if(state.flash>.001){c.globalAlpha=state.flash*.42;c.fillStyle=color;c.fillRect(0,0,width,height);}
 if(state.art&&state.strike>.001){
  const rays=state.ultimate?22:12,unit=Math.min(width,height);
  for(let i=0;i<rays;i++){
   const a=i*TAU/rays+(state.seed%19)*.04,len=unit*(.6+(i%4)*.2),inner=unit*(.15+(i%3)*.045);
   c.globalAlpha=state.strike*(i%2?.1:.2);c.strokeStyle=i%3?color:'#fff6d5';c.lineWidth=i%3?1.5:3;
   c.beginPath();c.moveTo(center.x+Math.cos(a)*inner,center.y+Math.sin(a)*inner*.7);c.lineTo(center.x+Math.cos(a)*len,center.y+Math.sin(a)*len*.7);c.stroke();
  }
 }
 for(const impact of state.impacts){
  const q=impact.age/650,radius=(.04+q*(state.art?1.2:.65))*Math.max(width,height),alpha=(1-q)**2;
  c.globalAlpha=alpha*.55;c.strokeStyle=color;c.lineWidth=2+state.strength;c.beginPath();c.ellipse(target.x,target.y,radius,radius*.62,0,0,TAU);c.stroke();
  // Perspective fragments leave the arena and sweep over the viewport, with lit faces.
  if(state.art)for(let i=0;i<(state.ultimate?30:18);i++){
   const a=i*2.399+state.seed*.013,depth=.35+(i%7)*.12,travel=q*q*Math.max(width,height)*(.5+depth),x=target.x+Math.cos(a)*travel,y=target.y+Math.sin(a)*travel*.65+q*q*height*.16;
   const size=(2+q*(9+state.strength*3))*depth,turn=a+q*5;
   c.save();c.translate(x,y);c.rotate(turn);c.globalAlpha=alpha*(.3+depth*.2);
   c.fillStyle=color;c.beginPath();c.moveTo(0,-size*1.7);c.lineTo(size,0);c.lineTo(0,size);c.lineTo(-size*.45,0);c.closePath();c.fill();
   c.fillStyle='#fff2d8';c.globalAlpha=alpha*.6;c.beginPath();c.moveTo(0,-size*1.7);c.lineTo(size,0);c.lineTo(0,size*.65);c.closePath();c.fill();c.restore();
  }
 }
 c.restore();c.globalAlpha=1;
}
export function createCinematicLayer(scene){
 if(!scene?.append)return{render(){},destroy(){}};
 const host=document.body?.append?document.body:scene,fullscreen=host!==scene;
 const canvas=document.createElement('canvas');canvas.className='cinematic-canvas'+(fullscreen?' viewport-cinematic':'');canvas.style.opacity='0';canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext?.('2d');if(!ctx)return{render(){},destroy(){}};
 host.append(canvas);let oldWidth=0,oldHeight=0;
 return{render(state,frame){
  if(state.reduced||Math.max(state.darkness,state.flash,state.charge,state.strike)<.001&&!state.impacts.length){if(canvas.style.opacity!=='0'){ctx.clearRect(0,0,oldWidth,oldHeight);canvas.style.opacity='0';}return;}
  const rect=frame.rect||scene.getBoundingClientRect?.()||{left:0,top:0},width=fullscreen?(globalThis.innerWidth||document.documentElement?.clientWidth||frame.width):frame.width,height=fullscreen?(globalThis.innerHeight||document.documentElement?.clientHeight||frame.height):frame.height,ratio=Math.min(1.5,globalThis.devicePixelRatio||1,Math.sqrt(2000000/(width*height)));
  if(oldWidth!==width||oldHeight!==height){oldWidth=width;oldHeight=height;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
  const localActor=frame.project?frame.project(frame.anchors.actor):frame.actor,localTarget=frame.project?frame.project(frame.anchors.target):frame.target;
  const point=p=>({x:p.x+(fullscreen?(rect.left||0):0),y:p.y+(fullscreen?(rect.top||0):0)}),actor=point(localActor),target=point(localTarget);
  canvas.style.opacity=state.reduced?'0':'1';drawCinematicScreen(ctx,state,{width,height,actor,target});
 },destroy(){canvas.remove();}};
}
