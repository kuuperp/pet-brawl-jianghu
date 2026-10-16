import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,WEAPONS,freshState,normalizeState,fighterFor,rivalsFor,seeded,toggleWeapon,tacticChance,settleBattle} from '../public/engine.mjs';
import {motionTiming,contactDistance} from '../public/combat-motion.mjs';
import {slots,pocketsView,groundView,tacticsView} from '../public/views.mjs';
const make=(rng=()=>0)=>{const s=freshState(),f=fighterFor(s);return new Battle(f,{...f,name:'练习伙伴'},rng);};
const allItems=b=>[...b.fighters[0].weapons,...b.fighters[1].weapons,...b.ground.map(d=>d.weapon),...b.discarded.map(d=>d.weapon)].sort();
test('All twenty-eight owned weapons can be carried and survive a v1 save reload',()=>{
 const s=freshState();s.level=20;s.owned=WEAPONS.map(w=>w.id);for(const w of s.owned)if(!s.equipped.includes(w))assert.ok(toggleWeapon(s,w).ok);
 assert.equal(s.equipped.length,WEAPONS.length);const saved=normalizeState(JSON.parse(JSON.stringify(s)));assert.deepEqual(saved.equipped,s.equipped);assert.equal(saved.version,1);
 assert.equal((slots(saved).match(/data-action="weapon-info"/g)||[]).length,WEAPONS.length);
});
test('Disarm removes exactly the held weapon, drops it, and leaves persistent gear untouched',()=>{
 const s=freshState(),hero=fighterFor(s),foe={...fighterFor(s),weapons:['pan','fish'],name:'持锅高手'},before=JSON.stringify([hero,foe,s]);const b=new Battle(hero,foe,()=>0);b.actor=0;
 assert.ok(b.requestTactic('disarm'));const v=b.step();assert.equal(v.kind,'disarm');assert.equal(v.weaponEvent.weapon,'pan');assert.deepEqual(b.fighters[1].weapons,['fish']);assert.equal(b.ground[0].weapon,'pan');assert.equal(b.fighters[1].held,null);assert.equal(b.fighters[0].tacticCooldown,3);assert.equal(JSON.stringify([hero,foe,s]),before);
 assert.ok(groundView(b.ground).includes('不粘平底锅'));assert.ok(tacticsView(b).includes('冷却'));
});
test('Stealing a duplicate weapon transfers one copy rather than destroying or minting gear',()=>{
 const b=make(),before=allItems(b);assert.ok(b.requestTactic('steal'));const v=b.step();assert.equal(v.kind,'steal');assert.equal(v.weaponEvent.kind,'steal');assert.equal(b.fighters[0].weapons.filter(w=>w==='bamboo').length,2);assert.equal(b.fighters[1].weapons.length,1);assert.deepEqual(allItems(b),before);assert.equal(b.ground.length,0);assert.equal(b.fighters[0].held,'bamboo');
 assert.ok(pocketsView(b.fighters).includes('3 件'));
});
test('Either side can pick up a dropped weapon, consuming a full turn',()=>{
 const b=make();b.requestTactic('disarm');b.step();const before=allItems(b);b.actor=0;assert.ok(b.requestTactic('pickup'));const v=b.step();assert.equal(v.kind,'pickup');assert.equal(v.damage,0);assert.equal(b.ground.length,0);assert.equal(b.counters[0].pickups,1);assert.deepEqual(allItems(b),before);
 const c=make();c.requestTactic('disarm');c.step();assert.equal(c.actor,1);let calls=0;c.rng=()=>calls++===0?.5:0;const enemyPickup=c.step();assert.equal(enemyPickup.kind,'pickup');assert.equal(c.counters[1].pickups,1);assert.equal(c.ground.length,0);
});
test('No weapons means fists, not a phantom bamboo sword',()=>{
 const b=make(()=>.5);b.fighters[0].weapons=[];b.fighters[0].held=null;b.fighters[1].weapons=[];b.fighters[1].held=null;b.actor=0;
 const v=b.step();assert.equal(v.kind,'martial');assert.equal(v.weapon,'fists');assert.ok(v.damage>0);assert.equal(b.fighters[0].weapons.length,0);assert.equal(b.requestTactic('steal'),false);assert.equal(b.requestTactic('pickup'),false);assert.equal(tacticChance(b.fighters[0],b.fighters[1],'disarm'),0);
});
test('Failed tactics cost a turn and shared cooldown, without moving weapons',()=>{
 const b=make(()=>.99),before=allItems(b);b.requestTactic('steal');const v=b.step();assert.equal(v.tacticSuccess,false);assert.deepEqual(allItems(b),before);assert.equal(b.requestTactic('disarm'),false);
 b.autoBurst=false;for(let i=0;i<3;i++){b.actor=0;b.step();}assert.equal(b.fighters[0].tacticCooldown,0);assert.ok(b.requestTactic('disarm'));
});
test('A queued manual tactic supersedes an automatic ultimate; explicit ultimate replaces a tactic',()=>{
 const b=make();b.fighters[0].rage=100;b.requestTactic('steal');assert.equal(b.step().kind,'steal');assert.equal(b.fighters[0].rage,100);
 const c=make();c.fighters[0].weapons=[];c.fighters[0].weaponUses=[];c.setHeld(c.fighters[0],-1);c.fighters[0].rage=100;c.requestTactic('disarm');assert.ok(c.requestBurst());assert.equal(c.queuedTactic,null);assert.equal(c.step().kind,'burst');
});
test('Inventory multiset is conserved throughout 600 battles, including pickups and duplicates',()=>{
 let disarms=0,steals=0,pickups=0;
 for(let i=0;i<600;i++){
  const s=freshState();s.level=1+i%20;s.equipped=WEAPONS.filter(w=>w.level<=s.level).map(w=>w.id);const player=fighterFor(s),enemy=rivalsFor(s,i)[i%3],original=JSON.stringify([player,enemy]),b=new Battle(player,enemy,seeded(i+2026)),items=allItems(b);
  while(!b.done){const v=b.step();assert.deepEqual(allItems(b),items);if(v.weaponEvent?.kind==='disarm')disarms++;if(v.weaponEvent?.kind==='steal')steals++;if(v.weaponEvent?.kind==='pickup')pickups++;for(const f of b.fighters)assert.ok(!f.held||f.weapons.includes(f.held));}
  assert.equal(JSON.stringify([player,enemy]),original);assert.ok(b.steps<=160);
 }
 assert.ok(disarms>100&&steals>100&&pickups>100);
});
test('More health produces longer bouts without excessive stalemates',()=>{
 const rounds=[];for(let i=0;i<180;i++){const s=freshState(),b=new Battle(fighterFor(s),rivalsFor(s,i)[1],seeded(i+111));assert.ok(b.fighters[0].hp>400);while(!b.done)b.step();rounds.push(Math.ceil(b.steps/2));}rounds.sort((a,b)=>a-b);assert.ok(rounds[90]>=10&&rounds[90]<=24);assert.equal(rounds.filter(n=>n===80).length,0);
});
test('Result records round and weapon interaction counts but restores original equipment',()=>{
 const s=freshState(),foe=rivalsFor(s,11)[0],b=new Battle(fighterFor(s),foe,seeded(14)),equipment=[...s.equipped];while(!b.done)b.step();const r=settleBattle(s,foe,b.winner===0,'v11-summary',b.summary());assert.equal(r.combat.rounds,Math.ceil(b.steps/2));assert.equal(s.history[0].steals,b.counters[0].steals);assert.deepEqual(s.equipped,equipment);assert.equal(normalizeState(s).history[0].rounds,s.history[0].rounds);
});
test('Animation hit, second hit, transfer and completion are sequenced at every playback speed',()=>{
 for(const speed of [1,1.5,2,3])for(const kind of ['attack','burst','martial','throw','discard','disarm','steal','pickup']){const t=motionTiming({kind,weapon:'brick'},speed);assert.ok(t.impact<t.second&&t.second<t.transfer&&t.transfer+540/speed<t.duration);assert.equal(t.ranged,kind==='throw');}
 assert.equal(contactDistance({x:120,width:120},{x:430}),259.6);assert.ok(contactDistance({x:170,width:130},{x:230})>0);
});
