import {HERO_RIG,heroRoot} from './hero-rig.mjs?v=2.4.0';
const PI=Math.PI,RAD=PI/180,finite=(x,f=0)=>Number.isFinite(x)?x:f;
const GOLD='#d9b66c',INK='#22333b',FUR={roughness:.91},CLOTH={roughness:.83},LEATHER={roughness:.53},METAL={roughness:.27,metalness:.72};
export const HERO_PALETTES={
 penguin:{body:'#32596d',shade:'#244356',belly:'#f6e8cf',foot:'#d99b43',scarf:'#cc624b',eye:INK,cheek:'#df9f85',coat:'#24596a',lining:'#d4dfcf',belt:'#553e39'},
 panda:{body:'#eae5d6',shade:'#303e3e',belly:'#f4ecd8',foot:'#303e3e',scarf:'#718f69',eye:INK,cheek:'#d7a58f',coat:'#62796a',lining:'#d2c6a5',belt:'#493b31'},
 cat:{body:'#cf9558',shade:'#9b663c',belly:'#f4dbb1',foot:'#bf854b',scarf:'#a54843',eye:'#243b33',cheek:'#d59078',coat:'#314d56',lining:'#b8c6b4',belt:'#684d37'},
 rabbit:{body:'#eee0d9',shade:'#ccb9b6',belly:'#fff0df',foot:'#d6c2be',scarf:'#a9698b',eye:'#46384c',cheek:'#d99baa',coat:'#6f617c',lining:'#e8d4c7',belt:'#685063'}
};
function shape(r,kind,color,x,y,z,sx,sy=sx,sz=sx,rz=0,material=FUR,rx=0,ry=0,alpha=1){
 r.push();r.translate(x,y,z);if(rx)r.rotateX(rx);if(ry)r.rotateY(ry);if(rz)r.rotateZ(rz);r.scale(sx,sy,sz);r.mesh(kind,color,0,alpha,'normal',material);r.pop();
}
const ball=(r,c,x,y,z,sx,sy=sx,sz=sx,rz=0,m=FUR)=>shape(r,'sphere',c,x,y,z,sx,sy,sz,rz,m);
function group(r,x,y,z,rz,fn){r.push();r.translate(x,y,z);if(rz)r.rotateZ(rz);fn();r.pop();}
function band(r,c,y,radius,depth=.17){shape(r,'cylinder',c,0,y,0,radius,.04,depth,0,CLOTH);}
function eyes(r,pet,p,profile,pose){
 const blink=finite(pose.blink),squint=Math.min(.45,finite(pose.focus)*.35),height=Math.max(.008,.058*(1-blink-squint));
 const eye=(x,y,z,side)=>{
  if(pet==='panda')ball(r,p.shade,x,y-.015,z-.015,.145,.19,.035,side*.17);
  ball(r,'#f2e6cc',x,y,z+.012,.075,height+.018,.023);
  ball(r,pet==='cat'?'#719d8a':pet==='rabbit'?'#9b7a9c':'#537a85',x+side*.012,y,z+.033,.045,height,.014);
  ball(r,p.eye,x+side*.018,y,z+.044,pet==='cat'?.013:.023,height*.87,.009);
  ball(r,'#ffffff',x+side*.025,y+.023,z+.052,.012,.014,.006);
  shape(r,'sphere',p.body,x-side*.018,y+.069,z+.022,.099,.022,.024,-side*.14,FUR);
  shape(r,'sphere',p.eye,x+side*.005,y+.096,z+.015,.087,.013,.016,-side*(.10+finite(pose.focus)*.13));
 };
 if(profile)eye(.31,2.69,.445,1);else for(const side of [-1,1])eye(side*.245,2.69,.473,side);
}
function head(r,pet,p,profile,pose,time){
 const panda=pet==='panda',cat=pet==='cat',rabbit=pet==='rabbit';
 shape(r,'hero-head',p.body,0,2.63,0,panda?.66:cat?.56:.57,panda?.54:.53,panda?.49:.47);
 if(pet==='penguin'){
  ball(r,p.belly,0,2.56,.348,.44,.385,.17);
  shape(r,'cone',p.foot,0,2.5,.595,.145,.14,.185,0,LEATHER,PI/2);
  ball(r,p.foot,0,2.445,.57,.15,.035,.10);
  for(const side of [-1,1])shape(r,'cloth',p.body,side*.1,3.14,-.04,.11,.18,.1,-side*.3,FUR);
 }else if(panda){
  for(const side of [-1,1]){ball(r,p.shade,side*.51,3.02,-.02,.205,.205,.15);ball(r,'#6d6a60',side*.51,3.03,.105,.115,.12,.025);}
  ball(r,p.belly,0,2.45,.406,.31,.2,.17);ball(r,p.shade,0,2.51,.59,.088,.052,.045);
 }else if(cat){
  for(const side of [-1,1]){
   shape(r,'cat-ear',p.body,side*.4,3.1,-.01,.23,.36,.19,-side*.13);
   shape(r,'cat-ear','#b27972',side*.4,3.12,.145,.13,.23,.025,-side*.13);
   ball(r,p.belly,side*.12,2.43,.444,.16,.12,.105);ball(r,p.shade,side*.49,2.65,.24,.06,.045,.09,side*.3);
  }
  ball(r,'#985e5a',0,2.48,.586,.065,.042,.037);
  for(const x of [-.15,0,.15])shape(r,'sphere',p.shade,x,3.00,.30,.028,.11,.016,-x*.8);
 }else if(rabbit){
  for(const side of [-1,1]){
   const angle=side*(.13+Math.sin(time*2+side)*.025)+finite(pose.ear)*.08;
   shape(r,'rabbit-ear',p.body,side*.25,3.42,-.07+side*.14,.15,.64,.12,-angle);
   shape(r,'rabbit-ear','#c58c9e',side*.25,3.44,.035+side*.14,.075,.46,.025,-angle);
  }
  for(const side of [-1,1])ball(r,p.belly,side*.10,2.44,.429,.14,.13,.10);
  ball(r,'#b2758c',0,2.5,.564,.06,.044,.035);
 }
 if(!profile){eyes(r,pet,p,false,pose);for(const side of [-1,1])ball(r,p.cheek,side*.36,2.48,.39,.073,.028,.018);}
 if(pet!=='penguin')for(const side of [-1,1])shape(r,'sphere',p.eye,side*.045,2.365,.474,.052,.012,.012,side*.18);
 shape(r,'cylinder',p.scarf,0,2.92,-.014,panda?.615:.54,.045,.395,0,CLOTH);
 shape(r,'sphere',GOLD,0,2.94,.39,.07,.075,.022,0,METAL);
}
function legs(r,pet,p,pose,front,profile){
 const k=front?'f':'b',s=front?1:-1;
 group(r,profile?s*.06:s*.27,HERO_RIG.hip,profile?s*.28:(front?.11:-.08),-finite(pose['l'+k])*RAD,()=>{
  shape(r,'sleeve',p.coat,0,-.18,0,.205,.255,.20,0,CLOTH);ball(r,p.coat,0,-.38,0,.145,.14,.145);
  group(r,0,-HERO_RIG.thigh,0,-finite(pose['k'+k])*RAD,()=>{
   shape(r,'sleeve',p.shade,0,-.14,0,.136,.24,.14,0,FUR);band(r,p.lining,-.265,.153,.151);band(r,p.lining,-.31,.153,.151);
   ball(r,p.foot,profile?.17:.04,-HERO_RIG.shin,profile?0:.12,profile?.32:.22,.15,profile?.18:.29);
   shape(r,'boot',p.belt,profile?.12:.025,-.435,profile?0:.095,profile?.29:.215,.15,profile?.181:.27,0,LEATHER);
   shape(r,'sphere','#292f34',profile?.17:.04,-.548,profile?0:.12,profile?.31:.23,.045,profile?.18:.29,0,LEATHER);
   shape(r,'sphere',p.lining,profile?.34:.04,-.40,profile?.13:.34,.06,.022,.022,0,CLOTH);
  });
 });
}
function arms(r,pet,p,pose,front,held,profile,armored,drawWeapon){
 const k=front?'f':'b',s=front?1:-1;
 group(r,profile?s*.1:s*.49,HERO_RIG.shoulder,profile?(front?.45:-.43):(front?.23:-.13),-finite(pose['a'+k])*RAD,()=>{
  shape(r,'sleeve',p.coat,0,-.15,0,pet==='panda'?.25:.21,.275,.205,0,CLOTH);ball(r,p.shade,0,-.36,0,.151,.16,.15);
  if(pet==='penguin'||armored)shape(r,'hero-head',armored?'#53667b':'#537b87',0,-.05,.055,.25,.17,.19,0,METAL);
  group(r,0,-HERO_RIG.upperArm,0,-finite(pose['e'+k])*RAD,()=>{
   shape(r,'sleeve',p.shade,0,-.15,0,.144,.235,.145,0,FUR);band(r,p.lining,-.20,.157,.157);band(r,p.lining,-.255,.16,.16);band(r,p.scarf,-.305,.165,.165);
   ball(r,p.body,0,-HERO_RIG.forearm,0,pet==='panda'?.215:.185,pet==='panda'?.18:.16,.172);
   for(let i=0;i<3;i++)ball(r,p.body,(i-1)*.075,-.50,.10,.05,.055,.056);
   ball(r,p.shade,.135,-.4,.1,.07,.1,.075,-.35);
   if(front&&held)group(r,.06,-.4,.02,(profile?PI:0)-.2+finite(pose.wrist)*RAD,()=>{r.rotateY(.12);drawWeapon(r,held,{scale:armored?.98:.79});});
  });
 });
}
function costume(r,pet,p,pose,time){
 const broad=pet==='panda'?1.13:pet==='rabbit'?.87:pet==='cat'?.92:1;
 shape(r,'tunic',p.coat,0,1.59,0,.52*broad,.53,.36,0,CLOTH);
 shape(r,'cylinder',p.body,0,2.12,0,.19,.16,.18,0,FUR);
 for(const side of [-1,1]){shape(r,'cloth',p.lining,side*.105,1.85,.323,.065,.235,.07,side*.43,CLOTH);shape(r,'cloth',p.coat,side*.21,1.25,.275,.22,.29,.10,side*(.12+finite(pose.cloth)*.12),CLOTH);}
 shape(r,'cylinder',p.belt,0,1.37,0,.52*broad,.075,.375,0,LEATHER);shape(r,'hero-head',GOLD,0,1.37,.391,.10,.09,.031,0,METAL);shape(r,'sphere',p.scarf,.32,1.39,.26,.13,.105,.07,0,CLOTH);
 const sway=Math.sin(time*3)*.04+finite(pose.cloth)*.18;
 for(const side of [-1,1])shape(r,'cloth',p.scarf,side*.18,1.08,.33,.095,.26,.09,side*.20+sway,CLOTH);
 if(pet==='penguin'){shape(r,'cloth',p.scarf,0,1.92,-.37,.4,.32,.14,sway,CLOTH);shape(r,'cylinder',p.scarf,0,2.09,0,.37,.075,.30,0,CLOTH);}
 else if(pet==='panda')for(const side of [-1,1]){shape(r,'cloth',p.lining,side*.29,1.65,.316,.15,.25,.10,side*.15,CLOTH);for(let i=0;i<3;i++)ball(r,'#544f3d',side*.2,1.62+i*.11,.386,.034,.027,.023);}
 else if(pet==='cat'){
  for(let i=0;i<4;i++)group(r,-.38-i*.11,1.2-i*.06,-.31,-.4-i*.36+sway,()=>shape(r,'sleeve',i===3?p.shade:p.body,0,-.16,0,.095,.22,.10));
  shape(r,'cloth',p.scarf,-.4,1.94,-.12,.19,.46,.14,-.4+sway,CLOTH);
 }else{ball(r,p.belly,0,1.12,-.36,.18,.18,.16);shape(r,'cloth',p.lining,0,1.56,.351,.12,.24,.06,.05,CLOTH);shape(r,'sphere',p.scarf,0,1.75,.402,.085,.085,.035,0,LEATHER);}
}
export function drawHero(r,fighter={},pose={},options={},hooks={}){
 const pet=HERO_PALETTES[fighter.pet]?fighter.pet:'penguin',p=HERO_PALETTES[pet],profile=options.profile==='duel',facing=options.facing===-1?-1:1;
 const scale=Math.max(.15,Math.min(4,finite(options.scale,finite(fighter.modelScale,1)))),time=finite(options.time),dead=Math.max(0,Math.min(1,finite(options.dead))),root=heroRoot(pose),held=Object.hasOwn(options,'held')?options.held:(fighter.held??fighter.weapons?.[0]);
 const blinkTime=time%5.2;pose={...pose,blink:pose.blink??(blinkTime>4.96?Math.sin((blinkTime-4.96)/.24*PI):0)};
 r.push();r.translate(finite(options.x),finite(options.y),finite(options.z));
 for(const [radius,alpha]of [[.65,.055],[.48,.08],[.3,.13]])shape(r,'disc','#172c35',0,.012+alpha*.02,0,radius*scale,1,radius*.55*scale,0,CLOTH,0,0,alpha);
 r.rotateY(finite(options.yaw));r.scale(facing*scale,scale,scale);r.translate(0,root.y+root.pivot,0);r.rotateZ(root.angle-dead*1.35);r.translate(0,-root.pivot,0);if(dead)r.translate(-dead*.6,-dead*.58,0);
 legs(r,pet,p,pose,false,profile);
 r.push();r.rotateY(finite(pose.twist)*RAD);arms(r,pet,p,pose,false,null,profile,fighter.boss,hooks.drawWeapon);
 r.push();if(profile)r.rotateY(PI/2);costume(r,pet,p,pose,time);r.pop();r.pop();legs(r,pet,p,pose,true,profile);
 group(r,0,2.17,0,-finite(pose.head)*RAD,()=>{
  r.translate(0,-2.17+Math.sin(time*2.8)*.008,0);r.push();if(profile)r.rotateY(PI/2);head(r,pet,p,profile,pose,time);r.pop();
  if(profile){eyes(r,pet,p,true,pose);ball(r,p.cheek,.24,2.49,.443,.055,.023,.015);if(pet!=='penguin')shape(r,'sphere',p.eye,.455,2.38,.285,.04,.011,.012,-.15);}
 });
 if(fighter.boss){r.push();if(profile)r.rotateY(PI/2);hooks.drawBossArmor(r,fighter,p,time);r.pop();}
 r.push();r.rotateY(finite(pose.twist)*RAD);arms(r,pet,p,pose,true,held,profile,fighter.boss,hooks.drawWeapon);r.pop();
 if(fighter.relic){shape(r,'hero-head','#9c7bb1',profile?.25:-.40,1.35,.43,.10,.14,.045,0,METAL);ball(r,GOLD,profile?.25:-.40,1.37,.476,.04,.05,.02);}
 r.pop();
}
