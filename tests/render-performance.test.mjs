import test from 'node:test';
import assert from 'node:assert/strict';
import {createMeshRenderer,geometry} from '../public/mini-gl.mjs';
import {drawArena,drawCharacter,drawWeapon} from '../public/world-assets.mjs';
import {CHAPTERS} from '../public/engine.mjs';
import {GUARD} from '../public/fighter-rig.mjs';
import {frontalArenaView} from '../public/battle-layout.mjs';

// Decode the production GPU stream, including instance attributes. This measures
// API work and geometry, not browser/GPU frame rate.
function fixture({instanced=false,preserve=false}={}){
 const calls=[],draws=[],uniforms=new Map(),pointers=new Map(),buffers=new Map();let bound=null,program=null,uploads=0;
 const ext={vertexAttribDivisorANGLE(){},drawArraysInstancedANGLE(mode,start,count,instances){
  for(let i=0;i<instances;i++){
   const matrix=Array(16).fill(0);matrix[15]=1;const normal=[];
   for(let row=0;row<3;row++){const p=pointers.get(row+2),data=buffers.get(p.buffer),offset=p.offset/4+i*p.stride/4;for(let c=0;c<4;c++)matrix[c*4+row]=data[offset+c];}
   for(let col=0;col<3;col++){const p=pointers.get(col+5),data=buffers.get(p.buffer),offset=p.offset/4+i*p.stride/4;normal.push(...data.slice(offset,offset+3));}
   draws.push(snapshot(matrix,normal,count));
  }calls.push(['instances',instances]);
 }};
 function snapshot(matrix,normal,count){return{matrix,normal,count,color:[...uniforms.get('uColor')],emission:uniforms.get('uEmission'),texture:uniforms.get('uTexture'),blend:gl.blending,positions:buffers.get(pointers.get(0).buffer)};}
 const gl=new Proxy({COMPILE_STATUS:1,LINK_STATUS:2,ARRAY_BUFFER:3,FLOAT:4,TRIANGLES:5,SRC_ALPHA:6,ONE:7,ONE_MINUS_SRC_ALPHA:8,DYNAMIC_DRAW:9,
  getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),shaderSource(shader,source){shader.source=source;},createProgram:()=>({shaders:[]}),attachShader(p,shader){p.shaders.push(shader);},getExtension:()=>instanced?ext:null,
  getAttribLocation(p,name){return['aPosition','aNormal','aModel0','aModel1','aModel2','aNormal0','aNormal1','aNormal2'].indexOf(name);},getUniformLocation:(p,name)=>name,useProgram(p){program=p;},
  createBuffer:()=>({}),bindBuffer(target,buffer){bound=buffer;},bufferData(target,data){buffers.set(bound,typeof data==='number'?new Float32Array(data/4):data);},bufferSubData(target,offset,data){buffers.get(bound).set(data,offset/4);uploads++;},
  vertexAttribPointer(location,size,type,normalized,stride,offset){pointers.set(location,{size,stride,offset,buffer:bound});},
  uniformMatrix4fv(name,transpose,value){uniforms.set(name,[...value]);},uniformMatrix3fv(name,transpose,value){uniforms.set(name,[...value]);},uniform4f(name,...value){uniforms.set(name,value);},uniform1f(name,value){uniforms.set(name,value);},
  blendFunc(source,destination){gl.blending=destination;},drawArrays(mode,start,count){assert.ok(program);draws.push(snapshot(uniforms.get('uModel'),uniforms.get('uNormal'),count));calls.push(['single']);}
 },{get:(o,k)=>k in o?o[k]:()=>{}});
 const r=createMeshRenderer({width:800,height:450,getContext:()=>gl},{preserve});return{r,gl,calls,draws,get uploads(){return uploads;}};
}
function scene(r){
 r.begin({width:800,height:450});
 for(let i=0;i<12;i++){r.push();r.translate((i-6)*.4,1,i%2);r.rotateZ(i*.2);r.rotateY(i*.12);r.scale(i%2?-1:1,1.5,.6);r.mesh('box','#f0c090',.1,1,'normal',{roughness:.3,metalness:.8,texture:4});r.pop();}
 // A normal alpha surface divides two runs of additive light. Grouping must
 // never move far-side sparks to the front of this surface.
 for(const z of [-9,-8,-3,-2]){r.push();r.translate(0,0,z);r.scale(.1);r.mesh('sphere','#ff9060',.8,.5,'add');r.pop();}
 r.push();r.translate(0,0,-6);r.mesh('box','#90d0ff',0,.4);r.pop();r.flush();
}
const normalized=draw=>({...draw,matrix:draw.matrix.map(v=>+v.toFixed(6)),normal:draw.normal.map(v=>+v.toFixed(6)),positions:undefined});
test('Instancing preserves reflected/nonuniform transforms, normals, materials and alpha ordering with one stream upload',()=>{
 const plain=fixture({preserve:true}),batched=fixture({instanced:true,preserve:true});scene(plain.r);scene(batched.r);
 assert.deepEqual(batched.draws.map(normalized),plain.draws.map(normalized));assert.equal(batched.uploads,1);assert.equal(batched.r.stats.meshes,17);assert.equal(batched.r.stats.vertices,plain.r.stats.vertices);assert.equal(batched.r.stats.drawCalls,4);assert.equal(plain.r.stats.drawCalls,17);
 assert.ok(batched.calls.some(c=>c[0]==='instances'&&c[1]===12));
 // Reused queue cells must not retain a previous frame's transforms/materials.
 scene(batched.r);assert.equal(batched.uploads,2);assert.deepEqual(batched.draws.slice(17).map(normalized),plain.draws.map(normalized));plain.r.destroy();batched.r.destroy();
});
test('Screen-sized detail lowers tiny meshes while portraits and large closeups retain full geometry',()=>{
 const battle=fixture(),portrait=fixture({preserve:true});
 const draw=(r,scale)=>{r.begin();r.push();r.scale(scale);r.mesh('sphere','#ffffff');r.pop();r.flush();};
 draw(battle.r,.05);draw(portrait.r,.05);assert.ok(battle.r.stats.vertices<portrait.r.stats.vertices/4);assert.equal(portrait.r.stats.vertices,geometry('sphere').count);
 draw(battle.r,2);assert.equal(battle.r.stats.vertices,portrait.r.stats.vertices);assert.equal(geometry('sphere'),geometry('sphere'),'CPU geometry is reused between contexts');battle.r.destroy();portrait.r.destroy();
});
test('Detailed boss battle submits every component with substantially fewer draws and vertices',()=>{
 const optimized=fixture({instanced:true}),full=fixture({preserve:true}),fighters=[{pet:'panda',held:'imperial-sword'},{pet:'rabbit',boss:true,chapter:19,chapterBoss:true,held:'celestial-axe'}];
 const draw=r=>{r.begin({width:1280,height:600,...frontalArenaView(1280,600,fighters)});drawArena(r,CHAPTERS[19],1);for(let i=0;i<2;i++)drawCharacter(r,fighters[i],GUARD,{x:i?5.8:-5.8,facing:i?-1:1,profile:'duel',held:fighters[i].held});for(let i=0;i<4;i++){r.push();r.translate(i,.12,1);drawWeapon(r,'imperial-sword',{scale:.28});r.pop();}r.flush();};
 draw(optimized.r);draw(full.r);assert.equal(optimized.r.stats.meshes,full.r.stats.meshes,'No visible part is removed');assert.ok(optimized.r.stats.drawCalls<full.r.stats.drawCalls*.35);assert.ok(optimized.r.stats.vertices<full.r.stats.vertices*.5);optimized.r.destroy();full.r.destroy();
});
