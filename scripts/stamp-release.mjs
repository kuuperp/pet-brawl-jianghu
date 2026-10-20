import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'public');
const {version}=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Expected a numeric release version');
// Every module edge gets the same release key, not only the entry point.
for(const name of readdirSync(dist).filter(name=>name.endsWith('.mjs'))){
 const path=resolve(dist,name),source=readFileSync(path,'utf8');
 writeFileSync(path,source.replace(/(\bfrom\s*['"])(\.\/[^'"?]+\.mjs)(?:\?v=[^'"]+)?(['"])/g,`$1$2?v=${version}$3`).replace(/(?:流畅版|江湖新篇) v\d+\.\d+(?:\.\d+)?/g,'江湖新篇 v'+version));
}
const path=resolve(dist,'index.html');let html=readFileSync(path,'utf8');
html=html.replace(/(\.\/(?:style\.css|app\.mjs))(?:\?v=[^'"]+)?/g,`$1?v=${version}`);
html=html.replace(/<meta name="app-version" content="[^"]*">/,'');
html=html.replace('<head>',`<head><meta name="app-version" content="${version}">`);
writeFileSync(path,html);console.log('Stamped full asset graph: v'+version);
