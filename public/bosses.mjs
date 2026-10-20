const skill=(id,name,kind,power,color,move='palm',extra={})=>({id,name,kind,power,color,move,...extra});
export const BOSS_SKILLS=[
 skill('bamboo','竹海万叶阵','flurry',1.65,'#a9e1a0','staff-spin',{hits:2}),
 skill('cauldron','百味赤锅宴','burn',1.8,'#ffa36d','smash'),
 skill('blossom','千瓣照影','barrier',1.45,'#f0b2d0','twin-palm'),
 skill('river','寒江封舟','frost',1.7,'#a8e3f3','sweep'),
 skill('mandate','五派问心剑','pierce',1.9,'#d4b9ff','slash',{pierce:.5}),
 skill('monastery','万钟归寂','stun',1.75,'#f2d991','palm'),
 skill('forge','熔铠震山','barrier',1.8,'#ffa36d','hammer-fist'),
 skill('garden','千花毒绽','poison',1.6,'#d8a9e5','heal-palm'),
 skill('cliff','断崖落羽','flurry',1.8,'#ade3e7','flying-kick',{hits:2}),
 skill('palace','王印裁决','pierce',2,'#f3d68c','palm',{pierce:.55}),
 skill('desert','葬日沙暴','blind',1.7,'#edc38a','sweep'),
 skill('ruins','千机封兵','disarm',1.7,'#b5d6bf','grab'),
 skill('marsh','万瘴噬心','drain',1.8,'#b7e4b7','heal-palm'),
 skill('snow','永冻王冠','frost',1.8,'#c5efff','smash'),
 skill('volcano','地脉喷发','burn',2,'#ffb078','hammer-fist'),
 skill('stars','九曜陨星','flurry',1.95,'#cec3ff','finger-strike',{hits:2}),
 skill('storm','天雷贯顶','stun',2,'#d7ccff','thrust'),
 skill('sky','九重风牢','disarm',1.85,'#bdeae8','swing'),
 skill('citadel','万甲归城','barrier',1.85,'#d0c2a8','shoulder'),
 skill('celestial','万象归元','drain',2.05,'#ffe3a6','spin-kick',{hits:2})
];
const ARMORS=['青竹叶鳞甲','赤锅炉心铠','琉璃花影衣','寒江锁浪甲','五派盟主袍','云钟伏魔袈裟','百炼熔火重铠','万花荆棘羽衣','风鹰绝壁轻甲','金阙镇国龙铠','流沙月轮软甲','旧朝青铜重铠','幽泽寄生藤甲','霜冠不融冰铠','地脉熔心战甲','九曜星轨法衣','九霄御雷战铠','流云天舟羽衣','铁壁龙炮机关铠','天穹归元法袍'];
export function bossProfile(chapter,segment,story={}){
 const chapterBoss=segment===3,primary=BOSS_SKILLS[chapter],secondary=BOSS_SKILLS[(chapter+segment+3)%BOSS_SKILLS.length];
 return{chapterBoss,name:story.name,primary:primary.id,skills:chapterBoss?[primary.id,secondary.id,BOSS_SKILLS[(chapter+7)%20].id]:[primary.id,secondary.id],armor:ARMORS[chapter],accessory:(story.traitName||'守关')+'印',armorReduction:chapterBoss?.08:.04,controlResist:chapterBoss?.28:.15,scale:chapterBoss?1.8+Math.min(.18,chapter*.009):1.3+segment*.07,style:chapter%6,firstCharge:chapterBoss?2:3,cooldown:chapterBoss?4:5,phaseThresholds:chapterBoss?[.6,.25]:[.4],color:primary.color};
}
const bounded=(n,a,b)=>Math.max(a,Math.min(b,n));
export function phaseBoss(f,event,who){
 if(!f.bossProfile||f.hp<=0)return;
 const phase=1+f.bossProfile.phaseThresholds.filter(t=>f.hp/f.maxHp<=t).length;
 if(phase<=(f.bossPhase||1))return;
 const stages=phase-(f.bossPhase||1);f.bossPhase=phase;f.atk=Math.round(f.atk*Math.pow(1.10,stages));f.rage=bounded(f.rage+25,0,100);
 f.shield+=Math.round(f.maxHp*(f.bossProfile.chapterBoss?.06:.035));
 (event.phaseChanges||=[]).push({who,phase});event.notes.push(f.name+'进入第 '+phase+' 阶段，强化攻击并重整护甲');
}
export function interruptBoss(f,event){
 if(!f.bossCharge)return false;f.bossCharge=null;f.bossCooldown=2;event.interrupted=true;event.notes.push('蓄力被打断！首领重新调整架势');return true;
}
export function resolveBossTurn(battle,event){
 const a=event.actor,b=event.target,att=battle.fighters[a],def=battle.fighters[b],profile=att.bossProfile;
 if(!profile)return false;
 if(att.bossCooldown>0){att.bossCooldown--;return false;}
 if(!att.bossCharge){
  const index=(att.bossCasts||0)%profile.skills.length,id=profile.skills[index];att.bossCharge=id;
  const s=BOSS_SKILLS.find(k=>k.id===id);event.kind='boss-charge';event.name='蓄力 · '+s.name;event.move='palm';event.weapon=att.held||'fists';event.bossSkill=s;
  event.notes.push('下次行动释放「'+s.name+'」；缴械、抢夺或眩晕可打断');
  att.shield+=Math.round(att.maxHp*.025);att.rage=bounded(att.rage+8,0,100);return true;
 }
 const s=BOSS_SKILLS.find(k=>k.id===att.bossCharge)||BOSS_SKILLS[0];att.bossCharge=null;att.bossCooldown=Math.max(2,profile.cooldown-((att.bossPhase||1)-1));att.bossCasts=(att.bossCasts||0)+1;
 event.kind='boss-skill';event.name=s.name;event.move=s.move;event.weapon=att.held||'fists';event.bossSkill=s;event.hits=s.hits||1;
 const piercing=(s.pierce||.18)+(att.skills.includes('piercemaster')?.08:0);
 let raw=(att.atk*s.power+att.level*.4)*(60/(60+def.def*(1-piercing)))*(battle.steps>80?1.35:1);
 if(def.skills.includes('ward'))raw*=.92;if(def.bossProfile)raw*=1-def.bossProfile.armorReduction;
 if(def.skills.includes('bareheart')&&!def.weapons.length)raw*=.92;
 if(def.skills.includes('resolve')&&def.hp<def.maxHp*.3)raw*=.92;
 raw=Math.max(1,Math.round(raw));event.absorbed=Math.min(def.shield,raw);def.shield-=event.absorbed;event.damage=Math.min(def.hp,raw-event.absorbed);def.hp-=event.damage;
 if(s.kind==='burn'||s.kind==='poison'){def.burn=Math.round(att.atk*(s.kind==='poison'?.2:.17))+(s.kind==='poison'?8:12);def.burnTurns=3;event.notes.push(s.kind==='poison'?'中毒：三次行动持续损伤':'地火：三次行动持续灼烧');if(s.kind==='poison')def.antiHeal=3;}
 if(s.kind==='barrier'){const shield=Math.round(att.maxHp*.10);att.shield+=shield;event.notes.push('重整护甲 +'+shield);}
 if(s.kind==='frost'){def.weakened=3;event.notes.push('霜寒：三次行动攻击降低 12%');}
 if(s.kind==='blind'){def.blind=3;event.notes.push('沙暴：三次行动命中降低');}
 if(s.kind==='stun'&&def.hp>0){if(def.skills.includes('ironwill')&&battle.rng()<.5)event.notes.push('清心定神抵抗了控制');else{def.stunned=1;event.stun=true;interruptBoss(def,event);}}
 if(s.kind==='disarm'&&def.weapons.length&&def.hp>0)battle.transfer('disarm',a,b,event);
 if(s.kind==='drain'){const heal=Math.min(att.maxHp-att.hp,Math.round(event.damage*.4));att.hp+=heal;event.heal+=heal;event.notes.push('汲取元气 +'+heal);}
 const reflection=(def.skills.includes('thorns')?.15:0)+(def.skills.includes('counterflow')?.06:0);
 if(reflection&&event.damage){event.counter=Math.min(att.hp,Math.round(event.damage*reflection));att.hp-=event.counter;}
 def.rage=bounded(def.rage+22,0,100);return true;
}
