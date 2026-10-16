import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
test('Actual controller completes fights, blocks mid-fight edits, trains, claims and restores saves',async()=>{
 if(process.env.CDK_NO_WEB_CRYPTO)Object.defineProperty(globalThis,'crypto',{value:undefined,configurable:true});
 const listeners={},nodes=new Map(),storage=new Map(),timers=new Map();let timerId=0,clock=0;
 class Element{
  constructor(id){this.id=id;this.html='';this.textContent='';this.open=false;this.dataset={};this.style={};this.offsetWidth=300;this.isConnected=true;this.classList={add(){},remove(){}};}
  set innerHTML(v){this.html=v;for(const m of v.matchAll(/\bid="([^"]+)"/g))nodes.set(m[1],new Element(m[1]));}
  get innerHTML(){return this.html;}
  querySelector(sel){if(sel==='dialog')return nodes.get('game-dialog');if(sel.startsWith('#'))return nodes.get(sel.slice(1))||null;return new Element('temporary');}
  addEventListener(type,fn){this[type]=fn;}
  showModal(){this.open=true;}close(){this.open=false;}focus(){}select(){}append(){}remove(){}setAttribute(){}click(){}getBoundingClientRect(){return{left:0,right:400,top:0,bottom:500};}
 }
 for(const id of ['app','modal-root','toast','import-file'])nodes.set(id,new Element(id));
 globalThis.document={querySelector(sel){return nodes.get(sel.slice(1))||null;},addEventListener(type,fn){listeners[type]=fn;},createElement(){return new Element('created');},body:new Element('body'),visibilityState:'visible',activeElement:null};
 globalThis.window={scrollTo(){},addEventListener(){},matchMedia:()=>({matches:true})};
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const originalSet=globalThis.setTimeout,originalClear=globalThis.clearTimeout,originalPerformance=globalThis.performance,originalRAF=globalThis.requestAnimationFrame,originalCAF=globalThis.cancelAnimationFrame;
 globalThis.setTimeout=(fn,ms)=>{timers.set(++timerId,{fn,ms,due:clock+ms});return timerId;};globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.performance={now:()=>clock};globalThis.requestAnimationFrame=fn=>setTimeout(()=>fn(clock),1000/60);globalThis.cancelAnimationFrame=id=>clearTimeout(id);
 const current=()=>JSON.parse(storage.get('pet-brawl-jianghu-v1'));
 function click(action,value,stale=false){const html=nodes.get('app').innerHTML+nodes.get('modal-root').innerHTML;if(!stale){const tag=[...html.matchAll(/<(?:button|a)\b[^>]*>/g)].map(m=>m[0]).find(t=>t.includes(`data-action="${action}"`)&&(value===undefined||t.includes(`data-value="${value}"`)));assert.ok(tag,`Button exists: ${action} ${value??''}`);assert.ok(!/\bdisabled\b/.test(tag),`Button enabled: ${action}`);}const target={dataset:{action,value},disabled:false,closest(){return this;}};return listeners.click({target,preventDefault(){}});}
 function advance(ms){const end=clock+ms;let guard=0;while(true){const next=[...timers].filter(([,t])=>t.due<=end).sort((a,b)=>a[1].due-b[1].due)[0];if(!next)break;assert.ok(guard++<5000);timers.delete(next[0]);clock=next[1].due;next[1].fn();}clock=end;}
 function resolveResult(){for(const[id,t]of [...timers])if(t.ms===500){timers.delete(id);t.fn();}}
 try{
  if(process.env.PET_BRAWL_OFFLINE_PREVIEW){const html=readFileSync(new URL('../review/pet-brawl-v1.5.0-click-fixed.html',import.meta.url),'utf8'),code=html.match(/<script id="preview-app">([\s\S]*?)<\/script>/)[1];new Script(code).runInThisContext();}else await import('../public/app.mjs');assert.equal(current().battles,0);
  assert.equal(current().settings.motion,'full');click('motion');assert.equal(current().settings.motion,'reduced');click('motion');assert.equal(current().settings.motion,'full');
  click('start');assert.ok(nodes.get('app').innerHTML.includes('in-battle'));
  click('nav','training');assert.ok(nodes.get('app').innerHTML.includes('in-battle'));
  advance(500);assert.equal(current().battles,0);assert.equal(nodes.get('health-row').innerHTML,'','Health waits for impact');click('pause');click('motion');assert.equal(current().settings.motion,'reduced');click('motion');assert.equal(current().settings.motion,'full');const pausedHP=nodes.get('health-row').innerHTML;advance(5000);assert.equal(nodes.get('health-row').innerHTML,pausedHP,'Pause freezes an unfinished strike before impact');const pausedLog=nodes.get('log-lines').innerHTML;advance(5000);assert.equal(nodes.get('log-lines').innerHTML,pausedLog);click('pause');advance(450);assert.notEqual(nodes.get('health-row').innerHTML,pausedHP,'Resuming continues the same hit');document.visibilityState='hidden';listeners.visibilitychange();const hiddenHP=nodes.get('health-row').innerHTML;advance(5000);assert.equal(nodes.get('health-row').innerHTML,hiddenHP,'A hidden tab does not fast-forward the action');document.visibilityState='visible';listeners.visibilitychange();advance(80);click('speed');
  click('skip');assert.equal(current().battles,1);const reward=current().gold;
  click('skip',undefined,true);assert.equal(current().battles,1);assert.equal(current().gold,reward);advance(2500);assert.equal(current().battles,1,'Canceled animation cannot resettle');assert.equal(current().gold,reward);
  resolveResult();assert.ok(nodes.get('modal-root').innerHTML.includes('result-rewards'));click('close');
  click('nav','training');click('train','hp');assert.equal(current().training.hp,1);const before=current().gold;
  click('claim','trains');assert.equal(current().gold,before+80);click('claim','trains',true);assert.equal(current().gold,before+80);
  click('nav','pet');click('pet','cat');assert.equal(current().pet,'cat');click('stance','fierce');assert.equal(current().stance,'fierce');
  click('nav','weapons');click('equip-weapon','brick');assert.deepEqual(current().equipped,['bamboo']);click('equip-weapon','bamboo');assert.deepEqual(current().equipped,['bamboo']);click('equip-weapon','brick');
  click('nav','arena');for(let i=0;i<8;i++){click('start');click('skip');resolveResult();click('close');}assert.equal(current().battles,9);assert.ok(current().level>=2);assert.ok(current().owned.includes('pan'));
  click('nav','tower');click('challenge-stage','1');click('skip');resolveResult();click('close');assert.equal(current().battles,10);
  click('settings');click('reset-confirm');click('reset');assert.equal(current().level,1);assert.equal(current().battles,0);
  const imported={...current(),name:'存档少侠',gold:987};nodes.get('import-file').files=[{size:600,text:async()=>JSON.stringify(imported)}];await nodes.get('import-file').change({target:nodes.get('import-file')});click('confirm-import');assert.equal(current().name,'存档少侠');assert.equal(current().gold,987);
  const full={...current(),level:20,owned:['bamboo','brick','pan','slipper','fish','fan','nunchaku','hammer','umbrella','pepper','guitar','spoon'],equipped:['bamboo']};nodes.get('import-file').files=[{size:800,text:async()=>JSON.stringify(full)}];await nodes.get('import-file').change({target:nodes.get('import-file')});click('confirm-import');click('nav','weapons');click('equip-all');assert.equal(current().equipped.length,12);
  click('lead-weapon','bamboo');assert.equal(current().equipped[0],'bamboo');
  click('nav','tower');click('select-chapter','4');assert.ok(nodes.get('app').innerHTML.includes('天下擂台'));click('select-stage','200');assert.ok(nodes.get('app').innerHTML.includes('归元乐斗盟主'));const priorBattles=current().battles;click('challenge-stage','200',true);assert.equal(current().battles,priorBattles);assert.ok(!nodes.get('app').innerHTML.includes('in-battle'));
  const late={...current(),stage:200,level:80,training:{hp:60,atk:60,def:60,agi:60}};nodes.get('import-file').files=[{size:1600,text:async()=>JSON.stringify(late)}];await nodes.get('import-file').change({target:nodes.get('import-file')});click('confirm-import');click('nav','tower');click('challenge-stage','200');assert.ok(nodes.get('app').innerHTML.includes('章节大 Boss'));click('skip');resolveResult();click('close');
  click('settings');click('cdk');assert.ok(nodes.get('modal-root').innerHTML.includes('仅在装备时生效'));
  assert.ok(nodes.get('modal-root').innerHTML.includes('type="button" data-action="redeem-cdk"'));assert.ok(!nodes.get('modal-root').innerHTML.includes('<form'));
  await click('redeem-cdk');assert.match(nodes.get('cdk-status').textContent,/请输入有效/);
  nodes.get('cdk-input').value='BAD-CODE';await click('redeem-cdk');
  assert.deepEqual(current().cdkClaims,[]);assert.match(nodes.get('cdk-status').textContent,/不正确/);
  if(process.env.CDK_TEST_CODE){
   nodes.get('cdk-input').value=process.env.CDK_TEST_CODE.toLowerCase();const redeem=click('redeem-cdk');assert.equal(nodes.get('cdk-submit').disabled,true);assert.equal(nodes.get('cdk-status').textContent,'正在校验兑换码…');await click('redeem-cdk');await redeem;
   assert.deepEqual(current().cdkClaims,['wuji-seal']);assert.equal(current().relicEquipped,true);assert.ok(nodes.get('modal-root').innerHTML.includes('神器兑换成功'));assert.ok(nodes.get('game-dialog').open);click('settings');assert.ok(nodes.get('modal-root').innerHTML.includes('已装备'));
   click('toggle-relic');assert.equal(current().relicEquipped,false);click('toggle-relic');assert.equal(current().relicEquipped,true);
   const roundtrip=current();nodes.get('import-file').files=[{size:2000,text:async()=>JSON.stringify(roundtrip)}];await nodes.get('import-file').change({target:nodes.get('import-file')});click('confirm-import');
   assert.deepEqual(current().cdkClaims,['wuji-seal']);assert.equal(current().relicEquipped,true);
   click('settings');click('cdk');nodes.get('cdk-input').value=process.env.CDK_TEST_CODE;await listeners.keydown({key:'Enter',target:{id:'cdk-input'},preventDefault(){}});assert.match(nodes.get('cdk-status').textContent,/已经兑换/);click('close');
  }
  const snapshot=JSON.stringify(current());nodes.get('import-file').files=[{size:15,text:async()=>'{"foreign":true}'}];await nodes.get('import-file').change({target:nodes.get('import-file')});assert.equal(JSON.stringify(current()),snapshot);
 }finally{globalThis.setTimeout=originalSet;globalThis.clearTimeout=originalClear;globalThis.performance=originalPerformance;globalThis.requestAnimationFrame=originalRAF;globalThis.cancelAnimationFrame=originalCAF;}
});
