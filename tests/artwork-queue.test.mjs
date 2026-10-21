import test from 'node:test';
import assert from 'node:assert/strict';
import {createArtworkQueue} from '../public/artwork-queue.mjs';
function fixture({observe=true}={}){
 const pending=new Map(),watched=new Set();let id=0,notify,blocked=false;
 class Observer{constructor(fn){notify=fn;}observe(node){watched.add(node);}unobserve(node){watched.delete(node);}disconnect(){watched.clear();}}
 const q=createArtworkQueue({request:fn=>{pending.set(++id,fn);return id;},cancel:key=>pending.delete(key),blocked:()=>blocked,Observer:observe?Observer:null});
 return{q,pending,watched,setBlocked(value){blocked=value;},intersect(node){notify([{target:node,isIntersecting:true}]);},run(){const next=pending.entries().next().value;assert.ok(next,'An idle job is scheduled');pending.delete(next[0]);return next[1]();}};
}
test('Artwork is lazy, serialized across idle slots, paused during fights and resumed afterward',async()=>{
 const f=fixture(),owner={},nodes=[{isConnected:true},{isConnected:true}],drawn=[],applied=[];
 f.q.add(owner,nodes.map((node,i)=>({node,draw:()=>{drawn.push(i);return'url:'+i;},apply:url=>applied.push(url)})));
 assert.equal(f.pending.size,0);assert.equal(drawn.length,0);f.intersect(nodes[0]);f.intersect(nodes[1]);assert.equal(f.pending.size,1);
 await f.run();assert.deepEqual(drawn,[0]);assert.deepEqual(applied,['url:0']);assert.equal(f.pending.size,1);
 f.q.pause();assert.equal(f.pending.size,0);f.q.resume();f.setBlocked(true);await f.run();assert.deepEqual(drawn,[0]);assert.equal(f.pending.size,0);
 f.setBlocked(false);f.q.resume();await f.run();assert.deepEqual(applied,['url:0','url:1']);assert.equal(f.pending.size,0);f.q.destroy();
});
test('Navigation cancels stale work, detached nodes are skipped, and encoding cannot overlap',async()=>{
 const f=fixture({observe:false}),owner={},oldNode={isConnected:true};let finish,active=0,peak=0;const applied=[];
 f.q.add(owner,[{node:oldNode,draw:()=>{peak=Math.max(peak,++active);return new Promise(resolve=>{finish=url=>{active--;resolve(url);};});},apply:url=>applied.push(url)}]);
 const running=f.run();f.q.cancel(owner);f.q.add(owner,[{node:{isConnected:false},draw:()=>assert.fail('Detached art generated'),apply(){}},{node:{isConnected:true},draw:()=>{peak=Math.max(peak,++active);active--;return'fresh';},apply:url=>applied.push(url)}]);
 assert.equal(f.pending.size,0,'The shared preview canvas remains exclusive while encoding');finish('stale');await running;assert.deepEqual(applied,[]);await f.run();assert.deepEqual(applied,['fresh']);assert.equal(peak,1);f.q.destroy();
});
