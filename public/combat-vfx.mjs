import {NEW_ARTS,NEW_SKILLS} from './armory.mjs?v=2.4.0';
// All effects are deterministic samples of the existing combat clock; no independent timers.
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
export const ART_FX={
 'cloud-fists':{shape:'fists',color:'#8ceaff',name:'流云连拳'},
 sweep:{shape:'cyclone',color:'#92ebcb',name:'回风扫堂腿'},
 'flying-kick':{shape:'swallow',color:'#75d6ff',name:'燕子穿云踢'},
 palm:{shape:'bagua',color:'#efcd78',name:'八卦游身掌'},
 'flip-kick':{shape:'koi',color:'#faac90',name:'鲤鱼翻身踢'},
 shoulder:{shape:'mountain',color:'#dbaa65',name:'震山铁靠'},
 straight:{shape:'tiger',color:'#ffb665',name:'伏虎冲拳'},
 whirlwind:{shape:'tornado',color:'#b3a1ff',name:'旋风连环腿'},
 'tiger-roar':{shape:'roar',color:'#ffcf73',name:'虎啸崩拳'},
 'twin-wind':{shape:'twin',color:'#a6f4e0',name:'双风贯耳'},
 'earth-kick':{shape:'earth',color:'#d8b37a',name:'伏地弹腿'},
 crane:{shape:'crane',color:'#c5f6ff',name:'白鹤穿云'},
 'dragon-elbow':{shape:'dragon',color:'#79e2ba',name:'游龙顶肘'},
 'falling-star':{shape:'meteor',color:'#c7a3ff',name:'落星锤'},
 'spring-palm':{shape:'lotus',color:'#98efb3',name:'回春绵掌'},
 'sun-finger':{shape:'sunbeam',color:'#ffba62',name:'烈阳指'}
};
export const BURST_FX={penguin:{shape:'ice',color:'#8eeaff',name:'冰山小拳拳'},panda:{shape:'mountain',color:'#edcc80',name:'泰山压顶抱'},cat:{shape:'claws',color:'#ffa86b',name:'喵喵连环爪'},rabbit:{shape:'rain',color:'#ffaec8',name:'萝卜流星雨'}};
// Passive seals are shown when their actual benefit applies, not advertised as separate attacks.
export const PASSIVE_FX={wind:['风','#8ce9d4'],focus:['会','#ffd582'],iron:['钟','#f9d481'],fury:['怒','#ffab78'],thorns:['棘','#c7a4ff'],renew:['愈','#9debc0'],comeback:['逆','#ff977e'],leech:['元','#adf2c7'],keen:['明','#ffedac'],piercing:['破','#8fdcfa'],oak:['木','#b4da95'],flow:['流','#9be2f0'],ward:['山','#ded0a0'],breath:['春','#a4edb4'],ironwill:['清','#abc9ff'],ruthless:['追','#a9eddf'],momentum:['叠','#96cfff'],borrow:['摘','#cbb1ff'],laststand:['生','#ffd4a2'],clearsky:['虚','#d1bbff']};
for(const art of NEW_ARTS)ART_FX[art.id]={shape:art.fx,color:art.color,name:art.name};
for(const [i,skill]of NEW_SKILLS.entries())PASSIVE_FX[skill.id]=[skill.name[0],['#badbbf','#e4c78a','#bdb4e3','#9ad7e3'][i%4]];
export function profileFor(e){
 if(e.bossSkill)return{shape:e.bossSkill.kind,color:e.bossSkill.color,name:e.bossSkill.name};
 if(e.kind==='burst')return BURST_FX[e.before[e.actor].pet]||BURST_FX.penguin;
 if(e.kind==='martial')return ART_FX[e.artId]||Object.values(ART_FX).find(v=>v.name===e.name)||ART_FX['cloud-fists'];
 if(e.before[e.actor].relic&&e.kind==='attack')return{shape:'celestial',color:'#dcb2ff',name:'无极天印'};
 if(['pepper','saber'].includes(e.weapon))return{shape:'flame',color:'#ff9d54',name:''};
 if(['fish','frost'].includes(e.weapon))return{shape:'ice',color:'#9be8ff',name:''};
 if(['guitar','bell'].includes(e.weapon))return{shape:'notes',color:'#e5b6ff',name:''};
 return{shape:['smash','hammer-fist','slam'].includes(e.move)?'earth':e.move==='thrust'?'sunbeam':'slash',color:e.crit?'#ffd26f':'#fff3c2',name:''};
}
export function passiveCues(e){
 const list=[],a=e.actor,b=e.target,A=e.before[a],B=e.before[b],skills=A.skills||[],other=B.skills||[];
 const add=(id,who,yes)=>{if(yes&&(who===a?skills:other).includes(id))list.push({id,who});};
 const art=['martial','burst'].includes(e.kind),hit=!e.dodged&&e.damage>0,attack=['attack','martial','burst','throw'].includes(e.kind);
 add('wind',b,e.dodged&&attack);add('focus',a,e.crit);add('iron',b,e.absorbed>0);add('oak',b,e.absorbed>0);add('fury',a,attack);
 add('thorns',b,e.counter>0);add('renew',a,e.heal>0);add('breath',a,e.heal>0);add('leech',a,e.heal>0&&hit);
 add('comeback',a,hit&&A.hp<A.maxHp*.35);add('keen',a,hit);add('piercing',a,hit);add('flow',a,art&&!A.held&&hit);
 add('ward',b,hit);add('ironwill',a,e.burn>0);add('ironwill',b,e.notes?.some(n=>n.includes('清心定神')));
 add('ruthless',a,hit&&B.hp<B.maxHp*.3);add('momentum',a,e.notes?.some(n=>n.includes('三叠浪')));
 add('borrow',a,['steal','disarm'].includes(e.kind)&&e.tacticSuccess);add('clearsky',a,art&&hit);
 for(const r of e.revives||[])add('laststand',r.who,true);
 add('comboheart',a,hit&&e.hits>1);add('bloodpact',a,e.heal>0&&A.hp<A.maxHp*.4);add('emberheart',a,e.notes?.some(n=>n.includes('灼烧')));add('shieldflow',a,e.notes?.some(n=>n.includes('护盾')));add('counterflow',b,e.counter>0);add('riposte',a,hit&&!!B.bossCharge);add('bareheart',a,art&&!A.held&&hit);add('weaponmaster',a,hit&&e.kind==='attack'&&!!A.held);add('tactician',a,['steal','disarm'].includes(e.kind)&&e.tacticSuccess);add('calmheart',a,attack);add('executioner',a,hit&&B.hp<B.maxHp*.2);add('regenheart',a,e.heal>0&&A.hp<A.maxHp*.5);add('stormstep',b,e.dodged);add('iceguard',b,e.crit);add('burnmaster',a,hit&&B.burnTurns>0);add('lifebloom',a,e.heal>0);add('piercemaster',a,hit);add('battlefocus',a,e.crit&&A.rage>=100);add('resolve',b,hit&&B.hp<B.maxHp*.3);add('celestial',a,e.kind==='burst');
 return list;
}
export function vfxFrame(s,v,time){
 const p=clamp(time/s.t.duration),e=s.event,attack=!['pickup','discard','stunned','burn','steal','boss-charge'].includes(e.kind),art=['martial','burst','boss-skill'].includes(e.kind);
 const charge=attack&&art?Math.sin(clamp((p-.08)/.32)*Math.PI):0;
 const strike=attack?Math.sin(clamp((p-.28)/.36)*Math.PI):0;
 const impacts=(e.hits>1&&!e.dodged?[.4,.53]:[.4]).map(at=>({age:(p-at)*s.t.duration,at})).filter(x=>attack&&!e.dodged&&x.age>=0&&x.age<600);
 return{p,charge,strike,impacts,art,profile:profileFor(e),cues:passiveCues(e),anchor:v.actorHand,hit:v.hitPoint,dir:s.dir};
}
function path(ctx,pts,color,width=2,alpha=1){ctx.globalAlpha=clamp(alpha);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function circle(c,x,y,r,color,w=2,alpha=1){if(r<=0)return;c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();}
function ellipse(c,x,y,rx,ry,color,w=2,a=1,rotation=0){if(rx<=0||ry<=0)return;c.globalAlpha=clamp(a);c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.stroke();}
function glow(c,x,y,r,color,alpha){if(r<=0||alpha<=0)return;c.globalAlpha=clamp(alpha);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff8df');g.addColorStop(.18,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function shard(c,x,y,r,angle,color,alpha){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=clamp(alpha);c.fillStyle=color;c.beginPath();c.moveTo(0,-r);c.lineTo(r*.35,0);c.lineTo(0,r);c.lineTo(-r*.35,0);c.closePath();c.fill();c.restore();}
function arc(c,x,y,r,start,end,color,w,a){c.globalAlpha=clamp(a);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.arc(x,y,r,start,end);c.stroke();}
function rune(c,x,y,r,t,color,alpha){circle(c,x,y,r,color,2,alpha);circle(c,x,y,r*.8,color,1,alpha*.7);for(let i=0;i<8;i++){const a=i*TAU/8+t;c.save();c.translate(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9);c.rotate(a);path(c,[[0,-5],[0,5]],color,3,alpha);c.restore();}}
// Each silhouette is deliberately different: wings, fish, dragon, flowers, fists, etc.
function signature(c,shape,x,y,r,t,color,alpha,dir){
 c.save();c.translate(x,y);c.scale(dir,1);
 const line=(pts,w=3,a=alpha)=>path(c,pts,color,w,a);
 switch(shape){
 case 'fists': for(let i=0;i<5;i++){const q=i/5,xx=-r+q*r*2,yy=Math.sin(q*TAU+t*7)*r*.4;c.save();c.translate(xx,yy);c.rotate(-.2);c.globalAlpha=alpha*(.35+q*.6);c.fillStyle=color;c.fillRect(-r*.18,-r*.1,r*.4,r*.2);for(let j=0;j<4;j++)circle(c,r*.2,-r*.09+j*r*.06,r*.055,'#fff8e1',2,alpha);c.restore();}break;
 case 'cyclone':case 'tornado':for(let i=0;i<6;i++)ellipse(c,0,r*.55-i*r*.22,r*(.45+i*.1),r*.15,color,3,alpha*(1-i*.1),shape==='cyclone'?-.25:Math.sin(t*9+i)*.15);break;
 case 'swallow':case 'crane':line([[-r,-r*.6],[-r*.6,-r*.15],[-r*.24,-r*.2],[0,r*.1],[r*.24,-r*.2],[r*.6,-r*.15],[r,-r*.6]],6);line([[-r*.7,-r*.6],[-r*.4,-r*.1],[0,r*.15],[r*.4,-r*.1],[r*.7,-r*.6]],2);line([[0,r*.1],[r*.2,-r*.4],[r*.36,-r*.55],[r*.6,-r*.45]],3);line([[0,r*.1],[-r*.3,r*.5],[0,r*.3],[r*.15,r*.55]],3);break;
 case 'bagua':case 'celestial':rune(c,0,0,r,t*4,color,alpha);circle(c,0,0,r*.5,'#fff8de',4,alpha);arc(c,0,-r*.25,r*.25,-Math.PI/2,Math.PI/2,color,7,alpha);arc(c,0,r*.25,r*.25,Math.PI/2,Math.PI*1.5,color,7,alpha);if(shape==='celestial'){for(let i=0;i<5;i++)line([[-r*1.4,r*(i-2)*.4],[r*1.4,r*(i-2)*.4]],2,alpha*.5);}break;
 case 'koi':c.rotate(t*6);ellipse(c,0,0,r*.8,r*.34,color,5,alpha,-.5);line([[-r*.7,r*.25],[-r*1.2,0],[-r*.95,r*.6],[-r*.7,r*.25]],4);circle(c,r*.5,-r*.2,4,'#fff7dc',3,alpha);for(let i=0;i<3;i++)arc(c,-i*r*.2,0,r*.25,-.9,.9,color,2,alpha);break;
 case 'mountain':case 'earth':for(let i=0;i<3;i++){let xx=(i-1)*r*.55;line([[xx-r*.5,r*.5],[xx,-r*(i===1?1:.6)],[xx+r*.5,r*.5]],i===1?7:3);}for(let i=0;i<6;i++){const a=i*Math.PI/5;line([[0,r*.5],[Math.cos(a)*r*.6,r*.5+Math.sin(a)*r*.15],[Math.cos(a)*r*1.4,r*.5+Math.sin(a)*r*.38]],2);}break;
 case 'tiger':case 'roar':line([[-r*.7,-r*.1],[-r*.8,-r*.8],[-r*.35,-r*.55],[0,-r*.7],[r*.35,-r*.55],[r*.8,-r*.8],[r*.7,-r*.1],[r*.4,r*.5],[0,r*.7],[-r*.4,r*.5],[-r*.7,-r*.1]],4);line([[-r*.48,-r*.2],[-r*.18,-r*.08]],5);line([[r*.48,-r*.2],[r*.18,-r*.08]],5);line([[-r*.22,r*.28],[0,r*.43],[r*.22,r*.28]],4);for(let i=0;i<3;i++)line([[-r*.2,-r*(.45-i*.13)],[r*.2,-r*(.45-i*.13)]],3);if(shape==='roar')for(let i=0;i<3;i++)circle(c,0,0,r*(1.1+i*.35),color,3,alpha*(1-i*.25));break;
 case 'twin':for(const sign of [-1,1]){c.save();c.translate(sign*r*.55,Math.sin(t*10)*r*.1);ellipse(c,0,0,r*.26,r*.42,color,4,alpha);for(let i=0;i<4;i++)line([[(i-1.5)*r*.14,-r*.2],[(i-1.5)*r*.14,-r*(.68-Math.abs(i-1.5)*.07)]],5);c.restore();}break;
 case 'dragon':{const pts=[];for(let i=0;i<=28;i++){const q=i/28;pts.push([-r*1.3+q*r*2.4,Math.sin(q*TAU*1.4-t*4)*r*.32]);}line(pts,12,alpha*.3);line(pts,4);const [hx,hy]=pts.at(-1);line([[hx-r*.25,hy-r*.15],[hx,hy-r*.36],[hx+r*.3,hy-r*.18],[hx+r*.45,hy],[hx+r*.2,hy+r*.15],[hx,hy+r*.3]],4);line([[hx,hy-r*.3],[hx-r*.15,hy-r*.65],[hx+r*.13,hy-r*.45]],3);circle(c,hx+r*.16,hy-r*.1,3,'#fff4d0',3,alpha);break;}
 case 'meteor':case 'rain':for(let i=0;i<(shape==='rain'?9:4);i++){const q=((t*2+i*.17)%1),xx=(i%3-1)*r*.8-q*r*.6,yy=-r*1.5+q*r*2.7;line([[xx+r*.65,yy-r],[xx,yy]],7,alpha*.5);shard(c,xx,yy,r*.18,.6,color,alpha);if(shape==='rain')line([[xx,yy-r*.12],[xx-r*.12,yy-r*.32],[xx,yy-r*.25],[xx+r*.14,yy-r*.36]],2);}break;
 case 'lotus':for(let i=0;i<8;i++){const a=i*TAU/8+t;c.save();c.rotate(a);ellipse(c,0,-r*.38,r*.19,r*.47,color,3,alpha);c.restore();}circle(c,0,0,r*.18,'#fff4cb',4,alpha);break;
 case 'flame':for(let i=0;i<7;i++){const xx=(i-3)*r*.25,yy=r*.5,hh=r*(.7+(i%3)*.3);line([[xx-r*.18,yy],[xx-r*.1,yy-hh*.45],[xx+r*.1,yy-hh],[xx+r*.2,yy-hh*.3],[xx+r*.25,yy]],7,alpha*.8);}break;
 case 'notes':for(let i=0;i<4;i++){const xx=(i-1.5)*r*.55,yy=Math.sin(i+t*5)*r*.4;ellipse(c,xx,yy,r*.14,r*.09,color,5,alpha,-.3);line([[xx+r*.12,yy],[xx+r*.12,yy-r*.6],[xx+r*.35,yy-r*.45]],3);}for(let i=0;i<3;i++)arc(c,0,0,r*(.8+i*.25),-.8,.8,color,2,alpha);break;
 case 'sunbeam':circle(c,0,0,r*.36,'#fff3c9',5,alpha);for(let i=0;i<12;i++){const a=i*TAU/12+t;line([[Math.cos(a)*r*.5,Math.sin(a)*r*.5],[Math.cos(a)*r,Math.sin(a)*r]],3);}break;
 case 'ice':for(let i=0;i<7;i++){const xx=(i-3)*r*.33,rr=r*(.65+(i%3)*.18);line([[xx-r*.18,r*.55],[xx,-rr],[xx+r*.2,r*.55],[xx-r*.18,r*.55]],3);shard(c,xx,-rr*.4,rr*.4,0,'#dffaff',alpha*.4);}break;
 case 'claws':for(let i=0;i<4;i++)line([[-r,r*(i*.35-.9)],[-r*.2,r*(i*.3-.3)],[r*.8,r*(i*.25+.1)]],9-i,alpha);break;
 default:for(let i=0;i<3;i++)arc(c,0,0,r*(.7+i*.18),-.9+t,1.3+t,color,7-i*2,alpha*(1-i*.2));
 }
 c.restore();
}
export function drawBattleEffects(c,s,v,time){
 const f=vfxFrame(s,v,time),{width,height}=s.layout,e=s.event,col=f.profile.color,p=f.p,unit=Math.max(32,Math.min(85,s.A.width*.6)),A={x:s.A.x+v.position.x,y:s.A.top+s.A.height*.56+v.position.y},B=v.hitPoint;
 c.clearRect(0,0,width,height);c.save();c.beginPath();c.rect(0,92,width,Math.max(0,height-92));c.clip();
 // Tint is restricted to the fighting area; health bars and landscape remain readable.
 if(f.art&&f.strike>0){c.globalAlpha=f.strike*.14;c.fillStyle='#271d3f';c.fillRect(0,94,width,height-94);}
 if(f.charge>0){glow(c,A.x,A.y,unit*1.7,col,f.charge*.33);ellipse(c,A.x,s.A.top+s.A.height,unit*1.25,unit*.3,col,3,f.charge);rune(c,A.x,A.y,unit*(.55+f.charge*.4),p*8,col,f.charge*.8);for(let i=0;i<14;i++){const a=i*TAU/14+p*8,r=unit*(1.7-f.charge);shard(c,A.x+Math.cos(a)*r,A.y+Math.sin(a)*r,4,a,col,f.charge*.8);}}
 if(f.strike>0){
  const q=clamp((p-.28)/.12),x=mix(v.actorHand.x,B.x,q),y=mix(v.actorHand.y,B.y,q),scale=f.art?1.5: .95;
  // A tapered, curved slash links the hand to its target, then the signature blooms on contact.
  if(!['earth','mountain'].includes(f.profile.shape)){
   c.globalAlpha=f.strike*.4;c.strokeStyle=col;c.lineWidth=f.art?13:7;c.beginPath();c.moveTo(v.actorHand.x-f.dir*unit*.45,v.actorHand.y+unit*.25);c.quadraticCurveTo(x-f.dir*unit*.4,y-unit*.8,x,y);c.stroke();
   path(c,[[v.actorHand.x,v.actorHand.y],[x,y]],'#fff9df',2,f.strike*.8);
  }
  c.shadowColor=col;c.shadowBlur=f.art?16:9;
  if(f.art){
   const halo=c.createRadialGradient(x,y,0,x,y,unit*1.6);halo.addColorStop(0,col+'55');halo.addColorStop(1,col+'00');c.globalAlpha=f.strike*.65;c.fillStyle=halo;c.fillRect(x-unit*1.6,y-unit*1.6,unit*3.2,unit*3.2);
   // Directional rush lines make the charge legible at a glance without covering the HUD.
   for(let i=0;i<7;i++){const yy=y+(i-3)*unit*.24,lead=x-f.dir*unit*(.4+(i%3)*.17);path(c,[[lead-f.dir*unit*(1.7+f.strike*.8),yy],[lead,yy]],col,i%2?2:4,f.strike*.35);}
  }
  if(f.profile.shape==='sunbeam'){path(c,[[x-f.dir*unit*2.8,y],[x+f.dir*unit*1.7,y]],col,17,f.strike*.65);path(c,[[x-f.dir*unit*2.8,y],[x+f.dir*unit*1.7,y]],'#fff9db',5,f.strike);}
  signature(c,f.profile.shape,x,y,unit*scale*(.8+f.strike*.3),p,col,f.strike*(e.dodged?.45:1),f.dir);
  c.shadowBlur=0;
 }
 if(v.projectile){const w=v.projectile;for(let i=1;i<=7;i++)shard(c,w.x-f.dir*i*8,w.y+i*1.4,Math.max(1,8-i),.8,col,(1-i/8)*.65);}
 for(const {age} of f.impacts){
  const q=age/600,fade=1-q,r=unit*(.3+q*2.4)*(e.kind==='burst'?1.4:1);
  glow(c,B.x,B.y,unit*(.6+q),col,fade*.42);
  circle(c,B.x,B.y,r,col,Math.max(1,6*(1-q)),fade*.8);ellipse(c,B.x,B.y,r*1.3,r*.45,'#fff4cc',2,fade*.6,-.3*f.dir);
  const count=f.art?26:14;
  for(let i=0;i<count;i++){const a=i*2.399+e.step*.3,speed=.55+(i%5)*.16,rr=unit*(.2+q*2.8)*speed;const xx=B.x+Math.cos(a)*rr,yy=B.y+Math.sin(a)*rr+q*q*38;shard(c,xx,yy,(2+i%4)*(1-q),a+q*3,i%3?col:'#fffbe4',fade);}
  if(f.art||['smash','slam'].includes(e.move)){const ground=s.B.top+s.B.height;ellipse(c,B.x,ground,r*1.6,Math.max(2,r*.22),col,3,fade*.8);for(let i=0;i<7;i++){const a=i*Math.PI/3.5;path(c,[[B.x,ground],[B.x+Math.cos(a)*r*.6,ground+Math.sin(a)*r*.16],[B.x+Math.cos(a+.1)*r,ground+Math.sin(a+.1)*r*.22]],'#b99769',2,fade*.7);}}
 }
 if(e.dodged&&p>.32&&p<.65){const q=(p-.32)/.33;for(let i=0;i<3;i++)ellipse(c,B.x-f.dir*i*13,B.y,unit*.5,unit*.75,'#bcebdc',2,(1-q)*.5);}
 if(e.absorbed&&p>.4&&p<.68)rune(c,B.x,B.y,unit*.9,p*3,'#ffe5a3',Math.sin((p-.4)/.28*Math.PI));
 if(e.heal&&p>.4&&p<.85){const q=(p-.4)/.45;for(let i=0;i<5;i++){const x=A.x+(i-2)*unit*.32,y=A.y+unit*.4-q*unit*1.3-(i%2)*12;path(c,[[x-4,y],[x+4,y]],'#8fe9b4',3,Math.sin(q*Math.PI));path(c,[[x,y-4],[x,y+4]],'#8fe9b4',3,Math.sin(q*Math.PI));}}
 if(e.weaponEvent&&p>.4&&p<.72){const q=(p-.4)/.32;circle(c,v.targetHand.x,v.targetHand.y,unit*(.3+q),e.kind==='steal'?'#d4b0ff':'#ffe5a2',3,1-q);}
 if(e.kind==='burn'||e.burn){const q=Math.sin(p*Math.PI);for(let i=0;i<6;i++)shard(c,A.x+(i-2.5)*10,A.y+25-p*35-(i%3)*6,10*q,.2,'#ffaf62',q*.7);}
 if(e.kind==='stunned')for(let i=0;i<3;i++){const a=p*TAU+i*TAU/3;shard(c,A.x+Math.cos(a)*unit*.6,A.y-unit*.7+Math.sin(a)*8,6,a,'#ffe596',.85);}
 if(p>.41&&p<.85){
  const fade=Math.sin((p-.41)/.44*Math.PI),counts=[0,0];
  for(const cue of f.cues){const who=cue.who,n=counts[who]++,box=s.layout.fighters[who],off=who===e.actor?v.position:v.targetPosition;const [glyph,color]=PASSIVE_FX[cue.id];const x=box.x+off.x+(n%4-1.5)*24,y=box.top+off.y+box.height+8+Math.floor(n/4)*20;
   circle(c,x,y,9,color,1,fade*.9);c.globalAlpha=fade;c.fillStyle=color;c.font='bold 12px sans-serif';c.textAlign='center';c.fillText(glyph,x,y+4);
  }
 }
 if(e.before[e.actor].relic){rune(c,A.x,A.y,unit*1.1,p*2,'#dec1ff',Math.sin(p*Math.PI)*.35);}
 c.restore();c.globalAlpha=1;
 return f;
}
export function createBattleVfx(layer){
 if(!layer)return{render(){},destroy(){}};
 const canvas=document.createElement('canvas');canvas.className='battle-vfx';canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext?.('2d');if(!ctx)return{render(){},destroy(){}};
 layer.append(canvas);let w=0,h=0,dpr=0;
 return{render(s,v,time,reduced){const ratio=Math.min(2,globalThis.devicePixelRatio||1),width=s.layout.width,height=s.layout.height;
  if(width!==w||height!==h||ratio!==dpr){w=width;h=height;dpr=ratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
  if(reduced){
   ctx.clearRect(0,0,w,h);const f=vfxFrame(s,v,time),color=f.profile.color,unit=Math.max(24,Math.min(50,s.A.width*.4));
   if(f.strike>.001){const q=clamp((f.p-.29)/.11),x=mix(v.actorHand.x,v.hitPoint.x,q),y=mix(v.actorHand.y,v.hitPoint.y,q);path(ctx,[[v.actorHand.x-f.dir*unit*.4,v.actorHand.y+unit*.25],[x-f.dir*unit*.2,y-unit*.4],[x,y]],color,4,f.strike*.8);}
   for(const impact of f.impacts){const q=impact.age/600;circle(ctx,v.hitPoint.x,v.hitPoint.y,unit*(.25+q*1.5),color,3,1-q);}
   ctx.globalAlpha=1;return;
  }drawBattleEffects(ctx,s,v,time);
 },destroy(){canvas.remove();}};
}
