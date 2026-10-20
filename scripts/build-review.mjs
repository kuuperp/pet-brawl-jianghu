import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {Script} from 'node:vm';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'public'),out=resolve(root,'review');mkdirSync(out,{recursive:true});
// Small offline packer for this app's named ES modules. Each source retains its own closure.
const modules=new Map();
function add(file){const id='./'+file;if(modules.has(id))return id;let text=readFileSync(resolve(dist,file),'utf8');const exports=new Map();modules.set(id,'');
 text=text.replace(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/gm,(_,names,path)=>{const dep=add(path.replace(/^\.\//,'').split('?')[0]);return`const {${names.replace(/\s+as\s+/g,':')}}=require(${JSON.stringify(dep)});`;});
 text=text.replace(/^export\s+(const|let|function|class)\s+([\w$]+)/gm,(_,kind,name)=>{exports.set(name,name);return`${kind} ${name}`;});
 text=text.replace(/^export\s*\{([^}]+)\};?/gm,(_,names)=>{for(const token of names.split(',')){const [local,exported]=token.trim().split(/\s+as\s+/);exports.set(exported||local,local);}return'';});
 if(/^\s*(?:import|export)\s/m.test(text))throw new Error('Unsupported module syntax in '+file);
 modules.set(id,`function(require){${text}\nreturn {${[...exports].map(([key,value])=>JSON.stringify(key)+':'+value).join(',')}};}`);return id;
}
add('app.mjs');const bundle=`(()=>{const modules={${[...modules].map(([id,code])=>JSON.stringify(id)+':'+code).join(',')}},cache={};function require(id){return cache[id]||(cache[id]=modules[id](require));}require('./app.mjs');})();`;
new Script(bundle,{filename:'playable-preview.html'});
const map=readFileSync(resolve(dist,'scene.svg')).toString('base64'),css=readFileSync(resolve(dist,'style.css'),'utf8').replace("url('./scene.svg')",`url('data:image/svg+xml;base64,${map}')`);
let html=readFileSync(resolve(dist,'index.html'),'utf8').replace('<title>宠斗江湖 · 今天也要可爱地开打</title>','<title>离线试玩 · 宠斗江湖</title>').replace(/<link rel="stylesheet" href="\.\/style\.css(?:\?v=[^"]+)?">/,`<style>${css}\n.review-status{position:fixed;z-index:999;top:8px;left:50%;transform:translateX(-50%);pointer-events:none;background:#455d48e8;color:#fffce8;padding:6px 14px;border-radius:30px;font-size:11px;box-shadow:0 3px 14px #32462c20}</style>`).replace('<body>','<body><div class="review-status">离线试玩 · 完整战斗动画</div>').replace(/<script type="module" src="\.\/app\.mjs(?:\?v=[^"]+)?"><\/script>/,`<script id="preview-app">${bundle.replace(/<\/script/gi,'<\\/script')}</script>`);
writeFileSync(resolve(out,'playable-preview.html'),html);console.log(`Offline preview: ${Buffer.byteLength(html)} bytes, ${modules.size} modules, no external assets`);
