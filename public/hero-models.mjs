import {HERO_RIG,heroRoot} from './hero-rig.mjs?v=2.5.0';
const PI=Math.PI,RAD=PI/180,finite=(x,f=0)=>Number.isFinite(x)?x:f;
const GOLD='#d6b578',INK='#253644',FUR={roughness:.91,texture:1},CLOTH={roughness:.79,texture:2},LEATHER={roughness:.53,texture:3},METAL={roughness:.25,metalness:.78,texture:4},JADE={roughness:.20,metalness:.15,texture:6};
export const HERO_PALETTES={
 penguin:{body:'#32596d',shade:'#244356',belly:'#f6e8cf',foot:'#d99b43',scarf:'#cc624b',eye:INK,cheek:'#df9f85',coat:'#275e78',lining:'#f0dec0',belt:'#553e39'},
 panda:{body:'#eae5d6',shade:'#303e3e',belly:'#f4ecd8',foot:'#303e3e',scarf:'#718f69',eye:INK,cheek:'#d7a58f',coat:'#4b7a69',lining:'#e4d8b4',belt:'#493b31'},
 cat:{body:'#cf9558',shade:'#9b663c',belly:'#f4dbb1',foot:'#bf854b',scarf:'#a54843',eye:'#243b33',cheek:'#d59078',coat:'#28545d',lining:'#d0d6b8',belt:'#684d37'},
 rabbit:{body:'#eee0d9',shade:'#ccb9b6',belly:'#fff0df',foot:'#d6c2be',scarf:'#a9698b',eye:'#46384c',cheek:'#d99baa',coat:'#85739b',lining:'#f1dcd0',belt:'#685063'}
};
function shape(r,kind,color,x,y,z,sx,sy=sx,sz=sx,rz=0,material=FUR,rx=0,ry=0,alpha=1){
 r.push();r.translate(x,y,z);if(rx)r.rotateX(rx);if(ry)r.rotateY(ry);if(rz)r.rotateZ(rz);r.scale(sx,sy,sz);r.mesh(kind,color,0,alpha,'normal',material);r.pop();
}
const ball=(r,c,x,y,z,sx,sy=sx,sz=sx,rz=0,m=FUR)=>shape(r,'sphere',c,x,y,z,sx,sy,sz,rz,m);
function group(r,x,y,z,rz,fn){r.push();r.translate(x,y,z);if(rz)r.rotateZ(rz);fn();r.pop();}
function band(r,c,y,radius,depth=.17){shape(r,'cylinder',c,0,y,0,radius,.04,depth,0,CLOTH);}
function eyes(r,pet,p,profile,pose){
 const blink=finite(pose.blink),squint=Math.min(.45,finite(pose.focus)*.35),height=Math.max(.008,.074*(1-blink-squint));
 const eye=(x,y,z,side)=>{
  if(pet==='panda')ball(r,p.shade,x,y-.015,z-.015,.145,.19,.035,side*.17);
  ball(r,'#fff8e7',x,y,z+.012,.087,height+.009,.024);
  ball(r,pet==='cat'?'#719d8a':pet==='rabbit'?'#9b7a9c':'#537a85',x+side*.012,y,z+.033,.048,height*.91,.016);
  ball(r,p.eye,x+side*.018,y,z+.044,pet==='cat'?.018:.028,height*.79,.011);
  ball(r,'#ffffff',x+side*.025,y+.023,z+.052,.012,.014,.006);
  shape(r,'sphere',p.body,x-side*.018,y+.085,z+.022,.099,.017,.024,-side*.04,FUR);
  shape(r,'sphere',p.eye,x+side*.005,y+.116,z+.015,.075,.010,.013,-side*(.025+finite(pose.focus)*.13));
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
 // A fitted cloth brow band, rather than a flat cylinder slicing through the face.
 shape(r,'brow-band',p.scarf,0,2.965,0,panda?.59:.52,.65,.38,0,CLOTH);
 shape(r,'gem-cut',GOLD,0,2.97,.413,.043,.055,.019,0,METAL);
}
function legs(r,pet,p,pose,front,profile){
 const k=front?'f':'b',s=front?1:-1;
 group(r,profile?s*.06:s*.27,HERO_RIG.hip,profile?s*.28:(front?.11:-.08),-finite(pose['l'+k])*RAD,()=>{
  shape(r,'sleeve',p.coat,0,-.18,0,.205,.255,.20,0,CLOTH);ball(r,p.coat,0,-.38,0,.145,.14,.145);
  group(r,0,-HERO_RIG.thigh,0,-finite(pose['k'+k])*RAD,()=>{
   shape(r,'sleeve',p.shade,0,-.14,0,.136,.24,.14,0,FUR);band(r,p.lining,-.265,.153,.151);band(r,p.lining,-.31,.153,.151);shape(r,'lapel',p.coat,0,-.18,.146,.075,.15,.023,0,CLOTH);
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
   ball(r,p.shade,.135,-.4,.1,.07,.1,.075,-.35);for(let i=0;i<3;i++)shape(r,'sphere',p.lining,(i-1)*.054,-.302,.145,.011,.023,.013,0,CLOTH);
   if(front&&held)group(r,.06,-.4,.02,(profile?PI:0)-.2+finite(pose.wrist)*RAD,()=>{r.rotateY(.12);drawWeapon(r,held,{scale:armored?.98:.79});});
  });
 });
}
function costume(r,pet,p,pose,time){
 const broad=pet==='panda'?1.13:pet==='rabbit'?.87:pet==='cat'?.92:1;
 shape(r,'tunic',p.coat,0,1.59,0,.52*broad,.53,.36,0,CLOTH);
 shape(r,'cylinder',p.body,0,2.12,0,.19,.16,.18,0,FUR);
 for(const side of [-1,1]){shape(r,'lapel',p.lining,side*.125,1.87,.343,.078,.25,.033,side*.35,CLOTH);shape(r,'cloth',p.coat,side*.21,1.25,.275,.22,.29,.10,side*(.12+finite(pose.cloth)*.12),CLOTH);}
 shape(r,'cylinder',p.belt,0,1.37,0,.52*broad,.075,.375,0,LEATHER);shape(r,'bevel-box',GOLD,0,1.37,.391,.10,.074,.027,0,METAL);shape(r,'sphere',p.scarf,.32,1.39,.26,.13,.105,.07,0,CLOTH);
 const sway=Math.sin(time*3)*.04+finite(pose.cloth)*.18;
 for(const side of [-1,1])shape(r,'cloth',p.scarf,side*.18,1.08,.33,.095,.26,.09,side*.20+sway,CLOTH);
 if(pet==='penguin'){shape(r,'cloth',p.scarf,0,1.92,-.37,.4,.32,.14,sway,CLOTH);shape(r,'cylinder',p.scarf,0,2.09,0,.37,.075,.30,0,CLOTH);}
 else if(pet==='panda')for(const side of [-1,1]){shape(r,'cloth',p.lining,side*.29,1.65,.316,.15,.25,.10,side*.15,CLOTH);for(let i=0;i<3;i++)ball(r,'#544f3d',side*.2,1.62+i*.11,.386,.034,.027,.023);}
 else if(pet==='cat'){
  shape(r,'cat-tail',p.body,0,1.2,-.30,1,1,1,sway,FUR);
  for(let i=0;i<3;i++)shape(r,'sphere',p.shade,Math.sin((.66+i*.11)*PI)*.2,1.2-.12*(.66+i*.11)+.25*Math.sin((.66+i*.11)*4),-.30-1.2*(.66+i*.11)+.4*(.66+i*.11)**2,.07,.055,.07,0,FUR);
  shape(r,'cloth',p.scarf,-.4,1.94,-.12,.19,.46,.14,-.4+sway,CLOTH);
 }else{ball(r,p.belly,0,1.12,-.36,.18,.18,.16);shape(r,'cloth',p.lining,0,1.56,.351,.12,.24,.06,.05,CLOTH);shape(r,'sphere',p.scarf,0,1.75,.402,.085,.085,.035,0,LEATHER);}
 // Piping and short stitches follow the cloth panels and remain solid geometry.
 for(const side of [-1,1]){
  shape(r,'lapel',GOLD,side*.19,1.87,.369,.012,.245,.012,side*.35,CLOTH);
  for(let i=0;i<4;i++)shape(r,'sphere',p.lining,side*(.30+i*.008),1.05+i*.08,.31,.013,.008,.012,0,CLOTH);
  shape(r,'sphere',GOLD,side*.40,1.40,.263,.023,.025,.015,0,METAL);
 }
 if(pet==='penguin'){
  shape(r,'bevel-box',p.lining,0,1.72,.37,.12,.16,.022,0,CLOTH);
  for(const side of [-1,1])shape(r,'lapel',GOLD,side*.045,1.76,.4,.032,.09,.019,-side*.5,METAL);
 }else if(pet==='panda'){
  for(let i=0;i<9;i++){const a=(i-4)*.22;ball(r,'#70533d',Math.sin(a)*.32,2.07-Math.cos(a)*.16,.34,.038,.042,.035,0,LEATHER);}
  shape(r,'gem-cut','#9ac4a7',0,1.76,.398,.068,.095,.025,0,JADE);
 }else if(pet==='cat'){
  shape(r,'lapel',p.belt,-.16,1.76,.386,.045,.36,.02,-.55,LEATHER);
  for(let i=0;i<3;i++)shape(r,'sphere',GOLD,-.25+i*.11,1.9-i*.18,.416,.021,.025,.018,0,METAL);
 }else{
  for(let i=0;i<5;i++){const a=i*PI*2/5;shape(r,'lapel',p.scarf,Math.sin(a)*.07,1.74+Math.cos(a)*.07,.422,.028,.065,.014,-a,CLOTH);}
  shape(r,'gem-cut',GOLD,0,1.74,.45,.027,.034,.019,0,METAL);
 }

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
