import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,normalizeState,statsFor,fighterFor,rivalsFor,stageFor,seeded,Battle,settleBattle,train,trainingCost,buyWeapon,toggleWeapon,toggleSkill,claimQuest,QUESTS,WEAPONS,SKILLS,PETS,xpNeeded,MAX_BATTLE_STEPS,TOTAL_STAGES,STAGES_PER_CHAPTER,MAX_LEVEL} from '../public/engine.mjs';
import {appView} from '../public/views.mjs';
function finish(b){while(!b.done)b.step();return b.winner===0;}
test('Combat terminates and conserves valid HP, rage and shield across 1,200 varied fights',()=>{
 let bursts=0,dodges=0,crits=0,stuns=0;
 for(let i=1;i<=1200;i++){
  const s=freshState();s.level=i%18+1;s.pet=Object.keys(PETS)[i%4];s.equipped=WEAPONS.filter(w=>w.level<=s.level).slice(-3).map(w=>w.id);s.skills=SKILLS.filter(k=>k.level<=s.level).slice(-2).map(k=>k.id);
  const foe=i%2?stageFor(i%20+1):rivalsFor(s,i)[i%3],b=new Battle(fighterFor(s),foe,seeded(i));
  while(!b.done){const v=b.step();if(v.kind==='burst')bursts++;if(v.dodged)dodges++;if(v.crit)crits++;if(v.stun)stuns++;assert.ok(b.steps<=MAX_BATTLE_STEPS);for(const f of b.fighters){assert.ok(Number.isFinite(f.hp)&&f.hp>=0&&f.hp<=f.maxHp);assert.ok(f.rage>=0&&f.rage<=100);assert.ok(Number.isFinite(f.shield)&&f.shield>=0);}}
  assert.ok([0,1].includes(b.winner));assert.equal(b.step(),null);
 }
 assert.ok(bursts>0&&dodges>0&&crits>0&&stuns>0);
});
test('Rewards settle exactly once and persist through normalization',()=>{
 const s=freshState(),foe=rivalsFor(s,15)[0],r=settleBattle(s,foe,true,'same-id'),first=JSON.stringify(s);
 assert.ok(r.gold>0&&r.xp>0);assert.equal(settleBattle(s,foe,true,'same-id'),null);assert.equal(JSON.stringify(s),first);
 const loaded=normalizeState(JSON.parse(first));assert.equal(loaded.wins,1);assert.equal(loaded.battles,1);assert.equal(settleBattle(loaded,foe,true,'same-id'),null);
});
test('Defeat pays consolation without advancing tower or losing currency',()=>{const s=freshState(),gold=s.gold;const r=settleBattle(s,stageFor(1),false,'loss');assert.ok(r.gold>0&&r.xp>0);assert.equal(s.stage,1);assert.equal(s.losses,1);assert.equal(s.gold,gold+r.gold);assert.equal(s.rating,0);});
test('Tower advancement and boss drops only happen on first clear',()=>{
 const s=freshState();for(let n=1;n<=TOTAL_STAGES;n++){const f=stageFor(n);assert.equal(settleBattle(s,f,true,'tower-'+n).firstClear,true);assert.equal(s.stage,n+1);if(f.reward)assert.ok(s.owned.includes(f.reward));}
 const r=settleBattle(s,stageFor(40),true,'replay');assert.equal(r.firstClear,false);assert.equal(s.stage,TOTAL_STAGES+1);assert.ok(r.gold<stageFor(40).gold);assert.equal(new Set(s.owned).size,s.owned.length);
});
test('Currency gates, duplicate purchases, unlimited loadouts and last weapon safety',()=>{
 const s=freshState();s.gold=0;const snapshot=JSON.stringify(s);assert.equal(train(s,'atk').ok,false);assert.equal(JSON.stringify(s),snapshot);assert.equal(buyWeapon(s,'pan').ok,false);
 s.gold=2000;s.level=4;assert.equal(buyWeapon(s,'fish').ok,true);const gold=s.gold;assert.equal(buyWeapon(s,'fish').ok,false);assert.equal(s.gold,gold);assert.equal(toggleWeapon(s,'fish').ok,true);assert.equal(buyWeapon(s,'fan').ok,true);assert.equal(toggleWeapon(s,'fan').ok,true);assert.equal(s.equipped.length,4);assert.equal(toggleWeapon(s,'fan').ok,true);
 assert.equal(toggleWeapon(s,'bamboo').ok,true);assert.equal(toggleWeapon(s,'brick').ok,true);assert.equal(toggleWeapon(s,'fish').ok,false);assert.equal(s.equipped.length,1);
});
test('Training permanently increases stats and daily claim is idempotent',()=>{const s=freshState();s.gold=5000;for(const key of ['hp','atk','def','agi']){const before=statsFor(s)[key],gold=s.gold,cost=trainingCost(s,key);assert.equal(train(s,key).ok,true);assert.ok(statsFor(s)[key]>before);assert.equal(s.gold,gold-cost);}const gold=s.gold;assert.ok(claimQuest(s,'trains'));assert.equal(s.gold,gold+80);assert.equal(claimQuest(s,'trains'),false);assert.equal(claimQuest(s,'wins'),false);});
test('Level growth auto-equips weapons and every unlocked passive without a slot cap',()=>{const s=freshState();for(let n=0;n<100;n++){settleBattle(s,rivalsFor(s,n)[1],true,'growth-'+n);assert.ok(s.equipped.every(id=>s.owned.includes(id))&&s.skills.length===SKILLS.filter(k=>k.level<=s.level).length);assert.ok(s.xp<xpNeeded(s.level));}assert.ok(s.level>10);assert.ok(s.owned.includes('pan'));assert.ok(statsFor(s).hp>200);assert.equal(toggleSkill(s,'leech').ok,true);assert.ok(!s.skills.includes('leech'));assert.equal(toggleSkill(s,'leech').ok,true);assert.ok(s.skills.includes('leech'));assert.deepEqual(normalizeState(s).skills,s.skills);});
test('Manual ultimate queues on a valid player turn and costs rage',()=>{const s=freshState(),b=new Battle({...fighterFor(s),weapons:[]},stageFor(20),seeded(6));b.autoBurst=false;b.actor=0;b.fighters[0].rage=100;assert.equal(b.requestBurst(),true);assert.equal(b.requestBurst(),false);const v=b.step();assert.equal(v.kind,'burst');assert.equal(b.fighters[0].rage,0);assert.equal(b.queuedBurst,false);});
test('Save validation rejects foreign saves and sanitizes values',()=>{assert.throws(()=>normalizeState({}));const s=freshState();s.name='<img onerror=x>';s.gold=-999;s.owned=['FAKE'];s.equipped=['FAKE'];s.training.hp=Infinity;s.skills=['FAKE'];const n=normalizeState(s);assert.equal(n.gold,0);assert.deepEqual(n.equipped,['bamboo']);assert.equal(n.training.hp,0);assert.deepEqual(n.skills,[]);const ui={nav:'arena',filter:'all',rivals:rivalsFor(n,1),battle:null,logs:[],selected:rivalsFor(n,1)[0],towerStage:1};const html=appView(n,ui);assert.ok(!html.includes('<img onerror'));assert.ok(html.includes('&lt;img'));});
test('Every page renders for a new and a mature save with all local assets',()=>{for(const mature of [false,true]){const s=freshState();if(mature){s.level=MAX_LEVEL;s.stage=TOTAL_STAGES+1;s.owned=WEAPONS.map(w=>w.id);s.skills=['leech','renew'];}const r=rivalsFor(s,1024);for(const nav of ['arena','pet','weapons','training','tower','records']){const html=appView(s,{nav,filter:'all',rivals:r,selected:r[0],battle:null,logs:[],towerStage:Math.min(s.stage,TOTAL_STAGES)});assert.ok(html.includes('<main'));assert.ok(html.includes('data-action='));assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));}}});
test('New players can win warmup encounters and losses still progress',()=>{let wins=0;for(let i=0;i<150;i++){const s=freshState(),foe=rivalsFor(s,i)[0];if(finish(new Battle(fighterFor(s),foe,seeded(i+100))))wins++;}assert.ok(wins>=60,`Warmup wins ${wins}/150`);});
