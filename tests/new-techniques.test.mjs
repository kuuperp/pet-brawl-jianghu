import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle,MARTIAL_ARTS,tacticChance} from '../public/engine.mjs';
const fighter=(skills=[],extra={})=>({name:'练功少侠',pet:'panda',level:60,hp:5000,atk:300,def:200,agi:10,weapons:['bamboo'],skills,stance:'balanced',...extra});
function strike(att=[],def=[],options={}){const b=new Battle(fighter(att,options.att),fighter(def,options.def),options.rng||(()=>.5));b.actor=0;if(options.prepare)options.prepare(b);return{event:b.step(),battle:b};}
test('New shield, accuracy, armor penetration and damage-reduction passives change combat outcomes',()=>{
 const oak=new Battle(fighter(['oak']),fighter(),()=>.5);assert.equal(oak.fighters[0].shield,400);
 assert.equal(strike([],[],{rng:()=>.96}).event.dodged,true);assert.equal(strike(['keen'],[],{rng:()=>.96}).event.dodged,false);
 const base=strike().event.damage;assert.ok(strike(['piercing']).event.damage>base);assert.ok(strike([],['ward']).event.damage<base);
});
test('Breath restores health, iron will reduces burning and resists a successful stun',()=>{
 const healed=strike(['breath'],[],{prepare:b=>{b.fighters[0].hp-=200;}});assert.equal(healed.event.heal,30);
 const burned=strike(['ironwill'],[],{prepare:b=>{b.fighters[0].burn=10;b.fighters[0].burnTurns=2;}});assert.equal(burned.event.burn,6);
 const seq=[.5,.5,.5,.5,.5,.5,0,0,.5];let i=0;
 const resisted=strike([],['ironwill'],{att:{weapons:['brick']},rng:()=>seq[i++]??.5});assert.ok(resisted.event.notes.includes('清心定神：抵抗眩晕'));assert.equal(resisted.battle.fighters[1].stunned,0);
});
test('Unarmed and universal art training, execution and every-third-hit bonuses apply only to their conditions',()=>{
 const base=strike([],[],{att:{weapons:[]}}).event.damage;
 assert.ok(strike(['flow'],[],{att:{weapons:[]}}).event.damage>base);assert.ok(strike(['clearsky'],[],{att:{weapons:[]}}).event.damage>base);
 assert.equal(strike(['flow']).event.damage,strike().event.damage);assert.equal(strike(['clearsky']).event.damage,strike().event.damage);
 const hurt=b=>{b.fighters[1].hp=1000;};assert.ok(strike(['ruthless'],[],{prepare:hurt}).event.damage>strike([],[],{prepare:hurt}).event.damage);assert.equal(strike(['ruthless']).event.damage,strike().event.damage);
 const b=new Battle(fighter(['momentum']),fighter(),()=>.5),hits=[];for(let i=0;i<3;i++){b.actor=0;hits.push(b.step().damage);}assert.equal(hits[0],hits[1]);assert.ok(hits[2]>hits[1]);
 const a=fighter(),d=fighter();assert.ok(Math.abs(tacticChance({...a,skills:['borrow']},d,'steal')-tacticChance(a,d,'steal')-.1)<1e-9);
});
test('Revival protects once per match, including lethal burning, and a later lethal hit ends the fight',()=>{
 const b=new Battle(fighter(['laststand']),fighter([],{atk:50000}),()=>.5);b.actor=1;let e=b.step();assert.equal(b.done,false);assert.equal(b.fighters[0].hp,750);assert.deepEqual(e.revives,[{who:0,hp:750}]);b.actor=1;e=b.step();assert.equal(b.done,true);assert.equal(b.winner,1);assert.equal(e.revives,undefined);
 const fire=new Battle(fighter(['laststand']),fighter(),()=>.5);fire.fighters[0].hp=5;fire.fighters[0].burn=10;fire.fighters[0].burnTurns=1;fire.actor=0;e=fire.step();assert.equal(e.kind,'burn');assert.equal(fire.done,false);assert.equal(fire.fighters[0].hp,750);
});
test('Every named new art is selectable without a usage cap and its drain, stun or burn effect is real',()=>{
 for(let i=0;i<MARTIAL_ARTS.length;i++){
  const art=MARTIAL_ARTS[i];let call=0;const rng=()=>call++===0?(i+.01)/MARTIAL_ARTS.length:.01;
  const b=new Battle(fighter([],{weapons:[]}),fighter(),rng);b.actor=0;b.fighters[0].hp-=500;
  const e=b.step();assert.equal(e.name,art.name);assert.equal(e.move,art.move);assert.equal(e.kind,'martial');assert.ok(e.damage>0);if(art.drain)assert.ok(e.heal>0);if(art.stun)assert.equal(e.stun,true);if(art.burn)assert.equal(b.fighters[1].burn,Math.round(art.burn+b.fighters[0].atk*.04));assert.equal(b.fighters[0].held,null);
 }
});
