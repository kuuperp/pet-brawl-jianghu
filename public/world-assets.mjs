// Sculpted game assets. Every visible part is a lit 3D mesh; no billboard characters.
import {drawCraftedWeapon,weaponFinishing} from './weapon-craft.mjs?v=2.6.0';
import {drawHero,HERO_PALETTES} from './hero-models.mjs?v=2.6.0';
import {ARENA_LENGTH_SCALE} from './battle-layout.mjs?v=2.6.0';
const PI=Math.PI, TAU=PI*2, RAD=PI/180;
const finite=(x,f=0)=>Number.isFinite(x)?x:f;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const hash=s=>Array.from(String(s)).reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,17);
function part(r,kind,color,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0,light=0,alpha=1){
 const metal=[GOLD,DARK_GOLD,METAL,DARK_METAL].includes(color);
 r.push();r.translate(x,y,z);if(rx)r.rotateX(rx);if(ry)r.rotateY(ry);if(rz)r.rotateZ(rz);r.scale(sx,sy,sz);r.mesh(kind,color,light,alpha,'normal',{roughness:metal?.3:.78,metalness:metal?.65:0,texture:metal?4:color===WOOD?5:0});r.pop();
}
function group(r,x,y,z,rx,ry,rz,fn){
 r.push();r.translate(x,y,z);if(rx)r.rotateX(rx);if(ry)r.rotateY(ry);if(rz)r.rotateZ(rz);fn();r.pop();
}
function ball(r,c,x,y,z,sx,sy=sx,sz=sx,light=0){part(r,'sphere',c,x,y,z,sx,sy,sz,0,0,0,light);}
function box(r,c,x,y,z,sx,sy=sx,sz=sx,rx=0,ry=0,rz=0,light=0){part(r,'box',c,x,y,z,sx,sy,sz,rx,ry,rz,light);}
function rod(r,c,x,y,z,rx,hy,rz=rx,ax=0,ay=0,az=0,light=0){part(r,'cylinder',c,x,y,z,rx,hy,rz,ax,ay,az,light);}
function ring(r,c,x,y,z,sx,sy=sx,sz=sx,ax=0,ay=0,az=0,light=0,alpha=1){part(r,'torus',c,x,y,z,sx,sy,sz,ax,ay,az,light,alpha);}
function cone(r,c,x,y,z,sx,sy=sx,sz=sx,rx=0,ry=0,rz=0,light=0){part(r,'cone',c,x,y,z,sx,sy,sz,rx,ry,rz,light);}

export const PET_MATERIALS=HERO_PALETTES;
const GOLD='#e4b962', DARK_GOLD='#a57e41', METAL='#bfd4d6', DARK_METAL='#344654', WOOD='#825a3e';
const weaponColors=['#8cc9ab','#e7a86f','#b8adf2','#7cbed8','#e28e86','#d4bc75','#9dd6c4','#e7a1bf'];
const swordIds=new Set(['blade','jade-sword','frost-sword','dawn-sword','dragon-sword','sun-sword','thunder-sword','blood-sword','star-sword','soul-sword','void-sword','heaven-sword','sword','rapier']);
const spearIds=new Set(['spear','trident','halberd','dragon-spear','frost-spear','thunder-spear','sky-spear','jade-spear','lance']);
const staffIds=new Set(['staff','monk-staff','gold-staff','sage-staff','dragon-staff','storm-staff','heaven-staff','bamboo-staff']);
const axeIds=new Set(['axe','war-axe','frost-axe','volcano-axe','titan-hammer','war-hammer','meteor-hammer','thunder-hammer']);
const orbIds=new Set(['orb','star-orb','frost-orb','void-orb','sun-orb','pearl','dragon-pearl','mirror','star-mirror','seal','dragon-seal','celestial-seal']);
const fanIds=new Set(['fan','ice-fan','flame-fan','storm-fan','phoenix-fan','feather-fan','jade-fan']);
const bowIds=new Set(['bow','moon-bow','sun-bow','star-bow','crossbow','thunder-bow','dragon-bow']);

