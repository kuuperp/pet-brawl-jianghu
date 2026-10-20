export const MIN_WEAPON_USES=3,MAX_WEAPON_USES=5;
export const randomWeaponLimit=(rng=Math.random)=>MIN_WEAPON_USES+Math.min(2,Math.max(0,Math.floor(rng()*3)));
export function weaponUseLimit(f,index=f?.heldIndex){
 const n=Number.isInteger(index)&&index>=0?f?.weaponLimits?.[index]:f?.heldLimit;
 return Number.isInteger(n)&&n>=MIN_WEAPON_USES&&n<=MAX_WEAPON_USES?n:MAX_WEAPON_USES;
}
export const weaponExhausted=f=>!!f?.held&&(f.heldUses||0)>=weaponUseLimit(f);
