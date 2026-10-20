export function extraDamageMultiplier(att,def,event,w){
 let scale=1;const has=id=>att.skills.includes(id);
 if(has('comboheart')&&event.hits>1)scale*=1.08;
 if(has('weaponmaster')&&event.kind==='attack'&&event.weapon!=='fists')scale*=1.07;
 if(has('riposte')&&def.bossCharge)scale*=1.18;
 if(has('executioner')&&def.hp<def.maxHp*.2)scale*=1.12;
 if(has('burnmaster')&&def.burnTurns>0)scale*=1.08;
 if(has('bareheart')&&!att.weapons.length&&['martial','burst'].includes(event.kind))scale*=1.08;
 if(has('celestial')&&event.kind==='burst')scale*=1.1;
 if(w?.proc==='judgement'&&def.hp<def.maxHp*.35)scale*=1.18;
 if(w?.proc==='thorn'&&def.burnTurns>0)scale*=1.14;
 if(w?.proc==='snow'&&def.shield>0)scale*=1.18;
 if(w?.proc==='thunder'&&def.bossCharge)scale*=1.2;
 if(att.weakened>0)scale*=.88;
 if(att.nextArt&&['martial','burst'].includes(event.kind)){scale*=1.15;att.nextArt=0;event.notes.push('归元印：下一招绝学增强');}
 if(def.bossProfile)scale*=1-def.bossProfile.armorReduction;
 if(def.skills.includes('bareheart')&&!def.weapons.length)scale*=.92;
 if(def.skills.includes('resolve')&&def.hp<def.maxHp*.3)scale*=.92;
 if(def.skills.includes('iceguard')&&event.crit)scale*=.85;
 return scale;
}
export function healingMultiplier(f){return(f.skills.includes('lifebloom')?1.10:1)*(f.skills.includes('bloodpact')&&f.hp<f.maxHp*.4?1.2:1)*(f.routeHealing||1)*(f.antiHeal>0?.65:1);}
export function shieldMultiplier(f){return f.skills.includes('shieldflow')?1.12:1;}
export function weaponProc(w,att,def,event){
 if(!w.proc||event.dodged||['throw','discard'].includes(event.kind))return;
 const addDamage=(amount,label)=>{const raw=Math.max(1,Math.round(amount)),absorbed=Math.min(def.shield,raw);def.shield-=absorbed;event.absorbed+=absorbed;const hp=Math.min(def.hp,raw-absorbed);def.hp-=hp;event.damage+=hp;if(hp)event.notes.push(label+' +'+hp);};
 const heal=(amount,label)=>{if(att.hp<=0)return;const h=Math.min(att.maxHp-att.hp,Math.round(amount*healingMultiplier(att)));att.hp+=h;event.heal+=h;if(h)event.notes.push(label+' +'+h);};
 const ward=ratio=>{const n=Math.round(att.maxHp*ratio*shieldMultiplier(att));att.shield+=n;event.notes.push('兵器护盾 +'+n);};
 switch(w.proc){
  case 'purify':att.burnTurns=0;att.burn=0;event.notes.push('清音：清除灼烧');break;
  case 'calm':att.rage=Math.min(100,att.rage+10);event.notes.push('定心：怒气 +10');break;
  case 'shatter':case 'cannon':if(event.absorbed>0)addDamage(att.atk*(w.proc==='cannon'?.25:.16),'破盾冲击');break;
  case 'furnace':att.emberStacks=Math.min(4,(att.emberStacks||0)+1);def.burn=Math.round(def.burn*(1+att.emberStacks*.08));event.notes.push('叠焰 '+att.emberStacks+' 层');break;
  case 'petal':ward(.025);break;
  case 'royal':def.rage=Math.max(0,def.rage-12);event.notes.push('金印：敌方怒气 −12');break;
  case 'sand':case 'cloud':att.evasionBuff=2;event.notes.push('掠影：短暂提高闪避');break;
  case 'venom':def.antiHeal=3;event.notes.push('蚀骨：压制恢复');break;
  case 'bronze':if(att.hp<att.maxHp*.5)ward(.035);break;
  case 'starlock':if(att.attacks%3===0)addDamage(att.atk*.2,'星锁破甲');break;
  case 'mire':if(def.hp<def.maxHp*.5)heal(event.damage*.12,'负伤汲魂');break;
  case 'lifelight':heal(att.maxHp*.01,'长明恢复');break;
  case 'frost':def.weakened=2;event.notes.push('裂冰：敌方攻击降低');break;
  case 'eruption':if(att.attacks%3===0)addDamage(att.atk*.24,'地火喷发');break;
  case 'ember':if(def.burnTurns>0)ward(.025);break;
  case 'astral':case 'windbreak':if(att.attacks%3===0){att.rage=Math.min(100,att.rage+18);event.notes.push('星风：怒气 +18');}break;
  case 'comet':addDamage(att.atk*.10,'星坠');break;
  case 'storm':def.rage=Math.max(0,def.rage-15);event.notes.push('镇神：敌方怒气 −15');break;
  case 'ribbon':att.tacticBuff=3;event.notes.push('流光：短暂强化夺械');break;
  case 'fortress':att.reflectBuff=2;event.notes.push('镇城：短暂反震');break;
  case 'heaven':att.nextArt=1;event.notes.push('归元：下一招绝学强化');break;
  case 'void':def.fracture=Math.min(.18,(def.fracture||0)+.035);event.notes.push('裂甲 '+Math.round(def.fracture*100)+'%');break;
  case 'dawn':if(def.hp<def.maxHp*.5)addDamage(att.atk*.16,'黎明破晓');break;
  case 'phoenix':if(att.hp<att.maxHp*.35)heal(att.maxHp*.035,'丹凤续明');break;
 }
 event.weaponProc=w.proc;
}
