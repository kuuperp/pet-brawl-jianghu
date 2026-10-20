// Presentation reads the same impact and transfer cues as the action clock.
const cap=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const copy=f=>({...f,weapons:[...(f.weapons||[])],weaponUses:[...(f.weaponUses||[])],skills:[...(f.skills||[])]});
const portion=(n,f)=>Math.ceil((n||0)*f);
export function combatSnapshot(event,fraction=0,{transferred=false,finished=false}={}){
 const f=finished?1:cap(fraction),before=event.before,after=event.after;
 const shown=(f===1?after:before).map(copy);
 if(f>0&&f<1){
  for(let i=0;i<shown.length;i++){
   const a=before[i],b=after[i];
   shown[i].shield=Math.max(0,(a.shield||0)+Math.sign((b.shield||0)-(a.shield||0))*portion(Math.abs((b.shield||0)-(a.shield||0)),f));
   shown[i].rage=cap((a.rage||0)+Math.round(((b.rage||0)-(a.rage||0))*f),0,100);
   shown[i].hp=cap(a.hp+(i===event.actor?portion(event.heal,f)-portion(event.counter,f)-(event.burn||0):-portion(event.damage,f)),0,a.maxHp);
  }
 }
 if(event.weaponEvent&&!transferred&&!finished)for(let i=0;i<shown.length;i++){
  for(const key of ['weapons','weaponUses','held','heldIndex','heldUses'])shown[i][key]=Array.isArray(before[i][key])?[...before[i][key]]:before[i][key];
 }
 if(transferred&&!finished)for(let i=0;i<shown.length;i++){
  for(const key of ['weapons','weaponUses','held','heldIndex','heldUses'])shown[i][key]=Array.isArray(after[i][key])?[...after[i][key]]:after[i][key];
 }
 return shown;
}
export function presentationAt(sequence,elapsed){
 const hits=sequence.cues.filter(c=>c.kind==='impact'),count=hits.filter(c=>elapsed>=c.time).length;
 return{fraction:hits.length?count/hits.length:0,transferred:!!sequence.event.weaponEvent&&elapsed>=sequence.transferTime,finished:elapsed>=sequence.t.duration};
}
export function createCombatLabels(sequence){
 const e=sequence.event,hits=sequence.cues.filter(c=>c.kind==='impact'),last=hits.at(-1)?.time??sequence.t.impact,labels=[];
 const add=(text,who,time,kind='damage',lane=0,part=0)=>labels.push({id:labels.length,text,who,time,kind,lane,part});
 const damaging=!['stunned','burn','discard','pickup','boss-charge'].includes(e.kind);
 for(const [i,cue]of hits.entries()){
  const split=n=>hits.length===1?n:i===0?Math.ceil(n/2):Math.floor(n/2);
  if(damaging){
   if(e.dodged)add(['disarm','steal'].includes(e.kind)?'护住兵器':'闪避',e.target,cue.time,'evade');
   else{
    if(split(e.damage))add((e.crit?'暴击 ':'−')+split(e.damage),e.target,cue.time,e.crit?'critical':'damage',0,i);
    if(split(e.absorbed))add('格挡 '+split(e.absorbed),e.target,cue.time,'shield',1,i);
   }
  }
  if(split(e.heal))add('+'+split(e.heal),e.actor,cue.time,'heal',0,i);
  if(split(e.counter))add('反伤 −'+split(e.counter),e.actor,cue.time,'damage',1,i);
 }
 if(e.burn)add('灼烧 −'+e.burn,e.actor,hits[0]?.time??last,'damage',2);
 if(e.kind==='stunned')add('晕乎乎',e.actor,last,'evade');
 if(e.kind==='discard')add('弃械换招',e.actor,last,'tactic');
 if(e.kind==='boss-charge')add('蓄力 · 可打断',e.actor,last,'tactic');
 if(e.interrupted)add('打断！',e.target,last,'tactic',2);
 for(const revive of e.revives||[])add('涅槃 +'+revive.hp,revive.who,last,'heal',2);
 const transfer=e.weaponEvent;
 if(transfer&&['disarm','steal','pickup'].includes(transfer.kind))add({disarm:'缴械！',steal:'抢到了！',pickup:'兵器到手'}[transfer.kind],e.actor,sequence.transferTime,'tactic',2);
 return labels;
}
export function sampleCombatLabels(labels,elapsed,lifetime=900){
 return labels.flatMap(label=>{
  const age=elapsed-label.time;if(age<0||age>=lifetime)return[];
  const fade=cap((age/lifetime-.65)/.35),opacity=1-fade*fade*(3-2*fade);
  return[{...label,age,opacity,rise:28*Math.sin(cap(age/lifetime)*Math.PI/2)}];
 });
}
export const labelLifetime=rate=>Math.max(900,600*cap(Number(rate)||1,1,3));
export const presentationDuration=(sequence,labels,lifetime)=>Math.max(sequence.t.duration,...labels.map(l=>l.time+lifetime));
