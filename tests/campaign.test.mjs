import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,TOTAL_STAGES,STAGES_PER_CHAPTER,MAX_LEVEL,WEAPONS,SKILLS,MARTIAL_ARTS,freshState,normalizeState,stageFor,settleBattle,fighterFor,Battle,seeded,leadWeapon,rivalsFor} from '../public/engine.mjs';
import {appView} from '../public/views.mjs';
import {weaponArt} from '../public/art.mjs';

test('Five chapters contain 200 reachable story stages, 15 minibosses and five chapter bosses',()=>{
 assert.equal(CHAPTERS.length,5);assert.equal(STAGES_PER_CHAPTER,40);assert.equal(TOTAL_STAGES,200);
 const stages=Array.from({length:200},(_,i)=>stageFor(i+1));
 assert.equal(stages.filter(s=>s.boss&&!s.chapterBoss).length,15);assert.equal(stages.filter(s=>s.chapterBoss).length,5);
 assert.equal(new Set(stages.map(s=>s.key)).size,200);assert.equal(new Set(stages.map(s=>s.story)).size,200);
 for(const s of stages){assert.equal(s.chapter,Math.floor((s.stage-1)/40));assert.equal(s.localStage,(s.stage-1)%40+1);assert.ok(s.story.length>25&&s.victory.length>8);assert.ok(s.level<=MAX_LEVEL);assert.ok(Number.isFinite(s.power)&&s.hp>0);assert.equal(s.boss,s.stage%10===0);assert.equal(s.chapterBoss,s.stage%40===0);if(s.boss){assert.ok(WEAPONS.some(w=>w.id===s.reward));assert.equal(s.weapons[0],s.signature);assert.ok(s.skills.includes(s.trait));assert.ok(s.hp>stageFor(s.stage-1).hp*1.15);}}
 assert.equal(stageFor(201).stage,200);assert.equal(stageFor(-1).stage,1);
});
test('Every boundary advances once, pays a boss reward once, and the final chapter ends at stage 201',()=>{
 const s=freshState();let chapters=0,drops=0;
 for(let n=1;n<=200;n++){
  const enemy=stageFor(n),before=[...s.owned],r=settleBattle(s,enemy,true,'clear-'+n);
  assert.equal(s.stage,n+1);assert.equal(r.firstClear,true);assert.equal(r.chapterClear,n%40===0);chapters+=r.chapterClear?1:0;
  if(enemy.reward){assert.ok(s.owned.includes(enemy.reward));if(!before.includes(enemy.reward)){drops++;assert.equal(s.equipped[0],enemy.reward);}}
  assert.equal(settleBattle(s,enemy,true,'clear-'+n),null);
  if(n%40===0){const snapshot=JSON.stringify(s.owned),replay=settleBattle(s,enemy,true,'replay-'+n);assert.equal(replay.firstClear,false);assert.equal(s.stage,n+1);assert.equal(JSON.stringify(s.owned),snapshot);assert.equal(replay.gold,Math.round(enemy.gold*.45)+replay.levels.length*40);}
 }
 assert.equal(chapters,5);assert.ok(drops>=16);assert.equal(s.stage,201);assert.equal(normalizeState(s).stage,201);assert.ok(s.level>60&&s.level<=MAX_LEVEL);
});
test('Legacy saves keep cleared stages and items, learn eligible new passives once, and retain later manual choices',()=>{
 const old=freshState();delete old.contentVersion;delete old.settings.motion;old.stage=21;old.level=50;old.gold=7654;old.owned.push('spoon');old.equipped=['spoon','bamboo'];
 const s=normalizeState(old);assert.equal(s.stage,21);assert.equal(s.gold,7654);assert.deepEqual(s.equipped,old.equipped);assert.equal(s.settings.motion,'full');assert.ok(s.skills.includes('laststand'));assert.ok(!s.skills.includes('clearsky'));
 s.skills=s.skills.filter(id=>id!=='laststand');assert.ok(!normalizeState(s).skills.includes('laststand'));
 s.stage=201;s.level=80;assert.equal(normalizeState(s).level,80);assert.equal(normalizeState(s).stage,201);
});
test('Expanded equipment has distinct art, can lead the loadout and enters battle without changing owned copies',()=>{
 assert.equal(WEAPONS.length,28);assert.equal(SKILLS.length,20);assert.equal(MARTIAL_ARTS.length,16);
 assert.equal(new Set(WEAPONS.map(w=>weaponArt(w.id))).size,28);
 for(const w of WEAPONS){const s=freshState();s.owned.push(w.id);s.owned=[...new Set(s.owned)];s.equipped=[...s.owned];const owned=JSON.stringify(s.owned);assert.equal(leadWeapon(s,w.id).ok,true);assert.equal(s.equipped[0],w.id);assert.equal(JSON.stringify(s.owned),owned);const b=new Battle(fighterFor(s),rivalsFor(s,3)[0],()=>.5);b.actor=0;const e=b.step();assert.equal(e.weapon,w.id);assert.ok(e.damage>=0);assert.ok(weaponArt(w.id).includes('<svg'));}
 assert.equal(leadWeapon(freshState(),'orb').ok,false);
});
test('The chapter UI exposes exactly forty inspectable stages and never unlocks a future challenge',()=>{
 const s=freshState(),r=rivalsFor(s,1);
 for(const n of [1,40,41,80,81,120,121,160,161,200]){
  const html=appView(s,{nav:'tower',towerStage:n,rivals:r,selected:r[0],logs:[],battle:null});
  assert.equal((html.match(/data-action="select-stage"/g)||[]).length,40);assert.equal((html.match(/data-action="select-chapter"/g)||[]).length,5);
  const button=html.match(/<button[^>]+data-action="challenge-stage"[^>]*>/)[0];assert.equal(button.includes('disabled'),n>1);assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));
 }
 s.stage=201;const html=appView(s,{nav:'tower',towerStage:200,rivals:r,selected:r[0],logs:[],battle:null});assert.ok(html.includes('五章通关'));
});
