// Generate only visible artwork, one idle job at a time. Keep SVGs until it is ready.
const requestIdle=fn=>typeof globalThis.requestIdleCallback==='function'?{idle:true,id:requestIdleCallback(fn,{timeout:700})}:{idle:false,id:setTimeout(fn,24)};
const cancelIdle=token=>{if(token.idle)globalThis.cancelIdleCallback?.(token.id);else clearTimeout(token.id);};
export function createArtworkQueue({request=requestIdle,cancel=cancelIdle,blocked=()=>false,Observer=globalThis.IntersectionObserver}={}){
 const owners=new Map(),watched=new Map();let pending=[],scheduled=null,running=false,paused=false,disposed=false;
 const observer=typeof Observer==='function'?new Observer(entries=>{for(const entry of entries){const job=watched.get(entry.target);if(!job||!entry.isIntersecting)continue;watched.delete(entry.target);observer.unobserve(entry.target);pending.push(job);}schedule();},{rootMargin:'160px'}):null;
 const valid=job=>!job.cancelled&&job.node?.isConnected!==false;
 function finish(job){const jobs=owners.get(job.owner);jobs?.delete(job);if(!jobs?.size)owners.delete(job.owner);}
 function schedule(){if(disposed||paused||running||scheduled!==null||!pending.length||blocked())return;scheduled=request(run);}
 async function run(){
  scheduled=null;if(disposed||paused||blocked())return;
  let job;while(pending.length){const next=pending.shift();if(valid(next)){job=next;break;}finish(next);}if(!job)return;
  running=true;
  try{const url=await job.draw();if(url&&valid(job))job.apply(url);}catch{/* Keep the existing artwork if a preview cannot be created. */}
  finally{finish(job);running=false;schedule();}
 }
 function cancelOwner(owner){
  const jobs=owners.get(owner);if(!jobs)return;for(const job of jobs){job.cancelled=true;if(watched.get(job.node)===job){watched.delete(job.node);observer?.unobserve(job.node);}}
  owners.delete(owner);pending=pending.filter(job=>!job.cancelled);if(!pending.length&&scheduled!==null){cancel(scheduled);scheduled=null;}
 }
 return{
  add(owner,jobs){cancelOwner(owner);if(disposed||!jobs.length)return;const set=new Set();owners.set(owner,set);for(const task of jobs){const job={...task,owner,cancelled:false};set.add(job);if(observer&&job.node?.isConnected!==false){watched.set(job.node,job);observer.observe(job.node);}else pending.push(job);}schedule();},
  cancel:cancelOwner,
  pause(){paused=true;if(scheduled!==null){cancel(scheduled);scheduled=null;}},
  resume(){paused=false;schedule();},
  destroy(){disposed=true;if(scheduled!==null)cancel(scheduled);for(const jobs of owners.values())for(const job of jobs)job.cancelled=true;observer?.disconnect();owners.clear();watched.clear();pending=[];}
 };
}
