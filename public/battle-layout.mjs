// A level, centered camera: perspective supplies depth without rotating the arena.
export function battleViewport(width,height){const top=width<600?100:88,bottom=34;return{x:0,y:top,width,height:Math.max(160,height-top-bottom)};}
export function frontalArenaView(width,height,fighters=[]){
 const aspect=Math.max(.1,width/height),highest=Math.max(3.55,...fighters.map(f=>(f.pet==='rabbit'?4.05:f.boss?3.95:3.45)*(f.modelScale||1)));
 const vertical=Math.max(6.1,(highest+.4)/.79,14.6/aspect),distance=24,eye=vertical*.32;
 return{camera:[0,eye,distance],target:[0,eye,0],fov:2*Math.atan(vertical/(2*distance)),span:vertical*aspect};
}
export function fighterPositions(fighters){return fighters.map((f,i)=>({x:i?3:-3,y:0,z:0,scale:f.modelScale||1}));}
