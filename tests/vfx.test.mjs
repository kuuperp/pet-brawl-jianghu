import test from 'node:test';
import assert from 'node:assert/strict';
import {MARTIAL_ARTS,SKILLS,Battle,fighterFor,freshState} from '../public/engine.mjs';
import {createCombatSequence,sampleCombat} from '../public/combat-sequence.mjs';
import {ART_FX,PASSIVE_FX,BURST_FX,vfxFrame,drawBattleEffects} from '../public/combat-vfx.mjs';
const f=fighterFor(freshState());
function event(art,actor=0){const b=new Battle(f,f,()=>.5);b.actor=actor;return{...b.step(),kind:'martial',artId:art.id,name:art.name,move:art.move,hits:art.hits||1,dodged:false};}
function recording(){const log=[];return{log,ctx:new Proxy({createRadialGradient(...args){log.push(['gradient',...args]);return{addColorStop(...a){log.push(['color',...a]);}};}},{get:(o,k)=>k in o?o[k]:(...args)=>{assert.ok(args.every(v=>typeof v!=='number'||Number.isFinite(v)),k+' must be finite');log.push([k,...args]);},set:(o,k,v)=>{o[k]=v;log.push(['set',k,v]);return true;}})};}
const layout=(width)=>({width,height:354,fighters:[{x:width*.2,top:164,width:width<500?90:126,height:width<500?98:137},{x:width*.8,top:164,width:width<500?90:126,height:width<500?98:137}],ground:{x:width/2,y:294}});
test('All 32 martial arts, four ultimates and 40 passives have visual identities; rendered signatures differ',()=>{
 assert.equal(MARTIAL_ARTS.length,32);assert.equal(Object.keys(BURST_FX).length,4);
 for(const skill of SKILLS)assert.ok(PASSIVE_FX[skill.id],skill.name);
 const signatures=new Set();
 for(const art of MARTIAL_ARTS){assert.ok(ART_FX[art.id],art.name);const e=event(art),seq=createCombatSequence(e,layout(800)),time=seq.t.duration*.44,v=sampleCombat(seq,time),r=recording();drawBattleEffects(r.ctx,seq,v,time);assert.ok(r.log.length>200);signatures.add(JSON.stringify(r.log));}
 assert.equal(signatures.size,32);
});
test('Effects sample identically for the same time, never hit before contact, and stay finite on mobile and mirrored attacks',()=>{
 for(const width of [320,800])for(const actor of [0,1])for(const art of MARTIAL_ARTS){const seq=createCombatSequence(event(art,actor),layout(width));
  for(const p of [0,.1,.29,.399,.4,.44,.53,.7,1]){const t=seq.t.duration*p,v=sampleCombat(seq,t),frame=vfxFrame(seq,v,t);if(p<.4)assert.equal(frame.impacts.length,0);const r=recording();drawBattleEffects(r.ctx,seq,v,t);const second=recording();drawBattleEffects(second.ctx,seq,v,t);assert.equal(JSON.stringify(second.log),JSON.stringify(r.log));}
 }
});
test('Dodge, throw, disarm, pickup, discard, burn, stun and all ultimates render without false impact bursts',()=>{
 for(const kind of ['attack','throw','disarm','steal','pickup','discard','burn','stunned','burst'])for(const pet of Object.keys(BURST_FX)){
 const e={...event(MARTIAL_ARTS[0]),kind,dodged:kind==='attack'};e.before[e.actor].pet=pet;const s=createCombatSequence(e,layout(800)),t=s.t.duration*.45,v=sampleCombat(s,t),r=recording();const frame=drawBattleEffects(r.ctx,s,v,t);if(e.dodged||['pickup','discard','burn','stunned','steal'].includes(kind))assert.equal(frame.impacts.length,0);
 }
});
