import {weaponArt} from './art.mjs?v=2.2.0';
// The battle rig is separate from portrait art. Nested elbow/knee joints move the actual limbs.
export const GUARD={body:0,y:0,head:0,af:-28,ef:-72,ab:22,eb:-75,lf:-15,kf:15,lb:22,kb:-18};
export const POSES={
 guard:GUARD,
 uppercut:{body:-8,y:-6,head:7,af:-155,ef:42,ab:25,eb:-120,lf:-32,kf:37,lb:28,kb:16},
 twinPalm:{body:20,y:1,head:-12,af:-86,ef:-8,ab:-94,eb:8,lf:-29,kf:30,lb:35,kb:8},
 lowKick:{body:15,y:12,head:-12,af:-50,ef:-90,ab:40,eb:-85,lf:-54,kf:3,lb:25,kb:28},
 craneKick:{body:-10,y:-12,head:9,af:-135,ef:-10,ab:95,eb:-25,lf:-112,kf:10,lb:54,kb:88},
 elbow:{body:27,y:-1,head:-14,af:-94,ef:-145,ab:20,eb:-110,lf:-33,kf:34,lb:35,kb:9},
 hammerFist:{body:29,y:9,head:-15,af:-62,ef:25,ab:-72,eb:34,lf:-38,kf:44,lb:34,kb:14},
 healPalm:{body:-5,y:6,head:6,af:-75,ef:-33,ab:-30,eb:-95,lf:-30,kf:52,lb:32,kb:20},
 fingerStrike:{body:23,y:-4,head:-16,af:-100,ef:12,ab:55,eb:-110,lf:-35,kf:34,lb:44,kb:5},
 thrust:{body:24,y:3,head:-13,af:-90,ef:0,ab:-48,eb:-100,lf:-40,kf:40,lb:41,kb:8},
 swing:{body:21,y:0,head:-14,af:-115,ef:28,ab:75,eb:-80,lf:-24,kf:27,lb:33,kb:8},
 runA:{body:12,y:-4,head:-8,af:55,ef:-80,ab:-65,eb:-35,lf:-48,kf:18,lb:46,kb:70},
 runB:{body:13,y:-1,head:-8,af:-65,ef:-35,ab:55,eb:-80,lf:45,kf:70,lb:-48,kb:18},
 chamber:{body:-15,y:4,head:10,af:42,ef:-128,ab:-40,eb:-45,lf:25,kf:25,lb:-25,kb:20},
 slash:{body:19,y:1,head:-12,af:-88,ef:28,ab:46,eb:-95,lf:-28,kf:28,lb:37,kb:8},
 smashReady:{body:-12,y:-4,head:6,af:-150,ef:-35,ab:-125,eb:-35,lf:-15,kf:15,lb:25,kb:10},
 smash:{body:32,y:6,head:-15,af:-45,ef:-12,ab:-60,eb:-10,lf:-35,kf:30,lb:38,kb:8},
 punch:{body:13,y:-1,head:-9,af:-92,ef:3,ab:38,eb:-110,lf:-24,kf:26,lb:30,kb:8},
 cross:{body:19,y:-2,head:-12,af:40,ef:-105,ab:-103,eb:5,lf:-30,kf:28,lb:28,kb:4},
 palm:{body:7,y:4,head:-4,af:-78,ef:-15,ab:35,eb:-140,lf:-28,kf:42,lb:35,kb:12},
 kickReady:{body:-12,y:-4,head:10,af:-40,ef:-70,ab:25,eb:-100,lf:-102,kf:110,lb:3,kb:5},
 kick:{body:-22,y:-7,head:13,af:55,ef:-95,ab:-35,eb:-85,lf:-105,kf:8,lb:13,kb:5},
 crouch:{body:23,y:24,head:-18,af:-35,ef:-90,ab:10,eb:-85,lf:-60,kf:105,lb:55,kb:-55},
 sweep:{body:-25,y:40,head:15,af:15,ef:-20,ab:-75,eb:-65,lf:-50,kf:0,lb:22,kb:85},
 jump:{body:-12,y:-15,head:8,af:-125,ef:-25,ab:-135,eb:-20,lf:-70,kf:100,lb:55,kb:85},
 fly:{body:-25,y:-10,head:12,af:45,ef:-95,ab:-105,eb:-40,lf:-94,kf:0,lb:65,kb:90},
 shoulder:{body:36,y:1,head:-20,af:8,ef:-150,ab:8,eb:-145,lf:-30,kf:30,lb:38,kb:0},
 slam:{body:32,y:9,head:-15,af:-58,ef:-15,ab:-58,eb:-15,lf:-42,kf:70,lb:38,kb:40},
 throwReady:{body:-16,y:2,head:10,af:125,ef:-105,ab:-55,eb:-40,lf:-10,kf:30,lb:35,kb:5},
 throw:{body:24,y:-2,head:-15,af:-112,ef:6,ab:42,eb:-45,lf:-25,kf:25,lb:45,kb:10},
 grab:{body:22,y:5,head:-10,af:-76,ef:3,ab:-70,eb:3,lf:-30,kf:30,lb:30,kb:10},
 pickup:{body:25,y:20,head:-8,af:-20,ef:0,ab:25,eb:-90,lf:-50,kf:95,lb:45,kb:-45},
 guardHigh:{body:-13,y:4,head:9,af:-125,ef:-50,ab:-110,eb:-55,lf:-10,kf:25,lb:22,kb:8},
 recoil:{body:-28,y:3,head:-14,af:35,ef:-35,ab:65,eb:-30,lf:-15,kf:25,lb:25,kb:25},
 dodge:{body:-32,y:17,head:20,af:-35,ef:-60,ab:35,eb:-60,lf:-30,kf:70,lb:45,kb:12}
};
const palette={penguin:{body:'#577e85',limb:'#4b7279',belly:'#fffcdf',foot:'#e5b252',scarf:'#df7b5c'},panda:{body:'#fffbe7',limb:'#465b51',belly:'#fffbe7',foot:'#465b51',scarf:'#749683'},cat:{body:'#e8b87c',limb:'#e5b274',belly:'#fff1cf',foot:'#e8b473',scarf:'#df7b5c'},rabbit:{body:'#fff2e9',limb:'#fff2e9',belly:'#fff8ed',foot:'#fff2e9',scarf:'#bd8799'}};
const joint=(key,content)=>`<g data-joint="${key}" transform="rotate(${GUARD[key]||0})">${content}</g>`;
export function handArt(id){return id&&id!=='fists'&&id!=='burst'?weaponArt(id).replace('<svg ','<svg x="0" y="0" width="76" height="76" '):'';}
export function fighterArt(type='penguin',{enemy=false,index=0,held=null}={}){
 const p=palette[type]||palette.penguin,ink='#344c45';
 // Combat portraits use a single visible eye and an inward-facing muzzle.
 const profileHeads={
  penguin:`<path d="M76 91Q65 39 107 25q45-5 56 34l-1 39q-35 29-76 4z" fill="${p.body}"/><path d="M116 52q33-13 44 18v28q-26 19-48-1z" fill="${p.belly}"/><path d="m155 80 27 10-24 13z" fill="${p.foot}"/><path d="m102 27-4-14 14 10 12-11 2 17" fill="${p.body}"/>`,
  panda:`<circle cx="87" cy="36" r="17" fill="${p.limb}"/><path d="M69 77q-1-43 47-45 45-1 54 37l9 22q-4 24-54 25-51-3-56-39z" fill="${p.body}"/><ellipse cx="143" cy="71" rx="15" ry="20" fill="${p.limb}" transform="rotate(-12 143 71)"/><ellipse cx="170" cy="91" rx="16" ry="12" fill="${p.belly}"/><path d="m173 85 11 5-11 7z" fill="${p.limb}"/>`,
  cat:`<path d="m85 51-9-32 30 18 29 2 17-19 10 34q12 12 11 29l13 10-15 12q-35 24-74 7-38-18-12-61z" fill="${p.body}"/><path d="m87 36 5 17 12-12m41 4 7-13 5 18" fill="#dda496" stroke="none"/><path d="m155 88 20-3 10 8-15 7" fill="#b66f64"/><path d="m159 98 27 3m-29 2 27 10" fill="none" stroke-width="2"/><path d="m121 40 3 12m8-11 3 12" stroke="#b77c4a" stroke-width="4"/>`,
  rabbit:`<path d="M90 56C61-15 94-21 109 47m13 2c6-72 37-63 24 13" fill="${p.body}"/><path d="M94 38C80 0 88-6 100 35m28 2c8-40 20-37 14 6" stroke="#e8b2b8" stroke-width="6" fill="none"/><path d="M74 86q-3-40 42-41 47-3 54 35l14 10-14 13q-30 20-64 11-33-5-32-28z" fill="${p.body}"/><path d="m168 85 13 5-13 7z" fill="#ca8d9f"/>`
 };
 let head=profileHeads[type]||profileHeads.penguin;
 const eyes=type==='panda'?'#fffbe7':ink;
 head+=`<ellipse cx="146" cy="73" rx="3.8" ry="5.4" fill="${eyes}" stroke="none"/><circle cx="147" cy="71" r="1.3" fill="#fff" stroke="none"/><path d="m153 101 9 3 6-5" fill="none" stroke-width="2.5"/><ellipse cx="143" cy="91" rx="7" ry="3.7" fill="#eab3a3" stroke="none"/>`;
 const arm=(front)=>{const k=front?'f':'b',x=front?138:86;return`<g transform="translate(${x} 132)">${joint('a'+k,`<path d="M-10 0Q0-10 10 0l-1 29q-9 11-18 0z" fill="${p.limb}"/><g transform="translate(0 29)">${joint('e'+k,`<path d="M-9-4Q0-10 9-4l1 27q-1 12-12 8-9-1-8-10z" fill="${p.limb}"/><path d="M-9 14h18v9H-9z" fill="${p.scarf}" stroke-width="2"/>${front?`<g class="rig-weapon" transform="translate(-29 -39) rotate(105 29 63)" id="held-${index}">${handArt(held)}</g>`:''}<ellipse cx="0" cy="28" rx="10" ry="9" fill="${p.limb}"/>`)}</g>`)}</g>`;};
 const leg=(front)=>{const k=front?'f':'b',x=front?126:99;return`<g transform="translate(${x} 178)">${joint('l'+k,`<path d="M-12-4h24l-2 31q-11 8-20 0z" fill="${p.body}"/><g transform="translate(0 28)">${joint('k'+k,`<path d="M-10-3h20l-2 30H-8z" fill="${p.limb}"/><path d="M-10 17H9v10h-19z" fill="${p.scarf}" stroke-width="2"/><path d="M-10 27q1-5 19-4l14 9q5 9-8 10H-8q-9-1-2-15z" fill="${p.foot}"/>`)}</g>`)}</g>`;};
 return`<svg viewBox="0 0 240 260" class="fighter-art" role="img" aria-label="${{penguin:'团子企鹅',panda:'糯米熊猫',cat:'橘子猫侠',rabbit:'桃桃玉兔'}[type]}武术动作"><ellipse class="rig-shadow" cx="117" cy="246" rx="54" ry="8" fill="#53614b" opacity=".16"/><g transform="translate(116 178)"><g data-joint="body"><g transform="translate(-116 -178)" stroke="${ink}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${leg(false)}${arm(false)}${type==='cat'?'<path d="M91 168q-40 8-31-20" stroke="#d7a166" stroke-width="12" fill="none"/>':''}<path d="M86 120q27-13 56-1l7 48q-2 26-33 28-34-1-37-27z" fill="${p.body}"/><ellipse cx="113" cy="154" rx="23" ry="28" fill="${p.belly}" stroke="none"/>${leg(true)}<g transform="translate(115 110)">${joint('head',`<g transform="translate(-115 -110)">${head}</g>`)}</g><path d="M83 111q30 12 64-2l-2 15q-30 13-61 0z" fill="${enemy?'#b89260':p.scarf}"/><path d="m91 123-21 28-2-16-12-2 25-15" fill="${enemy?'#b89260':p.scarf}"/>${arm(true)}</g></g></g></svg>`;
}
// Key poses include footwork before/after each strike; identical times drive impact effects.
const ART_MOVES={"bell-palm": "palm", "forge-combo": "combo", "petal-step": "spin-kick", "falcon-dive": "flying-kick", "royal-palm": "palm", "sand-sweep": "sweep", "bronze-fist": "uppercut", "mire-hand": "heal-palm", "frost-kick": "crane-kick", "eruption-fist": "hammer-fist", "star-fingers": "finger-strike", "thunder-elbow": "elbow", "cloud-palm": "twin-palm", "dragon-shoulder": "shoulder", "dawn-strike": "punch", "celestial-wheel": "spin-kick"};
export const canonicalMove=move=>ART_MOVES[move]||move;
export function rigFrames(move='punch'){
 const variant=Object.keys(ART_MOVES).indexOf(move)+1;move=canonicalMove(move);
 const sequence=[[0,'guard'],[.065,'runA'],[.13,'runB'],[.20,'runA'],[.27,'chamber'],[.34,'chamber'],[.40,'punch'],[.46,'chamber'],[.53,'punch'],[.62,'guard'],[.73,'runB'],[.81,'runA'],[.89,'runB'],[.97,'guard'],[1,'guard']];
 const pairs={uppercut:['crouch','uppercut'],'twin-palm':['chamber','twinPalm'],'low-kick':['crouch','lowKick'],'crane-kick':['jump','craneKick'],elbow:['chamber','elbow'],'hammer-fist':['smashReady','hammerFist'],'heal-palm':['guardHigh','healPalm'],'finger-strike':['chamber','fingerStrike'],thrust:['chamber','thrust'],swing:['throwReady','swing'],'staff-spin':['smashReady','slash'],slash:['chamber','slash'],smash:['smashReady','smash'],'double-slash':['smashReady','slash'],punch:['chamber','punch'],combo:['chamber','punch'],kick:['kickReady','kick'],sweep:['crouch','sweep'],'flying-kick':['jump','fly'],'flip-kick':['jump','kick'],'spin-kick':['kickReady','kick'],palm:['chamber','palm'],shoulder:['crouch','shoulder'],slam:['jump','slam'],disarm:['chamber','palm'],grab:['chamber','grab'],pickup:['guard','pickup'],throw:['throwReady','throw'],discard:['guard','pickup'],dodge:['guardHigh','dodge'],recoil:['guard','recoil']};
 const [prep,hit]=pairs[move]||pairs.punch;
 return sequence.map(([offset,name])=>{
   if(offset===.27||offset===.34||offset===.46)name=prep;
   if(offset===.40||offset===.53)name=offset===.53&&['combo','twin-palm'].includes(move)?'cross':offset===.53&&['double-slash','staff-spin'].includes(move)?'smash':hit;
   if(!['combo','twin-palm','double-slash','staff-spin','spin-kick'].includes(move)){if(offset===.46)name=hit;if(offset===.53)name='guard';}
   if(['throw','discard','pickup','dodge','recoil'].includes(move)&& (offset<.27||offset>.62))name='guard';
   const pose={...GUARD,...POSES[name]};
   if(move==='flip-kick'){if(offset===.34)pose.body=-135;else if(offset===.40)pose.body=-300;else if(offset>=.46)pose.body-=360;}
   if(move==='spin-kick'&&offset===.53){[pose.lf,pose.lb]=[-25,-100];[pose.kf,pose.kb]=[20,0];pose.body=16;}
   if(variant&&offset>=.27&&offset<=.62){pose.body+=(variant%5-2)*3;pose.y-=Math.floor(variant/4)*2;pose.af+=variant*.65;pose.ab-=variant*1.2;pose.ef+=(variant%3-1)*5;}
   return{offset,pose};
 });
}
export function jointTransform(key,pose){return key==='body'?`translate(0 ${pose.y}) rotate(${pose.body})`:`rotate(${pose[key]})`;}
export function bindRig(node){return Object.fromEntries(Object.keys(GUARD).filter(k=>k!=='y').map(k=>[k,node?.querySelector(`[data-joint="${k}"]`)]));}
export function applyRigPose(binding,pose){for(const [key,node]of Object.entries(binding))node?.setAttribute('transform',jointTransform(key,pose));}
