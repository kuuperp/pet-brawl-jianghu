// Shared progression curves. Reward previews and settlement use exactly these rules.
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export const BALANCE_VERSION=4;
export const XP_BANDS=Object.freeze([{gap:5,rate:1},{gap:10,rate:.70},{gap:20,rate:.30},{gap:30,rate:.10},{gap:Infinity,rate:.02}]);
export const XP_RULES='双方等级差0–5级：100%；6–10级：70%；11–20级：30%；21–30级：10%；超过30级：2%。';
export function experienceRate(playerLevel,enemyLevel){const gap=Math.abs(playerLevel-enemyLevel);return XP_BANDS.find(b=>gap<=b.gap).rate;}
export function levelGrowth(level){const n=cap(Math.floor(level)-1,0,299);return Math.min(n,29)+cap(n-29,0,50)*.86+Math.max(0,n-79)*.70;}
const GAINS={hp:[7,5,4,3],atk:[1.4,1.2,1.1,1],def:[1.1,1,1,1],agi:[1.3,1.1,1,1]};
export function trainingBonus(key,count){const n=cap(Math.floor(count),0,240),g=GAINS[key];if(!g)return 0;return Math.min(n,20)*g[0]+cap(n-20,0,40)*g[1]+cap(n-60,0,60)*g[2]+Math.max(0,n-120)*g[3];}
export function baseExperienceFraction(opponent){
 if(opponent.mode==='arena')return[.16,.20,.24][cap(opponent.difficulty||0,0,2)];
 return opponent.chapterBoss?.75:opponent.boss?.55:opponent.encounter==='elite'?.42:opponent.encounter==='trial'?.38:opponent.encounter==='ambush'?.36:.34;
}
