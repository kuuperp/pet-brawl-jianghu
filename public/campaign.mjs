export const STAGES_PER_CHAPTER=40;
export const MAX_LEVEL=80;
export const CHAPTERS=[
 {name:'竹林初见',sub:'追回失镖，寻回第一封侠义帖',color:'#6d927a',clue:'青竹镖印',ending:'守林熊交出了镖印：幕后买家正在烟火巷收购各派信物。',
  regions:[['青竹入口','村口镖车失踪，你沿着断裂的车辙进入竹林。','巡林','发现镖车残页'],['风铃渡口','渡口的风铃暗号，指向一支假扮镖师的队伍。','渡口','追回被调包的镖箱'],['旧祠山径','旧祠里藏着赃物账簿，山径上的哨兵轮流守夜。','山径','找出账簿的主人'],['竹海深处','守林熊认定你是窃镖者，只有赢下比试才能当面澄清。','竹海','把镖印交回镖局']],
  bosses:[['竹哨阿橘','cat','fan','focus','快刀会心'],['渡口铁团','panda','pan','iron','铁锅护体'],['青叶双影','rabbit','nunchaku','wind','双影闪躲'],['守林大宗熊','panda','umbrella','oak','玄甲守林']],rewards:['pan','fan','nunchaku','umbrella']},
 {name:'烟火小巷',sub:'夜市追凶，打破赤锅帮的生意',color:'#c29465',clue:'赤锅帮账簿',ending:'锅王认输，账簿最后一页写着：桃花山庄，月圆交货。',
  regions:[['清晨菜市','镖印的买家潜伏在菜市，摊贩却被赤锅帮逼得不敢作声。','菜市','问出夜市接头暗号'],['百味长街','你替摊贩解围，赤锅帮的打手开始沿街堵截。','长街','护送知情的豆腐师傅'],['灯火夜集','灯会之下有人交换账簿，冒名的买家混在人群中。','夜集','辨认真正的接头人'],['赤锅后厨','证据直指后厨密室，锅王亲自守着通往山庄的货单。','后厨','逼锅王交出完整货单']],
  bosses:[['核桃铁算盘','penguin','chain','focus','流星重锤'],['长街枪教头','cat','spear','piercing','长枪破阵'],['辣手火厨娘','rabbit','saber','renew','赤焰回春'],['百味赤锅王','panda','staff','ward','盘龙守灶']],rewards:['chain','spear','saber','staff']},
 {name:'桃花迷局',sub:'真假侠义帖，花影里的旧约',color:'#bd869a',clue:'半枚桃花玉',ending:'花间庄主将半枚玉交给你：另半枚正在寒江的走私船上。',
  regions:[['落花石阶','山庄闭门谢客，石阶上的假侠客正用伪造的帖子敛财。','石阶','追回假帖的印版'],['花溪茶亭','茶亭主人见过送货人，却要先确认你能保护她的朋友。','茶亭','护送茶亭信使'],['回廊幻阵','层层回廊藏着真假两条路，铜铃声暴露了守阵人的位置。','回廊','寻出幻阵的出口'],['满月庭院','旧约揭示了侠义帖的用途：聚齐五枚信物即可号令武林。','庭院','请庄主揭开五枚信物的秘密']],
  bosses:[['九齿花圃翁','panda','rake','piercing','九齿开甲'],['回廊镇铃使','rabbit','bell','ironwill','铜铃定魄'],['葫芦醉拳仙','penguin','bottle','leech','醉步借气'],['花间墨玉庄主','cat','brush','momentum','三叠墨劲']],rewards:['rake','bell','bottle','brush']},
 {name:'寒江夜渡',sub:'雪夜夺船，阻止信物越过寒江',color:'#7c9fad',clue:'完整的双鱼玉',ending:'江主承认，五枚信物都将送往天下擂台。你终于拿到了决赛的邀请。',
  regions:[['霜桥驿站','押送信物的船队刚离开驿站，你必须找到愿意带路的船家。','霜桥','取得船队的航线'],['雾港栈道','浓雾中多艘船同时离港，真正的货船藏着三叉旗。','雾港','辨认三叉旗船'],['冰河暗舱','登船之后退路被封，暗舱里还关着被劫的各派弟子。','暗舱','救出被困的弟子'],['寒江主舰','追影江主以半枚玉相要挟，约你在主舰甲板一决胜负。','主舰','夺回玉佩并让船队返航']],
  bosses:[['三叉渡江客','penguin','trident','oak','寒江护甲'],['破冰斧头熊','panda','axe','comeback','绝境开山'],['双月夜行兔','rabbit','moonblade','keen','双月追踪'],['追影寒江主','cat','chain-sickle','borrow','追影夺刃']],rewards:['trident','axe','moonblade','chain-sickle']},
 {name:'天下擂台',sub:'五派会武，把侠义还给江湖',color:'#a593ca',clue:'五派侠义帖',ending:'五派当众销毁了号令武林的密契。从此，侠义不由一块令牌决定，而由每一次出手决定。',
  regions:[['群侠初会','受困的弟子为你作证，但擂台幕后之人拒绝交出最后一枚信物。','初会','赢得公开质证的资格'],['风雷会场','雷鼓一响便不准退场，五派高手正在替幕后之人试探你的底牌。','会场','击破风雷会场的守关人'],['山河决胜','所有证词已经齐备，唯有夺冠才能让盟主当众回应指控。','决胜','夺下进入最终擂台的席位'],['归元之巅','乐斗盟主承认了密契，却坚称只有强者才能定义侠义。最后一战由你作答。','巅峰','击败盟主并归还五派信物']],
  bosses:[['莲灯守心师','rabbit','lotus','breath','莲灯长春'],['风雷鼓尊','penguin','drum','ironwill','雷火定神'],['山河剑魁','panda','blade','ruthless','重剑破阵'],['归元乐斗盟主','penguin','orb','laststand','涅槃归元']],rewards:['lotus','drum','blade','orb']}
];
export const TOTAL_STAGES=CHAPTERS.length*STAGES_PER_CHAPTER;
const ROLES=['探路小侠','巡游拳客','机灵斥候','护路镖手','铁衣守卫','游身刀客','伏路高手','领路教头','关前先锋'];
const BEATS=['入口处传来争执声，先替赶路人解围。','留下的脚印突然分岔，巡游者拦住了你的询问。','一位斥候想抢先报信，你必须追上他。','护路镖手认错了暗号，打过一场才能核实身份。','铁衣守卫拒绝让路，正面破阵的时刻到了。','刀客提出公平切磋，胜者可以带走下一条线索。','伏路高手现身，原来你的行踪早已泄露。','教头率众封锁要道，距离真相只差这道关卡。','关前先锋发起最后的试探，守关人就在前方。'];
export function campaignStage(value){
 const stage=Math.max(1,Math.min(TOTAL_STAGES,Math.floor(Number(value)||1))),chapter=Math.floor((stage-1)/STAGES_PER_CHAPTER),localStage=(stage-1)%STAGES_PER_CHAPTER+1,segment=Math.floor((localStage-1)/10),position=(localStage-1)%10;
 const c=CHAPTERS[chapter],region=c.regions[segment],boss=position===9,chapterBoss=localStage===STAGES_PER_CHAPTER,[name,pet,signature,trait,traitName]=c.bosses[segment];
 return{stage,chapter,localStage,segment,boss,chapterBoss,name:boss?name:region[2]+ROLES[position],pet:boss?pet:['panda','cat','rabbit','penguin'][(stage+segment)%4],signature:boss?signature:null,trait:boss?trait:null,traitName:boss?traitName:null,region:region[0],goal:region[3],story:region[1]+' '+(boss?`「${name}」挡在终点。击败对手，才能${region[3]}。`:BEATS[position]),victory:chapterBoss?c.ending:boss?`你成功${region[3]}，新的线索指向下一段旅途。`:'道路已经打开，继续追寻这条线索。',reward:boss?c.rewards[segment]:null};
}
