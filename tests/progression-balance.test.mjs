import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,normalizeState,statsFor,trainingGain,trainingCost,train,fighterFor,rivalsFor,stageFor,stageChallenge,settleBattle,battleRewards,experienceRate,xpNeeded,MAX_LEVEL,PETS,SKILLS} from '../public/engine.mjs';
import {rewardPanel} from '../public/progression-view.mjs';
import {levelGrowth,trainingBonus} from '../public/progression.mjs';
import {RELIC} from '../public/relics.mjs';
const protectedKeys=['level','xp','gold','rating','wins','losses','battles','streak','bestStreak','stage','daily','owned','equipped','skills','training','chapterChoices','cdkClaims','relicEquipped'];
test('Large level gaps reduce experience in both directions, including every band boundary',()=>{
 for(const [gap,rate]of [[0,1],[5,1],[6,.7],[10,.7],[11,.3],[20,.3],[21,.1],[30,.1],[31,.02],[200,.02]])for(const dir of [-1,1])assert.equal(experienceRate(250,250+dir*gap),rate);
 const s=freshState();s.level=50;const rival={...rivalsFor(s,1)[1],xp:200};
 assert.equal(battleRewards(s,rival).xp,200);
 for(const level of [1,100])assert.equal(battleRewards(s,{...rival,level}).xp,4);
 assert.equal(battleRewards(s,{...rival,level:200},false).xp,0);
 const low=freshState();low.stage=800;assert.ok(battleRewards(low,stageFor(800)).xp<=2,'A huge opponent level cannot cancel the gap penalty through its larger base reward');assert.equal(battleRewards(low,{...rival,level:100,xp:15},false).xp,0,'Trivial rewards may round down to zero');
});
test('Reward previews equal settlement for normal wins, defeats, replays, first clears and max level',()=>{
 for(const [level,stage,n]of [[1,1,1],[50,150,150],[50,151,150],[MAX_LEVEL,800,800]])for(const won of [true,false]){
  const s=freshState();Object.assign(s,{level,stage,xp:xpNeeded(level)-2});const foe=stageFor(n),preview=battleRewards(s,foe,won),r=settleBattle(s,foe,won,`${level}/${stage}/${n}/${won}`);
  assert.equal(r.xp,preview.xp);assert.equal(r.gold-r.levels.length*40,preview.gold);assert.equal(r.xpRate,preview.xpRate);assert.equal(r.firstClear,preview.firstClear);
  assert.ok(s.xp<xpNeeded(s.level));assert.ok(r.xp<=xpNeeded(level)*(won?(preview.firstClear?.85:.30):.08));if(level===MAX_LEVEL)assert.equal(r.xp,0);
 }
 const s=freshState();s.level=50;s.stage=150;const foe=stageFor(150),p=battleRewards(s,foe),html=rewardPanel(s,foe);assert.ok(html.includes(`+${p.gold} 铜钱`));assert.ok(html.includes(`+${p.xp} 经验`));
});
test('All future bosses allow practice; ordinary future stages and invalid stage values stay locked',()=>{
 const s=freshState();let practice=0;
 for(let n=1;n<=800;n++){const access=stageChallenge(s,n);assert.equal(access.allowed,n===1||n%10===0);assert.equal(access.early,n>1&&n%10===0);practice+=access.early?1:0;}
 assert.equal(practice,80);for(const n of [0,801,-10,NaN,Infinity,10.1,'10'])assert.equal(stageChallenge(s,n).allowed,false);
 const snapshot=JSON.stringify(s);assert.equal(settleBattle(s,{...stageFor(2),practice:true},true,'invalid'),null);assert.equal(JSON.stringify(s),snapshot);
});
test('Boss practice pays nothing on a win or loss, cannot count for quests, and preserves first-clear eligibility',()=>{
 for(const won of [false,true])for(const n of [10,40,200,800]){
  const s=freshState();s.xp=xpNeeded(s.level)-1;s.streak=3;s.bestStreak=4;const before=structuredClone(s),foe=stageFor(n),r=settleBattle(s,foe,won,'early');
  assert.equal(r.practice,true);assert.equal(r.gold,0);assert.equal(r.xp,0);assert.deepEqual(r.levels,[]);assert.deepEqual(r.unlocks,[]);assert.equal(r.firstClear,false);assert.equal(r.chapterClear,false);
  for(const key of protectedKeys)assert.deepEqual(s[key],before[key],`${won}/${n}/${key}`);
  assert.equal(s.history[0].practice,true);const loaded=normalizeState(s);assert.equal(loaded.history[0].practice,true);const again=JSON.stringify(s);assert.equal(settleBattle(s,foe,won,'early'),null);assert.equal(JSON.stringify(s),again);
  const panel=rewardPanel(s,foe);assert.ok(panel.includes('提前切磋 · 无奖励'));assert.ok(!panel.includes(`+${foe.gold}`));
  s.stage=n;s.level=foe.level;const normal=settleBattle(s,foe,true,'formal');assert.equal(normal.practice,false);assert.equal(normal.firstClear,true);assert.ok(normal.gold>0&&normal.xp>0);assert.equal(s.stage,n+1);assert.ok(s.owned.includes(foe.reward));
 }
});
test('Existing saves keep progression, training counts, equipment and the exact relic bonuses',()=>{
 const old=freshState();Object.assign(old,{contentVersion:3,level:150,stage:451,xp:333,gold:12345,training:{hp:160,atk:180,def:120,agi:100},owned:['bamboo','spoon'],equipped:['spoon'],cdkClaims:[RELIC.id],relicEquipped:true});
 const loaded=normalizeState(JSON.parse(JSON.stringify(old)));for(const key of protectedKeys)assert.deepEqual(loaded[key],old[key],key);assert.equal(loaded.contentVersion,4);assert.deepEqual(normalizeState(loaded),loaded);
 const naked=statsFor({...loaded,relicEquipped:false}),equipped=statsFor(loaded);for(const key of ['atk','def','evasion'])assert.equal(equipped[key]-naked[key],50000);
});
test('Late growth is slower, training remains useful and the UI reports the actual next base gain',()=>{
 assert.ok((levelGrowth(300)-levelGrowth(250))/50<(levelGrowth(30)-levelGrowth(1))/29);
 assert.ok(trainingBonus('hp',240)-trainingBonus('hp',239)<trainingBonus('hp',1));
 const s=freshState();s.stage=801;s.gold=100000000;
 for(const key of ['hp','atk','def','agi'])for(const count of [0,19,20,59,60,119,120,239]){
  s.training[key]=count;const stat=statsFor(s)[key],gain=trainingGain(s,key),cost=trainingCost(s,key),gold=s.gold;assert.ok(gain>0);assert.equal(train(s,key).ok,true);assert.equal(statsFor(s)[key]-stat,gain);assert.equal(s.gold,gold-cost);assert.ok(Number.isInteger(cost));
 }
 for(const pet of Object.keys(PETS)){s.pet=pet;s.level=300;const now=statsFor(s),l=s.level-1;assert.ok(now.hp<Math.round((PETS[pet].hp+l*12+s.training.hp*7)*3.2));assert.ok(now.atk<Math.round(PETS[pet].atk+l*2.4+s.training.atk*1.4));}
});
test('A full sequential mainline stays near enemy levels while normal arena wins still offer a catch-up route',()=>{
 const s=freshState();for(let n=1;n<=800;n++)settleBattle(s,stageFor(n),true,'main-'+n);assert.equal(s.stage,801);assert.ok(Math.abs(s.level-stageFor(800).level)<=10,`Final level ${s.level}`);
 const lagging=freshState();lagging.level=80;lagging.stage=800;const near=battleRewards(lagging,rivalsFor(lagging,4)[1]),far=battleRewards(lagging,stageFor(799));assert.ok(near.xp>far.xp,'A level-matched rival is better for leveling than an old, mismatched mainline');
});
