import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
test('Published entry point and complete module graph use a single release key',()=>{
 const {version}=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
 const html=readFileSync(new URL('index.html',dist),'utf8');
 assert.ok(html.includes(`name="app-version" content="${version}"`));
 assert.ok(html.includes(`href="./style.css?v=${version}"`));
 assert.ok(html.includes(`src="./app.mjs?v=${version}"`));
 const visited=new Set();
 function inspect(path){
  if(visited.has(path))return;visited.add(path);
  const source=readFileSync(new URL(path,dist),'utf8');
  for(const [,specifier]of source.matchAll(/\bfrom\s*['"](\.\/[^'"]+)['"]/g)){
   const url=new URL(specifier,dist);assert.equal(url.search,`?v=${version}`,specifier);
   url.search='';assert.ok(existsSync(url),specifier+' must be packaged');inspect(specifier.split('?')[0]);
  }
 }
 inspect('./app.mjs');assert.equal(visited.size,readdirSync(dist).filter(n=>n.endsWith('.mjs')).length);
});
