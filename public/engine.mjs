import {RELIC,relicActive} from './relics.mjs?v=1.5.1';
import {EXTRA_WEAPONS,EXTRA_SKILLS,EXTRA_ARTS} from './expansion.mjs?v=1.5.1';
import {CHAPTERS,STAGES_PER_CHAPTER,TOTAL_STAGES,MAX_LEVEL,campaignStage} from './campaign.mjs?v=1.5.1';
export {CHAPTERS,STAGES_PER_CHAPTER,TOTAL_STAGES,MAX_LEVEL};
export const VERSION=1;
export const HEALTH_SCALE=3.2;
export const MAX_BATTLE_STEPS=160;
export const MAX_WEAPON_USES=5;
export const ARMED_ART_CHANCE=.06;
export const MARTIAL_ARTS=[
  ...EXTRA_ARTS,
  {id:'cloud-fists',name:'流云连拳',move:'combo',power:1.30,hits:2},
  {id:'sweep',name:'回风扫堂腿',move:'sweep',power:1.25},
  {id:'flying-kick',name:'燕子穿云踢',move:'flying-kick',power:1.45},
  {id:'palm',name:'八卦游身掌',move:'palm',power:1.30,pierce:.25},
  {id:'flip-kick',name:'鲤鱼翻身踢',move:'flip-kick',power:1.35},
  {id:'shoulder',name:'震山铁靠',move:'shoulder',power:1.45},
  {id:'straight',name:'伏虎冲拳',move:'punch',power:1.40},
  {id:'whirlwind',name:'旋风连环腿',move:'spin-kick',power:1.35,hits:2}
];
export const FISTS={id:"fists",name:"空手小拳拳",min:0,max:3,accuracy:.97};
export const PETS={
  penguin:{name:'团子企鹅',tag:'暴击好手',color:'#577f83',hp:132,atk:19,def:6,agi:12,passive:'天生会心',desc:'暴击率额外增加 8%',burst:'冰山小拳拳'},
  panda:{name:'糯米熊猫',tag:'结实耐打',color:'#70836e',hp:153,atk:17,def:9,agi:8,passive:'厚实肚皮',desc:'基础生命与防御更高',burst:'泰山压顶抱'},
  cat:{name:'橘子猫侠',tag:'灵巧刺客',color:'#d89b66',hp:120,atk:21,def:5,agi:16,passive:'猫步轻功',desc:'闪避率额外增加 5%',burst:'喵喵连环爪'},
  rabbit:{name:'桃桃玉兔',tag:'回血能手',color:'#d09eac',hp:126,atk:18,def:5,agi:18,passive:'元气满满',desc:'行动时恢复 2% 最大生命',burst:'萝卜流星雨'}
};
export const WEAPONS=[
  {id:'bamboo',name:'翠竹剑',rarity:'普通',tier:0,level:1,cost:0,min:5,max:10,accuracy:1,desc:'朴素，但很靠谱。',effect:'命中稳定',flavor:'行走江湖，先从一根竹子开始。'},
  {id:'brick',name:'祖传板砖',rarity:'普通',tier:0,level:1,cost:160,min:11,max:19,accuracy:.85,stun:.18,desc:'18% 概率眩晕一回合',effect:'重击 · 眩晕',flavor:'武功再高，也怕这招。'},
  {id:'pan',name:'不粘平底锅',rarity:'精良',tier:1,level:2,cost:260,min:8,max:14,accuracy:.98,shield:9,desc:'出手后获得 9 点护盾',effect:'攻守兼备',flavor:'上得厅堂，下得擂台。'},
  {id:'slipper',name:'疾风拖鞋',rarity:'精良',tier:1,level:2,cost:310,min:2,max:6,accuracy:.90,hits:2,desc:'连续攻击两次，每次基础攻击减半',effect:'二连击',flavor:'你跑得再快，也快不过它。'},
  {id:'fish',name:'冻硬的咸鱼',rarity:'精良',tier:1,level:3,cost:400,min:9,max:17,accuracy:.96,drain:.22,desc:'恢复所造成伤害的 22%',effect:'咸鱼翻身 · 吸血',flavor:'梦想还是要有的，万一翻身了呢。'},
  {id:'fan',name:'逍遥折扇',rarity:'稀有',tier:2,level:4,cost:560,min:12,max:20,accuracy:1,crit:.18,desc:'使用时额外增加 18% 暴击率',effect:'会心一击',flavor:'扇的是风，打的是气场。'},
  {id:'nunchaku',name:'双截胡萝卜',rarity:'稀有',tier:2,level:5,cost:660,min:6,max:11,accuracy:.94,hits:2,desc:'连续攻击两次，每次基础攻击减半',effect:'双重打击',flavor:'哼哼哈嘿，补充维生素。'},
  {id:'hammer',name:'醒神小木槌',rarity:'稀有',tier:2,level:6,cost:820,min:25,max:38,accuracy:.77,stun:.26,desc:'26% 概率眩晕，命中率较低',effect:'强力眩晕',flavor:'一锤下去，烦恼全忘。'},
  {id:'umbrella',name:'桃花油纸伞',rarity:'史诗',tier:3,level:7,cost:960,min:17,max:27,accuracy:.98,shield:18,desc:'出手后获得 18 点护盾',effect:'桃花护体',flavor:'风雨无阻，揍你如初。'},
  {id:'pepper',name:'霹雳辣椒',rarity:'史诗',tier:3,level:8,cost:1080,min:16,max:27,accuracy:.93,burn:7,desc:'灼烧对手：每回合 7 点，持续两次行动',effect:'持续灼烧',flavor:'这一口，有点上头。'},
  {id:'guitar',name:'夺命小琵琶',rarity:'史诗',tier:3,level:9,cost:1260,min:22,max:32,accuracy:.96,drain:.30,desc:'恢复所造成伤害的 30%',effect:'魔音吸血',flavor:'没有技巧，全是感情。'},
  {id:'spoon',name:'乾坤大汤勺',rarity:'传说',tier:4,level:10,cost:1580,min:30,max:44,accuracy:1,pierce:.60,desc:'无视 60% 防御',effect:'传说 · 破甲',flavor:'一勺盛得下整个江湖。'},
  ...EXTRA_WEAPONS
];
export const SKILLS=[
  {id:'wind',name:'凌波微步',icon:'wind',level:1,desc:'闪避率 +7%'},
  {id:'focus',name:'会心一笑',icon:'spark',level:2,desc:'暴击率 +12%'},
  {id:'iron',name:'金钟小罩',icon:'shield',level:3,desc:'开场获得 28 点护盾'},
  {id:'fury',name:'怒气冲冲',icon:'flame',level:4,desc:'每次行动额外获得 12 点怒气'},
  {id:'thorns',name:'扎手团子',icon:'sun',level:5,desc:'反弹受到伤害的 15%'},
  {id:'renew',name:'偷偷回血',icon:'heart',level:6,desc:'每次行动恢复 5 点生命'},
  {id:'comeback',name:'绝地反击',icon:'swords',level:8,desc:'生命低于 35% 时，伤害 +30%'},
  {id:'leech',name:'借你元气',icon:'leaf',level:10,desc:'每次攻击恢复伤害的 12%'},
  ...EXTRA_SKILLS
];
export const STANCES={balanced:{name:'稳扎稳打',short:'均衡',desc:'属性均衡，见招拆招'},fierce:{name:'放手一搏',short:'强攻',desc:'攻击 +18%，防御 −20%'},nimble:{name:'游刃有余',short:'灵巧',desc:'闪避 +9%，攻击 −10%'}};
const RIVAL_NAMES=['饭团不服','橘猫教头','一只小机灵','摸鱼少侠','奶茶半糖','桃桃不逃','竹筒饭','路过的高手','不讲武德猫','呆头小鹅','兔了个兔','糯米糍'];
export const QUESTS=[{id:'battles',name:'上场就很勇敢',desc:'完成 3 场乐斗',goal:3,gold:100},{id:'wins',name:'今天手感不错',desc:'赢下 2 场乐斗',goal:2,gold:120},{id:'trains',name:'偷偷变强一点',desc:'修炼任意属性 1 次',goal:1,gold:80}];
export const weapon=id=>id==='fists'?FISTS:WEAPONS.find(w=>w.id===id)||WEAPONS[0];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function seeded(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function today(){const d=new Date();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
export function xpNeeded(level){return 65+level*30;}
export function freshState(){return{version:VERSION,contentVersion:2,cdkClaims:[],relicEquipped:false,name:'豆豆',pet:'penguin',level:1,xp:0,gold:220,rating:0,wins:0,losses:0,battles:0,streak:0,bestStreak:0,stage:1,owned:['bamboo','brick'],equipped:['bamboo','brick'],skills:['wind'],training:{hp:0,atk:0,def:0,agi:0},stance:'balanced',daily:{date:today(),battles:0,wins:0,trains:0,claimed:[]},settings:{sound:false,speed:1.5,autoBurst:true,motion:'full'},history:[],rewarded:[],createdAt:Date.now()};}
export function normalizeState(raw){
  if(!raw||typeof raw!=='object'||raw.version!==VERSION)throw new Error('这不是有效的江湖存档。');
  const s=freshState();
  const number=(n,min,max,fallback)=>typeof n==='number'&&Number.isFinite(n)?clamp(Math.floor(n),min,max):fallback;
  s.name=typeof raw.name==='string'?raw.name.trim().slice(0,12)||s.name:s.name;
  s.pet=PETS[raw.pet]?raw.pet:s.pet;
  for(const key of ['level','xp','gold','rating','wins','losses','battles','streak','bestStreak','stage'])s[key]=number(raw[key],key==='level'||key==='stage'?1:0,key==='stage'?TOTAL_STAGES+1:key==='level'?MAX_LEVEL:1000000,s[key]);
  s.xp=Math.min(s.xp,xpNeeded(s.level)-1);
  s.cdkClaims=Array.isArray(raw.cdkClaims)&&raw.cdkClaims.includes(RELIC.id)?[RELIC.id]:[];
  s.relicEquipped=s.cdkClaims.length>0&&raw.relicEquipped===true;
  s.owned=[...new Set(['bamboo',...(Array.isArray(raw.owned)?raw.owned:[])].filter(id=>WEAPONS.some(w=>w.id===id)))];
  s.equipped=[...new Set((Array.isArray(raw.equipped)?raw.equipped:[]).filter(id=>s.owned.includes(id)))];if(!s.equipped.length)s.equipped=['bamboo'];
  s.skills=[...new Set((Array.isArray(raw.skills)?raw.skills:[]).filter(id=>SKILLS.some(k=>k.id===id&&k.level<=s.level)))];
  if(raw.contentVersion!==2)for(const k of EXTRA_SKILLS.filter(k=>k.level<=s.level))if(!s.skills.includes(k.id))s.skills.push(k.id);
  for(const key of Object.keys(s.training))s.training[key]=number(raw.training?.[key],0,60,0);
  s.stance=STANCES[raw.stance]?raw.stance:s.stance;
  if(raw.daily?.date===today()){for(const key of ['battles','wins','trains'])s.daily[key]=number(raw.daily[key],0,100000,0);s.daily.claimed=Array.isArray(raw.daily.claimed)?raw.daily.claimed.filter(id=>QUESTS.some(q=>q.id===id)):[];}
  if(raw.settings){s.settings.motion=raw.settings.motion==='reduced'?'reduced':'full';s.settings.sound=raw.settings.sound===true;s.settings.autoBurst=raw.settings.autoBurst!==false;s.settings.speed=[1,1.5,2,3].includes(raw.settings.speed)?raw.settings.speed:1.5;}
  s.history=Array.isArray(raw.history)?raw.history.slice(0,20).filter(h=>h&&typeof h.opponent==='string'&&typeof h.won==='boolean').map(h=>({opponent:h.opponent.slice(0,20),won:h.won,mode:h.mode==='tower'?'tower':'arena',gold:number(h.gold,0,10000,0),xp:number(h.xp,0,10000,0),time:number(h.time,0,9999999999999,0),rounds:number(h.rounds,0,80,0),disarms:number(h.disarms,0,160,0),steals:number(h.steals,0,160,0),pickups:number(h.pickups,0,160,0)})):[];
  s.rewarded=Array.isArray(raw.rewarded)?raw.rewarded.filter(id=>typeof id==='string').slice(-30):[];s.createdAt=number(raw.createdAt,0,9999999999999,Date.now());
  return s;
}
export function syncDay(s){if(s.daily.date!==today())s.daily={date:today(),battles:0,wins:0,trains:0,claimed:[]};}
export function statsFor(s){const p=PETS[s.pet],l=s.level-1,t=s.training;let out={hp:Math.round((p.hp+l*12+t.hp*7)*HEALTH_SCALE),atk:Math.round(p.atk+l*2.4+t.atk*1.4),def:Math.round(p.def+l*1.15+t.def*1.1),agi:Math.round(p.agi+l*1.2+t.agi*1.3)};if(s.stance==='fierce'){out.atk=Math.round(out.atk*1.18);out.def=Math.round(out.def*.8);}if(s.stance==='nimble')out.atk=Math.round(out.atk*.9);out.evasion=0;if(relicActive(s)){out.atk+=RELIC.atk;out.def+=RELIC.def;out.evasion=RELIC.evasion;}return out;}
export function power(f){return Math.round(f.hp*.11+f.atk*3.5+f.def*2.8+f.agi*1.8+f.weapons.reduce((sum,id)=>sum+(weapon(id).min+weapon(id).max)*1.2,0)/Math.max(1,f.weapons.length)+f.skills.length*12+(f.evasion||0)*1.8);}
export function fighterFor(s){const f={name:s.name,pet:s.pet,level:s.level,...statsFor(s),weapons:[...s.equipped],skills:[...s.skills],stance:s.stance,relic:relicActive(s)?RELIC.id:null};return{...f,power:power(f)};}
function enemyFor(name,pet,level,factor=1,boss=false,seed=1){const rng=seeded(seed),p=PETS[pet],l=level-1;const available=WEAPONS.filter(w=>w.level<=level+1);const weapons=[...available].sort(()=>rng()-.5).slice(0,Math.min(available.length,2+Math.floor(level/3)+(boss?2:0))).map(w=>w.id);const skills=SKILLS.filter(k=>k.level<=level).slice(-2).map(k=>k.id);const f={name,pet,level,hp:Math.round((p.hp+l*15)*HEALTH_SCALE*factor*(boss?1.20:1)),atk:Math.round((p.atk+l*2.7)*factor),def:Math.round((p.def+l*1.3)*factor),agi:Math.round((p.agi+l*1.1)*factor),weapons,skills,stance:'balanced',boss};return{...f,power:power(f)};}
export function rivalsFor(s,seed){return [.80,.98,1.15].map((factor,i)=>{const rng=seeded(seed+i*371);const index=Math.floor(rng()*RIVAL_NAMES.length),pet=Object.keys(PETS)[Math.floor(rng()*4)],level=Math.max(1,s.level+(i===2?1:0));return{...enemyFor(RIVAL_NAMES[index],pet,level,factor,false,seed+i*11),key:`rival-${seed}-${i}`,mode:'arena',gold:48+i*18+s.level*5,xp:34+i*10+s.level*3,difficulty:i};});}
export function stageFor(n){
 const story=campaignStage(n),{stage,chapter,boss,chapterBoss}=story,level=Math.max(1,Math.ceil(stage/3));
 const enemy=enemyFor(story.name,story.pet,level,.88+chapter*.025+(boss?(chapterBoss?.4+chapter*.10:.24+chapter*.06):0),boss,stage*193);
 const learned=SKILLS.filter(k=>k.level<=level).map(k=>k.id);
 enemy.skills=[...new Set(['wind',...(boss?['focus','iron']:[]),...learned.slice(-(boss?4:2)),...(story.trait?[story.trait]:[])])];
 if(chapterBoss&&chapter>=2)enemy.skills.push('ward');
 if(chapterBoss&&chapter===4)enemy.skills.push('clearsky');
 enemy.skills=[...new Set(enemy.skills)];
 if(story.signature)enemy.weapons=[story.signature,...enemy.weapons.filter(id=>id!==story.signature)];
 enemy.weapons=enemy.weapons.slice(0,boss?8:5);
 return{...enemy,...story,power:power(enemy),key:`stage-${stage}`,mode:'tower',gold:80+stage*11+(chapterBoss?400:boss?160:0),xp:55+stage*3+(chapterBoss?180:boss?75:0)};
}
export function rankFor(s){const ranks=[{min:0,name:'初出茅庐',symbol:'芽'},{min:100,name:'青铜小侠',symbol:'铜'},{min:260,name:'白银少侠',symbol:'银'},{min:520,name:'黄金高手',symbol:'金'},{min:900,name:'名动江湖',symbol:'侠'},{min:1500,name:'乐斗宗师',symbol:'宗'}];const i=ranks.findLastIndex(r=>s.rating>=r.min);return{...ranks[i],next:ranks[i+1]||null};}
export function trainingCost(s,key){return 45+s.training[key]*13+Math.floor(Object.values(s.training).reduce((a,b)=>a+b,0)*2);}
export function train(s,key){if(!Object.hasOwn(s.training,key))return{ok:false,message:'未知修炼项目'};if(s.training[key]>=60)return{ok:false,message:'这项属性已经修炼圆满'};const cost=trainingCost(s,key);if(s.gold<cost)return{ok:false,message:'铜钱不够啦，打一场乐斗再来吧'};s.gold-=cost;s.training[key]++;syncDay(s);s.daily.trains++;return{ok:true,cost};}
export function buyWeapon(s,id){const w=WEAPONS.find(w=>w.id===id);if(!w)return{ok:false,message:'没有这件兵器'};if(s.owned.includes(id))return{ok:false,message:'这件兵器已经在背包里啦'};if(s.level<w.level)return{ok:false,message:`达到 Lv.${w.level} 后解锁`};if(s.gold<w.cost)return{ok:false,message:'铜钱不够啦，乐斗就能赚铜钱'};s.gold-=w.cost;s.owned.push(id);return{ok:true};}
export function toggleWeapon(s,id){if(!s.owned.includes(id))return{ok:false,message:'先收集这件兵器吧'};if(s.equipped.includes(id)){if(s.equipped.length===1)return{ok:false,message:'至少带一件兵器上场哦'};s.equipped=s.equipped.filter(x=>x!==id);}else{s.equipped.unshift(id);}return{ok:true};}
export function leadWeapon(s,id){if(!s.equipped.includes(id))return{ok:false,message:'请先携带这件兵器'};s.equipped=[id,...s.equipped.filter(w=>w!==id)];return{ok:true};}
export function toggleSkill(s,id){const k=SKILLS.find(k=>k.id===id);if(!k||k.level>s.level)return{ok:false,message:'继续升级，才能学会这招'};if(s.skills.includes(id))s.skills=s.skills.filter(x=>x!==id);else s.skills.push(id);return{ok:true};}
export function claimQuest(s,id){syncDay(s);const q=QUESTS.find(q=>q.id===id);if(!q||s.daily.claimed.includes(id)||s.daily[id]<q.goal)return false;s.daily.claimed.push(id);s.gold+=q.gold;return true;}
export function tacticChance(att,def,kind){
  if(kind==='pickup')return 1;
  if(!def.weapons.length)return 0;
  return clamp((kind==='steal'?.56:.72)+(att.agi-def.agi)*.004+(att.stance==='nimble'?.07:0)+(att.pet==='cat'?.04:0)+(att.skills.includes('borrow')?.10:0),kind==='steal'?.25:.40,kind==='steal'?.85:.94);
}
export class Battle{
  constructor(player,enemy,rng=Math.random){
    this.rng=rng;
    // Per-copy usage follows a weapon when it is stolen or dropped. Persistent gear stays untouched.
    this.fighters=[player,enemy].map(f=>({...f,weapons:[...f.weapons],weaponUses:f.weapons.map(()=>0),skills:[...f.skills],held:f.weapons[0]||null,heldIndex:f.weapons.length?0:-1,heldUses:0,maxHp:f.hp,hp:f.hp,rage:0,shield:(f.skills.includes('iron')?28:0)+(f.skills.includes('oak')?Math.round(f.hp*.08):0),attacks:0,revived:false,stunned:0,burn:0,burnTurns:0,tacticCooldown:0}));
    this.actor=player.agi>=enemy.agi?0:1;this.steps=0;this.done=false;this.winner=null;this.queuedBurst=false;this.queuedTactic=null;this.autoBurst=true;this.disposalMode='throw';
    this.ground=[];this.discarded=[];this.dropSerial=0;this.counters=[0,1].map(()=>({disarms:0,steals:0,pickups:0,throws:0,discards:0,arts:0}));
  }
  snapshot(){return this.fighters.map(f=>({...f,weapons:[...f.weapons],weaponUses:[...f.weaponUses],skills:[...f.skills]}));}
  summary(){return{rounds:Math.ceil(this.steps/2),...this.counters[0]};}
  setHeld(f,index){f.heldIndex=index;f.held=index>=0?f.weapons[index]:null;f.heldUses=index>=0?(f.weaponUses[index]||0):0;}
  ensureHeld(f){if(!f.weapons.length)this.setHeld(f,-1);else if(f.heldIndex<0||f.weapons[f.heldIndex]!==f.held)this.setHeld(f,0);}
  useHeld(f,event){if(f.heldIndex<0)return;f.weaponUses[f.heldIndex]=Math.min(MAX_WEAPON_USES,(f.weaponUses[f.heldIndex]||0)+1);f.heldUses=f.weaponUses[f.heldIndex];event.uses=f.heldUses;if(f.heldUses===MAX_WEAPON_USES)event.notes.push('兵器已用满 5 回合，下次行动必须投掷或丢弃');}
  removeHeld(f){const i=f.heldIndex,id=f.weapons.splice(i,1)[0],uses=f.weaponUses.splice(i,1)[0]||0;this.setHeld(f,-1);return{weapon:id,uses};}
  requestBurst(){if(this.done||this.fighters[0].weapons.length||this.queuedBurst)return false;this.queuedBurst=true;this.queuedTactic=null;return true;}
  requestTactic(kind){
    if(this.done||!['disarm','steal','pickup'].includes(kind)||this.queuedTactic===kind||this.fighters[0].heldUses>=MAX_WEAPON_USES)return false;
    if(kind==='pickup'?!this.ground.length:this.fighters[0].tacticCooldown>0||!this.fighters[1].weapons.length)return false;
    this.queuedTactic=kind;this.queuedBurst=false;return true;
  }
  setDisposal(kind){if(!['throw','discard'].includes(kind)||this.done)return false;this.disposalMode=kind;return true;}
  finish(){const[a,b]=this.fighters;if(a.hp<=0||b.hp<=0||this.steps>=MAX_BATTLE_STEPS){this.done=true;this.winner=a.hp<=0?1:b.hp<=0?0:a.hp/a.maxHp>=b.hp/b.maxHp?0:1;}return this.done;}
  complete(event){for(const [who,f]of this.fighters.entries())if(f.hp<=0&&f.skills.includes('laststand')&&!f.revived){f.revived=true;f.hp=Math.max(1,Math.round(f.maxHp*.15));(event.revives||=[]).push({who,hp:f.hp});event.notes.push(f.name+'施展涅槃心法，恢复 '+f.hp+' 生命');}this.actor=event.target;this.finish();event.after=this.snapshot();event.groundAfter=this.ground.map(w=>({...w}));return event;}
  transfer(kind,a,b,event){
    const att=this.fighters[a],def=this.fighters[b];
    if(kind==='pickup'){
      if(!this.ground.length)return;
      const drop=this.ground.shift();att.weapons.push(drop.weapon);att.weaponUses.push(drop.uses||0);this.setHeld(att,att.weapons.length-1);this.counters[a].pickups++;
      event.weaponEvent={kind,weapon:drop.weapon,from:'ground',to:a,drop};event.notes.push(`捡起「${weapon(drop.weapon).name}」，已用 ${att.heldUses}/5 回合`);return;
    }
    if(!def.weapons.length)return;
    this.ensureHeld(def);const item=this.removeHeld(def);
    event.weaponEvent={kind,weapon:item.weapon,uses:item.uses,from:b,to:kind==='steal'?a:'ground'};
    if(kind==='steal'){att.weapons.push(item.weapon);att.weaponUses.push(item.uses);this.setHeld(att,att.weapons.length-1);this.counters[a].steals++;event.notes.push(`抢到「${weapon(item.weapon).name}」，已用 ${item.uses}/5 回合`);}
    else{const drop={key:++this.dropSerial,...item,from:b};this.ground.push(drop);event.weaponEvent.drop=drop;this.counters[a].disarms++;event.notes.push(`「${weapon(item.weapon).name}」被打落到地上`);}
    if(!def.weapons.length)event.notes.push('对手兵器用尽，进入空手绝学阶段');
  }
  step(){
    if(this.done)return null;
    const a=this.actor,b=1-a,att=this.fighters[a],def=this.fighters[b],rng=this.rng,has=id=>att.skills.includes(id);
    const event={actor:a,target:b,step:++this.steps,kind:'attack',damage:0,heal:0,counter:0,burn:0,absorbed:0,crit:false,dodged:false,stun:false,hits:1,notes:[],before:this.snapshot(),groundBefore:this.ground.map(w=>({...w}))};
    const tacticReady=att.tacticCooldown===0;att.tacticCooldown=Math.max(0,att.tacticCooldown-1);
    if(att.burnTurns>0){event.burn=Math.min(att.hp,Math.round(att.burn*(has('ironwill')?.6:1)));att.hp-=event.burn;att.burnTurns--;event.notes.push(`灼烧 −${event.burn}`);if(att.hp<=0){event.kind='burn';return this.complete(event);}}
    if(att.stunned>0){att.stunned--;event.kind='stunned';event.notes.push('晕乎乎，停手一回合');return this.complete(event);}
    const overtime=this.steps>80;
    const regen=Math.round(((att.pet==='rabbit'?Math.max(1,Math.round(att.maxHp*.02)):0)+(has('renew')?5:0)+(has('breath')?att.maxHp*.006:0))*(overtime?.5:1));
    if(regen){const h=Math.min(att.maxHp-att.hp,regen);att.hp+=h;event.heal+=h;}
    this.ensureHeld(att);
    const armed=!!att.held,exhausted=armed&&att.heldUses>=MAX_WEAPON_USES;
    let tactic=a===0?this.queuedTactic:null;if(a===0)this.queuedTactic=null;
    if(tactic==='pickup'&&!this.ground.length||tactic&&tactic!=='pickup'&&!def.weapons.length)tactic=null;
    // Disposal has priority over all queued attacks. It is a separate action after the fifth use.
    const disposal=exhausted?(a===0?this.disposalMode:rng()<.8?'throw':'discard'):null;
    if(disposal){tactic=null;if(a===0)this.queuedBurst=false;}
    const manualArt=a===0&&this.queuedBurst&&!armed;
    const artReady=!disposal&&!tactic&&(armed?rng()<ARMED_ART_CHANCE:(a===1||this.autoBurst||manualArt));
    const burst=artReady&&att.rage>=100;
    let art=artReady&&!burst?MARTIAL_ARTS[Math.floor(rng()*MARTIAL_ARTS.length)]:null;
    if(!tactic&&!disposal&&!artReady&&armed){
      if(this.ground.length&&rng()<.08)tactic='pickup';
      else if(tacticReady&&def.weapons.length&&rng()<.14)tactic=rng()<.55?'disarm':'steal';
    }
    if(tactic){
      event.kind=tactic;event.name={disarm:'缴械打手',steal:'空手夺刃',pickup:'眼疾手快'}[tactic];event.weapon=att.held||'fists';event.move=tactic==='disarm'?'disarm':tactic==='steal'?'grab':'pickup';
      event.chance=tacticChance(att,def,tactic);event.tacticSuccess=rng()<event.chance;event.dodged=!event.tacticSuccess;
      if(tactic!=='pickup'){att.tacticCooldown=3;this.useHeld(att,event);}
      if(event.tacticSuccess){
        if(tactic==='disarm'){const raw=Math.max(1,Math.round(att.atk*.45*(60/(60+def.def*(has('piercing')?.82:1)))*(def.skills.includes('ward')?.92:1)));event.absorbed=Math.min(def.shield,raw);def.shield-=event.absorbed;event.damage=Math.min(def.hp,raw-event.absorbed);def.hp-=event.damage;}
        this.transfer(tactic,a,b,event);
      }else event.notes.push('对手护住了兵器，没能得手');
      att.rage=clamp(att.rage+16+(has('fury')?12:0),0,100);if(tactic!=='pickup')def.rage=clamp(def.rage+12,0,100);
      return this.complete(event);
    }
    const heldWeapon=armed?weapon(att.held):FISTS;
    const w=burst?{id:'burst',name:PETS[att.pet].burst,min:8,max:15,accuracy:1.5}:art?{id:'fists',name:art.name,min:3,max:7,accuracy:1,pierce:art.pierce,stun:art.stun,drain:art.drain,burn:art.burn}:heldWeapon;
    event.artId=art?.id||null;event.weapon=w.id;event.name=disposal?(disposal==='throw'?'飞掷·':'弃械·')+heldWeapon.name:w.name;event.kind=disposal|| (burst?'burst':art?'martial':'attack');
    event.move=disposal|| (burst?{penguin:'combo',panda:'slam',cat:'spin-kick',rabbit:'flying-kick'}[att.pet]:art?.move||w.move|| (armed?['hammer','pan','spoon'].includes(w.id)?'smash':['slipper','nunchaku'].includes(w.id)?'double-slash':'slash':['punch','kick','palm'][Math.floor(rng()*3)]));
    if(artReady){this.counters[a].arts++;if(a===0)this.queuedBurst=false;if(armed)event.notes.push('持械时 6% 概率触发绝学');}
    if(burst)att.rage=0;
    if(disposal){
      const item=this.removeHeld(att),drop={key:++this.dropSerial,...item,from:a};this.discarded.push(drop);this.counters[a][disposal==='throw'?'throws':'discards']++;
      event.weaponEvent={kind:disposal,weapon:item.weapon,from:a,to:'spent',drop};event.notes.push('这把兵器退出本场，不能再拾取');
      if(!att.weapons.length)event.notes.push('兵器用尽，接下来以空手绝学应战');
      if(disposal==='discard')return this.complete(event);
    }else this.useHeld(att,event);
    att.attacks++;
    const evade=clamp(.055+(def.agi-att.agi)*.0025+(def.pet==='cat'?.05:0)+(def.skills.includes('wind')?.07:0)+(def.stance==='nimble'?.09:0)+(def.evasion||0)/((def.evasion||0)+2500)*.9,.025,def.evasion?.95:.35);
    event.dodged=!burst&&rng()>clamp((disposal?.93:w.accuracy)+(has('keen')?.08:0)-evade,def.evasion?.05:.38,.985);
    if(!event.dodged){
      event.crit=rng()<clamp(.08+att.agi*.0015+(att.pet==='penguin'?.08:0)+(has('focus')?.12:0)+(disposal?0:w.crit||0),0,.65);event.hits=disposal?1:burst&&['penguin','cat'].includes(att.pet)?2:art?.hits||w.hits||1;
      const defense=def.def*(1-(disposal?0:w.pierce||0))*(burst&&att.pet==='cat'?.4:1)*(has('piercing')?.82:1);
      let damage=(att.atk+(w.min+rng()*(w.max-w.min))*(artReady?1:event.hits))*(60/(60+defense))*(.91+rng()*.18)*(event.crit?1.65:1);
      if(burst)damage*=att.pet==='cat'?2.5:2.2;
      else if(art)damage*=art.power;
      else if(disposal)damage*=1.2;
      else if(w.id==='fists')damage*=.9;
      if(has('comeback')&&att.hp<att.maxHp*.35)damage*=1.3;
      if(artReady&&!armed&&has('flow'))damage*=1.14;
      if(artReady&&has('clearsky'))damage*=1.16;
      if(has('ruthless')&&def.hp<def.maxHp*.3)damage*=1.18;
      if(has('momentum')&&att.attacks%3===0){damage*=1.22;event.notes.push('三叠浪：第三击增伤');}
      if(def.skills.includes('ward'))damage*=.92;
      if(overtime)damage*=1+Math.ceil((this.steps-80)/8)*.12;
      const raw=Math.max(1,Math.round(damage));event.absorbed=Math.min(def.shield,raw);def.shield-=event.absorbed;event.damage=Math.min(def.hp,raw-event.absorbed);def.hp-=event.damage;
      if(!disposal&&w.stun&&rng()<w.stun&&def.hp>0){if(def.skills.includes('ironwill')&&rng()<.5)event.notes.push('清心定神：抵抗眩晕');else{def.stunned=1;event.stun=true;event.notes.push('对手眩晕！');}}
      if(!disposal&&w.burn&&def.hp>0){def.burn=w.burn;def.burnTurns=2;event.notes.push('附加两回合灼烧');}
      const drain=(disposal?0:w.drain||0)+(has('leech')?.12:0);if(drain){const h=Math.min(att.maxHp-att.hp,Math.round(event.damage*drain*(overtime?.5:1)));att.hp+=h;event.heal+=h;}
      if(def.skills.includes('thorns')&&event.damage>0){event.counter=Math.min(att.hp,Math.round(event.damage*.15));att.hp-=event.counter;event.notes.push(`反伤 ${event.counter}`);}
      if(!disposal&&!burst&&def.hp>0&&att.hp>0&&def.weapons.length&&rng()<(['pan','hammer','bamboo'].includes(w.id)?.12:.055))this.transfer('disarm',a,b,event);
    }
    if(!disposal&&w.shield){att.shield+=w.shield;event.notes.push(`护盾 +${w.shield}`);}
    if(burst&&att.pet==='panda'){att.shield+=22;event.notes.push('护盾 +22');}
    if(burst&&att.pet==='rabbit'&&att.hp>0){const h=Math.min(att.maxHp-att.hp,Math.round(att.maxHp*.15*(overtime?.5:1)));att.hp+=h;event.heal+=h;}
    if(!burst)att.rage=clamp(att.rage+24+(has('fury')?12:0),0,100);else if(has('fury'))att.rage=12;
    def.rage=clamp(def.rage+18,0,100);
    return this.complete(event);
  }
}
export function settleBattle(s,opponent,won,id,combat={}){
  if(s.rewarded.includes(id))return null;
  s.rewarded.push(id);s.rewarded=s.rewarded.slice(-30);syncDay(s);
  s.battles++;s.daily.battles++;if(won){s.wins++;s.daily.wins++;s.streak++;s.bestStreak=Math.max(s.streak,s.bestStreak);}else{s.losses++;s.streak=0;}
  const firstClear=won&&opponent.mode==='tower'&&s.stage===opponent.stage;
  const replay=opponent.mode==='tower'&&!firstClear;
  const gold=Math.round(opponent.gold*(won?(replay?.45:1):.28)),xp=Math.round(opponent.xp*(won?(replay?.65:1):.45));
  s.gold+=gold;s.xp+=xp;if(opponent.mode==='arena')s.rating=Math.max(0,s.rating+(won?18+opponent.difficulty*4:-6));
  const levels=[],unlocks=[];
  while(s.level<MAX_LEVEL&&s.xp>=xpNeeded(s.level)){s.xp-=xpNeeded(s.level);s.level++;levels.push(s.level);s.gold+=40;for(const skill of SKILLS.filter(k=>k.level===s.level)){unlocks.push(`领悟「${skill.name}」`);if(!s.skills.includes(skill.id))s.skills.push(skill.id);}if([2,5,8].includes(s.level)){const w=WEAPONS.find(w=>w.level<=s.level&&!s.owned.includes(w.id));if(w){s.owned.push(w.id);unlocks.push(`得到「${w.name}」`);s.equipped.push(w.id);}}}
  if(s.level===MAX_LEVEL)s.xp=Math.min(s.xp,xpNeeded(MAX_LEVEL)-1);
  if(firstClear){s.stage=Math.min(TOTAL_STAGES+1,s.stage+1);if(opponent.reward&&!s.owned.includes(opponent.reward)){s.owned.push(opponent.reward);unlocks.push(`首通获得「${weapon(opponent.reward).name}」`);s.equipped.unshift(opponent.reward);}}
  const history={opponent:opponent.name,won,mode:opponent.mode,gold:gold+levels.length*40,xp,time:Date.now(),rounds:combat.rounds||0,disarms:combat.disarms||0,steals:combat.steals||0,pickups:combat.pickups||0};s.history.unshift(history);s.history=s.history.slice(0,20);
  return{won,gold:history.gold,xp,levels,unlocks,firstClear,combat,chapterClear:firstClear&&opponent.stage%STAGES_PER_CHAPTER===0};
}
