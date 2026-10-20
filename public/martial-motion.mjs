const cap=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=cap(x);return x*x*(3-2*x);};
function track(keys,p){let i=1;while(i<keys.length-1&&p>keys[i][0])i++;const [a,x]=keys[i-1],[b,y]=keys[i];return x+(y-x)*smooth((p-a)/(b-a));}
// Secondary joint channels follow the same clock as the strike, never independent timers.
export function martialDetails(sequence,p,pose){
 const move=sequence.move,attack=!sequence.status&&!['pickup','discard','boss-charge'].includes(sequence.event.kind),double=sequence.event.hits>1;
 const active=smooth((p-.22)/.07)*(1-smooth((p-.61)/.1)),weapon=/slash|thrust|swing|smash|staff|throw/.test(move),kick=/kick|sweep/.test(move);
 const twist=attack?track([[0,0],[.24,0],[.34,kick?8:-12],[.40,kick?-8:16],[.44,kick?-12:20],[.47,double?-13:6],[.53,double?18:0],[.59,double?8:0],[.69,0],[1,0]],p):0;
 const wrist=weapon?track([[0,0],[.27,-10],[.34,-24],[.40,20],[.44,30],[.48,double?-18:8],[.53,double?22:0],[.65,0],[1,0]],p):0;
 return{...pose,twist,wrist,focus:active,cloth:Math.sin(p*Math.PI*8)*active*.65+twist/22,ear:-twist/30,blink:sequence.status?.7:0};
}
