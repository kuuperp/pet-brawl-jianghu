const PI=Math.PI,TAU=PI*2;
const GOLD='#cfa65d',DARK='#273b49',STEEL='#c7d9df',IVORY='#eee2c7';
const METAL={roughness:.22,metalness:.86,texture:4},BRONZE={roughness:.3,metalness:.76,texture:4},WOOD={roughness:.57,texture:5},SILK={roughness:.63,texture:2},GEM={roughness:.16,metalness:.18,texture:6};
function p(r,kind,c,x,y,z,sx,sy=sx,sz=sx,rz=0,material=METAL,rx=0,ry=0,light=0){r.push();r.translate(x,y,z);if(rx)r.rotateX(rx);if(ry)r.rotateY(ry);if(rz)r.rotateZ(rz);r.scale(sx,sy,sz);r.mesh(kind,c,light,1,'normal',material);r.pop();}
const ball=(r,c,x,y,z,sx,sy=sx,sz=sx,m=METAL)=>p(r,'sphere',c,x,y,z,sx,sy,sz,0,m);
const rod=(r,c,x,y,z,radius,length,rz=0,m=METAL)=>p(r,'cylinder',c,x,y,z,radius,length,radius,rz,m);
const ring=(r,c,x,y,z,size,rx=0,rz=0)=>p(r,'torus',c,x,y,z,size,size,size,rz,BRONZE,rx);
function group(r,x,y,z,angle,fn){r.push();r.translate(x,y,z);r.rotateZ(angle);fn();r.pop();}
function strap(r,c,x,y,z,length,angle=0){p(r,'lapel',c,x,y,z,.055,length,.035,angle,SILK);}
function grip(r,accent,length=.27){
 rod(r,'#5b4541',0,0,0,.066,length,0,WOOD);
 for(let i=0;i<7;i++){const y=-length+.04+i*(length*2-.08)/6;p(r,'torus',i%2?accent:'#79635a',0,y,0,.070,.18,.070,0,SILK);}
 rod(r,GOLD,0,-length,0,.09,.04);rod(r,GOLD,0,length,0,.09,.035);ball(r,GOLD,0,-length-.075,0,.10,.075,.08);p(r,'gem-cut',accent,0,-length-.08,.065,.044,.047,.025,0,GEM);
}
function jewel(r,x,y,z,color,size=.07){p(r,'gem-cut',color,x,y,z,size,size*1.25,size*.48,0,GEM);for(const side of [-1,1])ball(r,GOLD,x+side*size*.75,y,z,.018,.045,.024);}
function engraving(r,color,y,width=.075,height=.10){for(const side of [-1,1])for(let i=0;i<3;i++)p(r,'bevel-box',color,side*(width*.6-i*.008),y+i*.085,.059,.009,height*.44,.006,side*.50,BRONZE);}
function sword(r,id,accent){
 const broad=/great|blade$/.test(id)&&!id.includes('twin'),curved=/saber|scorpion/.test(id),short=/dagger/.test(id),fire=/lava|ember/.test(id),steel=id==='dawn-sword'?'#e6d3a3':fire?'#8b777b':/frost/.test(id)?'#c7e7ed':STEEL,width=broad?.19:short?.12:.11,len=short?.52:broad?.83:.77;
 grip(r,accent);for(const side of [-1,1]){p(r,'lapel',GOLD,side*.17,.32,0,.09,.18,.075,-side*1.12,BRONZE);ball(r,GOLD,side*.3,.30,0,.045,.04,.055);}
 p(r,'bevel-box',DARK,0,.43,0,width*1.04,.105,.064);p(r,curved?'blade-dao':broad?'blade-great':'blade-jian',steel,0,.52+len,0,width,len,.055,0,METAL);
 jewel(r,0,.34,.082,accent,.073);engraving(r,GOLD,.56,width,.10);
 for(const side of [-1,1])p(r,'bevel-box',accent,side*width*.24,.91,.055,.009,.24,.009,0,GEM);
 if(fire)for(let i=0;i<4;i++)p(r,'bevel-box',i%2?accent:'#ffdb9d',(i%2?.04:-.04),1.13+i*.17,.06,.014,.105,.008,i%2?-.36:.36,GEM,0,0,.16);
 if(id==='bloom-blade')for(let i=0;i<5;i++){const a=i*TAU/5;p(r,'lapel',accent,Math.sin(a)*.14,.34+Math.cos(a)*.14,.10,.065,.12,.04,-a,SILK);}
 if(id==='dawn-sword')for(const side of [-1,1])p(r,'blade-spear',GOLD,side*.12,.65,0,.045,.20,.028,-side*.38,BRONZE);
}
function spear(r,id,accent){
 const bronze=id==='bronze-halberd',metal=bronze?'#b7a171':STEEL;
 grip(r,accent,.35);rod(r,bronze?'#674a35':DARK,0,.83,0,.045,.83,0,WOOD);
 for(const y of [.42,.82,1.37,1.52])rod(r,GOLD,0,y,0,.065,.03);
 p(r,'blade-spear',metal,0,1.92,0,.15,.36,.05);jewel(r,0,1.56,.068,accent,.06);
 for(const side of [-1,1]){
  if(id==='trident'||bronze){p(r,'lapel',GOLD,side*.20,1.6,0,.075,.22,.06,-side*1.1);p(r,'blade-dao',metal,side*.33,1.9,0,.10,.26,.036,-side*.18);}
  else strap(r,accent,side*.10,1.30,.06,.20,side*.26);
 }
}
function hammer(r,id,accent){
 grip(r,accent,.3);rod(r,'#674933',0,.64,0,.053,.66,0,WOOD);p(r,'bevel-box',DARK,0,1.23,0,.46,.25,.23);
 for(const side of [-1,1]){p(r,'bevel-box',STEEL,side*.45,1.23,0,.065,.26,.24);p(r,'bevel-box',GOLD,side*.34,1.23,.23,.026,.20,.018);}
 jewel(r,0,1.23,.26,accent,.13);for(const x of [-.25,.25])for(const y of [1.08,1.38])ball(r,GOLD,x,y,.25,.025);
 if(id==='meteor-hammer')for(let i=0;i<4;i++)ring(r,GOLD,0,.30+i*.12,0,.075,PI/2,i%2?PI/2:0);
}
function axe(r,id,accent){
 grip(r,accent,.31);rod(r,DARK,0,.66,0,.058,.72,0,WOOD);p(r,'bevel-box',GOLD,0,1.25,0,.12,.23,.10);
 for(const side of [-1,1])group(r,side*.36,1.27,0,0,()=>{r.scale(side,1,1);p(r,'axe-blade',id==='frost-axe'?'#c9e9f0':STEEL,0,0,0,.34,.45,.8);p(r,'lapel',accent,-.12,0,.067,.055,.27,.025,0,GEM);for(let i=0;i<3;i++)p(r,'bevel-box',GOLD,-.08+i*.09,-.14+i*.04,.073,.035,.009,.006,.25);});
 jewel(r,0,1.25,.12,accent,.08);
}
function staff(r,id,accent){
 grip(r,accent,.29);rod(r,id==='jade-staff'?'#6da98e':DARK,0,.77,0,.062,.97,0,id==='jade-staff'?GEM:WOOD);
 for(const y of [-.2,.35,.95,1.57]){rod(r,GOLD,0,y,0,.079,.04);for(let i=0;i<3;i++)p(r,'bevel-box',IVORY,(i-1)*.034,y,.075,.009,.023,.009);}
 for(const side of [-1,1])p(r,'lapel',GOLD,side*.12,1.81,0,.08,.23,.07,-side*.6);p(r,'gem-cut',accent,0,1.92,0,.18,.23,.14,0,GEM);
 for(const side of [-1,1])ring(r,GOLD,side*.21,1.70,.02,.09,PI/2);
}
function bow(r,id,accent){
 p(r,'bow-limb',id==='snow-bow'?'#d1e5e6':'#a47747',0,.98,0,1,.87,1,0,WOOD);
 for(const y of [.18,1.78]){p(r,'lapel',GOLD,-.10,y,0,.065,.13,.04,y<1?-.3:.3);ball(r,accent,-.16,y,0,.048,.07,.045,GEM);}
 rod(r,IVORY,-.15,.98,.015,.010,.87,0,SILK);rod(r,'#4e4744',.50,.98,0,.071,.19,0,WOOD);
 group(r,.04,.99,.09,-PI/2,()=>{rod(r,'#896443',0,.25,0,.015,.67,0,WOOD);p(r,'blade-spear',STEEL,0,1.02,0,.06,.14,.023);for(const side of [-1,1])p(r,'lapel',accent,side*.035,-.34,0,.045,.16,.025,-side*.18,SILK);});
}
function magic(r,id,accent){
 if(/seal/.test(id)){
  p(r,'bevel-box',id==='heaven-seal'?'#e6d8b6':'#719f95',0,.4,0,.32,.24,.26,0,GEM);p(r,'bevel-box',GOLD,0,.19,0,.35,.045,.29);
  for(const side of [-1,1])p(r,'lapel',GOLD,side*.13,.77,0,.11,.25,.08,-side*.5);jewel(r,0,.71,.08,accent,.12);engraving(r,GOLD,.33,.12,.1);
 }else if(/shield/.test(id)){
  p(r,'hero-head',DARK,0,.67,0,.48,.64,.13);p(r,'hero-head',GOLD,0,.67,.06,.425,.57,.095);p(r,'hero-head','#567c89',0,.67,.12,.37,.51,.07);jewel(r,0,.72,.21,accent,.16);
  for(const side of [-1,1])p(r,'lapel',GOLD,side*.15,.45,.20,.055,.21,.035,-side*.5);for(const y of [.28,1.03])for(const x of [-.2,.2])ball(r,GOLD,x,y,.18,.027);
 }else if(/bell/.test(id)){
  grip(r,accent,.15);p(r,'hero-head',GOLD,0,.70,0,.34,.45,.32);p(r,'cylinder',DARK,0,.30,0,.34,.025,.32);ring(r,GOLD,0,.33,0,.35);ring(r,GOLD,0,1.21,0,.115,PI/2);jewel(r,0,.75,.325,accent,.085);for(const side of [-1,1])p(r,'lapel',DARK,side*.21,.55,.27,.025,.14,.018,-side*.3);
 }else if(/lantern|lotus/.test(id)){
  grip(r,accent,.20);for(let i=0;i<7;i++){const a=i*TAU/7;p(r,'lapel',accent,Math.sin(a)*.22,.61,Math.cos(a)*.22,.15,.32,.10,0,SILK,Math.cos(a)*.4,Math.sin(a)*.4);}
  p(r,'gem-cut','#fff2b5',0,.74,0,.15,.26,.15,0,GEM);ring(r,GOLD,0,.35,0,.30);ring(r,GOLD,0,1.04,0,.15,PI/2);
 }else{
  grip(r,accent,.15);p(r,'gem-cut',accent,0,.67,0,.29,.34,.28,0,GEM);for(const a of [0,PI/3,-PI/3])p(r,'torus',GOLD,0,.67,0,.42,.42,.42,a,BRONZE,PI/2,a*.3);
  for(const side of [-1,1])p(r,'lapel',GOLD,side*.21,.37,0,.08,.23,.06,-side*.5);p(r,'gem-cut',IVORY,0,.67,.29,.055,.075,.027,0,GEM);
 }
}
export function drawCraftedWeapon(r,id,accent){
 if(id==='void-twinblades'){for(const side of [-1,1])group(r,side*.22,.06,0,-side*.12,()=>{r.scale(.72,.72,.72);sword(r,id,side<0?'#9384c9':'#85bdcb');});}
 else if(/sword|saber|dagger|blade/.test(id)&&id!=='moonblade')sword(r,id,accent);
 else if(/spear|trident|halberd/.test(id))spear(r,id,accent);
 else if(/hammer/.test(id))hammer(r,id,accent);
 else if(id==='axe'||id==='frost-axe')axe(r,id,accent);
 else if(/staff/.test(id))staff(r,id,accent);
 else if(/bow/.test(id))bow(r,id,accent);
 else if(id==='fan'||id==='cloud-fan'){grip(r,accent,.12);p(r,'folded-fan',id==='fan'?'#78a793':'#afcfc9',0,.10,0,.87,.87,1,0,SILK);for(let i=0;i<8;i++){const a=(i/7*2-1)*1.18;rod(r,GOLD,Math.sin(a)*.46,.1+Math.cos(a)*.46,.055,.011,.45,-a);ball(r,GOLD,Math.sin(a)*.86,.1+Math.cos(a)*.86,.01,.025);}jewel(r,0,.12,.08,accent,.05);}
 else if(id==='sky-ribbon'){grip(r,accent,.18);p(r,'silk-ribbon',accent,0,.23,0,1,.83,1,0,SILK);jewel(r,0,.2,.08,IVORY,.06);}
 else if(id==='moonblade'){for(const side of [-1,1]){p(r,'crescent',STEEL,side*.22,.75,0,.36,.52,.58,-side*.23);rod(r,GOLD,side*.22,.50,0,.035,.12,-side*.23);jewel(r,side*.22,.50,.07,accent,.05);}}
 else if(/orb|seal|shield|bell|lantern|lotus/.test(id))magic(r,id,accent);
 else return false;
 return true;
}
export function weaponFinishing(r,id,accent){
 if(id==='pan'){for(const x of [-.065,.065])ball(r,GOLD,x,.64,.08,.02);ring(r,GOLD,0,1,.09,.28,PI/2);}
 if(id==='bamboo')for(const side of [-1,1])p(r,'lapel','#8aac73',side*.13,1.2+side*.12,0,.06,.20,.025,-side*.55,SILK);
 if(id==='fish')for(let i=0;i<3;i++)for(const side of [-1,1])p(r,'lapel','#d6e6e7',side*.12,.55+i*.15,.105,.045,.08,.025,-side*.3,GEM);
 if(id==='guitar'){p(r,'cylinder',DARK,0,.63,.125,.10,.008,.10,0,METAL,PI/2);for(let i=0;i<3;i++)for(const side of [-1,1])ball(r,GOLD,side*.11,1.5+i*.1,0,.035);}
 if(id==='bottle'){ring(r,GOLD,0,.49,.30,.13,PI/2);jewel(r,0,.49,.32,accent,.07);}
 if(id==='brick'){p(r,'bevel-box','#a95f49',0,.42,0,.385,.225,.175,0,{roughness:.86,texture:3});engraving(r,'#dcae7a',.32,.18,.12);}
 if(id==='drum')for(let i=0;i<10;i++){const a=i*TAU/10;ball(r,GOLD,Math.sin(a)*.35,.72+Math.cos(a)*.35,.25,.025);}
 if(id==='iron-shield'||id==='royal-seal'||id==='heaven-seal')return;
 if(['spoon','rake','brush','dragon-cannon','forge-gauntlet'].includes(id)){for(let i=0;i<3;i++)ring(r,GOLD,0,.08+i*.10,0,.075);}
}
