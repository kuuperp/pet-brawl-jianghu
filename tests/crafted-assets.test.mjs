import test from 'node:test';
import assert from 'node:assert/strict';
import {geometry,createMeshRenderer} from '../public/mini-gl.mjs';
import {drawWeapon,drawCharacter,WEAPON_MODEL_IDS} from '../public/world-assets.mjs';
import {GUARD} from '../public/fighter-rig.mjs';
function fixture(){
 const writes=[],gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get:(o,k)=>k in o?o[k]:(...args)=>writes.push([k,...args])}),canvas={width:384,height:416,getContext:()=>gl};
 return{r:createMeshRenderer(canvas),writes};
}
test('Forged edges have actual thickness, bevel normals, tapered tips and a curved saber silhouette',()=>{
 for(const kind of ['blade-jian','blade-dao','blade-great','blade-spear','axe-blade','bevel-box','gem-cut','folded-fan','bow-limb','cat-tail','lapel','brow-band','silk-ribbon']){
  const g=geometry(kind);assert.ok(g.count>=100,kind);assert.equal(g.positions.length,g.normals.length);assert.ok([...g.positions,...g.normals].every(Number.isFinite),kind);
  const z=g.positions.filter((_,i)=>i%3===2);assert.ok(Math.max(...z)>Math.min(...z),kind+' is a solid surface');
 }
 const sword=geometry('blade-jian'),saber=geometry('blade-dao');
 assert.ok(sword.normals.some((v,i)=>i%3===0&&Math.abs(v)>.25),'Beveled edges turn toward the light');
 const tip=[];for(let i=0;i<sword.positions.length;i+=3)if(sword.positions[i+1]===1)tip.push(sword.positions[i]);assert.ok(tip.every(x=>Math.abs(x)<1e-6));
 assert.notDeepEqual(saber.positions,sword.positions,'The curved blade has its own silhouette');
});
test('All sixty real weapon models and every hero fit tightly into their generated portraits without clipping',()=>{
 const {r}=fixture();
 const cases=[...WEAPON_MODEL_IDS.map(id=>()=>{r.rotateY(-.27);r.rotateZ(-.30);drawWeapon(r,id);}),...['penguin','panda','cat','rabbit'].map(pet=>()=>drawCharacter(r,{pet},GUARD,{yaw:-.24,held:null}))];
 for(const draw of cases){r.begin({width:384,height:416});draw();const bounds=r.fit({padding:1.18});let minY=Infinity,maxY=-Infinity;for(let i=0;i<8;i++){const p=bounds.min.map((x,axis)=>i&(1<<axis)?bounds.max[axis]:x),screen=r.project(p);assert.ok(screen.visible);assert.ok(screen.x>8&&screen.x<376);assert.ok(screen.y>8&&screen.y<408);minY=Math.min(minY,screen.y);maxY=Math.max(maxY,screen.y);}assert.ok(maxY-minY>170,'The image must show the model at a readable size');}
 r.destroy();
});
test('Fur, woven cloth, brushed steel, wood and jade reach the production material shader',()=>{
 const {r,writes}=fixture();r.begin();drawCharacter(r,{pet:'panda'},GUARD,{held:'imperial-sword'});drawWeapon(r,'jade-staff');r.flush();
 const textures=writes.filter(w=>w[0]==='uniform1f'&&w[1]==='uTexture').map(w=>w[2]);for(const texture of [1,2,3,4,5,6])assert.ok(textures.includes(texture),'Missing material '+texture);
 assert.ok(writes.some(w=>w[0]==='uniform1f'&&w[1]==='uMetalness'&&w[2]>.8));assert.ok(writes.some(w=>w[0]==='uniform1f'&&w[1]==='uRoughness'&&w[2]<.2));r.destroy();
});
