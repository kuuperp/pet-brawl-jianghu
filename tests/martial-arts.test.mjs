import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Battle,freshState,fighterFor,seeded,MAX_WEAPON_USES,ARMED_ART_CHANCE,MARTIAL_ARTS,SKILLS,toggleSkill,normalizeState} from '../public/engine.mjs';
import {fighterArt,rigFrames,GUARD,applyRigPose,bindRig} from '../public/fighter-rig.mjs';
import {pocketsView,combatControls} from '../public/views.mjs';
const practice=(weapons=['bamboo','pan'],rng=()=>.5)=>{const f={...fighterFor(freshState()),hp:100000,skills:[]};return new Battle({...f,weapons},{...f,name:'木桩伙伴',pet:'panda',weapons:[]},rng);};
const heroTurn=b=>{b.actor=0;return b.step();};

test('The same weapon is held for five own actions, then thrown and replaced without resetting other copies',()=>{
 const b=practice();for(let n=1;n<=MAX_WEAPON_USES;n++){const v=heroTurn(b);assert.equal(v.kind,'attack');assert.equal(v.weapon,'bamboo');assert.equal(b.fighters[0].heldUses,n);}
 assert.equal(b.requestTactic('steal'),false);const t=heroTurn(b);assert.equal(t.kind,'throw');assert.ok(t.damage>0);assert.deepEqual(b.fighters[0].weapons,['pan']);assert.equal(b.discarded[0].uses,5);assert.equal(b.ground.length,0);assert.equal(b.fighters[0].held,null);
 const next=heroTurn(b);assert.equal(next.weapon,'pan');assert.equal(b.fighters[0].heldUses,1);assert.equal(b.counters[0].throws,1);
});
test('Discard consumes an action, causes no hit, and exhausted weapons cannot be picked up',()=>{
 const b=practice(['pan']);b.setDisposal('discard');for(let i=0;i<5;i++)heroTurn(b);const hp=b.fighters[1].hp,shield=b.fighters[0].shield;
 const v=heroTurn(b);assert.equal(v.kind,'discard');assert.equal(v.damage,0);assert.equal(b.fighters[1].hp,hp);assert.equal(b.fighters[0].shield,shield);assert.equal(b.fighters[0].weapons.length,0);assert.equal(b.requestTactic('pickup'),false);assert.equal(b.discarded.length,1);assert.equal(heroTurn(b).kind,'burst');
});
test('Misses count, stun does not; a missed final throw still retires the weapon',()=>{
 const b=practice(['bamboo'],()=>.999);b.fighters[0].stunned=1;assert.equal(heroTurn(b).kind,'stunned');assert.equal(b.fighters[0].heldUses,0);
 for(let i=0;i<5;i++)assert.ok(heroTurn(b).dodged);const t=heroTurn(b);assert.equal(t.kind,'throw');assert.ok(t.dodged);assert.equal(b.fighters[0].weapons.length,0);assert.equal(b.discarded.length,1);
});
test('Stealing and pickup preserve physical weapon usage, including duplicate kinds',()=>{
 const b=practice(['bamboo']);b.fighters[1].weapons=['bamboo'];b.fighters[1].weaponUses=[4];b.setHeld(b.fighters[1],0);b.rng=()=>0;
 b.requestTactic('steal');heroTurn(b);assert.deepEqual(b.fighters[0].weaponUses,[1,4]);assert.equal(b.fighters[0].heldUses,4);
 b.rng=()=>.5;heroTurn(b);assert.equal(b.fighters[0].heldUses,5);assert.equal(heroTurn(b).kind,'throw');assert.deepEqual(b.fighters[0].weaponUses,[1]);heroTurn(b);assert.equal(b.fighters[0].heldUses,2);
 const c=practice();c.fighters[1].weapons=['fish'];c.fighters[1].weaponUses=[3];c.setHeld(c.fighters[1],0);c.rng=()=>0;c.requestTactic('disarm');heroTurn(c);assert.equal(c.ground[0].uses,3);c.requestTactic('pickup');heroTurn(c);assert.equal(c.fighters[0].heldUses,3);c.rng=()=>.5;heroTurn(c);heroTurn(c);assert.equal(heroTurn(c).kind,'throw');
});
test('Unarmed arts are unlimited, use all sixteen forms, and never create a weapon or auto-pickup',()=>{
 const b=practice([],seeded(1024));b.ground=[{key:1,weapon:'bamboo',uses:2,from:1}];const forms=new Set();
 for(let i=0;i<65;i++){const v=heroTurn(b);assert.ok(['martial','burst'].includes(v.kind));if(v.kind==='martial')forms.add(v.name);assert.equal(b.fighters[0].held,null);assert.equal(b.fighters[0].weapons.length,0);}
 assert.equal(forms.size,MARTIAL_ARTS.length);assert.equal(b.counters[0].arts,65);assert.equal(b.ground.length,1);
 const c=practice([]);c.autoBurst=false;for(let i=0;i<20;i++){c.fighters[0].rage=0;assert.ok(c.requestBurst());assert.equal(heroTurn(c).kind,'martial');}
});
test('Holding weapons allows a low random art chance, even at full rage, and blocks manual overrides',()=>{
 let arts=0;for(let i=0;i<5000;i++){const b=practice(['bamboo'],seeded(i+701));b.fighters[0].rage=100;assert.equal(b.requestBurst(),false);if(['martial','burst'].includes(heroTurn(b).kind))arts++;}
 const rate=arts/5000;assert.ok(rate>ARMED_ART_CHANCE-.015&&rate<ARMED_ART_CHANCE+.015,`observed ${rate}`);
 const b=practice(['bamboo']);b.fighters[0].rage=100;assert.equal(heroTurn(b).kind,'attack');assert.equal(b.fighters[0].rage,100);
});
test('Unlimited learned passives survive saves and battle UI explains the new rules',()=>{
 const s=freshState();s.level=80;for(const k of SKILLS)if(!s.skills.includes(k.id))assert.ok(toggleSkill(s,k.id).ok);assert.equal(s.skills.length,SKILLS.length);assert.deepEqual(normalizeState(s).skills,s.skills);
 const b=practice();for(let i=0;i<5;i++)heroTurn(b);assert.ok(pocketsView(b.fighters).includes('5/5'));assert.ok(combatControls(s,b).includes('下次行动投掷打人'));assert.ok(combatControls(s,practice([])).includes('无限次施展'));
});
test('All four battle sprites have independent elbow/knee joints; strikes change limb poses, not just the container',()=>{
 for(const pet of ['penguin','panda','cat','rabbit']){const svg=fighterArt(pet,{index:0,held:'bamboo'});for(const key of Object.keys(GUARD).filter(k=>k!=='y'))assert.ok(svg.includes(`data-joint="${key}"`));assert.equal((svg.match(/id="held-0"/g)||[]).length,1);}
 const signatures=new Set();for(const move of MARTIAL_ARTS.map(a=>a.move)){const frames=rigFrames(move),hit=frames.find(f=>f.offset===.4).pose;assert.ok(frames.some(f=>Math.abs(f.pose.lf-GUARD.lf)>20));assert.ok(Math.abs(hit.af-GUARD.af)>10||Math.abs(hit.lf-GUARD.lf)>40);signatures.add(JSON.stringify(frames));assert.equal(frames.at(-1).pose.ef,GUARD.ef);}
 assert.equal(signatures.size,MARTIAL_ARTS.length);let animated=0;const binding=bindRig({querySelector:()=>({setAttribute(name,value){animated++;assert.equal(name,'transform');assert.ok(value.includes('rotate('));}})});applyRigPose(binding,rigFrames('sweep').find(f=>f.offset===.4).pose);assert.equal(animated,10);
});
test('The existing map asset is byte-for-byte unchanged',()=>{assert.equal(createHash('sha256').update(readFileSync(new URL('../public/scene.svg',import.meta.url))).digest('hex'),'b5d0725ceca10e0c732dbbe2abb1a77d1ac4ea769c9aac06024976b8d138b0de');});
