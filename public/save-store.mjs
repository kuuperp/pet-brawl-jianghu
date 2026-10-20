import {freshState,normalizeState} from './engine.mjs?v=2.0.0';
export const SAVE_KEY='pet-brawl-jianghu-v1';
export function readProtectedSave(storage,key=SAVE_KEY){
 let raw=null;try{raw=storage.getItem(key);if(!raw)return{state:freshState(),blocked:false,recovered:false};return{state:normalizeState(JSON.parse(raw)),blocked:false,recovered:false};}
 catch{
  if(raw)try{storage.setItem(key+'-damaged',raw);}catch{}
  try{const backup=storage.getItem(key+'-backup');if(backup)return{state:normalizeState(JSON.parse(backup)),blocked:false,recovered:true};}catch{}
  return{state:freshState(),blocked:true,recovered:false};
 }
}
export function writeProtectedSave(storage,state,{key=SAVE_KEY,blocked=false}={}){
 if(blocked)return false;
 const next=JSON.stringify(state);
 try{const previous=storage.getItem(key);if(previous&&previous!==next){try{normalizeState(JSON.parse(previous));storage.setItem(key+'-backup',previous);}catch{}}
  storage.setItem(key,next);return true;
 }catch{return false;}
}