function grip(r,color=WOOD,length=.28){
 rod(r,color,0,0,0,.065,length,.065);
 ring(r,GOLD,0,-length+.02,0,.09,.5,.09);
 rod(r,GOLD,0,length-.025,0,.09,.045,.09);
}
function sword(r,id,accent){
 const heavy=id==='blade'||/great|heavy|mountain|titan/.test(id),fire=/flame|fire|sun|phoenix|saber|volcano/.test(id),ice=/ice|frost|snow/.test(id);
 const blade=ice?'#d5f6fc':fire?'#efaa8d':METAL,w=heavy?.16:.085,length=heavy?.88:.72;
 grip(r,heavy?'#463b46':WOOD);
 box(r,GOLD,0,.31,0,heavy?.34:.25,.045,.085);
 box(r,blade,0,.42+length,0,w,length,.045);
 cone(r,blade,0,.48+length*2,0,w,.18,.045);
 box(r,accent,0,.44+length,0,w*.25,length*.94,.05,0,0,0,.25);
 ball(r,accent,0,.31,.09,.085,.075,.055,.25);
 if(heavy){box(r,DARK_GOLD,0,.56,0,.21,.13,.07);ring(r,accent,0,.83,0,.21,.7,.21,PI/2,0,0,.2);}
 if(fire){cone(r,accent,.12,1.25,0,.09,.32,.055,0,0,-.25,.6);cone(r,'#ffe5ad',-.1,1.75,0,.05,.24,.045,0,0,.2,.7);}
}
function spear(r,id,accent){
 grip(r,WOOD,.38);rod(r,WOOD,0,.8,0,.045,.8,.045);
 rod(r,GOLD,0,1.48,0,.09,.12,.09);
 cone(r,METAL,0,1.88,0,.15,.36,.065);
 box(r,accent,0,1.65,0,.06,.21,.065,0,0,0,.2);
 if(id==='trident'||/halberd/.test(id)){
  box(r,GOLD,0,1.59,0,.38,.045,.065);
  for(const x of [-.3,.3]){rod(r,METAL,x,1.75,0,.045,.22,.045);cone(r,accent,x,2.02,0,.09,.18,.055,0,0,0,.2);}
 }else{
  group(r,.03,1.45,0,0,0,-.2,()=>{box(r,accent,.16,-.14,0,.18,.13,.02);cone(r,accent,.2,-.33,0,.12,.16,.02,0,0,PI);});
 }
}
function fan(r,id,accent){
 grip(r,WOOD,.15);
 const colors=id==='fan'?['#78a98b','#b5ccb0']:['#d9e4d5',accent];
 for(let i=0;i<7;i++)group(r,0,.08,0,0,0,(i-3)*.25,()=>{
  cone(r,colors[i%2],0,.65,0,.28,.53,.035,0,0,PI);
  rod(r,GOLD,0,.57,.035,.018,.52,.018);
 });
 ball(r,GOLD,0,.08,.055,.07);
}
function axe(r,id,accent){
 const hammer=/hammer/.test(id);
 grip(r,WOOD,.38);rod(r,WOOD,0,.72,0,.055,.72,.055);
 if(hammer){
  rod(r,DARK_METAL,0,1.25,0,.27,.45,.27,0,0,PI/2);
  for(const x of [-.47,.47])rod(r,GOLD,x,1.25,0,.3,.06,.3,0,0,PI/2);
  ball(r,accent,0,1.25,.28,.15,.15,.04,.4);
 }else{
  box(r,DARK_GOLD,0,1.29,0,.12,.25,.1);
  for(const side of [-1,1]){
   box(r,METAL,side*.26,1.3,0,.25,.22,.055,0,0,side*.12);
   cone(r,METAL,side*.56,1.29,0,.24,.31,.055,0,0,-side*PI/2);
   box(r,accent,side*.27,1.3,.06,.17,.055,.014,0,0,side*.12,.25);
  }
 }
}
function staff(r,id,accent){
 grip(r,WOOD,.38);rod(r,id==='staff'?'#a27a43':DARK_METAL,0,.72,0,.06,.98,.06);
 for(const y of [-.2,.35,.95,1.6])rod(r,GOLD,0,y,0,.085,.045,.085);
 if(/sage|heaven|gold|monk/.test(id)){
  ring(r,GOLD,0,1.89,0,.3,.3,.3,PI/2);
  ball(r,accent,0,1.89,0,.13,.16,.1,.5);
  for(const x of [-.24,.24])ring(r,GOLD,x,1.64,.03,.1,.1,.1,PI/2);
 }else{ring(r,accent,0,.68,0,.13,.4,.13,0,0,0,.3);cone(r,GOLD,0,1.78,0,.1,.18,.1);}
}
function orb(r,id,accent){
 const seal=/seal/.test(id),mirror=/mirror/.test(id);
 if(seal){box(r,'#d6aa69',0,.35,0,.3,.24,.24);box(r,accent,0,.61,0,.24,.045,.18);cone(r,GOLD,0,.82,0,.2,.17,.15);box(r,'#ecd49c',0,.13,.02,.33,.03,.27);}
 else{
  ball(r,mirror?'#d8f3f3':accent,0,.65,0,.3,mirror?.4:.3,mirror?.08:.3,.55);
  ring(r,GOLD,0,.65,0,.43,.43,.43,PI/2);
  if(!mirror){ring(r,accent,0,.65,0,.47,.47,.47,PI/2,.7,PI/4,.4);ring(r,GOLD,0,.65,0,.5,.5,.5,.3,.2,.6);}
  grip(r,DARK_METAL,.17);rod(r,GOLD,0,.27,0,.07,.18,.07);
 }
}
function bow(r,id,accent){
 for(let i=0;i<7;i++){const a=-1.3+i*.43;part(r,'box',GOLD,Math.cos(a)*.5-.25,.95+Math.sin(a)*.85,0,.05,.2,.05,0,0,-a-.2);}
 box(r,'#f2e6c9',-.12,.96,.025,.014,.82,.012);
 rod(r,WOOD,0,.75,0,.045,.25,.045);
 group(r,.08,1.05,.06,0,0,PI/2,()=>{rod(r,WOOD,0,.25,0,.018,.65,.018);cone(r,accent,0,.98,0,.075,.12,.025);});
}
function ornament(r,id,accent){
 if(id==='bell'||/bell|gong/.test(id)){
  grip(r,GOLD,.18);cone(r,GOLD,0,.73,0,.39,.45,.39);ring(r,DARK_GOLD,0,.31,0,.4,.5,.4);ball(r,accent,0,.24,0,.13,.14,.13,.15);ring(r,GOLD,0,1.24,0,.14,.14,.14,PI/2);
 }else if(id==='bottle'||/gourd|bottle|flask/.test(id)){
  ball(r,accent,0,.46,0,.35,.4,.29);ball(r,accent,0,.98,0,.24,.28,.21);rod(r,GOLD,0,1.25,0,.11,.09,.11);ring(r,GOLD,0,.78,0,.21,.5,.21);
  box(r,'#f8dda0',0,.45,.28,.16,.16,.025);
 }else if(id==='lotus'||/lotus|lamp|lantern/.test(id)){
  grip(r,GOLD,.22);rod(r,GOLD,0,.43,0,.05,.32,.05);
  for(let i=0;i<6;i++){const a=i*TAU/6;part(r,'sphere',accent,Math.cos(a)*.24,.72,Math.sin(a)*.24,.14,.28,.12,0,a,.35);}
  ball(r,'#fff2bd',0,.85,0,.17,.24,.17,.8);ring(r,GOLD,0,.5,0,.36,.5,.36);
 }else if(id==='drum'||/drum/.test(id)){
  rod(r,'#bd655c',0,.72,0,.4,.21,.4,PI/2);
  for(const z of [-.22,.22]){rod(r,'#f4d8ac',0,.72,z,.39,.025,.39,PI/2);ring(r,GOLD,0,.72,z,.41,.41,.41,PI/2);}
  grip(r,WOOD,.22);
 }else if(id==='guitar'||/lute|pipa|guitar/.test(id)){
  ball(r,accent,0,.52,0,.33,.42,.12);ball(r,accent,0,.9,0,.24,.28,.11);box(r,WOOD,0,1.38,0,.065,.4,.06);
  for(const x of [-.06,0,.06])box(r,GOLD,x,1,.13,.007,.64,.006);
  box(r,GOLD,0,.5,.13,.17,.035,.02);
 }else if(id==='brush'||/brush|pen/.test(id)){
  grip(r,WOOD,.38);rod(r,DARK_METAL,0,.6,0,.065,.61,.065);rod(r,GOLD,0,1.21,0,.09,.08,.09);cone(r,'#eee7d5',0,1.59,0,.16,.32,.12);cone(r,'#273e49',0,1.85,0,.07,.15,.06);
 }else if(/scroll|book/.test(id)){
  box(r,accent,0,.55,0,.37,.43,.08);box(r,'#f1e1b9',0,.55,.085,.29,.34,.015);for(const x of [-.37,.37])rod(r,GOLD,x,.55,0,.07,.48,.07);
  for(let i=0;i<3;i++)box(r,DARK_GOLD,0,.35+i*.17,.107,.17,.012,.006);
 }else orb(r,id,accent);
}

