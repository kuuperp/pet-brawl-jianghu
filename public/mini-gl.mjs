// Small, dependency-free mesh renderer. Geometry, depth, normals and lighting are real 3D.
export const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
export function multiply(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
const unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export function lookAt(eye,target){const z=unit(eye.map((x,i)=>x-target[i])),x=unit(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
export function orthographic(width,height,near=.1,far=100){return new Float32Array([2/width,0,0,0,0,2/height,0,0,0,0,-2/(far-near),0,0,0,-(far+near)/(far-near),1]);}
function normals(m){
 const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
 const A=e*i-f*h,B=f*g-d*i,C=d*h-e*g,D=c*h-b*i,E=a*i-c*g,F=b*g-a*h,G=b*f-c*e,H=c*d-a*f,I=a*e-b*d;
 const inv=1/(a*A+b*B+c*C||1);return new Float32Array([A*inv,B*inv,C*inv,D*inv,E*inv,F*inv,G*inv,H*inv,I*inv]);
}
const colors=new Map();
export function rgb(c){if(Array.isArray(c))return c;const key=c||'#ffffff';if(colors.has(key))return colors.get(key);const h=key.replace('#',''),n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);const v=[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];colors.set(key,v);return v;}
const VERTEX=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uVP;uniform mat3 uNormal;varying mediump vec3 vPosition;varying mediump vec3 vNormal;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=normalize(uNormal*aNormal);gl_Position=uVP*p;}`;
const FRAGMENT=`precision mediump float;uniform vec4 uColor;uniform vec3 uEye;uniform vec3 uFog;uniform float uEmission;varying mediump vec3 vPosition;varying mediump vec3 vNormal;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-0.6,1.0,0.8));float diffuse=max(0.0,dot(n,light));float hemi=0.5+0.5*n.y;float rim=pow(1.0-max(dot(normalize(uEye-vPosition),n),0.0),3.0);vec3 halfVector=normalize(light+normalize(uEye-vPosition));float spec=pow(max(dot(n,halfVector),0.0),36.0);vec3 lit=uColor.rgb*(0.40+0.21*hemi+0.48*diffuse)+vec3(1.0,0.94,0.8)*spec*0.16+uColor.rgb*rim*0.10+uColor.rgb*uEmission;float fog=smoothstep(26.0,65.0,length(uEye-vPosition));gl_FragColor=vec4(mix(lit,uFog,fog),uColor.a);}`;
export function geometry(kind){
 const pos=[],norm=[];
 const tri=(a,b,c,na,nb=na,nc=na)=>{pos.push(...a,...b,...c);norm.push(...na,...nb,...nc);};
 const quad=(a,b,c,d,n)=>{tri(a,b,c,n);tri(a,c,d,n);};
 if(kind==='sphere'){
  const point=(u,v)=>[Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u)];
  for(let j=0;j<10;j++)for(let k=0;k<16;k++){const a=point(k*Math.PI/8,j*Math.PI/10),b=point((k+1)*Math.PI/8,j*Math.PI/10),c=point((k+1)*Math.PI/8,(j+1)*Math.PI/10),d=point(k*Math.PI/8,(j+1)*Math.PI/10);tri(a,b,c,a,b,c);tri(a,c,d,a,c,d);}
 }else if(kind==='cylinder'||kind==='cone'){
  const top=kind==='cone'?0:1;
  for(let k=0;k<16;k++){const u=k*Math.PI/8,v=(k+1)*Math.PI/8,c=Math.cos(u),s=Math.sin(u),C=Math.cos(v),S=Math.sin(v),a=[c,-1,s],b=[C,-1,S],d=[c*top,1,s*top],e=[C*top,1,S*top],n=unit([c,kind==='cone'?.5:0,s]),N=unit([C,kind==='cone'?.5:0,S]);tri(a,b,e,n,N,N);tri(a,e,d,n,N,n);tri([0,-1,0],b,a,[0,-1,0]);if(top)tri([0,1,0],d,e,[0,1,0]);}
 }else if(kind==='disc'){
  for(let k=0;k<32;k++){const u=k*Math.PI/16,v=(k+1)*Math.PI/16;tri([0,0,0],[Math.cos(u),0,Math.sin(u)],[Math.cos(v),0,Math.sin(v)],[0,1,0]);}
 }else if(kind==='torus'){
  const point=(u,v)=>[(1+.1*Math.cos(v))*Math.cos(u),.1*Math.sin(v),(1+.1*Math.cos(v))*Math.sin(u)],normal=(u,v)=>[Math.cos(v)*Math.cos(u),Math.sin(v),Math.cos(v)*Math.sin(u)];
  for(let k=0;k<24;k++)for(let j=0;j<6;j++){const u=k*Math.PI/12,U=(k+1)*Math.PI/12,v=j*Math.PI/3,V=(j+1)*Math.PI/3,a=point(u,v),b=point(U,v),c=point(U,V),d=point(u,V),na=normal(u,v),nb=normal(U,v),nc=normal(U,V),nd=normal(u,V);tri(a,b,c,na,nb,nc);tri(a,c,d,na,nc,nd);}
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
export function createMeshRenderer(canvas,{preserve=false}={}){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,preserveDrawingBuffer:preserve,powerPreference:'low-power'});
 if(!gl)throw new Error('3D context unavailable');
 const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh;};
 const vs=compile(gl.VERTEX_SHADER,VERTEX),fs=compile(gl.FRAGMENT_SHADER,FRAGMENT),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const names=['uModel','uVP','uNormal','uColor','uEye','uFog','uEmission'],uniform=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)]));
 const ap=gl.getAttribLocation(program,'aPosition'),an=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(ap);gl.enableVertexAttribArray(an);
 const meshes=new Map();let current=identity(),stack=[],queue=[],eye=[8,8,16],viewProjection=identity(),fog=rgb('#d0ded5'),disposed=false;
 function buffer(kind){if(meshes.has(kind))return meshes.get(kind);const g=geometry(kind),p=gl.createBuffer(),n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,g.positions,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,g.normals,gl.STATIC_DRAW);const b={p,n,count:g.count};meshes.set(kind,b);return b;}
 const api={
  push(){stack.push(current);current=new Float32Array(current);},pop(){if(!stack.length)throw new Error('Unbalanced 3D transform');current=stack.pop();},
  translate(x=0,y=0,z=0){const m=identity();m[12]=x;m[13]=y;m[14]=z;current=multiply(current,m);},
  scale(x=1,y=x,z=x){const m=identity();m[0]=x;m[5]=y;m[10]=z;current=multiply(current,m);},
  rotateX(a=0){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;current=multiply(current,m);},
  rotateY(a=0){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;current=multiply(current,m);},
  rotateZ(a=0){const m=identity(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;current=multiply(current,m);},
  mesh(kind,color,emission=0,alpha=1){if(alpha<=.005)return;queue.push({kind,color:rgb(color),emission,alpha:Math.max(0,Math.min(1,alpha)),matrix:new Float32Array(current)});},
  begin({width=canvas.width,height=canvas.height,background='#d0ded5',camera=[7,7.2,15],target=[0,2,0],span=18}={}){
   if(disposed)return;current=identity();stack=[];queue=[];eye=camera;fog=rgb(background);const cw=Math.max(1,Math.round(width)),ch=Math.max(1,Math.round(height));if(canvas.width!==cw)canvas.width=cw;if(canvas.height!==ch)canvas.height=ch;
   gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...fog,1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);viewProjection=multiply(orthographic(span,span*canvas.height/canvas.width),lookAt(camera,target));
  },
  flush(){
   if(disposed)return;gl.useProgram(program);gl.uniformMatrix4fv(uniform.uVP,false,viewProjection);gl.uniform3fv(uniform.uEye,eye);gl.uniform3fv(uniform.uFog,fog);let bound=null;
   const opaque=queue.filter(q=>q.alpha>=.995),transparent=queue.filter(q=>q.alpha<.995).sort((a,b)=>Math.hypot(...b.matrix.slice(12,15).map((x,i)=>x-eye[i]))-Math.hypot(...a.matrix.slice(12,15).map((x,i)=>x-eye[i])));
   for(const list of [opaque,transparent]){gl.depthMask(list===opaque);for(const q of list){const b=buffer(q.kind);if(bound!==b){gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.vertexAttribPointer(an,3,gl.FLOAT,false,0,0);bound=b;}gl.uniformMatrix4fv(uniform.uModel,false,q.matrix);gl.uniformMatrix3fv(uniform.uNormal,false,normals(q.matrix));gl.uniform4f(uniform.uColor,...q.color,q.alpha);gl.uniform1f(uniform.uEmission,q.emission);gl.drawArrays(gl.TRIANGLES,0,b.count);}}
   gl.depthMask(true);return queue.length;
  },
  destroy(){if(disposed)return;disposed=true;for(const b of meshes.values()){gl.deleteBuffer(b.p);gl.deleteBuffer(b.n);}meshes.clear();gl.deleteProgram(program);queue=[];},
  get canvas(){return canvas;},get gl(){return gl;}
 };
 return api;
}
