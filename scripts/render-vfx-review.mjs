import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {MARTIAL_ARTS,fighterFor,freshState,Battle} from '../public/engine.mjs';
import {fighterArt,GUARD,jointTransform} from '../public/fighter-rig.mjs';
import {createCombatSequence,sampleCombat} from '../public/combat-sequence.mjs';
import {drawBattleEffects} from '../public/combat-vfx.mjs';
const require=createRequire(import.meta.url),deps=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,sharp=require(deps+'/sharp'),{createCanvas}=require(deps+'/@napi-rs/canvas');
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'review');mkdirSync(out,{recursive:true});
const layout={width:800,height:354,fighters:[{x:175,top:164,width:126,height:137},{x:625,top:164,width:126,height:137}],ground:{x:400,y:294}};
const bg=readFileSync(resolve(root,'public/scene.svg')).toString('base64');
function rig(e,i,v){const pose=i===e.actor?v.pose:v.targetPose,off=i===e.actor?v.position:v.targetPosition,box=layout.fighters[i];let svg=fighterArt(e.before[i].pet,{index:i,enemy:i===1,held:null}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');for(const k of Object.keys(GUARD).filter(k=>k!=='y'))svg=svg.replace(new RegExp(`data-joint="${k}"(?: transform="[^"]*")?`),`data-joint="${k}" transform="${jointTransform(k,pose)}"`);return`<g transform="translate(${box.x-box.width/2+off.x} ${box.top+off.y})"><svg width="126" height="137" viewBox="0 0 240 260">${i?'<g transform="translate(240 0) scale(-1 1)">'+svg+'</g>':svg}</svg></g>`;}
export async function frame(art,p=.44){const base=fighterFor(freshState()),battle=new Battle({...base,weapons:[]},{...base,pet:'cat',weapons:[]},()=>.5),e={...battle.step(),actor:0,target:1,kind:'martial',artId:art.id,move:art.move,name:art.name,hits:art.hits||1,dodged:false,heal:art.id==='spring-palm'?22:0};const s=createCombatSequence(e,layout),t=p*s.t.duration,v=sampleCombat(s,t),canvas=createCanvas(800,354);drawBattleEffects(canvas.getContext('2d'),s,v,t);const backdrop=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="354"><image href="data:image/svg+xml;base64,${bg}" width="800" height="400" y="-25"/>${rig(e,1,v)}${rig(e,0,v)}<rect x="16" y="15" width="768" height="56" rx="12" fill="#fffbece6"/><text x="35" y="40" font-size="18" font-family="sans-serif" fill="#4c6554">${art.id.toUpperCase()}</text><text x="35" y="59" font-size="10" font-family="sans-serif" fill="#879475">v1.5.0 · Shared game rendering · ${Math.round(p*100)}% of action</text></svg>`;return sharp(Buffer.from(backdrop)).composite([{input:canvas.toBuffer('image/png')}]).png().toBuffer();}
const picks=['dragon-elbow','sun-finger','falling-star','palm'];const tiles=[];
for(let i=0;i<picks.length;i++){const png=await frame(MARTIAL_ARTS.find(a=>a.id===picks[i]));writeFileSync(resolve(out,picks[i]+'.png'),png);tiles.push({input:png,left:i%2*800,top:Math.floor(i/2)*354});}
await sharp({create:{width:1600,height:708,channels:4,background:'#f7f5e8'}}).composite(tiles).png().toFile(resolve(out,'vfx-contact-sheet.png'));
console.log('Rendered four actual effect samples; native Canvas + shared SVG poses, not a browser screenshot.');
