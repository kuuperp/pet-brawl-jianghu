// Weapon effects are resolved by combat-rules.mjs, not just displayed in cards.
const W=(id,name,level,min,max,accuracy,props,effect,desc)=>({id,name,level,min,max,accuracy,tier:level<150?3:4,rarity:level<150?'史诗':'传说',cost:Math.round(750+level*92),...props,effect,desc,flavor:desc,signature:id});
export const NEW_WEAPONS=[
 W('jade-staff','云钟碧玉禅杖',76,58,82,.98,{shield:24,shieldRatio:.035,stun:.12,move:'staff-spin',proc:'purify'},'清音破妄','命中有 12% 概率眩晕；获得成长护盾，并清除自身灼烧。'),
 W('prayer-beads','无声伏魔珠',82,48,70,1,{hits:2,drain:.18,move:'twin-palm',proc:'calm'},'珠光定心','二连击与 18% 吸血；命中额外获得 10 怒气。'),
 W('meteor-hammer','百炼陨星锤',88,86,122,.86,{pierce:.35,stun:.22,move:'smash',proc:'shatter'},'陨星碎甲','35% 穿甲，22% 眩晕；对护盾追加基于攻击的破盾伤害。'),
 W('forge-gauntlet','赤炉铸火拳套',94,52,76,.98,{hits:2,burn:12,burnRatio:.07,move:'combo',proc:'furnace'},'双炉叠焰','二连击附加成长灼烧；连续命中同一目标逐层提高灼烧。'),
 W('thorn-whip','万花荆棘长鞭',100,72,98,.96,{drain:.22,burn:10,burnRatio:.06,move:'swing',proc:'thorn'},'缠枝寄生','吸血 22% 并附加灼烧；对灼烧中的目标伤害提高。'),
 W('bloom-blade','琉璃落花刃',106,69,94,1,{crit:.15,move:'slash',proc:'petal'},'花落护身','暴击率 +15%；命中后获得按生命成长的花盾。'),
 W('falcon-bow','绝壁逐日弓',112,88,123,1,{pierce:.35,crit:.18,move:'thrust',proc:'falcon'},'飞羽追猎','35% 穿甲，暴击率 +18%；对闪避型敌人提高命中。'),
 W('wind-spear','断风青羽枪',118,92,128,.99,{pierce:.5,move:'thrust',proc:'windbreak'},'断风穿阵','无视 50% 防御；每第三次攻击额外获得怒气。'),
 W('imperial-sword','金阙天衡剑',124,103,143,.98,{pierce:.4,crit:.14,move:'slash',proc:'judgement'},'天衡裁决','40% 穿甲；对生命低于 35% 的目标提高伤害。'),
 W('royal-seal','镇国金印',130,80,110,1,{shield:25,shieldRatio:.05,move:'palm',proc:'royal'},'金印镇岳','行动获得成长护盾；命中使敌人损失 12 点怒气。'),
 W('sand-saber','流沙月轮刀',136,105,149,.97,{pierce:.4,drain:.16,move:'slash',proc:'sand'},'月轮掠影','40% 穿甲与 16% 吸血；出手后短暂提高闪避。'),
 W('scorpion-dagger','赤蝎双尾匕',142,65,92,.99,{hits:2,burn:18,burnRatio:.09,move:'double-slash',proc:'venom'},'蝎尾蚀骨','二连击附加成长灼烧；命中压制目标后续恢复。'),
 W('bronze-halberd','旧朝镇军戟',148,120,168,.96,{pierce:.5,shield:30,shieldRatio:.035,move:'thrust',proc:'bronze'},'镇军古誓','50% 穿甲与成长护盾；生命低于一半时护盾增强。'),
 W('ruin-disc','星锁青铜环',154,76,110,1,{hits:2,crit:.16,move:'staff-spin',proc:'starlock'},'星锁封脉','二连击；每第三次攻击附加额外破甲伤害。'),
 W('venom-scythe','幽泽蚀心镰',160,124,174,.97,{drain:.3,pierce:.3,burn:14,burnRatio:.08,move:'swing',proc:'mire'},'蚀心汲魂','30% 吸血与穿甲；对负伤目标提高吸血量。'),
 W('mire-lantern','青萤长明灯',166,103,144,1,{shield:35,shieldRatio:.055,drain:.15,move:'palm',proc:'lifelight'},'长明渡厄','成长护盾与 15% 吸血；行动额外恢复 1% 生命。'),
 W('frost-axe','霜冠裂冰斧',172,156,216,.88,{pierce:.5,stun:.18,move:'smash',proc:'frost'},'裂冰断甲','50% 穿甲，18% 眩晕；命中暂时降低敌人攻击。'),
 W('snow-bow','雪境冰羽弓',178,129,181,1,{crit:.2,pierce:.35,move:'thrust',proc:'snow'},'冰羽寻隙','暴击率 +20% 与 35% 穿甲；对有护盾目标伤害提高。'),
 W('lava-greatsword','熔心焚山剑',184,165,232,.94,{pierce:.45,burn:25,burnRatio:.12,move:'smash',proc:'eruption'},'地火燎原','45% 穿甲与成长灼烧；每第三次命中引发追加地火。'),
 W('ember-hammer','地脉赤焰锤',190,171,240,.88,{stun:.25,burn:20,burnRatio:.1,move:'smash',proc:'ember'},'地脉震荡','25% 眩晕与成长灼烧；命中燃烧目标获得护盾。'),
 W('astral-orb','九曜观星盘',196,105,150,1,{hits:2,crit:.2,drain:.2,move:'staff-spin',proc:'astral'},'九曜归轨','二连击、20% 吸血与暴击；每第三次攻击补充怒气。'),
 W('comet-staff','流星引路杖',202,155,217,.99,{pierce:.4,shield:35,shieldRatio:.045,move:'staff-spin',proc:'comet'},'星坠护行','40% 穿甲与成长护盾；命中额外造成一次星坠伤害。'),
 W('thunder-spear','九霄贯雷枪',208,177,247,.97,{pierce:.55,stun:.2,move:'thrust',proc:'thunder'},'天雷破甲','55% 穿甲，20% 眩晕；对蓄力中的 Boss 伤害提高。'),
 W('storm-bell','风雷镇神铃',214,146,205,1,{shield:45,shieldRatio:.055,stun:.2,move:'palm',proc:'storm'},'雷鸣定魄','20% 眩晕与成长护盾；命中减少敌方怒气。'),
 W('cloud-fan','九重流云扇',220,159,223,1,{crit:.18,drain:.2,move:'swing',proc:'cloud'},'九重回风','暴击率 +18%，20% 吸血；出手提高下一次闪避。'),
 W('sky-ribbon','天舟流光绫',226,108,155,1,{hits:2,shield:35,shieldRatio:.04,move:'double-slash',proc:'ribbon'},'流光夺势','二连击与成长护盾；命中暂时提高夺械成功率。'),
 W('dragon-cannon','铁壁机关龙炮',232,216,301,.9,{pierce:.6,move:'smash',proc:'cannon'},'龙焰轰城','60% 穿甲；优先击穿护盾，命中护盾目标追加冲击。'),
 W('iron-shield','不退镇城盾',238,153,218,.98,{shield:60,shieldRatio:.08,move:'shoulder',proc:'fortress'},'铁壁反震','高额成长护盾；持有期间受到攻击会反震伤害。'),
 W('heaven-seal','天穹归元印',244,172,242,1,{hits:2,drain:.22,pierce:.45,move:'palm',proc:'heaven'},'万象归一','二连击、45% 穿甲与 22% 吸血；命中使下一招绝学增强。'),
 W('void-twinblades','无相双极刃',256,125,177,.99,{hits:2,pierce:.55,crit:.18,move:'double-slash',proc:'void'},'双极破虚','二连击与 55% 穿甲；连续攻击逐步削弱敌方防御。'),
 W('dawn-sword','黎明照夜剑',272,218,304,1,{pierce:.5,crit:.22,move:'slash',proc:'dawn'},'黎明破晓','50% 穿甲与暴击；对半血以下目标追加黎明伤害。'),
 W('phoenix-feather','不灭丹凤翎',288,187,263,1,{drain:.25,shield:45,shieldRatio:.06,move:'palm',proc:'phoenix'},'丹凤续明','吸血 25% 与成长护盾；低血时额外恢复生命。')
];
const EPIC={umbrella:['petal','成长护盾；命中积蓄花盾',.045],pepper:['furnace','灼烧随攻击成长，连续命中叠焰'],guitar:['mire','30% 吸血，对负伤目标恢复增强'],spoon:['shatter','60% 穿甲，额外冲击护盾'],saber:['thorn','成长灼烧，对燃烧目标增伤'],staff:['bronze','二连击与成长护盾，低血时护盾增强',.035],rake:['void','50% 穿甲，命中逐层削弱防御'],bell:['storm','30% 眩晕，成长护盾并减少敌方怒气',.04],bottle:['lifelight','40% 吸血，行动额外恢复生命'],brush:['judgement','会心与穿甲，斩击负伤目标'],trident:['royal','成长护盾与穿甲，压制敌方怒气',.05],axe:['dawn','重击与穿甲，对半血以下目标追加伤害'],moonblade:['starlock','二连击会心，第三次攻击追加破甲伤害'], 'chain-sickle':['mire','穿甲与吸血，对负伤目标恢复增强'],lotus:['lifelight','成长护盾与吸血，持续恢复生命',.07],drum:['ember','眩晕与成长灼烧，命中燃烧目标获得护盾'],blade:['windbreak','65% 穿甲，每第三次攻击补充怒气'],orb:['astral','二连击会心吸血，每第三次攻击补充怒气']};
export function balanceWeapon(w){
 const rule=EPIC[w.id];if(!rule)return w;
 return {...w,proc:rule[0],shieldRatio:rule[2]||0,burnRatio:w.burn?.08:0,desc:rule[1],effect:rule[1].split('，')[0],min:Math.round(w.min*1.10),max:Math.round(w.max*1.10)};
}
export const NEW_SKILLS=[
 {id:'comboheart',name:'百转连环诀',icon:'swords',level:74,desc:'多段招式伤害 +8%'},
 {id:'bloodpact',name:'血契回元',icon:'leaf',level:84,desc:'生命低于 40% 时，吸血效果 +20%'},
 {id:'emberheart',name:'赤炉火心',icon:'flame',level:94,desc:'造成的灼烧伤害 +18%'},
 {id:'shieldflow',name:'琉璃护心诀',icon:'shield',level:104,desc:'获得的护盾提高 12%'},
 {id:'counterflow',name:'逆流反震功',icon:'sun',level:114,desc:'额外反弹受到直接伤害的 6%'},
 {id:'riposte',name:'破绽追击',icon:'spark',level:124,desc:'攻击正在蓄力的 Boss，伤害 +18%'},
 {id:'bareheart',name:'无兵归真',icon:'paw',level:134,desc:'空手时获得 8% 减伤，绝学伤害 +8%'},
 {id:'weaponmaster',name:'百兵同源',icon:'swords',level:144,desc:'持械攻击伤害 +7%'},
 {id:'tactician',name:'夺势擒龙诀',icon:'bag',level:154,desc:'夺械成功率额外 +6%；夺械成功恢复 3% 生命'},
 {id:'calmheart',name:'澄心守神',icon:'star',level:164,desc:'每次行动额外获得 4 怒气'},
 {id:'executioner',name:'落日断锋',icon:'swords',level:174,desc:'对生命低于 20% 的目标伤害 +12%'},
 {id:'regenheart',name:'心灯不熄',icon:'heart',level:184,desc:'生命低于一半时，行动恢复 0.6% 最大生命'},
 {id:'stormstep',name:'九霄踏风',icon:'wind',level:194,desc:'闪避率额外 +4%，仍受上限限制'},
 {id:'iceguard',name:'霜冠守御',icon:'shield',level:204,desc:'受到暴击时伤害降低 15%'},
 {id:'burnmaster',name:'地火归炉',icon:'flame',level:214,desc:'攻击灼烧中的目标，伤害 +8%'},
 {id:'lifebloom',name:'万花长明经',icon:'leaf',level:224,desc:'所有生命恢复效果 +10%'},
 {id:'piercemaster',name:'龙鳞破甲劲',icon:'swords',level:234,desc:'额外穿透剩余防御的 8%'},
 {id:'battlefocus',name:'群星照心',icon:'spark',level:244,desc:'怒气满时，暴击率额外 +6%'},
 {id:'resolve',name:'不退铁壁誓',icon:'mountain',level:264,desc:'生命低于 30% 时，受到直接伤害降低 8%'},
 {id:'celestial',name:'天地归元经',icon:'star',level:284,desc:'专属绝招伤害 +10%；施展时获得 3% 生命护盾'}
];
export const NEW_ARTS=[
 {id:'bell-palm',name:'云钟震心掌',move:'bell-palm',power:1.4,stun:.1,fx:'bell',color:'#e5cf83',desc:'掌劲化钟，10% 概率眩晕'},
 {id:'forge-combo',name:'赤炉百炼拳',move:'forge-combo',power:1.38,hits:2,burn:14,fx:'fire',color:'#ff975d',desc:'双拳连击，附加成长灼烧'},
 {id:'petal-step',name:'万花回旋踢',move:'petal-step',power:1.44,hits:2,fx:'petal',color:'#edaac7',desc:'花影回旋，双段踢击'},
 {id:'falcon-dive',name:'风鹰坠云腿',move:'falcon-dive',power:1.55,pierce:.3,fx:'wing',color:'#95d7df',desc:'跃起俯冲，穿透 30% 防御'},
 {id:'royal-palm',name:'金阙镇岳掌',move:'royal-palm',power:1.48,pierce:.35,fx:'seal',color:'#f1cc77',desc:'金印落掌，穿透 35% 防御'},
 {id:'sand-sweep',name:'流沙旋月腿',move:'sand-sweep',power:1.42,drain:.15,fx:'sand',color:'#ebc58a',desc:'贴地回旋，恢复部分伤害'},
 {id:'bronze-fist',name:'青铜破军拳',move:'bronze-fist',power:1.56,pierce:.4,fx:'bronze',color:'#a9c9af',desc:'沉肩破军，穿透 40% 防御'},
 {id:'mire-hand',name:'幽泽摄魂手',move:'mire-hand',power:1.3,drain:.4,fx:'mire',color:'#9fd9b0',desc:'汲取元气，恢复伤害的 40%'},
 {id:'frost-kick',name:'霜冠裂空踢',move:'frost-kick',power:1.5,stun:.13,fx:'ice',color:'#b2e6f3',desc:'冰棱腾空，13% 概率眩晕'},
 {id:'eruption-fist',name:'熔心崩山拳',move:'eruption-fist',power:1.65,burn:18,fx:'lava',color:'#ff9568',desc:'双拳崩地，附加成长灼烧'},
 {id:'star-fingers',name:'九曜点星指',move:'star-fingers',power:1.4,hits:2,pierce:.2,fx:'star',color:'#c1b7ff',desc:'连点双星，穿透 20% 防御'},
 {id:'thunder-elbow',name:'九霄贯雷肘',move:'thunder-elbow',power:1.62,stun:.1,fx:'thunder',color:'#b9b1ff',desc:'雷霆顶肘，10% 概率眩晕'},
 {id:'cloud-palm',name:'流云归海掌',move:'cloud-palm',power:1.42,hits:2,drain:.12,fx:'cloud',color:'#b7e9e4',desc:'双掌推云，借势恢复元气'},
 {id:'dragon-shoulder',name:'铁壁龙震靠',move:'dragon-shoulder',power:1.64,pierce:.45,fx:'dragon',color:'#dfb786',desc:'重甲贴身，穿透 45% 防御'},
 {id:'dawn-strike',name:'黎明破夜拳',move:'dawn-strike',power:1.58,pierce:.25,fx:'dawn',color:'#ffe7aa',desc:'破夜前冲，穿透 25% 防御'},
 {id:'celestial-wheel',name:'天地归元轮',move:'celestial-wheel',power:1.52,hits:2,drain:.18,fx:'celestial',color:'#f3d691',desc:'周天回旋，双段攻击并恢复元气'}
];
