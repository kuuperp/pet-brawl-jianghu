import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {Battle,fighterFor,freshState} from '../public/engine.mjs';
import {fighterArt,GUARD,jointTransform} from '../public/fighter-rig.mjs';
import {weaponArt} from '../public/art.mjs';
import {createCombatSequence,sampleCombat} from '../public/combat-sequence.mjs';
import {createMotionClock} from '../public/motion-clock.mjs';
const require=createRequire(import.meta.url),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp'),root=resolve(import.meta.dirname,'..'),out=resolve(root,'review');mkdirSync(out,{recursive:true});
const f={...fighterFor(freshState()),hp:2600,skills:[]},battle=new Battle({...f,weapons:['bamboo']},{...f,name:'演示对手',pet:'cat',weapons:['pan']},()=>.5),events=[];
for(let i=0;i<24&&!battle.done;i++){
 if(i===2)battle.requestTactic('disarm');if(i===4)battle.requestTactic('pickup');
 let calls=0;const unarmed=!battle.fighters[battle.actor].weapons.length;battle.rng=()=>unarmed&&calls++===0?((i%8)+.2)/8:.5;
 events.push(battle.step());
}
const layout={width:880,height:354,fighters:[{x:186,top:164,width:126,height:137},{x:694,top:164,width:126,height:137}],ground:{x:440,y:294}};
const bg=readFileSync(resolve(root,'dist/scene.svg')).toString('base64'),fps=60;
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','pipe:0','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an',resolve(out,'combat-continuity.mp4')],{stdio:['pipe','ignore','pipe']});
let ffError='';ff.stderr.on('data',b=>ffError+=b);const completed=once(ff,'close');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rig(pet,index,held,pose,opacity,position,shadowLift,tilt=0){
 let svg=fighterArt(pet,{index,enemy:index===1,held}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 for(const key of Object.keys(GUARD).filter(k=>k!=='y'))svg=svg.replace(new RegExp(`data-joint="${key}"(?: transform="[^"]*")?`),`data-joint="${key}" transform="${jointTransform(key,pose)}"`);
 svg=svg.replace(`id="held-${index}"`,`id="held-${index}" opacity="${opacity?1:0}"`);
 const shadowScale=Math.max(.55,1-shadowLift/180);svg=svg.replace('class="rig-shadow"',`class="rig-shadow" transform="translate(0 ${shadowLift*260/137}) translate(117 246) scale(${shadowScale}) translate(-117 -246)"`);
 const box=layout.fighters[index];return`<g transform="translate(${box.x-box.width/2+position.x} ${box.top+position.y}) rotate(${tilt} 63 68.5)"><svg width="126" height="137" viewBox="0 0 240 260" overflow="visible">${index?`<g transform="translate(240 0) scale(-1 1)">${svg}</g>`:svg}</svg></g>`;
}
const english=s=>s.replace('暴击 ','CRIT ').replace('格挡 ','BLOCK ').replace('闪避','DODGE').replace('护住兵器','GUARD').replace('灼烧 ','BURN ').replace('反伤 ','REFLECT ').replace('缴械！','DISARM!').replace('抢到了！','STOLEN!').replace('兵器到手','PICKED UP').replace('弃械换招','DISCARD').replace('晕乎乎','STUNNED');
function frameSVG(e,seq,ms,paused,speed,number){
 const v=sampleCombat(seq,ms),at=seq.t,health=e.before.map(x=>x.hp),first=ms>=at.impact,second=ms>=at.second&&e.hits>1&&!e.dodged;
 if(first){health[e.actor]=e.after[e.actor].hp;health[e.target]=e.after[e.target].hp+(e.hits>1&&!e.dodged&&!second?Math.floor(e.damage/2):0);}
 const transferred=ms>=seq.transferTime,ground=transferred?e.groundAfter:e.groundBefore,held=e.before.map(x=>x.held);
 if(!['martial','burst','stunned','burn','pickup'].includes(e.kind))held[e.actor]=e.weapon==='fists'?null:e.weapon;
 if(transferred&&e.weaponEvent)e.after.forEach((x,i)=>held[i]=x.held);
 let content=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="960" height="540" viewBox="0 0 960 540"><defs><clipPath id="arena"><rect x="0" y="0" width="880" height="354" rx="18"/></clipPath></defs><rect width="960" height="540" fill="#f8f7ed"/><text x="40" y="38" fill="#536b50" font-family="sans-serif" font-size="21" font-weight="bold">PET BRAWL  /  MOTION REVIEW</text><text x="920" y="36" text-anchor="end" fill="#a28b58" font-family="sans-serif" font-size="11">DRAFT · NOT PUBLISHED</text><text x="40" y="68" fill="#8d987d" font-family="sans-serif" font-size="12">${escape((e.move||e.kind).toUpperCase().replaceAll('-',' '))}   /   ACTION ${number+1}   /   ${paused?'PAUSED':speed+'× PLAYBACK'}</text><g transform="translate(40 88)" clip-path="url(#arena)"><image x="0" y="-46.44" width="880" height="440" href="data:image/svg+xml;base64,${bg}"/>`;
 for(let i=0;i<2;i++){const x=i?620:28,max=e.before[i].maxHp;content+=`<rect x="${x-10}" y="15" width="242" height="62" rx="10" fill="#fffcec" opacity=".85"/><text x="${x}" y="35" fill="#597158" font-family="sans-serif" font-size="12">${i?'CAT MASTER':'DOUDOU'}</text><rect x="${x}" y="44" width="220" height="8" rx="4" fill="#dce4ce"/><rect x="${x}" y="44" width="${220*health[i]/max}" height="8" rx="4" fill="${i?'#c69b73':'#84a072'}"/><text x="${x}" y="67" fill="#8f987b" font-family="sans-serif" font-size="9">${health[i]} / ${max}</text>`;}
 for(let i=0;i<ground.length;i++){if(e.kind==='pickup'&&v.progress>=.4&&!transferred&&i===0)continue;const spacing=Math.min(26,180/Math.max(1,ground.length)),x=440+(i-(ground.length-1)/2)*spacing;content+=`<g transform="translate(${x-17.5} 276.5)">${weaponArt(ground[i].weapon).replace('<svg ','<svg width="35" height="35" ')}</g>`;}
 if(v.aura)content+=`<ellipse cx="${v.aura.x}" cy="${v.aura.y}" rx="${v.aura.size*.48}" ry="${v.aura.size*.52}" fill="#f0ce74" opacity="${v.aura.opacity*.4}"/>`;
 for(const i of [e.target,e.actor])content+=rig(e.before[i].pet,i,held[i],i===e.actor?v.pose:v.targetPose,v.handVisible[i],i===e.actor?v.position:v.targetPosition,i===e.actor?-v.position.y:0,i===e.actor?v.actorTilt:v.targetTilt);
 if(v.projectile){const p=v.projectile;content+=`<g transform="translate(${p.x} ${p.y}) rotate(${p.angle}) translate(${-p.size/2} ${-p.size/2})" opacity="${p.opacity}">${weaponArt(p.weapon).replace('<svg ',`<svg width="${p.size}" height="${p.size}" `)}</g>`;}
 for(const p of v.sparks){const z=(.5+p.age/220)*p.size/100;content+=`<g transform="translate(${p.x} ${p.y}) rotate(${p.angle}) scale(${z})" opacity="${p.opacity}"><path d="m0-48 10 30 28-16-16 28 29 10-30 10 15 29-27-20-15 27-5-34-30 6 19-26-22-20 32 4z" fill="#e4ad5e"/><circle r="10" fill="#fffadf"/></g>`;}
 for(const l of v.labels){const box=layout.fighters[l.who],p=l.who===e.actor?v.position:v.targetPosition;content+=`<text x="${box.x+p.x}" y="${box.top+15+(l.kind==='shield'?24:0)-l.age*.05}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${l.kind==='critical'?20:16}" fill="${l.kind==='heal'?'#739155':'#a56c47'}" stroke="#fffce5" stroke-width="3" paint-order="stroke" opacity="${l.opacity}">${escape(english(l.text))}</text>`;}
 content+='</g>';content+=`<rect x="40" y="466" width="880" height="48" rx="11" fill="#eef1e3"/><text x="60" y="486" font-family="sans-serif" font-size="11" fill="#6d8262">One clock · poses + movement + hits + weapon flight</text><text x="60" y="503" font-family="sans-serif" font-size="9" fill="#98a18a">Frame render from the game timeline · not a browser recording</text><rect x="650" y="486" width="240" height="4" rx="2" fill="#d9e2cb"/><rect x="650" y="486" width="${240*v.progress}" height="4" rx="2" fill="#96ad7e"/>${paused?'<text x="770" y="507" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ad8358">PAUSED AT THE CURRENT FRAME</text>':''}</svg>`;
 return content;
}
let wall=0,tickId=0,pending=new Map(),index=-1,active=null,sequence=null,elapsed=0,nextAt=0,wasPaused=false,rate=1.5,frames=0,selected=0;
const driver={now:()=>wall,request:fn=>{pending.set(++tickId,fn);return tickId;},cancel:id=>pending.delete(id)};
function next(){index++;if(index>=events.length){active=null;return;}sequence=createCombatSequence(events[index],layout);elapsed=0;active=createMotionClock({duration:sequence.t.duration,rate,driver,onFrame:t=>elapsed=t,onFinish(){active=null;nextAt=wall+60;}});}
next();
while(index<events.length&&wall<60000){
 const paused=wall>=7200&&wall<8050,desiredRate=wall>=18000?2:1.5;
 if(active&&paused!==wasPaused){if(paused)active.pause();else active.resume();}wasPaused=paused;
 if(active&&desiredRate!==rate)active.setRate(desiredRate);rate=desiredRate;
 const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(wall));
 const png=await sharp(Buffer.from(frameSVG(events[index],sequence,elapsed,paused,rate,index))).png().toBuffer();if(!ff.stdin.write(png))await once(ff.stdin,'drain');
 if(selected<6&&elapsed>=sequence.t.impact&&elapsed<sequence.t.impact+1000/fps*rate&&[0,2,4,9,16,21].includes(index)){writeFileSync(resolve(out,`frame-${index}.png`),png);selected++;}
 frames++;wall=frames*1000/fps;if(!active&&wall>=nextAt)next();
}
ff.stdin.end();const [code]=await completed;if(code!==0)throw new Error(ffError||'Video encoder failed');
writeFileSync(resolve(out,'review-info.json'),JSON.stringify({draft:true,published:false,render:'Shared game timeline and SVG joints; not browser capture',frames,fps,seconds:frames/fps,actions:events.length,kinds:[...new Set(events.map(e=>e.kind))],moves:[...new Set(events.map(e=>e.move))]},null,2));console.log(`Rendered ${frames} frames, ${(frames/fps).toFixed(1)} seconds, ${events.length} actions`);
