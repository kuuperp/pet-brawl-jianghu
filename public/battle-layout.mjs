// A level, centered camera: perspective supplies depth without rotating the arena.
import {martialDetails} from './martial-motion.mjs?v=2.3.0';
export const ARENA_LENGTH_SCALE=1.7,ARENA_HALF_WIDTH=6.4*ARENA_LENGTH_SCALE,FIGHTER_START_X=5.8;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function battleViewport(width,height){const top=width<600?100:88,bottom=34;return{x:0,y:top,width,height:Math.max(160,height-top-bottom)};}
export function frontalArenaView(width,height,fighters=[],{focus=0,closeup=0}={}){
 const aspect=Math.max(.1,width/height),highest=Math.max(3.55,...fighters.map(f=>(f.pet==='rabbit'?4.05:f.boss?3.95:3.45)*(f.modelScale||1)));
 const framingWidth=14.6*ARENA_LENGTH_SCALE*(1-closeup)+10*closeup,vertical=Math.max(6.1,(highest+.4)/.79,framingWidth/aspect),distance=24,eye=vertical*.32;
 return{camera:[focus,eye,distance],target:[focus,eye,0],fov:2*Math.atan(vertical/(2*distance)),span:vertical*aspect};
}
export function fighterPositions(fighters){return fighters.map((f,i)=>({x:i?FIGHTER_START_X:-FIGHTER_START_X,y:0,z:0,scale:f.modelScale||1}));}
export function animateFighterPositions(poses,event,sequence,sample,{reduced=false}={}){
 if(reduced)return poses;
 const A=poses[event.actor],B=poses[event.target],dir=event.actor===0?1:-1,p=sample.progress;
 A.pose=martialDetails(sequence,p,sample.pose);B.pose={...sample.targetPose,focus:.3,cloth:Math.sin(p*Math.PI*7)*Math.abs(sample.targetPose.body)/45};
 const approach=Math.abs(sequence.distance)>.01?Math.abs(sample.position.x/sequence.distance):0;
 const travel=event.kind==='pickup'?Math.max(0,Math.abs(A.x)-.5*A.scale):Math.max(0,Math.abs(B.x-A.x)-.63*(A.scale+B.scale));
 A.x+=dir*travel*approach;
 A.y=Math.max(0,-sample.position.y/80)+(event.kind==='pickup'?0:Math.max(0,B.scale-A.scale)*1.15*Math.sin(Math.max(0,Math.min(1,(p-.20)/.45))*Math.PI));
 B.x+=sample.targetPosition.x/80;A.dead=Math.max(0,Math.min(1,-sample.actorTilt/16));B.dead=Math.max(0,Math.min(1,-sample.targetTilt/16));B.hit=Math.min(1,Math.abs(sample.targetTilt)/8)+(.4<=p&&p<.55&&!event.dodged?.4:0);
 return poses;
}
export function combatCameraFocus(poses,event,progress){
 if(['throw','discard','burn','stunned','boss-charge'].includes(event.kind))return{};
 const closeup=smooth((progress-.025)/.30)*(1-smooth((progress-.67)/.31)),A=poses[event.actor],B=poses[event.target];
 return{focus:(event.kind==='pickup'?A.x:(A.x+B.x)/2)*closeup,closeup};
}
