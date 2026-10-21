// Small, dependency-free mesh renderer. Geometry, depth, normals and lighting are real 3D.
import {craftGeometry} from './craft-geometry.mjs?v=2.5.1';
export const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
export function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
const unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export function lookAt(eye,target){const z=unit(eye.map((x,i)=>x-target[i])),x=unit(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
export function orthographic(width,height,near=.1,far=100){return new Float32Array([2/width,0,0,0,0,2/height,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
export function perspective(fov,aspect,near=.1,far=100){const f=1/Math.tan(fov/2),n=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*n,-1,0,0,2*far*near*n,0]);}
export function cameraMatrix({camera,target,span=18,fov},width,height){return multiply(fov?perspective(fov,width/height):orthographic(span,span*height/width),lookAt(camera,target));}
export function artworkView(bounds,width,height,padding=1.16){const center=bounds.min.map((v,i)=>(v+bounds.max[i])/2),span=Math.max(.4,bounds.max[0]-bounds.min[0],(bounds.max[1]-bounds.min[1])*width/height)*padding;return{camera:[center[0],center[1],center[2]+10],target:center,span};}
export function projectPoint(matrix,point,width,height){const p=[...point,1],clip=Array.from({length:4},(_,row)=>p.reduce((sum,v,i)=>sum+v*matrix[i*4+row],0)),w=clip[3]||1;return{x:(clip[0]/w+1)*width/2,y:(1-clip[1]/w)*height/2,depth:clip[2]/w,visible:clip[3]>0&&Math.abs(clip[0])<=w&&Math.abs(clip[1])<=w};}
function normals(m,out=new Float32Array(9)){
 const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
 const A=e*i-f*h,B=f*g-d*i,C=d*h-e*g,D=c*h-b*i,E=a*i-c*g,F=b*g-a*h,G=b*f-c*e,H=c*d-a*f,I=a*e-b*d;
 const inv=1/(a*A+b*B+c*C||1);out[0]=A*inv;out[1]=B*inv;out[2]=C*inv;out[3]=D*inv;out[4]=E*inv;out[5]=F*inv;out[6]=G*inv;out[7]=H*inv;out[8]=I*inv;return out;
}
const colors=new Map();
export function rgb(c){if(Array.isArray(c))return c;const key=c||'#ffffff';if(colors.has(key))return colors.get(key);const h=key.replace('#',''),n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);const v=[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];colors.set(key,v);return v;}
const VERTEX=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uVP;uniform mat3 uNormal;varying mediump vec3 vPosition;varying mediump vec3 vNormal;varying mediump vec3 vLocal;void main(){vLocal=aPosition;vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=normalize(uNormal*aNormal);gl_Position=uVP*p;}`;
const FRAGMENT=`precision mediump float;
uniform vec4 uColor;uniform vec3 uEye;uniform vec3 uFog;uniform float uEmission;
uniform float uExposure;uniform vec3 uPointPosition;uniform vec3 uPointColor;uniform float uPointPower;uniform float uRoughness;uniform float uMetalness;uniform float uTexture;
varying mediump vec3 vPosition;varying mediump vec3 vNormal;varying mediump vec3 vLocal;
float grain(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*437.58);}
void main(){
 vec3 n=normalize(vNormal),light=normalize(vec3(-0.65,1.0,0.9));
 float diffuse=max(0.0,dot(n,light)),hemi=0.5+0.5*n.y;
 vec3 view=normalize(uEye-vPosition),halfVector=normalize(light+view);
 float rim=pow(1.0-max(dot(view,n),0.0),3.0),spec=pow(max(dot(n,halfVector),0.0),mix(90.0,9.0,uRoughness));
 float fill=max(dot(n,normalize(vec3(0.8,0.35,0.5))),0.0),back=max(dot(n,normalize(vec3(0.3,0.7,-1.0))),0.0);
 vec3 ray=uPointPosition-vPosition;float distance2=dot(ray,ray);
 float point=max(dot(n,normalize(ray+vec3(0.0001))),0.0)*uPointPower/(1.0+distance2*0.28);
 float surfaceTone=1.0;
 if(uTexture>0.5&&uTexture<1.5)surfaceTone=0.975+grain(floor(vLocal*48.0))*0.045;
 if(uTexture>1.5&&uTexture<2.5)surfaceTone=0.97+0.03*sin(vLocal.x*56.0)*sin(vLocal.y*64.0);
 if(uTexture>2.5&&uTexture<3.5)surfaceTone=0.96+grain(floor(vLocal*24.0))*0.06;
 if(uTexture>3.5&&uTexture<4.5)surfaceTone=0.985+sin(vLocal.y*98.0+sin(vLocal.x*9.0))*0.015;
 if(uTexture>4.5&&uTexture<5.5)surfaceTone=0.91+sin(vLocal.y*30.0+sin(vLocal.x*12.0)*1.8)*0.07;
 if(uTexture>5.5)surfaceTone=0.96+sin(vLocal.y*12.0+sin(vLocal.x*8.0))*0.035;
 vec3 base=pow(uColor.rgb,vec3(2.2))*surfaceTone;
 vec3 reflected=reflect(-view,n),environment=mix(vec3(0.14,0.19,0.23),vec3(0.82,0.89,0.95),reflected.y*0.5+0.5);
 vec3 specular=mix(vec3(1.0,0.94,0.83),base,uMetalness)*spec*mix(0.75,0.055,uRoughness);
 vec3 ambient=mix(vec3(0.23,0.29,0.35),vec3(0.39,0.43,0.47),hemi);
 vec3 lit=(base*(ambient+vec3(1.0,0.89,0.73)*diffuse*0.56+vec3(0.65,0.79,1.0)*fill*0.18)+specular+environment*mix(vec3(0.04),base,uMetalness)*uMetalness*(1.0-uRoughness)*0.38+vec3(0.70,0.84,1.0)*(back*0.14+rim*0.07))*uExposure;
 lit+=base*uEmission+uPointColor*(base*0.68+0.12)*point;
 lit=lit/(vec3(1.0)+max(lit-vec3(0.88),vec3(0.0))*0.55);
 lit=pow(max(lit,vec3(0.0)),vec3(0.454545));
 float fog=smoothstep(26.0,65.0,length(uEye-vPosition));gl_FragColor=vec4(mix(lit,uFog,fog),uColor.a);
}`;
const geometries=new Map(),PROFILE_KINDS=new Set(['hero-head','tunic','sleeve','boot','rabbit-ear','cloth','cat-ear']);
export function geometry(kind,detail='full'){
 const key=kind+':'+detail;if(geometries.has(key))return geometries.get(key);
 const g=buildGeometry(kind,detail),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<g.positions.length;i++){const axis=i%3;min[axis]=Math.min(min[axis],g.positions[i]);max[axis]=Math.max(max[axis],g.positions[i]);}
 g.bounds={min,max};geometries.set(key,g);return g;
}
function buildGeometry(kind,detail){
 const crafted=craftGeometry(kind);if(crafted)return crafted;
 const pos=[],norm=[];
 const tri=(a,b,c,na,nb=na,nc=na)=>{pos.push(...a,...b,...c);norm.push(...na,...nb,...nc);};
 const quad=(a,b,c,d,n)=>{tri(a,b,c,n);tri(a,c,d,n);};
 if(PROFILE_KINDS.has(kind)){
  const profiles={
   'hero-head':[[-1,.14,.25],[-.87,.53,.57],[-.57,.86,.85],[-.15,1,1],[.3,.98,.94],[.66,.79,.76],[.91,.43,.43],[1,.015,.015]],
   tunic:[[-1,.85,.94],[-.88,1,1],[-.62,.96,.96],[-.2,.85,.86],[.2,.86,.87],[.64,1,.94],[.85,.93,.82],[1,.57,.57]],
   sleeve:[[-1,.78,.78],[-.85,.85,.85],[-.3,.88,.88],[.4,1,1],[.85,.85,.85],[1,.2,.2]],
   boot:[[-1,.62,.82],[-.8,.91,1],[-.25,1,1],[.2,.77,.8],[.75,.65,.7],[1,.55,.6]],
   'rabbit-ear':[[-1,.38,.6],[-.7,.85,.95],[-.15,1,1],[.4,.76,.85],[.8,.38,.5],[1,.02,.02]],
   'cat-ear':[[-1,1,1],[-.55,.83,.78],[0,.55,.51],[.55,.27,.26],[1,.005,.005]]
  };
  if(kind==='cloth'){
   const point=(u,v)=>[(u*2-1)*(1-v*.18),v*2-1,Math.sin(u*Math.PI*3)*.13+(1-v)*.24];
   const normal=(u,v)=>unit([-Math.cos(u*Math.PI*3)*.39, .12,1]);
   for(let j=0;j<8;j++)for(let k=0;k<10;k++){const u=k/10,U=(k+1)/10,v=j/8,V=(j+1)/8;tri(point(u,v),point(U,v),point(U,V),normal(u,v),normal(U,v),normal(U,V));tri(point(u,v),point(U,V),point(u,V),normal(u,v),normal(U,V),normal(u,V));}
  }else{
   const profile=profiles[kind],sample=y=>{let i=1;while(i<profile.length-1&&y>profile[i][0])i++;const a=profile[i-1],b=profile[i],t=(y-a[0])/(b[0]-a[0]);const prev=profile[Math.max(0,i-2)],next=profile[Math.min(profile.length-1,i+1)],dy=b[0]-a[0];return[1,2].map(k=>{const m=(b[k]-prev[k])/(b[0]-prev[0]),n=(next[k]-a[k])/(next[0]-a[0]);return Math.max(.005,(2*t**3-3*t*t+1)*a[k]+(t**3-2*t*t+t)*dy*m+(-2*t**3+3*t*t)*b[k]+(t**3-t*t)*dy*n);});};
   const point=(u,y)=>{const [x,z]=sample(y);return[Math.cos(u)*x,y,Math.sin(u)*z+(kind==='rabbit-ear'?.14*(y+1)**2:0)];};
   const normal=(u,y)=>{const e=.002,a=point(u+e,y),b=point(u-e,y),c=point(u,Math.min(.999,y+e)),d=point(u,Math.max(-.999,y-e));return unit(cross(c.map((v,i)=>v-d[i]),a.map((v,i)=>v-b[i])));};
   const rows=detail==='low'?16:detail==='medium'?24:32,sides=detail==='low'?12:detail==='medium'?20:28;
   for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const u=k*2*Math.PI/sides,U=(k+1)*2*Math.PI/sides,y=-1+j*2/rows,Y=-1+(j+1)*2/rows,a=point(u,y),b=point(U,y),c=point(U,Y),d=point(u,Y);tri(a,c,b,normal(u,y),normal(U,Y),normal(U,y));tri(a,d,c,normal(u,y),normal(u,Y),normal(U,Y));}
  }
 }else if(kind==='sphere'){
  const point=(u,v)=>[Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u)];
  const rows=detail==='low'?6:detail==='medium'?10:16,sides=detail==='low'?8:detail==='medium'?16:24;
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const a=point(k*2*Math.PI/sides,j*Math.PI/rows),b=point((k+1)*2*Math.PI/sides,j*Math.PI/rows),c=point((k+1)*2*Math.PI/sides,(j+1)*Math.PI/rows),d=point(k*2*Math.PI/sides,(j+1)*Math.PI/rows);tri(a,b,c,a,b,c);tri(a,c,d,a,c,d);}
 }else if(kind==='cylinder'||kind==='cone'){
  const top=kind==='cone'?0:1;
  const sides=detail==='low'?8:detail==='medium'?12:16;
  for(let k=0;k<sides;k++){const u=k*2*Math.PI/sides,v=(k+1)*2*Math.PI/sides,c=Math.cos(u),s=Math.sin(u),C=Math.cos(v),S=Math.sin(v),a=[c,-1,s],b=[C,-1,S],d=[c*top,1,s*top],e=[C*top,1,S*top],n=unit([c,kind==='cone'?.5:0,s]),N=unit([C,kind==='cone'?.5:0,S]);tri(a,b,e,n,N,N);tri(a,e,d,n,N,n);tri([0,-1,0],b,a,[0,-1,0]);if(top)tri([0,1,0],d,e,[0,1,0]);}
 }else if(kind==='disc'){
  for(let k=0;k<32;k++){const u=k*Math.PI/16,v=(k+1)*Math.PI/16;tri([0,0,0],[Math.cos(u),0,Math.sin(u)],[Math.cos(v),0,Math.sin(v)],[0,1,0]);}
 }else if(kind==='arc'||kind==='arc-core'){
  // A solid crescent ribbon in XY, with front/back faces and a visible rim.
  for(let i=0;i<36;i++){
   const a=-Math.PI*.75+i*Math.PI*1.2/36,b=-Math.PI*.75+(i+1)*Math.PI*1.2/36,inner=kind==='arc-core'?.975:.91;
   const point=(t,r,z)=>[Math.cos(t)*r,Math.sin(t)*r,z],n=[0,0,1];
   quad(point(a,inner,.045),point(b,inner,.045),point(b,1,.045),point(a,1,.045),n);
   quad(point(a,1,-.045),point(b,1,-.045),point(b,inner,-.045),point(a,inner,-.045),[0,0,-1]);
   quad(point(a,1,.045),point(b,1,.045),point(b,1,-.045),point(a,1,-.045),[Math.cos(a),Math.sin(a),0]);
  }
 }else if(kind==='torus'||kind==='energy-ring'){
  const tube=kind==='energy-ring'?.027:.1,point=(u,v)=>[(1+tube*Math.cos(v))*Math.cos(u),tube*Math.sin(v),(1+tube*Math.cos(v))*Math.sin(u)],normal=(u,v)=>[Math.cos(v)*Math.cos(u),Math.sin(v),Math.cos(v)*Math.sin(u)];
  const sides=detail==='low'?16:detail==='medium'?20:24,tubes=detail==='low'?4:6;
  for(let k=0;k<sides;k++)for(let j=0;j<tubes;j++){const u=k*2*Math.PI/sides,U=(k+1)*2*Math.PI/sides,v=j*2*Math.PI/tubes,V=(j+1)*2*Math.PI/tubes,a=point(u,v),b=point(U,v),c=point(U,V),d=point(u,V),na=normal(u,v),nb=normal(U,v),nc=normal(U,V),nd=normal(u,V);tri(a,b,c,na,nb,nc);tri(a,c,d,na,nc,nd);}
 }else if(kind==='wedge'){
  quad([-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[0,0,-1]);quad([-1,-1,1],[-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,0,0]);quad([1,-1,-1],[1,-1,1],[1,1,1],[1,1,-1],[1,0,0]);quad([-1,-1,1],[1,-1,1],[1,-1,-1],[-1,-1,-1],[0,-1,0]);tri([-1,1,-1],[1,1,-1],[0,-1,1],unit([0,1,1]));
 }else{
  for(const [n,a,b,c,d]of [
   [[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],
   [[1,0,0],[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,0,0],[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
   [[0,1,0],[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[0,-1,0],[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]])quad(a,b,c,d,n);
 }
 return{positions:new Float32Array(pos),normals:new Float32Array(norm),count:pos.length/3};
}
// Affine instance transforms use six attributes; WebGL 1 guarantees eight in total.
const INSTANCE_VERTEX=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec4 aModel0;attribute vec4 aModel1;attribute vec4 aModel2;attribute vec3 aNormal0;attribute vec3 aNormal1;attribute vec3 aNormal2;uniform mat4 uVP;varying mediump vec3 vPosition;varying mediump vec3 vNormal;varying mediump vec3 vLocal;void main(){vLocal=aPosition;vec4 local=vec4(aPosition,1.0);vec4 p=vec4(dot(aModel0,local),dot(aModel1,local),dot(aModel2,local),1.0);vPosition=p.xyz;vNormal=normalize(mat3(aNormal0,aNormal1,aNormal2)*aNormal);gl_Position=uVP*p;}`;
const LOD_KINDS=new Set(['sphere','cylinder','cone','torus','energy-ring',...PROFILE_KINDS]),UNIT=identity(),ORIGIN=[0,0,0];
export function createMeshRenderer(canvas,{preserve=false}={}){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,preserveDrawingBuffer:preserve,powerPreference:preserve?'low-power':'high-performance'});
 if(!gl)throw new Error('3D context unavailable');
 const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
 const names=['uModel','uVP','uNormal','uColor','uEye','uFog','uEmission','uExposure','uPointPosition','uPointColor','uPointPower','uRoughness','uMetalness','uTexture'];
 function makeProgram(vertex,instanced=false){
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,FRAGMENT),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  return{program,uniform:Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)])),ap:gl.getAttribLocation(program,'aPosition'),an:gl.getAttribLocation(program,'aNormal'),attributes:instanced?['aModel0','aModel1','aModel2','aNormal0','aNormal1','aNormal2'].map(n=>gl.getAttribLocation(program,n)):[]};
 }
 const standard=makeProgram(VERTEX),extension=gl.getExtension?.('ANGLE_instanced_arrays'),instancing=extension&&typeof extension.drawArraysInstancedANGLE==='function'?extension:null;
 let instanced=null;try{if(instancing)instanced=makeProgram(INSTANCE_VERTEX,true);}catch{/* The uniform path remains available on older drivers. */}
 const instanceBuffer=instanced?gl.createBuffer():null;
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const meshes=new Map(),matrixStack=[identity()],queue=[],opaque=[],transparent=[],groupCache=new Map(),groups=[],groupPool=[],opaqueGroups=[],transparentCommands=[];
 let current=matrixStack[0],depth=0,count=0,eye=[8,8,16],viewProjection=identity(),fog=rgb('#d0ded5'),disposed=false,lighting={},instanceData=new Float32Array(21*32);
 const stats={meshes:0,drawCalls:0,vertices:0,instanced:!!instanced};
 function buffer(kind,detail){const key=kind+':'+detail;if(meshes.has(key))return meshes.get(key);const g=geometry(kind,detail),p=gl.createBuffer(),n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,g.positions,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,g.normals,gl.STATIC_DRAW);const b={p,n,count:g.count,bounds:g.bounds};meshes.set(key,b);return b;}
 function detailFor(kind,m){
  if(preserve||!LOD_KINDS.has(kind))return'full';
  const scale=Math.sqrt(Math.max(m[0]**2+m[1]**2+m[2]**2,m[4]**2+m[5]**2+m[6]**2,m[8]**2+m[9]**2+m[10]**2));
  const w=Math.abs(viewProjection[3]*m[12]+viewProjection[7]*m[13]+viewProjection[11]*m[14]+viewProjection[15])||1;
  const radius=canvas.height*.5*Math.abs(viewProjection[5])*scale/w;
  return radius<10?'low':radius<28?'medium':'full';
 }
 const api={
  push(){const next=matrixStack[++depth]||(matrixStack[depth]=new Float32Array(16));next.set(current);current=next;},
  pop(){if(!depth)throw new Error('Unbalanced 3D transform');current=matrixStack[--depth];},
  translate(x=0,y=0,z=0){for(let i=0;i<4;i++)current[12+i]+=current[i]*x+current[4+i]*y+current[8+i]*z;},
  scale(x=1,y=x,z=x){for(let i=0;i<4;i++){current[i]*=x;current[4+i]*=y;current[8+i]*=z;}},
  rotateX(a=0){const c=Math.cos(a),s=Math.sin(a);for(let i=0;i<4;i++){const y=current[4+i],z=current[8+i];current[4+i]=y*c+z*s;current[8+i]=z*c-y*s;}},
  rotateY(a=0){const c=Math.cos(a),s=Math.sin(a);for(let i=0;i<4;i++){const x=current[i],z=current[8+i];current[i]=x*c-z*s;current[8+i]=x*s+z*c;}},
  rotateZ(a=0){const c=Math.cos(a),s=Math.sin(a);for(let i=0;i<4;i++){const x=current[i],y=current[4+i];current[i]=x*c+y*s;current[4+i]=y*c-x*s;}},
  mesh(kind,color,emission=0,alpha=1,blend='normal',material={}){
   if(alpha<=.005)return;const q=queue[count]||(queue[count]={matrix:new Float32Array(16),normal:new Float32Array(9)});count++;
   const value=rgb(color),opacity=Math.max(0,Math.min(1,alpha)),roughness=material.roughness??.68,metalness=material.metalness??0,texture=material.texture??0,detail=detailFor(kind,current);
   if(instanced&&(q.kind!==kind||q.detail!==detail||q.red!==value[0]||q.green!==value[1]||q.blue!==value[2]||q.alpha!==opacity||q.emission!==emission||q.roughness!==roughness||q.metalness!==metalness||q.texture!==texture))q.batchKey=kind+':'+detail+':'+value+':'+opacity+':'+emission+':'+roughness+':'+metalness+':'+texture;
   const m=q.matrix;if(!q.normalValid||m[0]!==current[0]||m[1]!==current[1]||m[2]!==current[2]||m[4]!==current[4]||m[5]!==current[5]||m[6]!==current[6]||m[8]!==current[8]||m[9]!==current[9]||m[10]!==current[10]){normals(current,q.normal);q.normalValid=true;}
   q.kind=kind;q.color=value;q.red=value[0];q.green=value[1];q.blue=value[2];q.emission=emission;q.alpha=opacity;q.blend=blend;q.roughness=roughness;q.metalness=metalness;q.texture=texture;m.set(current);q.detail=detail;
  },
  begin({width=canvas.width,height=canvas.height,background='#d0ded5',camera=[0,2.5,18],target=[0,2.5,0],span=18,fov}={}){
   if(disposed)return;depth=0;current=matrixStack[0];current.set(UNIT);count=0;lighting={};eye=camera;fog=rgb(background);const cw=Math.max(1,Math.round(width)),ch=Math.max(1,Math.round(height));if(canvas.width!==cw)canvas.width=cw;if(canvas.height!==ch)canvas.height=ch;
   gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...fog,1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);viewProjection=cameraMatrix({camera,target,span,fov},canvas.width,canvas.height);
  },
  project(point,width=canvas.width,height=canvas.height){return projectPoint(viewProjection,point,width,height);},
  fit({padding=1.16}={}){
   if(!count)return;const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
   for(let j=0;j<count;j++){const q=queue[j],local=buffer(q.kind,q.detail).bounds;for(let i=0;i<8;i++){const x=i&1?local.max[0]:local.min[0],y=i&2?local.max[1]:local.min[1],z=i&4?local.max[2]:local.min[2];for(let row=0;row<3;row++){const v=q.matrix[12+row]+x*q.matrix[row]+y*q.matrix[4+row]+z*q.matrix[8+row];bounds.min[row]=Math.min(bounds.min[row],v);bounds.max[row]=Math.max(bounds.max[row],v);}}}
   const view=artworkView(bounds,canvas.width,canvas.height,padding);eye=view.camera;viewProjection=cameraMatrix(view,canvas.width,canvas.height);return bounds;
  },
  lighting(value){lighting=value||{};},
  flush(){
   if(disposed)return;stats.meshes=count;stats.drawCalls=0;stats.vertices=0;opaque.length=0;transparent.length=0;
   for(let i=0;i<count;i++){const q=queue[i];if(q.alpha>=.995&&q.blend!=='add')opaque.push(q);else{const m=q.matrix;q.distance=(m[12]-eye[0])**2+(m[13]-eye[1])**2+(m[14]-eye[2])**2;transparent.push(q);}}
   transparent.sort((a,b)=>b.distance-a.distance);
   let active=null,bound=null,lastColor=null,lastAlpha,lastEmission,lastRoughness,lastMetalness,lastTexture,lastBlend='normal';
   function activate(p){
    if(active===p)return;if(active){for(const a of active.attributes){instancing.vertexAttribDivisorANGLE(a,0);gl.disableVertexAttribArray(a);}gl.disableVertexAttribArray(active.ap);gl.disableVertexAttribArray(active.an);}
    active=p;bound=null;lastColor=null;lastEmission=lastRoughness=lastMetalness=lastTexture=undefined;gl.useProgram(p.program);gl.enableVertexAttribArray(p.ap);gl.enableVertexAttribArray(p.an);
    const u=p.uniform;gl.uniformMatrix4fv(u.uVP,false,viewProjection);gl.uniform3fv(u.uEye,eye);gl.uniform3fv(u.uFog,fog);gl.uniform1f(u.uExposure,lighting.exposure??1);gl.uniform3fv(u.uPointPosition,lighting.position||ORIGIN);gl.uniform3fv(u.uPointColor,rgb(lighting.color||'#ffffff'));gl.uniform1f(u.uPointPower,lighting.power||0);
   }
   function bind(q){
    const b=buffer(q.kind,q.detail),p=active;if(bound!==b){gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.vertexAttribPointer(p.ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.vertexAttribPointer(p.an,3,gl.FLOAT,false,0,0);bound=b;}
    const u=p.uniform;if(lastBlend!==q.blend){gl.blendFunc(gl.SRC_ALPHA,q.blend==='add'?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);lastBlend=q.blend;}
    if(lastColor!==q.color||lastAlpha!==q.alpha){gl.uniform4f(u.uColor,...q.color,q.alpha);lastColor=q.color;lastAlpha=q.alpha;}
    if(lastEmission!==q.emission){gl.uniform1f(u.uEmission,q.emission);lastEmission=q.emission;}if(lastRoughness!==q.roughness){gl.uniform1f(u.uRoughness,q.roughness);lastRoughness=q.roughness;}if(lastMetalness!==q.metalness){gl.uniform1f(u.uMetalness,q.metalness);lastMetalness=q.metalness;}if(lastTexture!==q.texture){gl.uniform1f(u.uTexture,q.texture);lastTexture=q.texture;}
    return b;
   }
   function drawOne(q){activate(standard);const b=bind(q),u=standard.uniform;gl.uniformMatrix4fv(u.uModel,false,q.matrix);gl.uniformMatrix3fv(u.uNormal,false,q.normal);gl.drawArrays(gl.TRIANGLES,0,b.count);stats.drawCalls++;stats.vertices+=b.count;}
   function drawGroup(items){
    if(items.length<2){drawOne(items[0]);return;}activate(instanced);const b=bind(items[0]);gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer);
    for(let i=0;i<6;i++){const a=instanced.attributes[i];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,i<3?4:3,gl.FLOAT,false,84,items.offset*84+(i<3?i*16:48+(i-3)*12));instancing.vertexAttribDivisorANGLE(a,1);}
    instancing.drawArraysInstancedANGLE(gl.TRIANGLES,0,b.count,items.length);stats.drawCalls++;stats.vertices+=b.count*items.length;
   }
   gl.depthMask(true);
   if(instanced){
    groupCache.clear();groups.length=0;opaqueGroups.length=0;transparentCommands.length=0;
    function collect(q,commands){
     const key=q.batchKey;let group=groupCache.get(key);
     if(!group){group=groupPool[groups.length]||(groupPool[groups.length]=[]);group.length=0;groups.push(group);groupCache.set(key,group);commands.push(group);}group.push(q);
    }
    for(const q of opaque)collect(q,opaqueGroups);groupCache.clear();
    // Additive light is commutative. Batch only adjacent additive runs so normal
    // alpha surfaces keep their original back-to-front compositing order.
    for(const q of transparent){if(q.blend==='add')collect(q,transparentCommands);else{groupCache.clear();transparentCommands.push(q);}}
    const length=groups.reduce((n,g)=>n+(g.length>1?g.length*21:0),0);
    if(length){
     if(length>instanceData.length)instanceData=new Float32Array(2**Math.ceil(Math.log2(length)));let offset=0;
     for(const group of groups){if(group.length<2)continue;group.offset=offset/21;for(const q of group){const m=q.matrix;for(let row=0;row<3;row++)for(let c=0;c<4;c++)instanceData[offset+row*4+c]=m[c*4+row];instanceData.set(q.normal,offset+12);offset+=21;}}
     // Orphan once per frame, then upload once. Later batches use offsets into
     // this snapshot and never overwrite data still needed by an earlier draw.
     gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer);gl.bufferData(gl.ARRAY_BUFFER,instanceData.byteLength,gl.DYNAMIC_DRAW);gl.bufferSubData(gl.ARRAY_BUFFER,0,instanceData.subarray(0,length));
    }
    for(const group of opaqueGroups)if(group.length===1)drawOne(group[0]);for(const group of opaqueGroups)if(group.length>1)drawGroup(group);
    gl.depthMask(false);for(const command of transparentCommands)if(Array.isArray(command))drawGroup(command);else drawOne(command);
   }else{for(const q of opaque)drawOne(q);gl.depthMask(false);for(const q of transparent)drawOne(q);}
   if(active)for(const a of active.attributes){instancing.vertexAttribDivisorANGLE(a,0);gl.disableVertexAttribArray(a);}
   gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);return count;
  },
  destroy(){if(disposed)return;disposed=true;for(const b of meshes.values()){gl.deleteBuffer(b.p);gl.deleteBuffer(b.n);}meshes.clear();gl.deleteProgram(standard.program);if(instanced){gl.deleteBuffer(instanceBuffer);gl.deleteProgram(instanced.program);}queue.length=0;groupCache.clear();},
  get canvas(){return canvas;},get gl(){return gl;},get stats(){return stats;}
 };
 return api;
}
