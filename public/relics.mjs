// Single-player, local-save redemption. This is not a server-side entitlement system.
export const RELIC={id:'wuji-seal',name:'太初·无极天印',atk:50000,def:50000,evasion:50000};
export const CDK_DIGEST='2f13b88907a8457df2879aef650de0d2f77c16ffb31a0e86721ec0274c4496d9';
export function hasRelic(s){return s.cdkClaims?.includes(RELIC.id)===true;}
export function relicActive(s){return hasRelic(s)&&s.relicEquipped===true;}
export function normalizeCdk(input){
 return String(input??'').normalize('NFKC').trim()
  .replace(/^[`"'“”‘’]+|[`"'“”‘’]+$/g,'')
  .replace(/[\s\u200B-\u200D\uFEFF]/g,'')
  .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g,'-').toUpperCase();
}
// Portable SHA-256 for validated ASCII CDKs. Works in offline/file/embedded previews
// without Web Crypto, TextEncoder, network requests, or a secure-context requirement.
export function sha256Ascii(text){
 if(!/^[\x00-\x7f]*$/.test(text))throw new Error('ASCII input required');
 const k=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
 const bytes=Array.from(text,c=>c.charCodeAt(0)),bits=bytes.length*8;
 bytes.push(128);while(bytes.length%64!==56)bytes.push(0);
 const high=Math.floor(bits/4294967296),low=bits>>>0;
 for(const n of [high,low])for(let shift=24;shift>=0;shift-=8)bytes.push((n>>>shift)&255);
 const rotate=(x,n)=>(x>>>n)|(x<<(32-n));
 for(let offset=0;offset<bytes.length;offset+=64){
  const w=new Int32Array(64);
  for(let i=0;i<16;i++){const j=offset+i*4;w[i]=(bytes[j]<<24)|(bytes[j+1]<<16)|(bytes[j+2]<<8)|bytes[j+3];}
  for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2],s0=rotate(x,7)^rotate(x,18)^(x>>>3),s1=rotate(y,17)^rotate(y,19)^(y>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}
  let [a,b,c,d,e,f,g,hh]=h;
  for(let i=0;i<64;i++){const s1=rotate(e,6)^rotate(e,11)^rotate(e,25),choice=(e&f)^(~e&g),t1=(hh+s1+choice+k[i]+w[i])|0,s0=rotate(a,2)^rotate(a,13)^rotate(a,22),majority=(a&b)^(a&c)^(b&c),t2=(s0+majority)|0;hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;}
  [a,b,c,d,e,f,g,hh].forEach((n,i)=>h[i]=(h[i]+n)|0);
 }
 return h.map(n=>(n>>>0).toString(16).padStart(8,'0')).join('');
}
export function redeemCdk(s,input){
 const code=normalizeCdk(input);
 if(!/^[A-Z0-9-]{8,64}$/.test(code))return Promise.resolve({ok:false,message:'请输入有效的 CDK（字母、数字和连字符）。'});
 return Promise.resolve().then(()=>{
  const hash=sha256Ascii(code);
  if(hash!==CDK_DIGEST)return{ok:false,message:'CDK 不正确，请检查后重试。'};
  if(hasRelic(s))return{ok:false,message:'这份存档已经兑换过无极天印，无需重复兑换。'};
  s.cdkClaims=[RELIC.id];s.relicEquipped=true;
  return{ok:true,message:'兑换成功！太初·无极天印已装备。'};
 });
}
export function relicArt(){return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="51" fill="#34264c" stroke="#e8c883" stroke-width="2"/><path d="M60 9 71 43 105 30 80 59 108 82 73 77 60 112 48 77 13 82 40 59 15 30 49 43Z" fill="none" stroke="#caab71"/><path d="m60 24 24 36-24 36-24-36Z" fill="#bd8be0" stroke="#fff0c7" stroke-width="3"/><path d="M60 36v48M45 60h30" stroke="#fff8dc" stroke-width="4"/><circle cx="60" cy="60" r="10" fill="#fff0bb"/></svg>';}
