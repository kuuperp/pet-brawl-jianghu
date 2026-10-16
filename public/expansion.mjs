// New equipment and techniques are data-driven; every listed effect is resolved by the combat engine.
export const EXTRA_WEAPONS=[
 {id:'chain',name:'流星核桃锤',rarity:'稀有',tier:2,level:12,cost:1900,min:24,max:40,accuracy:.92,stun:.18,pierce:.2,move:'smash',desc:'18% 眩晕，并无视 20% 防御',effect:'流星重击',flavor:'转的是核桃，晕的是对面。'},
 {id:'spear',name:'青锋长枪',rarity:'稀有',tier:2,level:16,cost:2300,min:28,max:42,accuracy:.98,pierce:.4,move:'thrust',desc:'无视 40% 防御，命中稳定',effect:'一点寒芒',flavor:'枪尖有分寸，少侠有锋芒。'},
 {id:'saber',name:'赤焰短刀',rarity:'史诗',tier:3,level:20,cost:2700,min:31,max:46,accuracy:.95,burn:14,move:'slash',desc:'附加 14 点灼烧，持续两次行动',effect:'烈焰追击',flavor:'火候刚好，专治嘴硬。'},
 {id:'staff',name:'盘龙长棍',rarity:'史诗',tier:3,level:24,cost:3100,min:17,max:25,accuracy:.96,hits:2,shield:18,move:'staff-spin',desc:'二连击，出手获得 18 点护盾',effect:'攻守两仪',flavor:'棍扫一条线，饭吃两大碗。'},
 {id:'rake',name:'九齿饭耙',rarity:'史诗',tier:3,level:28,cost:3500,min:36,max:53,accuracy:.93,pierce:.5,move:'smash',desc:'无视 50% 防御',effect:'九齿破甲',flavor:'耙得开铁甲，也拌得匀饭。'},
 {id:'bell',name:'镇魂铜铃',rarity:'史诗',tier:3,level:32,cost:3900,min:29,max:44,accuracy:.95,stun:.3,shield:22,move:'palm',desc:'30% 眩晕，出手获得 22 点护盾',effect:'铃响定神',flavor:'叮一声，你的回合借我用用。'},
 {id:'bottle',name:'回春葫芦',rarity:'史诗',tier:3,level:36,cost:4300,min:35,max:52,accuracy:.98,drain:.4,move:'swing',desc:'恢复所造成伤害的 40%',effect:'回春酿',flavor:'葫芦里没有药，只有好心情。'},
 {id:'brush',name:'判官毛笔',rarity:'史诗',tier:3,level:40,cost:4700,min:38,max:55,accuracy:1,crit:.22,pierce:.25,move:'thrust',desc:'暴击率 +22%，无视 25% 防御',effect:'点墨惊鸿',flavor:'写下你的名字，顺便画个包。'},
 {id:'trident',name:'寒江三叉戟',rarity:'传说',tier:4,level:44,cost:5100,min:42,max:62,accuracy:.97,pierce:.35,shield:36,move:'thrust',desc:'无视 35% 防御，获得 36 点护盾',effect:'寒江守势',flavor:'三叉齐出，一条鱼也跑不了。'},
 {id:'axe',name:'开山小斧',rarity:'传说',tier:4,level:48,cost:5500,min:65,max:92,accuracy:.83,pierce:.4,move:'smash',desc:'重伤害，命中偏低，无视 40% 防御',effect:'开山一击',flavor:'小斧头，大脾气。'},
 {id:'moonblade',name:'弯月双环',rarity:'传说',tier:4,level:52,cost:5900,min:27,max:38,accuracy:.96,hits:2,crit:.18,move:'double-slash',desc:'二连击，暴击率 +18%',effect:'双月交辉',flavor:'左一弯月亮，右一弯月亮。'},
 {id:'chain-sickle',name:'追影链镰',rarity:'传说',tier:4,level:56,cost:6300,min:48,max:69,accuracy:.97,drain:.25,pierce:.4,move:'swing',desc:'无视 40% 防御，吸血 25%',effect:'追影夺息',flavor:'影子追上你之前，镰刀先到了。'},
 {id:'lotus',name:'莲花灯盏',rarity:'传说',tier:4,level:60,cost:6800,min:42,max:60,accuracy:1,shield:60,drain:.18,move:'palm',desc:'获得 60 点护盾，吸血 18%',effect:'莲灯护身',flavor:'照亮夜路，也照亮你的护盾。'},
 {id:'drum',name:'雷鸣战鼓',rarity:'传说',tier:4,level:64,cost:7300,min:52,max:75,accuracy:.94,stun:.22,burn:20,move:'smash',desc:'22% 眩晕，附加两次 20 点灼烧',effect:'雷火齐鸣',flavor:'不问节拍，只问你服不服。'},
 {id:'blade',name:'山河重剑',rarity:'传说',tier:4,level:68,cost:7800,min:75,max:102,accuracy:.96,pierce:.65,move:'smash',desc:'无视 65% 防御',effect:'一剑山河',flavor:'剑有分量，承诺也有。'},
 {id:'orb',name:'乾元星盘',rarity:'传说',tier:4,level:72,cost:8400,min:38,max:55,accuracy:1,hits:2,crit:.2,drain:.15,move:'staff-spin',desc:'二连击，暴击率 +20%，吸血 15%',effect:'星河归一',flavor:'江湖再大，也在这一盘星光里。'}
];
export const EXTRA_SKILLS=[
 {id:'oak',name:'玄甲护身功',icon:'shield',level:11,desc:'开场获得最大生命 8% 的护盾'},
 {id:'keen',name:'明目诀',icon:'sun',level:14,desc:'攻击命中率 +8%，仍受命中上限限制'},
 {id:'piercing',name:'破玉劲',icon:'swords',level:17,desc:'攻击额外穿透剩余防御的 18%'},
 {id:'flow',name:'无相拳经',icon:'paw',level:20,desc:'空手绝学及专属绝招伤害 +14%'},
 {id:'ward',name:'不动如山',icon:'mountain',level:24,desc:'受到的直接攻击伤害降低 8%'},
 {id:'breath',name:'长春吐纳',icon:'leaf',level:28,desc:'行动恢复 0.6% 最大生命；决胜期减半'},
 {id:'ironwill',name:'清心定神诀',icon:'spark',level:32,desc:'50% 概率抵抗眩晕，灼烧伤害降低 40%'},
 {id:'ruthless',name:'追风破阵',icon:'wind',level:36,desc:'对生命低于 30% 的敌人伤害 +18%'},
 {id:'momentum',name:'三叠浪',icon:'swords',level:40,desc:'每第三次攻击伤害 +22%，未命中也计数'},
 {id:'borrow',name:'摘星擒拿手',icon:'bag',level:44,desc:'缴械与抢夺成功率 +10%，受成功率上限限制'},
 {id:'laststand',name:'涅槃心法',icon:'heart',level:50,desc:'每场一次：致死时恢复 15% 最大生命'},
 {id:'clearsky',name:'太虚归元',icon:'star',level:60,desc:'所有绝学及专属绝招伤害 +16%'}
];
export const EXTRA_ARTS=[
 {id:'tiger-roar',name:'虎啸崩拳',move:'uppercut',power:1.42,pierce:.2,desc:'弓步上勾拳，穿透 20% 防御'},
 {id:'twin-wind',name:'双风贯耳',move:'twin-palm',power:1.32,hits:2,desc:'左右双掌连续进击'},
 {id:'earth-kick',name:'伏地弹腿',move:'low-kick',power:1.4,pierce:.15,desc:'低身弹腿，穿透 15% 防御'},
 {id:'crane',name:'白鹤穿云',move:'crane-kick',power:1.48,desc:'提膝跃起，单足穿云'},
 {id:'dragon-elbow',name:'游龙顶肘',move:'elbow',power:1.42,pierce:.3,desc:'贴身顶肘，穿透 30% 防御'},
 {id:'falling-star',name:'落星锤',move:'hammer-fist',power:1.5,stun:.12,desc:'双拳下砸，12% 概率眩晕'},
 {id:'spring-palm',name:'回春绵掌',move:'heal-palm',power:1.18,drain:.35,desc:'推掌借气，恢复伤害的 35%'},
 {id:'sun-finger',name:'烈阳指',move:'finger-strike',power:1.32,burn:10,desc:'凝气点指，附加两次 10 点灼烧'}
];
