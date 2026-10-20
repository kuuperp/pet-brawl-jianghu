// Shared skeleton for sculpted hands, planted soles and impact anchors.
export const HERO_RIG=Object.freeze({hip:1.08,shoulder:1.99,upperArm:.43,forearm:.42,thigh:.38,shin:.43,head:2.62});
const RAD=Math.PI/180,cap=(x,a,b)=>Math.max(a,Math.min(b,x));
const rotate=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
export function heroJoint(pose={},part='hand'){
 const h=HERO_RIG;let point,z=.5;
 if(part==='hand'||part==='back-hand'||part==='elbow'){
  const near=part!=='back-hand',k=near?'f':'b',a=-(pose['a'+k]||0)*RAD,b=-(pose['e'+k]||0)*RAD,upper=rotate([0,-h.upperArm],a),lower=part==='elbow'?[0,0]:rotate([0,-h.forearm],a+b);
  point=[(near?.1:-.1)+upper[0]+lower[0],h.shoulder+upper[1]+lower[1]];z=near?.45:-.43;
 }else if(part==='foot'||part==='back-foot'){
  const near=part==='foot',k=near?'f':'b',a=-(pose['l'+k]||0)*RAD,b=-(pose['k'+k]||0)*RAD,upper=rotate([0,-h.thigh],a),lower=rotate([.17,-h.shin],a+b);
  point=[(near?.06:-.06)+upper[0]+lower[0],h.hip+upper[1]+lower[1]];z=near?.28:-.28;
 }else{point=part==='head'?[.43,h.head]:part==='low'?[.27,.65]:[.37,1.58];z=part==='head'?.5:.4;}
 if(['hand','back-hand','elbow','body'].includes(part)){const a=(pose.twist||0)*RAD,x=point[0];point[0]=x*Math.cos(a)+z*Math.sin(a);z=-x*Math.sin(a)+z*Math.cos(a);}
 return[...point,z];
}
export function heroRoot(pose={}){
 const angle=-(pose.body||0)*RAD,pivot=HERO_RIG.hip;
 const footY=part=>{const p=heroJoint(pose,part),q=rotate([p[0],p[1]-pivot],angle);return q[1]+pivot-.15;};
 const plant=Math.abs(pose.body||0)>85?0:cap(.035-Math.min(footY('foot'),footY('back-foot')),-.25,.35);
 return{angle,pivot,y:plant-(pose.y||0)*.003};
}
export function heroWorldPoint(pose,part,options={}){
 const root=heroRoot(pose),p=heroJoint(pose,part),q=rotate([p[0],p[1]-root.pivot],root.angle),scale=options.scale||1,dir=options.facing===-1?-1:1;
 return[(options.x||0)+q[0]*scale*dir,(options.y||0)+(q[1]+root.pivot+root.y)*scale,(options.z||0)+p[2]*scale];
}
