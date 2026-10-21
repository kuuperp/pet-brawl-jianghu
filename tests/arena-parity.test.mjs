import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,fighterFor,rivalsFor,stageFor,Battle,seeded,PETS,WEAPONS,SKILLS} from '../public/engine.mjs';
function build(level,j){const s=freshState();s.level=level;s.pet=Object.keys(PETS)[j%4];s.stance=['balanced','fierce','nimble'][j%3];const n=[0,20,60,180][Math.floor(j/4)%4];s.training={hp:n,atk:n,def:n,agi:n};s.equipped=WEAPONS.filter(w=>w.level<=level).slice(-(j%2?6:2)).map(w=>w.id);s.skills=SKILLS.filter(k=>k.level<=level).map(k=>k.id);return s;}
test('Same-level arena peers preserve training and gear budgets, deterministic generation and saves',()=>{
 for(const level of [1,10,50,150,300])for(let j=0;j<24;j++){
  const s=build(level,j),before=JSON.stringify(s),foes=rivalsFor(s,321);
  assert.deepEqual(foes,rivalsFor(s,321));assert.equal(JSON.stringify(s),before);
  for(const f of foes){assert.equal(f.level,level);assert.deepEqual([...f.weapons].sort(),[...s.equipped].sort());assert.deepEqual(f.skills,s.skills);assert.ok(Number.isFinite(f.power));}
  const relic={...s,cdkClaims:['wuji-seal'],relicEquipped:true};assert.deepEqual(rivalsFor(relic,321),foes,'Relic values cannot inflate the opponent budget');
 }
});
test('Seeded ordinary arena win rates stay below 60% across early, middle and late progression',()=>{
 for(const level of [1,10,50,150,300]){
  const wins=[0,0,0],n=800;
  for(let j=0;j<n;j++){const s=build(level,j),foes=rivalsFor(s,j+1);for(let i=0;i<3;i++){const b=new Battle(fighterFor(s),foes[i],seeded(70001+j*17+i));while(!b.done)b.step();wins[i]+=b.winner===0;}}
  for(let i=0;i<3;i++)assert.ok(wins[i]/n<=.60,`level ${level}, tier ${i}: ${wins[i]}/${n}`);
  assert.ok(wins[0]/n>=.30,`level ${level}: normal tier should remain winnable`);
  console.log(`Lv.${level}: ${wins.map(w=>(w/n*100).toFixed(1)+'%').join(' / ')}`);
 }
});
test('Mainline enemies no longer lose earlier learned techniques when leveling',()=>{
 for(const n of [30,150,450,800]){const f=stageFor(n);for(const k of SKILLS.filter(k=>k.level<=f.level))assert.ok(f.skills.includes(k.id));}
});