export const WEAPON_MODEL_IDS=Object.freeze([
 'bamboo','brick','pan','slipper','fish','fan','nunchaku','hammer','umbrella','pepper','guitar','spoon',
 'chain','spear','saber','staff','rake','bell','bottle','brush','trident','axe','moonblade','chain-sickle','lotus','drum','blade','orb',
 'jade-staff','prayer-beads','meteor-hammer','forge-gauntlet','thorn-whip','bloom-blade','falcon-bow','wind-spear',
 'imperial-sword','royal-seal','sand-saber','scorpion-dagger','bronze-halberd','ruin-disc','venom-scythe','mire-lantern',
 'frost-axe','snow-bow','lava-greatsword','ember-hammer','astral-orb','comet-staff','thunder-spear','storm-bell',
 'cloud-fan','sky-ribbon','dragon-cannon','iron-shield','heaven-seal','void-twinblades','dawn-sword','phoenix-feather'
]);
const SIGNATURE_MATERIALS={
 'jade-staff':'#8fcab4','prayer-beads':'#c8b385','meteor-hammer':'#9e9db5','forge-gauntlet':'#e7a069',
 'thorn-whip':'#91b78c','bloom-blade':'#d99dbb','falcon-bow':'#d6bc82','wind-spear':'#99c9ba',
 'imperial-sword':'#c0a4dd','royal-seal':'#b299d1','sand-saber':'#dec080','scorpion-dagger':'#baa5c8',
 'bronze-halberd':'#b8b184','ruin-disc':'#9cc7b4','venom-scythe':'#a7c795','mire-lantern':'#b3a3d4',
 'frost-axe':'#9dd9eb','snow-bow':'#c6e9ec','lava-greatsword':'#f09a70','ember-hammer':'#eeb074',
 'astral-orb':'#b6acf0','comet-staff':'#c7c4ed','thunder-spear':'#abd9f1','storm-bell':'#9ec2e5',
 'cloud-fan':'#b1dacf','sky-ribbon':'#c9b3de','dragon-cannon':'#ddab78','iron-shield':'#a8bbc7',
 'heaven-seal':'#e4cf9d','void-twinblades':'#b59bd4','dawn-sword':'#f0cfa0','phoenix-feather':'#e8a081'
};
function newSignature(r,id,accent){
 if(id==='prayer-beads'){
  ring(r,'#9f8463',0,.55,0,.49,.49,.49,PI/2);
  for(let i=0;i<10;i++){const a=i*TAU/10;ball(r,i%3?accent:GOLD,Math.cos(a)*.48,.55+Math.sin(a)*.48,0,.095);}
  cone(r,'#bd795e',0,-.14,0,.12,.19,.05,0,0,PI);return true;
 }
 if(id==='forge-gauntlet'){
  box(r,DARK_METAL,0,.42,0,.3,.38,.19);box(r,accent,0,.7,.18,.32,.13,.08);
  for(let i=0;i<3;i++)ball(r,GOLD,(i-1)*.2,.81,.08,.13,.15,.19);
  ball(r,accent,.34,.3,.03,.17,.23,.18);rod(r,GOLD,0,.06,0,.33,.07,.22);ball(r,'#ffe2a8',0,.43,.22,.12,.14,.045,.45);return true;
 }
 if(id==='thorn-whip'){
  grip(r,'#6a7957',.32);
  const points=[[.02,.42,0],[.16,.74,.03],[.46,.95,.03],[.77,.94,0],[1,.72,-.03],[1.05,.44,-.04]];
  for(let i=0;i<points.length-1;i++){
   const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   rod(r,'#78976c',(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,.045,length/2,.045,0,0,-Math.atan2(dx,dy));
   cone(r,accent,b[0],b[1]+.08,b[2],.055,.14,.04,0,0,i%2?.7:-.7);
  }return true;
 }
 if(id==='ruin-disc'){
  rod(r,'#849b8d',0,.65,0,.45,.055,.45,PI/2);ring(r,GOLD,0,.65,.07,.47,.47,.47,PI/2);
  ball(r,accent,0,.65,.1,.2,.2,.08,.4);
  for(let i=0;i<6;i++){const a=i*TAU/6;box(r,GOLD,Math.sin(a)*.31,.65+Math.cos(a)*.31,.12,.035,.09,.018,0,0,-a);}return true;
 }
 if(id==='sky-ribbon'){
  grip(r,GOLD,.21);
  for(let i=0;i<7;i++){const u=i/6,x=Math.sin(u*PI*1.5)*.4,y=.28+u*1.58;box(r,i%2?accent:'#ede2da',x,y,Math.cos(u*TAU)*.1,.12,.16,.025,0,u*.5,Math.cos(u*PI*1.5)*-.7);}
  ball(r,GOLD,0,.3,0,.1);return true;
 }
 if(id==='dragon-cannon'){
  grip(r,WOOD,.24);
  rod(r,DARK_METAL,0,.8,0,.23,.68,.23);
  for(const y of [.3,.65,1.25])rod(r,GOLD,0,y,0,.27,.055,.27);
  ring(r,GOLD,0,1.49,0,.27,.8,.27);rod(r,'#172e3b',0,1.494,0,.19,.012,.19);
  ball(r,'#de9f68',0,.54,.18,.3,.25,.15);
  for(const side of [-1,1]){ball(r,'#ddc283',side*.17,.69,.29,.085,.06,.05,.15);cone(r,GOLD,side*.24,.92,.12,.06,.2,.06,0,0,-side*.3);}
  return true;
 }
 if(id==='iron-shield'){
  ball(r,'#6f8496',0,.65,0,.47,.61,.12);
  ring(r,METAL,0,.65,.02,.48,.4,.62,PI/2);
  box(r,GOLD,0,.65,.13,.055,.47,.027);box(r,GOLD,0,.65,.13,.36,.045,.027);
  ball(r,accent,0,.65,.19,.17,.22,.06,.2);return true;
 }
 if(id==='void-twinblades'){
  for(const side of [-1,1])group(r,side*.25,.15,0,0,0,-side*.16,()=>{
   r.scale(.7,.7,.7);sword(r,id,side<0?'#ac91d4':'#a7c4de');
  });return true;
 }
 if(id==='phoenix-feather'){
  rod(r,GOLD,0,.6,0,.035,.84,.035);
  for(let i=0;i<6;i++){const y=.4+i*.23,side=i%2?1:-1;part(r,'sphere',i%3?accent:'#ebc789',side*.13,y,0,.13,.27,.035,0,0,-side*.45);}
  cone(r,'#f9dca1',0,1.82,0,.11,.23,.04,0,0,0,.3);return true;
 }
 return false;
}

export function drawWeapon(r,id,options={}){
 if(!id||id==='fists'||id==='burst')return;
 id=String(id);const h=hash(id),accent=options.color||SIGNATURE_MATERIALS[id]||weaponColors[h%weaponColors.length],scale=finite(options.scale,1);
 r.push();r.scale(scale,scale,scale);
 if(drawCraftedWeapon(r,id,accent)){
  // Forged blades, cast fittings and carved bodies have physical surface detail.
 }else if(newSignature(r,id,accent)){
  // Unique silhouettes use purpose-built geometry above.
 }else if(id==='bamboo'){
  rod(r,'#658e64',0,.65,0,.065,.95,.065);
  for(const y of [-.12,.3,.75,1.2,1.55])rod(r,'#adc185',0,y,0,.09,.025,.09);
  cone(r,'#d5daa0',0,1.74,0,.065,.15,.065);
 }else if(id==='brick'){
  box(r,'#b87058',0,.42,0,.38,.22,.17);box(r,'#d7946b',0,.64,0,.36,.015,.16);
  for(const x of [-.17,.17])box(r,'#8f5347',x,.4,.176,.012,.15,.008);
 }else if(id==='pan'){
  grip(r,DARK_METAL,.3);rod(r,DARK_METAL,0,.47,0,.07,.3,.07);
  rod(r,'#63726f',0,1,0,.43,.07,.43,PI/2);ring(r,METAL,0,1,.06,.43,.43,.43,PI/2);rod(r,'#263943',0,1,.085,.34,.025,.34,PI/2);
 }else if(id==='slipper'){
  ball(r,'#d894a1',0,.58,0,.24,.56,.09);box(r,'#edd7c7',0,.5,.09,.19,.13,.06);ball(r,'#efbfca',0,.7,.13,.19,.16,.09);
 }else if(id==='fish'){
  ball(r,'#8dafc5',0,.7,0,.23,.62,.13);cone(r,'#6c93ad',0,.1,0,.28,.17,.1,0,0,PI);
  cone(r,'#c5d9df',.18,.65,0,.13,.24,.05,0,0,-.65);ball(r,'#fff1ca',.1,1.08,.11,.06);ball(r,'#243543',.11,1.09,.15,.027);
 }else if(id==='nunchaku'){
  for(const side of [-1,1]){cone(r,'#eaa05d',side*.2,.63,0,.1,.48,.1,0,0,side*.14);cone(r,'#79a675',side*.26,1.17,0,.08,.17,.04,0,0,side*.3);}
  for(let i=0;i<3;i++)ring(r,DARK_METAL,(i-1)*.12,.12,0,.08,.08,.08,PI/2,i%2?PI/2:0);
 }else if(id==='hammer')axe(r,'war-hammer',accent);
 else if(id==='umbrella'){
  rod(r,WOOD,0,.65,0,.04,.9,.04);cone(r,'#d8a4b0',0,1.5,0,.84,.25,.84);ring(r,'#f0c7c4',0,1.27,0,.84,.3,.84);
  for(let i=0;i<6;i++){const a=i*TAU/6;group(r,0,1.47,0,0,a,0,()=>{box(r,GOLD,.42,-.1,0,.43,.012,.012,0,0,-.23);});}
  ball(r,GOLD,0,1.79,0,.055,.12,.055);
 }else if(id==='pepper'){
  ball(r,'#d86655',0,.65,0,.2,.49,.16);cone(r,'#df6554',.07,.15,0,.14,.28,.11,0,0,.3);rod(r,'#5c8d60',-.04,1.17,0,.06,.15,.06,0,0,-.4);cone(r,'#8bb376',.13,1.19,0,.09,.2,.035,0,0,-.9);
 }else if(id==='spoon'){
  rod(r,GOLD,0,.6,0,.06,.84,.045);ball(r,'#e8c783',0,1.58,0,.33,.43,.09);ball(r,'#b78d48',0,1.61,.075,.26,.34,.03);
 }else if(id==='chain'){
  grip(r,WOOD,.3);for(let i=0;i<4;i++)ring(r,METAL,0,.4+i*.16,0,.09,.09,.09,PI/2,i%2?PI/2:0);
  ball(r,'#99724e',0,1.35,0,.32,.37,.29);for(const x of [-.24,.24])cone(r,GOLD,x,1.37,0,.08,.2,.08,0,0,-Math.sign(x)*PI/2);
 }else if(id==='rake'){
  grip(r,WOOD,.35);rod(r,WOOD,0,.7,0,.05,.76,.05);box(r,DARK_METAL,0,1.39,0,.55,.06,.07);
  for(let i=0;i<9;i++)box(r,METAL,(i-4)*.12,1.6,0,.025,.2,.04);
 }else if(id==='moonblade'||/ring|chakram|wheel/.test(id)){
  for(const side of [-1,1]){ring(r,METAL,side*.22,.7,0,.35,.35,.35,PI/2);box(r,accent,side*.22,.41,0,.14,.045,.055);}
 }else if(id==='chain-sickle'||/sickle|scythe/.test(id)){
  const poison=id==='venom-scythe',steel=poison?'#a6c7a2':METAL;
  grip(r,poison?'#536b54':WOOD,.35);rod(r,DARK_METAL,0,.63,0,.055,.6,.055);box(r,steel,.25,1.2,0,.3,.09,.04,0,0,-.2);cone(r,steel,.56,1.08,0,.1,.26,.04,0,0,-2.1,poison?.15:0);
  for(let i=0;i<3;i++)ring(r,poison?accent:GOLD,-.12-i*.12,-.24-i*.08,0,.08,.08,.08,PI/2,i%2?PI/2:0);
  if(poison)ball(r,accent,0,1.14,.075,.12,.12,.045,.4);
 }else if(spearIds.has(id)||/spear|trident|halberd|lance/.test(id))spear(r,id,accent);
 else if(fanIds.has(id)||/fan/.test(id))fan(r,id,accent);
 else if(staffIds.has(id)||/staff|rod|pole/.test(id))staff(r,id,accent);
 else if(axeIds.has(id)||/axe|hammer|mace|maul/.test(id))axe(r,id,accent);
 else if(bowIds.has(id)||/bow/.test(id))bow(r,id,accent);
 else if(orbIds.has(id)||/orb|seal|mirror|pearl/.test(id))orb(r,id,accent);
 else if(['bell','bottle','lotus','drum','guitar','brush'].includes(id)||/bell|drum|gourd|lamp|lantern|flask|scroll|book|lute|pipa/.test(id))ornament(r,id,accent);
 else if(swordIds.has(id)||/sword|saber|blade|dagger/.test(id))sword(r,id,accent);
 else{
  // Deterministic fallback still has a distinct silhouette for new equipment IDs.
  const build=[sword,spear,axe,staff,fan,ornament][h%6];build(r,id,accent);
 }
 weaponFinishing(r,id,accent);r.pop();
}

function bossArmor(r,f,p,time){
 const chapter=Math.max(0,finite(f.chapter)),style=typeof f.bossStyle==='string'?hash(f.bossStyle)%6:chapter%6,big=f.chapterBoss===true;
 const accent=['#a9d5bd','#eac281','#e0a1c9','#92c8dc','#c4a7ef','#f09d76'][chapter%6];
 const shell=['#456777','#637454','#6b4d72','#476c87','#626080','#704f48'][chapter%6];
 // Breastplate, clasps, belt, sculpted shoulder pieces and a raised back silhouette.
 ball(r,shell,0,1.57,.34,.55,.56,.19);
 rod(r,GOLD,0,1.15,0,.65,.07,.45);
 ball(r,accent,0,1.73,.56,.13,.17,.055,.3);
 for(const side of [-1,1]){
  part(r,'sphere',shell,side*.6,2.01,.08,.32,.22,.31,0,0,-side*.16);
  cone(r,GOLD,side*.77,2.17,.06,.1,.23,.1,0,0,-side*.46);
  box(r,GOLD,side*.31,1.37,.5,.035,.29,.03,0,0,-side*.12);
 }
 // Capes are shallow solid geometry and receive the same lighting as the body.
 box(r,style===1?'#b8764f':style===3?'#567d94':'#934f5c',0,1.38,-.45,.58,.77,.045,-.13,0,0);
 box(r,GOLD,0,.63,-.55,.58,.035,.06,0,0,0);
 if(big){
  rod(r,shell,0,3.05,0,.78,.12,.62);
  ring(r,GOLD,0,3.16,0,.73,.3,.57);
  for(let i=0;i<5;i++){const a=(i-2)*.43;cone(r,GOLD,Math.sin(a)*.68,3.38,Math.cos(a)*.48,.115,.24,.115,0,0,-a*.2);}
  ball(r,accent,0,3.32,.61,.14,.18,.06,.55);
 }else{
  rod(r,shell,0,3.02,-.06,.72,.065,.58);
  cone(r,GOLD,0,3.3,0,.16,.26,.14);
 }
 if(style===0||style===4){
  for(const side of [-1,1]){cone(r,style===4?accent:GOLD,side*.72,3.25,-.04,.15,.37,.15,0,0,-side*.45);ball(r,shell,side*.57,2.72,.26,.16,.34,.16);}
 }else if(style===1){
  for(const side of [-1,1])box(r,GOLD,side*.27,2.83,.58,.26,.07,.07,0,0,side*.16);
 }else if(style===2){
  for(const side of [-1,1]){part(r,'sphere',accent,side*.64,2.78,-.16,.22,.5,.12,0,0,-side*.6);cone(r,GOLD,side*.9,2.87,-.2,.13,.18,.07,0,0,-side*.8);}
 }else if(style===3){
  for(let i=0;i<3;i++){cone(r,accent,(i-1)*.27,3.32,-.22,.12,.4+(i===1?.15:0),.12,0,0,(i-1)*-.2,.15);}
 }else{
  ring(r,GOLD,0,2.4,-.55,.96,.96,.96,PI/2,0,0,.2);
  for(const side of [-1,1])ball(r,accent,side*.86,2.4,-.54,.1,.15,.1,.7);
 }
 if(f.phase>=2||f.bossPhase>=2){
  ring(r,accent,0,1.6,-.57,.86,.86,.86,PI/2,0,time*.3,.7);
  cone(r,accent,0,3.5,-.12,.16,.4,.16,0,0,0,.6);
 }
}

export function drawCharacter(r,fighter={},pose={},options={}){
 drawHero(r,fighter,pose,options,{drawWeapon,drawBossArmor:bossArmor});
}

export const ARENA_THEMES={
 bamboo:{name:'青竹镖台',floor:'#79918a',edge:'#354e50',trim:'#d8c397',stone:'#b4bda8',sky:'#c6dcd2',accent:'#8db996'},
 market:{name:'烟火灯市',floor:'#aa8c76',edge:'#634e49',trim:'#e1bd7c',stone:'#d5b891',sky:'#e4cbb2',accent:'#de8065'},
 blossom:{name:'桃花玉阶',floor:'#baa5ae',edge:'#6a596e',trim:'#e5c5a0',stone:'#d7c6cc',sky:'#e6d4de',accent:'#df9fbd'},
 river:{name:'寒江船擂',floor:'#78959f',edge:'#334e66',trim:'#b1d3d3',stone:'#aec6cc',sky:'#bdcfdc',accent:'#85d6e3'},
 tournament:{name:'五派会武',floor:'#b8a681',edge:'#665342',trim:'#e5c47e',stone:'#d3c9a8',sky:'#e7dbc2',accent:'#ca795c'},
 monastery:{name:'听禅石庭',floor:'#a5b2a0',edge:'#506354',trim:'#cfba85',stone:'#d4d4bb',sky:'#d3dfd0',accent:'#b1c590'},
 forge:{name:'百炼熔炉',floor:'#8b7d75',edge:'#3e424b',trim:'#c9935d',stone:'#ac9f91',sky:'#c8ada2',accent:'#f39b67'},
 garden:{name:'碧水月庭',floor:'#8caea6',edge:'#4b6a69',trim:'#ddc9a5',stone:'#d5dcd0',sky:'#d3e4dc',accent:'#9dd7c3'},
 cliff:{name:'绝壁栈道',floor:'#a39886',edge:'#59594e',trim:'#d9bb86',stone:'#bbb9a7',sky:'#d8e0d9',accent:'#b7c5a5'},
 palace:{name:'琉璃王庭',floor:'#a999b5',edge:'#574c6c',trim:'#e3c481',stone:'#d3c6dc',sky:'#d8d1e6',accent:'#bfa6e9'},
 desert:{name:'流沙古道',floor:'#ccb07b',edge:'#8a674e',trim:'#e7cf92',stone:'#e3c991',sky:'#ead8b2',accent:'#e9b16c'},
 ruins:{name:'失落古城',floor:'#999b94',edge:'#505e5a',trim:'#c9b89b',stone:'#b9c1ae',sky:'#cdd6d0',accent:'#90c6b5'},
 marsh:{name:'幽泽莲台',floor:'#8e9b9b',edge:'#43565c',trim:'#baa4ba',stone:'#b4c2ba',sky:'#bfcfd0',accent:'#b1a2d1'},
 snow:{name:'霜雪冰宫',floor:'#b5cfd8',edge:'#58768e',trim:'#dce9eb',stone:'#d9e9e9',sky:'#d5e7ee',accent:'#95d9ef'},
 volcano:{name:'赤焰熔岩',floor:'#8a7774',edge:'#423e48',trim:'#d79767',stone:'#a29891',sky:'#cbb0ac',accent:'#f59969'},
 observatory:{name:'摘星观台',floor:'#8e92b4',edge:'#464967',trim:'#dccb8e',stone:'#c6c9df',sky:'#c5cbe3',accent:'#b9b0f0'},
 storm:{name:'风雷云顶',floor:'#899ca8',edge:'#435266',trim:'#c7d3bc',stone:'#b8ccd0',sky:'#bdccda',accent:'#a6d6f0'},
 sky:{name:'浮空仙桥',floor:'#b1c7c2',edge:'#617e88',trim:'#e1d39e',stone:'#dce4d5',sky:'#d8e9e6',accent:'#a6dbd1'},
 citadel:{name:'玄铁王城',floor:'#8e929d',edge:'#3b485c',trim:'#c5ae7c',stone:'#bac0c9',sky:'#c1ccdc',accent:'#d39891'},
 celestial:{name:'归元天穹',floor:'#b6acbe',edge:'#66587e',trim:'#ecdb9b',stone:'#e6ddec',sky:'#e3dcf0',accent:'#d0b5f1'}
};
export const ARENA_THEME_IDS=Object.freeze(Object.keys(ARENA_THEMES));
export function arenaTheme(chapter={}){
 const index=Math.max(0,finite(chapter.index,finite(chapter.chapter)));
 const id=ARENA_THEMES[chapter.arenaTheme]?chapter.arenaTheme:ARENA_THEME_IDS[index%ARENA_THEME_IDS.length];
 return {...ARENA_THEMES[id],id,index};
}

function pillar(r,x,z,p,height=2.9){
 rod(r,p.edge,x,height/2,z,.2,height/2,.2);
 for(const y of [.14,height-.17])rod(r,p.trim,x,y,z,.31,.12,.31);
 ball(r,p.trim,x,height+.02,z,.24,.12,.24);
}
function lantern(r,x,y,z,p,scale=1,time=0){
 group(r,x,y,z,0,0,Math.sin(time*.7+x)*.025,()=>{
  rod(r,p.trim,0,.5*scale,0,.022,.18*scale,.022);
  ball(r,p.accent,0,0,0,.24*scale,.34*scale,.24*scale,.12);
  for(const sy of [-.3,.3])rod(r,p.trim,0,sy*scale,0,.17*scale,.04*scale,.17*scale);
  rod(r,p.trim,0,-.43*scale,0,.024,.11*scale,.024);
 });
}
function gate(r,p,{width=5,y=3.7,z=-4.7,roof=true}={}){
 for(const x of [-width/2,width/2])pillar(r,x,z,p,y);
 box(r,p.edge,0,y-.24,z,width/2+.4,.16,.24);
 if(roof){
  box(r,p.trim,0,y+.02,z,width/2+.65,.09,.46);
  box(r,p.edge,0,y+.23,z,width/2+.37,.12,.33);
  for(const side of [-1,1])box(r,p.edge,side*(width/2+.46),y+.16,z,.32,.09,.44,0,0,side*.24);
 }
}
function tree(r,x,z,p,{blossom=false,snow=false,height=3.5}={}){
 const trunk='#795d4b',leaves=snow?'#e9f1e8':blossom?p.accent:'#7c9b7d';
 rod(r,trunk,x,height*.35,z,.17,height*.35,.18,0,0,.08);
 for(const side of [-1,1])rod(r,trunk,x+side*.3,height*.62,z,.1,height*.2,.1,0,0,-side*.7);
 for(let i=0;i<5;i++){const a=i*2.1;ball(r,leaves,x+Math.cos(a)*.58,height*.76+(i%2)*.32,z+Math.sin(a)*.34,.72,.56,.63);}
}
function bamboo(r,x,z,height=4.1){
 const c='#709978';
 rod(r,c,x,height*.5,z,.09,height*.5,.09);
 for(let i=1;i<5;i++)rod(r,'#acc093',x,height*i/5,z,.12,.035,.12);
 for(let i=0;i<4;i++){const side=i%2?1:-1;cone(r,'#8db38a',x+side*.3,height*.55+i*.33,z,.13,.52,.045,0,i*.7,-side*.7);}
}
function mountain(r,x,z,p,height=3.4,snow=false){
 cone(r,p.edge,x,height*.38-.5,z,1.7,height*.6,1.35,0,x*.1);
 if(snow)cone(r,'#e8f0e7',x,height*.76,z,.66,height*.27,.55,0,x*.1);
}
function banners(r,p,x=5.7,z=-3.6){
 for(const side of [-1,1]){
  pillar(r,side*x,z,p,3.9);
  box(r,p.accent,side*(x-.3),2.75,z,.43,.84,.045,0,0,-side*.04);
  box(r,p.trim,side*(x-.3),2.75,z+.055,.24,.035,.012);
  cone(r,p.trim,side*(x-.3),1.87,z,.43,.2,.045,0,0,PI);
 }
}
function platform(r,p,id){
 const wood=['market','river','cliff'].includes(id),round=['bamboo','blossom','garden','marsh','observatory','sky','celestial'].includes(id);
 if(round){
  rod(r,p.edge,0,-.34,0,6.4,.34,2.65);
  rod(r,p.floor,0,-.045,0,6.3,.065,2.55);
  ring(r,p.trim,0,.026,0,5.9,.25,2.3);
  ring(r,p.trim,0,.034,0,.95,.24,.75);
 }else{
  box(r,p.edge,0,-.34,0,6.4,.34,2.6);
  box(r,p.floor,0,-.045,0,6.3,.065,2.5);
  for(const side of [-1,1])box(r,p.trim,0,.035,side*2.4,6.18,.026,.035);
  for(const side of [-1,1])box(r,p.trim,side*6.18,.035,0,.035,.026,2.4);
 }
 if(wood){
  for(let i=0;i<12;i++)box(r,i%2?'#987a5b':'#a78b6b',(i-5.5)*1.03,.039,0,.49,.009,2.33);
 }else{
  for(let iz=-1;iz<=1;iz++)for(let ix=-4;ix<=4;ix++){
   if(round&&Math.abs(ix)===4&&Math.abs(iz)===1)continue;
   box(r,(ix+iz)%3===0?p.stone:p.floor,ix*1.32,.029,iz*1.02,.63,.012,.46);
  }
 }
 // A shallow deck, carved front fascia and centered steps read clearly at eye level.
 for(const x of [-5.65,5.65])for(const z of [-1.7,1.7])rod(r,p.trim,x,.04,z,.1,.06,.1);
 if(!round){
  box(r,p.trim,0,-.15,2.625,6.22,.024,.025);
  for(let i=-4;i<=4;i++)box(r,p.stone,i*1.22,-.4,2.625,.4,.12,.024);
 }
 box(r,p.edge,0,-.7,2.85,1.5,.12,.42);
 box(r,p.floor,0,-.57,2.85,1.46,.025,.39);
 box(r,p.edge,0,-.9,3.22,1.72,.1,.38);
 box(r,p.stone,0,-.79,3.22,1.68,.025,.35);
}
function ambientBase(r,p){
 rod(r,p.sky,0,-1.12,-1,11,.3,8);
 for(const side of [-1,1])box(r,p.stone,side*7.2,-.53,-1,.42,.23,1.05,0,0,side*.15);
}

export function drawArena(r,chapter={},time=0){
 const p=arenaTheme(chapter),id=p.id,t=finite(time);
 r.push();r.scale(ARENA_LENGTH_SCALE,1,1);ambientBase(r,p);platform(r,p,id);r.pop();
 banners(r,p,9.2,-3.3);
 if(id==='bamboo'){
  for(const [x,z,h] of [[-5.9,-4,4.2],[-4.9,-5.2,3.6],[5.6,-4.6,4.8],[6.5,-3.2,3.5]])bamboo(r,x,z,h);
  gate(r,p,{width:4.8,y:3.7});for(const x of [-2.5,2.5])lantern(r,x,2.9,-4.65,p,.8,t);
 }else if(id==='market'){
  for(const side of [-1,1]){
   const x=side*5.1,z=-4.45;
   for(const sx of [-.9,.9])rod(r,'#805a43',x+sx,1.45,z,.07,1.45,.07);
   box(r,'#bf745c',x,2.9,z,1.23,.11,.75,0,0,-side*.08);
   box(r,p.trim,x,.97,z+.15,1.13,.13,.58);
   for(let i=0;i<4;i++)ball(r,['#edbc7a','#a7b67a','#e2a27e','#d8d29c'][i],x+(i-1.5)*.42,1.22,z+.35,.18,.2,.17);
   lantern(r,x,3.4,z,p,.8,t);
  }
  box(r,WOOD,0,3.5,-5.3,3.2,.025,.025);
  for(let i=0;i<7;i++)cone(r,i%2?p.accent:p.trim,(i-3)*.8,3.25,-5.3,.22,.22,.03,0,0,PI);
 }else if(id==='blossom'){
  tree(r,-5.6,-4.4,p,{blossom:true});tree(r,5.7,-4.2,p,{blossom:true,height:4});
  gate(r,p,{width:4.8,y:3.45});
  for(const x of [-3.6,3.6]){rod(r,p.stone,x,.4,-3.25,.36,.4,.36);lantern(r,x,1.35,-3.25,p,.85,t);}
  for(let i=0;i<7;i++)ball(r,p.accent,(i-3)*1.25,.07,-1.9+(i%3)*.43,.065,.022,.045);
 }else if(id==='river'){
  rod(r,'#6e9fab',0,-.83,-1,10,.09,7);
  for(let i=0;i<8;i++)rod(r,WOOD,(i-3.5)*1.7,.36,-3.4,.11,.72,.11);
  box(r,WOOD,0,1.07,-3.4,6.25,.075,.09);
  for(const x of [-5.7,-2.8,2.8,5.7])lantern(r,x,1.8,-3.5,p,.75,t);
  gate(r,p,{width:4.8,y:3.65,z:-6.5});
  for(let i=0;i<4;i++)box(r,'#bad2cc',(i-1.5)*3,.02-.85,-5-(i%2),1.1,.015,.07,0,0,.04);
 }else if(id==='tournament'){
  gate(r,p,{width:5.5,y:4.1});banners(r,p);
  for(const side of [-1,1])for(let i=0;i<3;i++)box(r,p.stone,side*5.7,.25+i*.32,-5.3-i*.48,1.3,.16,.36);
  rod(r,GOLD,0,.5,-5.4,.55,.5,.55);ball(r,GOLD,0,1.34,-5.4,.53,.48,.53);ring(r,GOLD,0,1.9,-5.4,.38,.38,.38,PI/2);
 }else if(id==='monastery'){
  gate(r,p,{width:5.4,y:3.65});
  box(r,p.edge,0,4.13,-4.7,2.17,.12,.48);box(r,p.trim,0,4.33,-4.7,1.7,.07,.36);
  for(const x of [-5.2,5.2])tree(r,x,-4.4,p,{height:3.6});
  rod(r,'#7d8b73',0,.58,-4.3,.58,.35,.46);cone(r,GOLD,0,1.03,-4.3,.67,.15,.52);ball(r,GOLD,0,1.25,-4.3,.12);
 }else if(id==='forge'){
  for(const side of [-1,1]){
   const x=side*5.2;
   rod(r,DARK_METAL,x,1.15,-4.3,.9,1.15,.74);cone(r,p.edge,x,2.68,-4.3,.8,.48,.67);
   box(r,'#f1a36b',x,.7,-3.59,.44,.48,.045,0,0,0,.65);
   rod(r,p.edge,x,3.5,-4.3,.3,.52,.3);
   box(r,DARK_METAL,x,.6,-2.2,.45,.17,.29);box(r,DARK_METAL,x,.93,-2.2,.68,.14,.31);box(r,DARK_METAL,x,.33,-2.2,.3,.19,.24);
  }
  for(let i=0;i<5;i++)ball(r,['#b8a17a','#c89065','#d5b887'][i%3],-3.6+i*1.8,.22,-4.8,.35,.24,.29);
 }else if(id==='garden'){
  for(const side of [-1,1]){
   box(r,p.stone,side*4,1.6,-5.1,2,.9,.25);box(r,p.edge,side*4,2.55,-5.1,2.17,.07,.39);
   tree(r,side*5.7,-3.6,p,{blossom:side===1,height:3.3});
  }
  ring(r,p.trim,0,1.8,-5.1,1.48,1.48,1.48,PI/2);
  rod(r,'#83bcb2',-5.7,-.25,-.2,.9,.04,.85);
  for(let i=0;i<5;i++){const a=i*TAU/5;ball(r,'#a4c9ac',-5.7+Math.cos(a)*.45,-.19,-.2+Math.sin(a)*.4,.24,.02,.19);}
 }else if(id==='cliff'){
  for(const side of [-1,1]){mountain(r,side*7.2,-4.5,p,4.6);mountain(r,side*4.5,-7.2,p,3.8);}
  for(let i=0;i<7;i++)rod(r,WOOD,(i-3)*1.9,.6,-3.5,.09,.65,.09);
  box(r,WOOD,0,1.21,-3.5,5.8,.055,.07);box(r,WOOD,0,.52,-3.5,5.8,.035,.055);
  for(const side of [-1,1])box(r,WOOD,side*6.7,-.68,0,.36,.45,2.9,0,0,-side*.12);
 }else if(id==='palace'){
  gate(r,p,{width:7,y:4.2});gate(r,p,{width:4.7,y:4.9,z:-6.7});
  for(const side of [-1,1]){pillar(r,side*5.9,-3.8,p,3.6);lantern(r,side*5.9,3,-3.8,p,1,t);}
  for(let i=0;i<3;i++)box(r,p.stone,0,-.03+i*.16,-4-i*.48,2.5-i*.15,.1,.38);
 }else if(id==='desert'){
  for(const side of [-1,1]){
   ball(r,'#d9b984',side*6.8,-.6,-4.3,2.7,.8,2);
   rod(r,p.edge,side*5.7,1.65,-4.8,.43,1.65,.43);
   cone(r,p.trim,side*5.7,3.65,-4.8,.43,.35,.43);
   box(r,p.trim,side*5.7,2,-4.35,.21,.035,.015);
  }
  gate(r,p,{width:4.6,y:3.25,z:-6,roof:false});
  for(let i=0;i<4;i++)cone(r,p.stone,(i-1.5)*2.2,-.1,-6.6,.5,.8,.4,0,0,(i-1.5)*.18);
 }else if(id==='ruins'){
  for(const [x,z,h] of [[-5.7,-3.6,2.2],[-3.7,-5.4,3.4],[4,-5,2.8],[6,-3.2,1.8]]){
   pillar(r,x,z,p,h);box(r,p.stone,x+.2,h+.12,z,.48,.17,.4,0,0,.16);
  }
  box(r,p.edge,0,3.6,-5.2,3.1,.24,.35,0,0,-.06);
  for(let i=0;i<5;i++){const a=i*TAU/5;cone(r,p.accent,Math.cos(a)*1.2,2.6+Math.sin(a)*.8,-5.5,.16,.27,.16,0,a,a*.2,.2);}
  ring(r,p.trim,0,2.5,-5.5,1.5,1.5,1.5,PI/2);
 }else if(id==='marsh'){
  rod(r,'#788d8e',0,-.8,-1,10,.09,7);
  for(const side of [-1,1]){
   tree(r,side*6,-4.3,{...p,accent:'#9da5a0'},{height:3.7});
   for(let i=0;i<3;i++){const x=side*(4.6+i*.65),z=-3.1+(i%2)*1.1;rod(r,'#c7c8ab',x,.46,z,.12,.46,.12);ball(r,i%2?'#b59ac4':'#a2b0a7',x,.93,z,.57,.27,.49);}
  }
  for(let i=0;i<4;i++)ball(r,p.accent,(i-1.5)*2.8,.3+Math.sin(t*.7+i)*.06,-4.8,.065,.11,.065,.45);
 }else if(id==='snow'){
  for(const [x,z,h] of [[-6.8,-5,5],[-3.8,-7,4],[5.7,-5.3,4.7],[7.5,-3.6,3.5]])mountain(r,x,z,p,h,true);
  for(const x of [-5.6,5.6]){cone(r,'#a3d8e7',x,1.3,-3.6,.45,1.3,.4,0,.25);cone(r,'#d4f0ed',x+.3,.7,-3.1,.27,.7,.23,0,-.4);}
  ring(r,'#eaf7ee',0,.06,0,4.1,.24,2.05,0,0,0,.1);
 }else if(id==='volcano'){
  for(const side of [-1,1]){
   mountain(r,side*6.9,-5,p,4.1);
   for(let i=0;i<3;i++)rod(r,i%2?p.edge:'#5a4c50',side*(4.8+i*.65),.8+i*.35,-4+i*.3,.36,.8+i*.35,.34);
  }
  for(let i=0;i<7;i++){const a=i*TAU/7;box(r,p.accent,Math.cos(a)*3.4,.049,Math.sin(a)*1.8,.58,.009,.035,0,-a,0,.35);}
  rod(r,'#e78e5d',0,-.8,-3,8,.06,4,0,0,0,.4);
  for(let i=0;i<4;i++)ball(r,'#ffbd7e',(i-1.5)*2.6,.6+(i%2)*.5,-4.8,.11,.19,.11,.65);
 }else if(id==='observatory'){
  for(const x of [-5.6,5.6])pillar(r,x,-3.8,p,3.7);
  group(r,0,2.8,-5.3,.2,t*.035,.3,()=>{
   ring(r,p.trim,0,0,0,1.7,1.7,1.7,PI/2);
   ring(r,p.trim,0,0,0,1.45,1.45,1.45,.3,.7,.3);
   ring(r,p.accent,0,0,0,1.1,1.1,1.1,PI/2,1,.6,.2);
   ball(r,'#e7dbad',0,0,0,.35,.35,.35,.4);
   for(let i=0;i<5;i++){const a=i*TAU/5;ball(r,weaponColors[i],Math.cos(a)*1.7,Math.sin(a)*1.7,0,.13,.13,.13,.15);}
  });
 }else if(id==='storm'){
  for(const side of [-1,1]){
   pillar(r,side*5.5,-4,p,3.4);cone(r,p.trim,side*5.5,4,-4,.1,.5,.1);
   for(let i=0;i<3;i++)ball(r,'#8e9dab',side*(4.5+i*.65),4.5+(i%2)*.2,-6,.85,.4,.55);
  }
  group(r,0,3.4,-5.8,0,0,-.15,()=>{
   box(r,'#c7edfb',-.12,.4,0,.095,.55,.08,0,0,-.35,.55);
   box(r,'#c7edfb',0,0,0,.31,.09,.08,0,0,.15,.55);
   box(r,'#c7edfb',.12,-.4,0,.095,.55,.08,0,0,-.35,.55);
  });
 }else if(id==='sky'){
  for(const side of [-1,1]){
   for(let i=0;i<4;i++)ball(r,'#e8f1e6',side*(5.2+i*.7),-.5+(i%2)*.25,-4.6,.88,.4,.74);
   cone(r,p.stone,side*6.1,-1.3,-4.5,1.3,1.2,1,PI);
   pillar(r,side*5.6,-4,p,2.9);
  }
  for(let i=0;i<5;i++)box(r,p.stone,0,.1+i*.17,-4-i*.6,1.7-i*.1,.09,.25);
  ring(r,p.trim,0,3.6,-6,1.3,1.3,1.3,PI/2,0,0,.12);
 }else if(id==='citadel'){
  for(const side of [-1,1]){
   const x=side*5.6;
   box(r,p.edge,x,1.9,-5.3,1.3,1.9,.7);cone(r,'#6f6070',x,4.2,-5.3,1.45,.7,.95);
   for(let i=0;i<3;i++)box(r,p.stone,x+(i-1)*.7,3.68,-4.65,.2,.23,.2);
   box(r,p.accent,x,2,-4.55,.3,.9,.035);cone(r,p.trim,x,1.05,-4.55,.3,.2,.035,0,0,PI);
  }
  gate(r,p,{width:4.2,y:4,z:-5.5,roof:false});
  for(let i=0;i<3;i++)box(r,p.stone,(i-1)*1.3,3.9,-5.5,.3,.19,.3);
 }else{
  for(const side of [-1,1]){
   cone(r,p.stone,side*5.7,1.45,-4.3,.52,1.45,.4,0,.2);
   cone(r,p.accent,side*5.7,3.2,-4.3,.25,.46,.2,0,.2,0,.25);
   ring(r,p.trim,side*5.7,2.7,-4.3,.65,.65,.65,PI/2,0,0,.15);
  }
  group(r,0,3.7,-6.3,0,t*.025,0,()=>{
   for(let i=0;i<3;i++)ring(r,i%2?p.accent:p.trim,0,0,0,1.65-i*.26,1.65-i*.26,1.65-i*.26,PI/2+i*.4,i*.5,i*.3,.15);
   ball(r,'#fff0c8',0,0,0,.4,.4,.4,.6);
  });
  for(let i=0;i<5;i++)box(r,p.stone,(i%2?-.35:.35),.15+i*.24,-3.9-i*.55,1.2,.095,.25,0,0,(i%2?1:-1)*.025);
 }
}
