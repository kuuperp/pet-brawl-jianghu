import {RELIC,hasRelic,relicActive,redeemCdk,relicArt} from './relics.mjs?v=2.1.0';
import {PETS,SKILLS,TOTAL_STAGES,STAGES_PER_CHAPTER,CHAPTERS,QUESTS,STANCES,WEAPONS,Battle,freshState,normalizeState,syncDay,fighterFor,campaignFighterFor,chooseRoute,rivalsFor,stageFor,settleBattle,train,buyWeapon,toggleWeapon,leadWeapon,toggleSkill,claimQuest,weapon,statsFor} from './engine.mjs?v=2.1.0';
import {icon,petArt,weaponArt} from './art.mjs?v=2.1.0';
import {playCombatMotion,paintArtwork,destroyScene3D,syncScene3D,resumeScene3D} from './battle3d.mjs?v=2.1.0';
import {readProtectedSave,writeProtectedSave} from './save-store.mjs?v=2.1.0';
import {handArt} from './fighter-rig.mjs?v=2.1.0';
import {combatSnapshot} from './combat-presentation.mjs?v=2.1.0';
import {appView,healthBox,combatControls,logView,groundView,pocketsView,tacticsView,heldLabel,motionControl,escapeHTML as e,NAV} from './views.mjs?v=2.1.0';
const STORE='pet-brawl-jianghu-v1';
const root=document.querySelector('#app'),modalRoot=document.querySelector('#modal-root'),toastEl=document.querySelector('#toast');
let loadedSave;try{loadedSave=readProtectedSave(localStorage,STORE);}catch{loadedSave={state:freshState(),blocked:true,recovered:false};}
let state=loadedSave.state,loadError=loadedSave.blocked;
const ui={nav:'tower',filter:'all',towerStage:Math.min(state.stage,TOTAL_STAGES),rivals:[],selected:null,battle:null,logs:[],display:null,displayGround:[],animating:false,paused:false,saveError:false};
let motionCancel=null;
let timer=null,toastTimer=null,resultTimer=null,battleId='',settled=false,dialogKind='',lastFocus=null,audioContext=null;
function newRivals(){ui.rivals=rivalsFor(state,Math.floor(Math.random()*1000000));ui.selected=ui.rivals[0];}
newRivals();
function save(){let ok=false;try{ok=writeProtectedSave(localStorage,state,{key:STORE,blocked:loadError});}catch{}ui.saveError=!ok;if(!ok)toast(loadError?'原存档已保护，请导入备份后继续保存。':'浏览器未允许保存，请在设置中导出存档备份。');return ok;}
function render(){syncDay(state);destroyScene3D();root.innerHTML=appView(state,ui);paintArtwork(root,state,{...ui,player:campaignFighterFor(state,ui.selected)});}
function toast(text){clearTimeout(toastTimer);toastEl.textContent=text;toastEl.classList.add('visible');toastTimer=setTimeout(()=>toastEl.classList.remove('visible'),3300);}
function active(){return ui.battle&&(!ui.battle.done||ui.animating);}
function canChange(){if(active()){toast('先打完这一场吧，也可以点快进立即结算。');return false;}return true;}
function navigate(page){if(!NAV.some(n=>n[0]===page)||!canChange())return;closeDialog();clearTimeout(resultTimer);ui.battle=null;ui.display=null;ui.displayGround=[];ui.nav=page;if(page==='tower')ui.towerStage=Math.min(state.stage,TOTAL_STAGES);if(page==='arena'&&ui.selected.mode==='tower')newRivals();render();window.scrollTo({top:0,behavior:'smooth'});}
function ensureAudio(){if(!state.settings.sound)return;try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}catch{state.settings.sound=false;}}
function sound(kind){if(!state.settings.sound)return;ensureAudio();if(!audioContext)return;try{const t=audioContext.currentTime,o=audioContext.createOscillator(),g=audioContext.createGain();o.type=kind==='burst'?'triangle':'sine';const f=kind==='win'?660:kind==='miss'?680:kind==='burst'?180:kind==='coin'?980:280;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(kind==='win'?980:Math.max(50,f*.4),t+.12);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.2);}catch{}}
function showDialog(title,body,kind='generic'){clearTimeout(resultTimer);lastFocus=document.activeElement;dialogKind=kind;modalRoot.innerHTML=`<dialog id="game-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close" aria-label="关闭">${icon('close')}</button></div>${body}</dialog>`;const d=modalRoot.querySelector('dialog');d.showModal();paintArtwork(modalRoot,state,{...ui,player:fighterFor(state)});d.addEventListener('cancel',ev=>{ev.preventDefault();closeDialog();});d.addEventListener('click',ev=>{if(ev.target===d){const r=d.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)closeDialog();}});}
function closeDialog(){const d=modalRoot.querySelector('dialog');if(d?.open)d.close();modalRoot.innerHTML='';dialogKind='';if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;}
function settings(){if(!canChange())return;showDialog('江湖小设置',`<div class="dialog-body"><div class="settings-row"><span>我的侠名<small>最多 12 个字</small></span><button class="text-button" data-action="rename">${e(state.name)} ${icon('edit')}</button></div><div class="settings-row"><span>乐斗音效<small>轻量音效，默认关闭</small></span><button class="button secondary small-btn" data-action="sound">${state.settings.sound?'已开启':'已关闭'}</button></div><div class="settings-row"><span>战斗动画<small>完整：侧身对战、立体刀光、元素爆发、动态光影与命中震动；简化：保留关键刀光、命中效果和伤害提示</small></span><button class="button secondary small-btn" data-action="motion">${state.settings.motion==='reduced'?'简化动画':'豪华特效'}</button></div><div class="settings-row"><span>战斗速度<small>战斗中也可随时切换</small></span><button class="button secondary small-btn" data-action="speed">${state.settings.speed}×</button></div><div class="settings-row"><span>自动施展空手绝学<small>关闭后可手动施展，次数不限</small></span><button class="button secondary small-btn" data-action="auto">${state.settings.autoBurst?'已开启':'已关闭'}</button></div><div class="settings-buttons"><button class="button light" data-action="export">${icon('download')}导出存档</button><button class="button light" data-action="import">${icon('upload')}导入存档</button></div><section class="cdk-section"><div class="spread"><div><strong>CDK · 神器兑换</strong><p>输入兑换码，领取专属护身神器。</p></div><button class="button secondary small-btn" data-action="cdk">输入 CDK</button></div>${hasRelic(state)?`<div class="relic-card"><div class="relic-art">${relicArt()}</div><div><small>CDK 限定 · 护身神器</small><h3>${RELIC.name}</h3><p>攻击 +50,000 · 防御 +50,000<br>闪避值 +50,000</p><button class="button small-btn secondary" data-action="toggle-relic" aria-pressed="${relicActive(state)}">${relicActive(state)?'已装备 · 点击卸下':'装备神器'}</button></div></div>`:''}</section><p class="help-note">进度保存在当前浏览器，换设备前请导出存档。对手均为电脑角色。普通物品使用铜钱获得，限定神器仅能通过 CDK 兑换。</p><button class="text-button" data-action="nav" data-value="records" style="margin-top:16px">${icon('scroll')}查看最近战报 ${icon('arrow')}</button><button class="danger-button" data-action="reset-confirm">重新开始一段江湖</button></div>`,'settings');}
function cdkDialog(){if(!canChange())return;showDialog('CDK 神器兑换',`<div class="dialog-body" id="cdk-form" role="group" aria-label="CDK 兑换"><div class="cdk-hero"><div class="relic-art">${relicArt()}</div><small>EXCLUSIVE RELIC</small><h3>${RELIC.name}</h3><p>攻击 +50,000 · 防御 +50,000 · 闪避值 +50,000</p></div><label class="field-label" for="cdk-input">输入兑换码</label><input class="name-input" id="cdk-input" name="cdk" placeholder="粘贴兑换码，支持空格及中英文横线" maxlength="160" autocomplete="off" autocapitalize="characters" spellcheck="false" required aria-describedby="cdk-status"><p id="cdk-status" class="cdk-status" role="status" aria-live="polite">每份存档限领一次，兑换后自动装备。</p><button class="button full" id="cdk-submit" type="button" data-action="redeem-cdk">兑换神器</button><p class="help-note">独立护身装备，可在设置中卸下。三项属性仅在装备时生效；闪避值影响概率，不代表百分比，普通攻击闪避概率最高 95%，必中的专属绝招不受影响。神器不占兵器携带位，也不会被投掷或抢走。</p></div>`,'cdk');document.querySelector('#cdk-input')?.focus();}
function submitCdk(){
 if(!canChange())return Promise.resolve();
 const form=document.querySelector('#cdk-form'),button=document.querySelector('#cdk-submit'),status=document.querySelector('#cdk-status');
 if(!form||button?.disabled)return Promise.resolve();
 const before=state,code=document.querySelector('#cdk-input')?.value||'';let candidate;
 if(button){button.disabled=true;button.textContent='正在校验…';}if(status)status.textContent='正在校验兑换码…';
 return Promise.resolve().then(()=>{candidate=normalizeState(before);return redeemCdk(candidate,code);}).then(result=>{
  if(state!==before||active()){if(status)status.textContent='游戏进度已变化，请重新输入兑换码。';return;}
  if(!result.ok){if(status)status.textContent=result.message;return;}
  state=candidate;const saved=save();ui.battle=null;render();
  if(dialogKind==='cdk')showDialog('神器兑换成功',`<div class="dialog-body"><div class="cdk-hero"><div class="relic-art">${relicArt()}</div><h3>${RELIC.name}</h3><p>已领取并装备</p></div><div class="unlock-notice">攻击 +50,000<br>防御 +50,000<br>闪避值 +50,000</div><p class="cdk-status" role="status">${saved?'已保存到当前存档。可以在设置中卸下或重新装备。':'当前环境无法保存进度，请先点击下方按钮导出存档。'}</p><div class="settings-buttons"><button class="button secondary" type="button" data-action="export">导出存档</button><button class="button" type="button" data-action="settings">查看已装备神器</button></div></div>`,'cdk-success');
  toast(saved?result.message:'兑换成功，但浏览器未能保存，请立即导出存档。');
 }).catch(()=>{if(status)status.textContent='校验暂时失败，请重试。';}).finally(()=>{if(button){button.disabled=false;button.textContent='兑换神器';}});
}
function help(){showDialog('三分钟，闯入小江湖',`<div class="dialog-body"><div class="help-steps">${[['挑对手，放轻松','在乐斗广场选择对手，点「开始乐斗」。每场满血开打，不扣体力；输了也有铜钱和经验。'],['带兵器，配绝学','所有已收集兵器都能携带，兵器谱可一键全部带上。同一把武器最多使用 5 次持械行动，随后必须投掷或丢弃，可在战斗中选择。出手未命中也计数，眩晕不计数。已领悟被动绝学装配不限量。'],['缴械、抢夺与拾取','缴械打落对手手持兵器，抢夺成功则加入自己的本场武器池；拾取能捡回被缴械的兵器，并保留已使用次数。用满后投掷或丢弃的兵器退出本场，不能捡回。三者都占用一次行动，缴械与抢夺共用 3 次己方行动冷却，成功率受敏捷和身法影响。'],['空手，无限施展绝学','没有兵器后，以三十二路拳掌腿法过招，不限次数、没有冷却。可关闭自动，改为手动施展。怒气满 100 时升级为专属绝招。持械时绝学只有 6% 概率触发，不能手动强制释放。'],['长经验，闯江湖','铜钱可买兵器、永久修炼。升级提升全部属性，首次击败每章首领还能获得兵器奖励。']].map(([t,p],i)=>`<div class="help-step"><span>${i+1}</span><div><h3>${t}</h3><p>${p}</p></div></div>`).join('')}</div><p class="help-note">敏捷影响先手、闪避与暴击。防御按比例减伤，护盾先吸收伤害。战斗最多 80 回合（160 次行动）。第 41 回合开始进入决胜时刻，伤害逐渐提高、回复减半，避免僵局。超时按剩余生命比例判胜。兵器用尽时空手作战，缴械和抢夺不改变战后装备。<br><br>这是独立制作的宠物乐斗单机版，进度自动保存在本机。开启音效、导出存档和更改侠名，请点右上角头像。</p><button class="button full" style="margin-top:20px" data-action="close">懂了，去打两招 ${icon('arrow')}</button></div>`,'help');}
function rename(){if(!canChange())return;showDialog('取个响亮的侠名',`<form class="dialog-body" id="rename-form"><label class="field-label" for="pet-name">你的小侠，叫什么？</label><input class="name-input" id="pet-name" name="petname" value="${e(state.name)}" maxlength="12" required autocomplete="off"><button class="button full" type="submit">就叫这个名字</button></form>`,'rename');const input=document.querySelector('#pet-name');input.focus();input.select();}
function weaponInfo(id){const w=weapon(id);showDialog(w.name,`<div class="dialog-body detail-center"><div class="detail-art" data-weapon-model="${id}">${weaponArt(id)}</div><h3>${w.effect}</h3><p>${w.flavor}</p><div class="detail-stats"><span>${w.rarity}</span><span>伤害 +${w.min}–${w.max}${w.hits?' × 2':''}</span><span>基础命中 ${Math.round(w.accuracy*100)}%</span></div><div class="detail-effect">${w.desc}</div><p class="help-note">${w.hits?'两次连击合计使用一次基础攻击，附加伤害计算两次。':'基础攻击与兵器附加伤害共同决定输出。'}伤害还会受到防御、护盾、暴击和天赋影响。${w.shield?'即使未命中也会获得护盾。':''}</p><button class="button full" style="margin-top:18px" data-action="close">收好这份兵器笔记</button></div>`,'weapon');}
function startBattle(){
  if(active())return;closeDialog();clearTimeout(timer);clearTimeout(resultTimer);motionCancel?.();motionCancel=null;ensureAudio();
  ui.nav='arena';ui.logs=[];ui.paused=false;ui.animating=false;ui.battle=new Battle(campaignFighterFor(state,ui.selected),ui.selected);ui.display=ui.battle.snapshot();ui.displayGround=[];
  ui.battle.autoBurst=state.settings.autoBurst;battleId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);settled=false;render();timer=setTimeout(playStep,350);
}
function eventText(v){
  const [a,b]=[ui.battle.fighters[v.actor],ui.battle.fighters[v.target]];
  if(v.kind==='boss-charge')return`${a.name} 正在蓄力「${v.bossSkill.name}」。下次行动释放，可用缴械、抢夺或眩晕打断。`;
  if(v.kind==='burn')return`${a.name} 被灼烧击倒，余火造成 ${v.burn} 点伤害。`;
  if(v.kind==='stunned')return`${a.name} 眼冒金星，晕乎乎地休息了一回合。`;
  if(v.kind==='discard')return`${a.name} 将用满五回合的「${weapon(v.weapon).name}」扔出场外。${v.notes.join('，')}。`;
  let t=v.kind==='pickup'?`${a.name} 抢先捡起了地上的兵器。`:`${a.name} 使出「${v.name}」`;
  if(['disarm','steal'].includes(v.kind))t+=`（成功率 ${Math.round(v.chance*100)}%），${v.tacticSuccess?'得手了！':'被 '+b.name+' 防住了。'}`;
  else if(v.kind!=='pickup')t+=v.dodged?`，被 ${b.name} 闪开了！`:`，${v.crit?'暴击！':''}${v.hits>1?'二连击！':''}造成 ${v.damage} 点伤害${v.absorbed?'（护盾吸收 '+v.absorbed+'）':''}。`;
  if(v.heal)t+=` 回复 ${v.heal} 点生命。`;if(v.notes.length)t+=' '+v.notes.join('，')+'。';return t;
}
function updateCombat(){
  const b=ui.battle;if(!b)return;const display=ui.display||b.fighters;syncScene3D(display,ui.displayGround);
  const m=document.querySelector('#motion-control');if(m)m.innerHTML=motionControl(state.settings);
  const h=document.querySelector('#health-row');if(h)h.innerHTML=display.map(healthBox).join('');
  const c=document.querySelector('#arena-controls');if(c)c.innerHTML=combatControls(state,b,ui.paused,ui.animating);
  const tactics=document.querySelector('#tactics-bar');if(tactics)tactics.innerHTML=tacticsView(b);
  const pockets=document.querySelector('#battle-pockets');if(pockets)pockets.innerHTML=pocketsView(display);
  const g=document.querySelector('#ground-weapons');if(g)g.innerHTML=groundView(ui.displayGround);
  const l=document.querySelector('#log-lines');if(l)l.innerHTML=logView(ui.logs);
  const r=document.querySelector('#scene-round');if(r)r.textContent=`第 ${Math.max(1,Math.ceil(b.steps/2))} / 80 回合${b.steps>80?' · 决胜时刻':''}${ui.paused?' · 已暂停':''}`;
}
function syncHeld(){
  (ui.display||ui.battle.fighters).forEach((f,i)=>{const held=document.querySelector('#held-'+i),label=document.querySelector('#held-label-'+i);if(held){held.innerHTML=handArt(f.held);held.style.opacity='1';}if(label)label.textContent=heldLabel(f);});
}
function appendEvent(v){if(!v||ui.logs.some(l=>l.step===v.step))return;ui.logs.push({step:v.step,actor:v.actor,burst:['burst','martial','boss-skill','boss-charge'].includes(v.kind)||!!v.weaponEvent,text:eventText(v)});}
function playStep(){
  clearTimeout(timer);if(!ui.battle||ui.battle.done||ui.animating||ui.paused||document.visibilityState==='hidden')return;
  const v=ui.battle.step();if(!v)return;ui.animating=true;ui.pendingEvent=v;let fraction=0,transferred=false;
  const commitLog=()=>{if(fraction>=1&&(!v.weaponEvent||transferred))appendEvent(v);};
  const banner=document.querySelector('#event-banner');if(banner){banner.className='event-banner '+(['burst','martial','boss-skill','boss-charge'].includes(v.kind)?'burst':['steal','disarm','pickup'].includes(v.kind)?'tactic-banner':'');banner.textContent=v.kind==='stunned'?v.before[v.actor].name+'：头有点晕……':v.kind==='burn'?'灼烧发作！':v.before[v.actor].name+' · '+v.name;}
  motionCancel=playCombatMotion(v,{speed:state.settings.speed,motion:state.settings.motion,
    onImpact(part){
      fraction=part;ui.display=combatSnapshot(v,fraction,{transferred});
      ui.displayGround=transferred?v.groundAfter:v.groundBefore;commitLog();updateCombat();sound(v.dodged?'miss':v.kind);
    },
    onTransfer(){transferred=true;ui.display=combatSnapshot(v,fraction,{transferred});ui.displayGround=v.groundAfter;commitLog();updateCombat();syncHeld();},
    onFinish(){appendEvent(v);ui.pendingEvent=null;motionCancel=null;ui.animating=false;ui.display=v.after;ui.displayGround=v.groundAfter;updateCombat();syncHeld();if(ui.battle.done)finishBattle();else if(!ui.paused&&document.visibilityState!=='hidden')timer=setTimeout(playStep,90/state.settings.speed);}
  });
}
function skipBattle(){
  if(!active())return;clearTimeout(timer);motionCancel?.();motionCancel=null;ui.animating=false;ui.paused=false;
  appendEvent(ui.pendingEvent);ui.pendingEvent=null;
  while(!ui.battle.done){const v=ui.battle.step();appendEvent(v);}
  ui.display=ui.battle.snapshot();ui.displayGround=ui.battle.ground;updateCombat();syncHeld();finishBattle();
}
function finishBattle(){
  if(settled)return;settled=true;ui.animating=false;ui.paused=false;clearTimeout(timer);motionCancel?.();motionCancel=null;
  const result=settleBattle(state,ui.selected,ui.battle.winner===0,battleId,ui.battle.summary());if(!result)return;
  save();render();sound(result.won?'win':'hit');resultTimer=setTimeout(()=>showResult(result),500);
}
function showResult(r){const tower=ui.selected.mode==='tower',hasNext=tower&&r.won&&state.stage<=TOTAL_STAGES&&ui.selected.stage<state.stage;showDialog(r.won?'这场，打得漂亮':'下次，一定翻盘',`<div class="result-body"><div class="result-art">${petArt(state.pet)}</div><div class="result-eyebrow">${r.won?'A LITTLE VICTORY':'EVERY BATTLE COUNTS'}</div><h3 class="result-title ${r.won?'':'loss'}">${r.won?['少侠，好身手！','这局有点帅！','小爪子，大胜利！'][Math.floor(Math.random()*3)]:'不服，再练练！'}</h3><p class="result-desc">${r.won?'你战胜了 '+e(ui.selected.name)+'，江湖又多了一段传说。':'这次惜败于 '+e(ui.selected.name)+'，经验与铜钱照样带回家。'}</p><div class="result-rewards"><div><b>${icon('coin')}+${r.gold}</b><small>铜钱${r.levels.length?' · 含升级奖励':''}</small></div><div><b>${icon('spark')}+${r.xp}</b><small>经验</small></div></div>${r.levels.length||r.unlocks.length||r.chapterClear?`<div class="unlock-notice">${r.levels.length?`升级至 Lv.${state.level}！全部基础属性提升。<br>`:''}${r.unlocks.map(e).join('<br>')}${r.chapterClear?'<br>整章通关！':''}</div>`:''}${r.firstClear&&ui.selected.mode==='tower'?`<div class="story-result"><strong>${r.chapterClear?'章节落幕':'江湖进展'}</strong><p>${e(ui.selected.victory)}</p></div>`:''}<div class="battle-summary-strip">本场 ${r.combat?.rounds||0} 回合 · 缴械 ${r.combat?.disarms||0} 次 · 抢夺 ${r.combat?.steals||0} 次 · 拾取 ${r.combat?.pickups||0} 次<br>投掷 ${r.combat?.throws||0} 次 · 弃械 ${r.combat?.discards||0} 次 · 绝学 ${r.combat?.arts||0} 次<br><span class="tiny muted">本场武器争夺结束，原有装备已归还。</span></div><div class="result-actions"><button class="button secondary" data-action="${r.won?'close':'result-train'}">${r.won?'先歇一小会':'去修炼一下'}</button><button class="button" data-action="${hasNext?'next-stage':'again'}">${hasNext?'挑战下一关':'再来一场'} ${icon('arrow')}</button></div><p class="result-footnote">${ui.saveError?'进度未保存，请在设置中导出备份。':r.won?'进度已保存。铜钱可以用来修炼或收集新兵器。':'失败没有额外惩罚，下一场依然满血出发。'}</p></div>`,'result');}
function doChange(result,success){if(!result?.ok){toast(result?.message||'暂时无法操作');return false;}save();ui.battle=null;render();sound('coin');if(success)toast(success);return true;}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pet-brawl-save-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('存档已导出，换设备时可以导入继续玩。');}
const unrestricted=new Set(['motion','sound','help','close','speed','auto','burst','skip','weapon-info','tactic','pause','disposal']);
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-action]');if(!button||button.disabled)return;const action=button.dataset.action,value=button.dataset.value;ev.preventDefault();if(active()&&!unrestricted.has(action)){canChange();return;}
  switch(action){
    case'nav':navigate(value);break;
    case'settings':settings();break;
    case'cdk':cdkDialog();break;
    case'redeem-cdk':return submitCdk();
    case'toggle-relic':if(hasRelic(state)){state.relicEquipped=!state.relicEquipped;save();ui.battle=null;render();settings();toast(state.relicEquipped?'无极天印已装备，三项属性生效。':'无极天印已卸下。');}break;
    case'help':help();break;
    case'close':closeDialog();break;
    case'rename':rename();break;
    case'sound':state.settings.sound=!state.settings.sound;ensureAudio();save();if(active()){const snd=root.querySelector('[data-action="sound"]');if(snd){snd.innerHTML=icon(state.settings.sound?'sound':'muted');snd.title=(state.settings.sound?'关闭':'开启')+'音效';snd.setAttribute('aria-label',snd.title);}}else render();if(dialogKind==='settings')settings();sound('coin');break;
    case'motion':state.settings.motion=state.settings.motion==='reduced'?'full':'reduced';motionCancel?.setMotion(state.settings.motion);save();if(active())updateCombat();else render();if(dialogKind==='settings')settings();break;
    case'speed':{const speeds=[1,1.5,2,3];state.settings.speed=speeds[(speeds.indexOf(state.settings.speed)+1)%speeds.length];motionCancel?.setRate(state.settings.speed);save();if(active())updateCombat();else if(dialogKind==='settings')settings();else render();break;}
    case'auto':state.settings.autoBurst=!state.settings.autoBurst;save();if(ui.battle)ui.battle.autoBurst=state.settings.autoBurst;if(active())updateCombat();else if(dialogKind==='settings')settings();else render();break;
    case'select-rival':ui.selected=ui.rivals[Number(value)]||ui.rivals[0];ui.battle=null;ui.logs=[];render();break;
    case'refresh-rivals':newRivals();ui.battle=null;ui.logs=[];render();break;
    case'start':case'again':startBattle();break;
    case'pause':ui.paused=!ui.paused;if(ui.paused){clearTimeout(timer);motionCancel?.pause();}else if(document.visibilityState!=='hidden'){if(ui.animating)motionCancel?.resume();else if(!ui.battle?.done)timer=setTimeout(playStep,90);}updateCombat();break;
    case'tactic':if(ui.battle?.requestTactic(value)){updateCombat();toast(({disarm:'缴械',steal:'抢夺',pickup:'拾取'}[value])+'已安排，将在下次行动生效。');}break;
    case'disposal':if(ui.battle?.setDisposal(value)){updateCombat();toast(value==='throw'?'用满五回合后，将投掷打人。':'用满五回合后，将直接丢弃。');}break;
    case'skills-all':state.skills=SKILLS.filter(k=>k.level<=state.level).map(k=>k.id);save();render();toast('已装配全部领悟的绝学。');break;
    case'burst':if(ui.battle?.requestBurst()){updateCombat();toast('绝学蓄势，将在下次空手行动时施展！');}break;
    case'skip':closeDialog();skipBattle();break;
    case'filter':ui.filter=value;render();break;
    case'weapon-info':weaponInfo(value);break;
    case'equip-all':state.equipped=[...state.owned].sort((a,b)=>weapon(b).level-weapon(a).level);save();ui.battle=null;render();toast('全部 '+state.equipped.length+' 件兵器已经带好！');break;
    case'equip-weapon':doChange(toggleWeapon(state,value),state.equipped.includes(value)?'兵器已经带好':'兵器已卸下');break;
    case'lead-weapon':doChange(leadWeapon(state,value),'已设为首发：'+weapon(value).name);break;
    case'buy-weapon':{const r=buyWeapon(state,value);if(r.ok)state.equipped.unshift(value);doChange(r,'「'+weapon(value).name+'」收入囊中！');break;}
    case'pet':if(PETS[value]){state.pet=value;save();ui.battle=null;render();toast(PETS[value].name+'，准备出发！');}break;
    case'stance':if(STANCES[value]){state.stance=value;save();ui.battle=null;render();toast('路数已切换：'+STANCES[value].name);}break;
    case'skill':doChange(toggleSkill(state,value),'绝学搭配已更新');break;
    case'train':{const before=statsFor(state)[value],r=train(state,value);doChange(r,r.ok?'修炼成功！'+({hp:'生命',atk:'攻击',def:'防御',agi:'敏捷'}[value])+' '+before+' → '+statsFor(state)[value]:'');break;}
    case'claim':if(claimQuest(state,value)){save();render();sound('coin');toast('小目标达成，+'+QUESTS.find(q=>q.id===value).gold+' 铜钱！');}break;
    case'choose-route':{const [chapter,route]=value.split(':');doChange(chooseRoute(state,Number(chapter),route),'本章行动方针已更新');break;}
    case'select-act':{const act=Number(value);if(Number.isInteger(act)&&act>=0&&act<4){ui.towerStage=act*200+1;render();}break;}
    case'select-chapter':{const index=Number(value);if(Number.isInteger(index)&&index>=0&&index<CHAPTERS.length){const first=index*STAGES_PER_CHAPTER+1;ui.towerStage=Math.max(first,Math.min(first+STAGES_PER_CHAPTER-1,state.stage));render();}break;}
    case'select-stage':{const n=Number(value);if(Number.isInteger(n)&&n>=1&&n<=TOTAL_STAGES){ui.towerStage=n;render();}break;}
    case'challenge-stage':if(Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=TOTAL_STAGES&&Number(value)<=state.stage){ui.selected=stageFor(Number(value));ui.nav='arena';ui.battle=null;ui.logs=[];render();window.scrollTo({top:0,behavior:'smooth'});startBattle();}break;
    case'next-stage':closeDialog();ui.selected=stageFor(Math.min(state.stage,TOTAL_STAGES));startBattle();break;
    case'result-train':closeDialog();navigate('training');break;
    case'export':exportSave();break;
    case'import':document.querySelector('#import-file').click();break;
    case'confirm-import':if(window.__pendingPetSave){state=window.__pendingPetSave;loadError=false;delete window.__pendingPetSave;save();closeDialog();ui.battle=null;ui.logs=[];ui.towerStage=Math.min(state.stage,TOTAL_STAGES);newRivals();render();toast('存档已载入，少侠别来无恙。');}break;
    case'reset-confirm':showDialog('重新出发？',`<div class="dialog-body"><p class="muted small">这会清除当前的等级、铜钱、兵器和通关进度。建议先导出一份存档。</p><div class="settings-buttons"><button class="button secondary" data-action="export">先导出备份</button><button class="button orange" data-action="reset">确认重新开始</button></div></div>`,'reset');break;
    case'reset':loadError=false;state=freshState();ui.battle=null;ui.logs=[];ui.nav='arena';ui.towerStage=1;save();closeDialog();newRivals();render();toast('新的小江湖，从现在开始。');break;
  }
});
document.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='cdk-input'){ev.preventDefault();if(!ev.repeat)return submitCdk();}});
document.addEventListener('submit',ev=>{if(ev.target.id!=='rename-form')return;ev.preventDefault();const name=new FormData(ev.target).get('petname').trim().slice(0,12);if(!name){toast('先取一个侠名吧。');return;}state.name=name;save();closeDialog();render();toast('记住了，'+name+'少侠！');});
document.querySelector('#import-file').addEventListener('change',async ev=>{const file=ev.target.files[0];ev.target.value='';if(!file)return;if(file.size>1000000){toast('文件太大啦，请选择本游戏导出的 JSON 存档。');return;}try{const imported=normalizeState(JSON.parse(await file.text()));window.__pendingPetSave=imported;showDialog('载入这份江湖记忆？',`<div class="dialog-body"><p class="small muted">即将载入 <b>${e(imported.name)}</b> · Lv.${imported.level} 的存档。<br>当前进度会被替换，可以先导出一份备份。</p><div class="settings-buttons"><button class="button secondary" data-action="export">导出当前进度</button><button class="button" data-action="confirm-import">确认载入</button></div></div>`,'import');}catch{toast('存档格式不正确，请选择本游戏导出的 JSON 文件。');}});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){save();clearTimeout(timer);motionCancel?.pause();}
  else{resumeScene3D();}if(document.visibilityState!=='hidden'&&active()&&!ui.paused){if(ui.animating)motionCancel?.resume();else{clearTimeout(timer);timer=setTimeout(playStep,90);}}
});
window.addEventListener('beforeunload',()=>save());
render();save();
if(loadError)setTimeout(()=>toast('原存档读取失败，已保留原始内容；请在设置中导入备份。'),300);
else if(loadedSave.recovered)setTimeout(()=>toast('已从自动备份恢复江湖进度。'),300);
