// Single-player, local-save redemption. This is not a server-side entitlement system.
export const RELIC={id:'wuji-seal',name:'太初·无极天印',atk:50000,def:50000,evasion:50000};
export const CDK_DIGEST='2f13b88907a8457df2879aef650de0d2f77c16ffb31a0e86721ec0274c4496d9';
export function hasRelic(s){return s.cdkClaims?.includes(RELIC.id)===true;}
export function relicActive(s){return hasRelic(s)&&s.relicEquipped===true;}
export function redeemCdk(s,input){
 const code=String(input||'').normalize('NFKC').trim().toUpperCase();
 if(!/^[A-Z0-9-]{8,64}$/.test(code))return Promise.resolve({ok:false,message:'请输入有效的 CDK（字母、数字和连字符）。'});
 if(!globalThis.crypto?.subtle)return Promise.resolve({ok:false,message:'当前浏览器无法校验兑换码，请使用 HTTPS 游戏地址。'});
 return globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(code)).then(buffer=>{
  const hash=Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==CDK_DIGEST)return{ok:false,message:'CDK 不正确，请检查后重试。'};
  if(hasRelic(s))return{ok:false,message:'这份存档已经兑换过无极天印，无需重复兑换。'};
  s.cdkClaims=[RELIC.id];s.relicEquipped=true;
  return{ok:true,message:'兑换成功！太初·无极天印已装备。'};
 });
}
export function relicArt(){return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51" fill="#34264c" stroke="#e8c883" stroke-width="2"/><path d="M60 9 71 43 105 30 80 59 108 82 73 77 60 112 48 77 13 82 40 59 15 30 49 43Z" fill="none" stroke="#caab71"/><path d="m60 24 24 36-24 36-24-36Z" fill="#bd8be0" stroke="#fff0c7" stroke-width="3"/><path d="M60 36v48M45 60h30" stroke="#fff8dc" stroke-width="4"/><circle cx="60" cy="60" r="10" fill="#fff0bb"/></svg>';}
