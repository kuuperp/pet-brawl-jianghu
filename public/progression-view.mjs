import {battleRewards,XP_RULES,MAX_LEVEL,weapon} from './engine.mjs?v=2.6.0';
import {icon} from './art.mjs?v=2.6.0';
export function rewardPanel(s,opponent){
 const r=battleRewards(s,opponent);
 if(r.practice)return`<div class="early-challenge-note"><strong>${icon('swords')}提前切磋 · 无奖励</strong><p>胜负均不获得经验、铜钱或物品，不计任务与胜负战绩，也不推进主线。正式推进到这一关后，仍可领取完整首通奖励。</p></div>`;
 if(r.locked)return'<p class="reward-rule">普通关卡需要按顺序解锁；所有主线 Boss 均可提前切磋。</p>';
 return`<div class="reward-caption">胜利基础奖励（升级铜钱另计）</div><div class="reward-strip"><span>${icon('coin')} +${r.gold} 铜钱</span><span>${icon('spark')} +${r.xp} 经验</span></div><p class="reward-rule">${s.level>=MAX_LEVEL?'已满级，不再获得经验':`等级差 ${r.gap} 级 · 等级差经验倍率 ${Math.round(r.xpRate*100)}%${r.gap>5?'，建议挑战接近自身等级的对手。':''}`}</p>${r.replay?'<p class="reward-rule">重游：铜钱45%，经验65%后再按等级差衰减，首通赠品不重复领取。</p>':opponent.reward?`<p class="boss-loot">正式首通获得「${weapon(opponent.reward).name}」${s.owned.includes(opponent.reward)?' · 已收集':''}</p>`:''}<details class="experience-rules"><summary>经验获取规则</summary><p>${XP_RULES} 双向等级差均生效。失败基础经验为20%；先应用单场经验上限，再按等级差衰减并向下取整。结算显示实际收益。</p></details>`;
}
