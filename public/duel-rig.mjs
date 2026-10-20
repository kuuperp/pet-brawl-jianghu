// Side-view limbs articulate in the arena's XY plane; the face and torso turn inward.
const RAD=Math.PI/180;
const rotate=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
export function duelAnchor(pose={},part='hand',options={}){
 let point,z=.5;
 if(part==='hand'||part==='back-hand'){
  const near=part==='hand',k=near?'f':'b',upper=-(pose['a'+k]||0)*RAD,lower=-(pose['e'+k]||0)*RAD;
  const arm=rotate([0,-.43],upper),fore=rotate([0,-.42],upper+lower);point=[(near?.1:-.1)+arm[0]+fore[0],1.94+arm[1]+fore[1]];z=near?.5:-.48;
 }else if(part==='foot'||part==='back-foot'){
  const near=part==='foot',k=near?'f':'b',upper=-(pose['l'+k]||0)*RAD,lower=-(pose['k'+k]||0)*RAD;
  const leg=rotate([0,-.38],upper),foot=rotate([.17,-.43],upper+lower);point=[(near?.06:-.06)+leg[0]+foot[0],1.06+leg[1]+foot[1]];z=near?.3:-.3;
 }else if(part==='head'){point=[.45,2.6];z=.6;}
 else if(part==='low'){point=[.27,.65];z=.35;}
 else{point=[.38,1.55];z=.45;}
 point=rotate(point,-(pose.body||0)*RAD);point[1]-=(pose.y||0)*.012;
 const scale=options.scale||1,dir=options.facing===-1?-1:1;
 return[(options.x||0)+point[0]*scale*dir,(options.y||0)+point[1]*scale,(options.z||0)+z*scale];
}
