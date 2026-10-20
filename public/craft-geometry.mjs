// Sculpted silhouettes and real bevels: edge highlights come from surface normals.
const PI=Math.PI,unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function craftGeometry(kind){
 if(!['bevel-box','axe-blade','blade-jian','blade-dao','blade-great','blade-spear','crescent','gem-cut','lapel','bow-limb','cat-tail','silk-ribbon','folded-fan','brow-band'].includes(kind))return null;
 const positions=[],normals=[],tri=(a,b,c,n,nb=n,nc=n)=>{positions.push(...a,...b,...c);normals.push(...n,...nb,...nc);},normal=(a,b,c)=>unit(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])));
 const face=(a,b,c,d,n)=>{n=n||normal(a,b,c);tri(a,b,c,n);tri(a,c,d,n);};
 if(kind==='bevel-box'){
  const b=.84;
  for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const j=(axis+1)%3,k=(axis+2)%3,n=[0,0,0];n[axis]=sign;const p=(x,y)=>{const a=[0,0,0];a[axis]=sign;a[j]=x;a[k]=y;return a;};face(p(-b,-b),p(b,-b),p(b,b),p(-b,b),n);}
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)for(const si of [-1,1])for(const sj of [-1,1]){const k=3-i-j,p=(a,b,c)=>{const v=[];v[i]=si*a;v[j]=sj*b;v[k]=c;return v;},n=[0,0,0];n[i]=si;n[j]=sj;face(p(1,b,-b),p(1,b,b),p(b,1,b),p(b,1,-b),unit(n));}
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])tri([x,y*b,z*b],[x*b,y,z*b],[x*b,y*b,z],unit([x,y,z]));
 }else if(kind==='axe-blade'){
  const outline=[[-1,-.27]];for(let i=0;i<=24;i++){const a=-PI*.43+i*PI*.86/24;outline.push([.57+.49*Math.cos(a),Math.sin(a)]);}outline.push([-1,.27]);
  for(const side of [-1,1])for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length],inner=q=>[.12+(q[0]-.12)*.85,q[1]*.85,side*.075],A=inner(a),B=inner(b),C=[b[0],b[1],0],D=[a[0],a[1],0];tri([.12,0,side*.075],A,B,[0,0,side]);const n=normal(A,B,C);if(n[2]*side<0)n.forEach((v,j)=>n[j]=-v);face(A,B,C,D,n);}
 }else if(kind.startsWith('blade-')){
  const profile=[[-1,.79],[-.9,.91],[.45,kind==='blade-great'?1:.82],[.73,.62],[1,0]],sample=y=>{let i=1;while(i<profile.length-1&&y>profile[i][0])i++;const a=profile[i-1],b=profile[i],t=(y-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;};
  const sections=[[-1,0],[-.74,.72],[-.22,1],[-.11,.7],[.11,.7],[.22,1],[.74,.72],[1,0]];
  const p=(u,y,side)=>{const w=sample(y),bend=kind==='blade-dao'?.18*(y+1)**1.8:kind==='blade-spear'?0:0;return[bend+u[0]*w,y,side*u[1]*Math.min(1,w*3)];};
  for(let j=0;j<28;j++)for(let k=0;k<sections.length-1;k++)for(const side of [-1,1]){const y=-1+j/14,Y=-1+(j+1)/14,a=p(sections[k],y,side),b=p(sections[k+1],y,side),c=p(sections[k+1],Y,side),d=p(sections[k],Y,side),n=normal(a,b,c);if(n[2]*side<0)n.forEach((v,i)=>n[i]=-v);face(a,b,c,d,n);}
  face([-sample(-1),-1,-.01],[sample(-1),-1,-.01],[sample(-1),-1,.01],[-sample(-1),-1,.01],[0,-1,0]);
 }else if(kind==='crescent'){
  const p=(a,r,z)=>[Math.cos(a)*r,Math.sin(a)*r,z];
  for(let j=0;j<42;j++){const a=-PI*.71+j*PI*1.42/42,b=-PI*.71+(j+1)*PI*1.42/42,taper=Math.sin((j+.5)/42*PI),inner=1-.42*taper;for(const side of [-1,1])face(p(a,inner,side*.07),p(b,inner,side*.07),p(b,1,0),p(a,1,0),[0,0,side]);face(p(a,inner,-.07),p(b,inner,-.07),p(b,inner,.07),p(a,inner,.07),[-Math.cos(a),-Math.sin(a),0]);}
 }else if(kind==='gem-cut'){
  const p=(u,v)=>[Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u)];
  for(let j=0;j<6;j++)for(let k=0;k<12;k++){const a=p(k*PI/6,j*PI/6),b=p((k+1)*PI/6,j*PI/6),c=p((k+1)*PI/6,(j+1)*PI/6),d=p(k*PI/6,(j+1)*PI/6);const n=unit(a.map((v,i)=>v+b[i]+c[i]+d[i]));face(a,b,c,d,n);}
 }else if(kind==='bow-limb'||kind==='cat-tail'){
  const center=t=>kind==='bow-limb'?[Math.sin(t*PI)*.66-.16,(t*2-1),0]:[Math.sin(t*PI)*.20,-.12*t+.25*Math.sin(t*4),-1.2*t+.4*t*t];
  const p=(t,a)=>{const c=center(t),r=kind==='cat-tail'?.105*(1-t*.42):.07*(.46+Math.sin(t*PI)*.54);return[c[0]+Math.cos(a)*r,c[1],c[2]+Math.sin(a)*r];};
  for(let j=0;j<32;j++)for(let k=0;k<12;k++){const t=j/32,T=(j+1)/32,a=k*PI/6,A=(k+1)*PI/6;face(p(t,a),p(t,A),p(T,A),p(T,a));}
 }else{
  const p=(u,v,side)=>{
   if(kind==='brow-band'){const a=(u*2-1)*1.36;return[Math.sin(a), (v*2-1)*.07+Math.cos(a)*.015, Math.cos(a)+side*.017];}
   if(kind==='folded-fan'){const a=(u*2-1)*1.18,r=.14+v*.86;return[Math.sin(a)*r,Math.cos(a)*r,Math.sin(u*PI*14)*.045+side*.012];}
   if(kind==='silk-ribbon')return[Math.sin(v*PI*2.4)*.4+(u*2-1)*(.10+Math.sin(v*PI)*.035),v*2,Math.cos(v*PI*2)*.13+(u-.5)*Math.sin(v*PI*3)*.15+side*.009];
   return[(u*2-1)*(.30+.70*Math.sin(v*PI*.8)),v*2-1,.13*Math.sin(v*PI)+(1-u*u)*.08+side*.025];
  };
  for(let j=0;j<24;j++)for(let k=0;k<12;k++)for(const side of [-1,1]){const u=k/12,U=(k+1)/12,v=j/24,V=(j+1)/24,a=p(u,v,side),b=p(U,v,side),c=p(U,V,side),d=p(u,V,side),n=normal(a,b,c);if(n[2]*side<0)n.forEach((x,i)=>n[i]=-x);face(a,b,c,d,n);}
 }
 return{positions:new Float32Array(positions),normals:new Float32Array(normals),count:positions.length/3};
}
