import {CHAPTERS,TOTAL_STAGES,STAGES_PER_CHAPTER,stageFor,weapon,PETS,SKILLS} from './engine.mjs?v=1.5.0';
import {icon,petArt} from './art.mjs?v=1.5.0';
export function journeyView(s,u,statsGrid){
 const target=stageFor(u.towerStage),chapter=target.chapter,c=CHAPTERS[chapter],first=chapter*STAGES_PER_CHAPTER+1,cleared=Math.min(TOTAL_STAGES,s.stage-1);
 const tag=target.chapterBoss?'章节大 Boss':target.boss?'高难度小 Boss':'剧情关卡';
 return`<div class="wide-section campaign-page">
  <section class="panel journey-overview"><div><span class="eyebrow">THE FIVE CHAPTERS</span><h2>五封侠义帖，一路小江湖。</h2><p>5 章 · 200 关 · 每 10 关一道强敌，章末迎战大 Boss</p></div><div class="journey-count"><strong>${cleared}<small> / ${TOTAL_STAGES}</small></strong><span>已通关</span></div></section>
  ${s.stage>TOTAL_STAGES?`<div class="tower-complete">${icon('trophy')}五章通关！五派信物已归还，所有关卡均可重游。</div>`:''}
  <nav class="chapter-tabs" aria-label="剧情章节">${CHAPTERS.map((ch,i)=>{const start=i*STAGES_PER_CHAPTER+1,done=Math.max(0,Math.min(STAGES_PER_CHAPTER,s.stage-start));return`<button class="chapter-tab ${chapter===i?'active':''}" data-action="select-chapter" data-value="${i}" aria-pressed="${chapter===i}"><small>第 ${i+1} 章 ${s.stage<start?'· 未抵达':''}</small><strong>${ch.name}</strong><span>${done} / ${STAGES_PER_CHAPTER} 关</span></button>`;}).join('')}</nav>
  <div class="tower-layout campaign-layout"><div class="chapter-list">
   <div class="chapter-story"><span class="tag">第 ${chapter+1} 章 · ${first}—${first+STAGES_PER_CHAPTER-1} 关</span><h2>${c.name}</h2><p>${c.sub}</p><small>追寻线索：${c.clue}</small></div>
   ${c.regions.map((region,segment)=>`<section class="panel chapter-card"><div class="chapter-head"><span class="chapter-index">0${segment+1}</span><div><h3>${region[0]}</h3><p>本章 ${segment*10+1}—${segment*10+10} 关 · ${region[3]}</p></div></div><div class="stage-nodes campaign-nodes">${Array.from({length:10},(_,j)=>{const n=first+segment*10+j,v=stageFor(n),locked=n>s.stage;return`<button class="stage-node ${n<s.stage?'done':''} ${n===s.stage?'current':''} ${n===target.stage?'selected':''} ${v.boss?'boss':''} ${v.chapterBoss?'chapter-boss':''} ${locked?'future':''}" data-action="select-stage" data-value="${n}" aria-pressed="${n===target.stage}" title="第 ${v.localStage} 关 · ${v.name}${locked?' · 尚未解锁':''}"><span>${v.chapterBoss?icon('trophy'):v.boss?icon('swords'):n<s.stage?icon('check'):locked?icon('lock'):v.localStage}</span><small>${v.localStage} ${v.chapterBoss?'大 Boss':v.boss?'小 Boss':n<s.stage?'已通关':locked?'待解锁':'可挑战'}</small></button>`;}).join('')}</div></section>`).join('')}
  </div><aside class="panel stage-preview"><span class="tag ${target.boss?'orange':''}">${tag} · 第 ${chapter+1} 章 ${target.localStage}/40</span>${petArt(target.pet,{enemy:true})}<h2>${target.name}</h2><p>Lv.${target.level} · 战力 ${target.power} · ${PETS[target.pet].tag}</p>
   <div class="stage-story"><strong>${target.region} · 剧情</strong><p>${target.story}</p></div>
   ${target.boss?`<div class="boss-trait">${icon('flame')}<div><strong>${target.traitName}</strong><small>招牌兵器：${weapon(target.signature).name}</small><span>${weapon(target.signature).desc}</span><span>${SKILLS.find(k=>k.id===target.trait)?.name}：${SKILLS.find(k=>k.id===target.trait)?.desc}</span></div></div>`:''}
   ${statsGrid(target)}<div class="reward-strip"><span>${icon('coin')} +${target.gold}</span><span>${icon('spark')} +${target.xp} EXP</span></div>
   <button class="button full" data-action="challenge-stage" data-value="${target.stage}" ${target.stage>s.stage?'disabled':''}>${icon(target.stage>s.stage?'lock':'swords')}${target.stage>s.stage?'先通关第 '+(target.stage-1)+' 关':target.stage<s.stage?'重游这一关':target.chapterBoss?'迎战章节大 Boss':target.boss?'挑战守关小 Boss':'继续这段江湖'}</button>
   ${target.reward?`<p class="boss-loot">首通赠送「${weapon(target.reward).name}」${s.owned.includes(target.reward)?' · 已收集':''}</p>`:''}
   ${target.stage<s.stage?'<p class="boss-loot">重游奖励：铜钱 45% · 经验 65%，首通赠品不重复领取</p>':''}
  </aside></div><p class="page-note">每章第 10、20、30 关为高难度小 Boss，第 40 关为章节大 Boss。可查看所有关卡，挑战须按顺序解锁。</p></div>`;
}
