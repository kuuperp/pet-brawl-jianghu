// A single, pausable clock owns poses, impacts and transfers. No independent action timers.
export function createMotionClock({duration,rate=1,cues=[],onFrame=()=>{},onCue=()=>{},onFinish=()=>{},driver}={}){
 const d=driver||{now:()=>performance.now(),request:fn=>typeof requestAnimationFrame==='function'?requestAnimationFrame(fn):setTimeout(()=>fn(performance.now()),16),cancel:id=>typeof cancelAnimationFrame==='function'?cancelAnimationFrame(id):clearTimeout(id)};
 const marks=[...cues].sort((a,b)=>a.time-b.time);let elapsed=0,last=d.now(),frame=null,index=0,paused=false,stopped=false,rendered=NaN;
 const speed=v=>Math.max(1,Math.min(3,Number(v)||1));rate=speed(rate);
 function render(){if(elapsed!==rendered){rendered=elapsed;onFrame(elapsed);}}
 function advance(now){
  if(stopped||paused)return;
  const end=Math.min(duration,elapsed+Math.max(0,now-last)*rate);last=now;
  while(index<marks.length&&marks[index].time<=end){const cue=marks[index++];elapsed=cue.time;render();onCue(cue);if(stopped)return;}
  elapsed=end;render();
  if(elapsed>=duration){stopped=true;onFinish();}
 }
 function schedule(){if(!stopped&&!paused&&frame===null)frame=d.request(now=>{frame=null;advance(now);schedule();});}
 function cancelFrame(){if(frame!==null){d.cancel(frame);frame=null;}}
 const clock={
  pause(){if(stopped||paused)return;cancelFrame();advance(d.now());paused=true;},
  resume(){if(stopped||!paused)return;paused=false;last=d.now();schedule();},
  setRate(value){if(!paused&&!stopped)advance(d.now());rate=speed(value);},
  extendTo(value){if(Number.isFinite(value))duration=Math.max(duration,value);},
  cancel(){stopped=true;cancelFrame();},
  get elapsed(){return elapsed;},get paused(){return paused;},get done(){return stopped;},get rate(){return rate;}
 };
 render();schedule();return clock;
}
