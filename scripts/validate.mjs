import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {DOMParser} from 'linkedom';
import {build as buildI18n, locales as i18nLocales} from './i18n-merge.mjs';

// --- version + UI labels ---
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
if(fs.readFileSync('VERSION','utf8').trim()!==pkg.version)throw Error('Version mismatch');
const html=fs.readFileSync('index.html','utf8');
if(!html.includes('VI '+pkg.version))throw Error('UI version mismatch');
execFileSync(process.execPath,['--check','app.js']);

// --- vector assets ---
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>['.git','node_modules','artifacts'].includes(e.name)?[]:e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const all=files('.');
const svgs=all.filter(p=>p.endsWith('.svg'));
for(const file of svgs){const text=fs.readFileSync(file,'utf8'),doc=new DOMParser().parseFromString(text,'image/svg+xml');if(doc.documentElement.localName!=='svg')throw Error('Invalid SVG '+file);const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate SVG IDs '+file);for(const m of text.matchAll(/url\(#([^)]+)\)/g))if(!ids.includes(m[1]))throw Error('Unresolved SVG ref '+file+': '+m[1]);if(doc.querySelector('image'))throw Error('Raster embedded in vector '+file);}

// --- html references ---
const doc=new DOMParser().parseFromString(html,'text/html');
for(const e of doc.querySelectorAll('[src],[href]'))for(const a of ['src','href']){const ref=e.getAttribute(a);if(!ref||/^(?:https?:|#|blob:)/.test(ref))continue;const name=ref.split(/[?#]/)[0];if(name==='spacelibre-svg-assets.zip')continue;if(!fs.existsSync(name))throw Error('Missing resource '+name);}

// --- secret exclusion ---
for(const file of all.filter(p=>/\.(?:js|mjs|cjs|json|md|yml|yaml|html|svg|css)$/.test(p))){const text=fs.readFileSync(file,'utf8');if(/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/.test(text))throw Error('Credential-like value in '+file);}

// --- VI consistency: the site must follow its own manual (docs/versioning.md + skill standard) ---
const css=fs.readFileSync('styles.css','utf8');
const firstRule=sel=>{const re=new RegExp('(?:^|[}])\\s*'+sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\{([^}]*)\\}');const m=css.match(re);if(!m)throw Error('Missing rule '+sel);return m[1];};
const px=(rule,prop)=>{const m=rule.match(new RegExp('(?:^|;)'+prop+':(\\d+(?:\\.\\d+)?)px'));return m?parseFloat(m[1]):null;};
const inRange=(v,lo,hi,what)=>{if(v===null||v<lo||v>hi)throw Error(what+' must be '+lo+'-'+hi+'px (got '+v+')');};
const atLeast=(v,min,what)=>{if(v===null||v<min)throw Error(what+' must be at least '+min+'px (got '+v+')');};

// 1) typography scale: 主标题 48–80, 分区标题 28–40, 正文 16–20
inRange(px(firstRule('h1'),'font-size'),48,80,'h1 / 主标题 (display)');
inRange(px(firstRule('h2'),'font-size'),28,40,'h2 / 分区标题 (section)');
inRange(px(firstRule('body'),'font-size'),16,20,'body / 正文');
for(const sel of ['h1','h2']){const w=firstRule(sel).match(/font-weight:(\d+)/);if(!w||Number(w[1])<600)throw Error(sel+' (display) must use Arial Bold (font-weight >= 600)');}

// 2) every font size lives in the documented 12–80px band
for(const m of css.matchAll(/font(?:-size)?:\s*(\d+(?:\.\d+)?)px/g)){const n=parseFloat(m[1]);if(n<12)throw Error('Font size below the 12px label minimum: '+m[0]);if(n>80)throw Error('Font size above the 80px display maximum: '+m[0]);}

// 3) spacing rhythm: margin/padding/gap are multiples of 8 (or --space-* tokens)
const SPACE=/(?:^|[;{])(?:margin(?:-(?:top|right|bottom|left))?|padding(?:-(?:top|right|bottom|left))?|gap|row-gap|column-gap):([^;}]+)/g;
for(const m of css.matchAll(SPACE)){if(/(?:calc|min|max|clamp)\(/.test(m[1]))continue;for(const v of m[1].matchAll(/(-?\d+(?:\.\d+)?)px/g)){const n=parseFloat(v[1]);if(Math.abs(n)>=8&&n%8!==0)throw Error('Off-rhythm spacing, not a multiple of 8: '+m[0]);}}

// 4) spacing tokens exist and match the 8px scale
const root=firstRule(':root');
for(const n of [1,2,3,4,5,6,8,12])if(!root.includes('--space-'+n+':'))throw Error('Missing spacing token --space-'+n);
for(const t of root.matchAll(/--space-(\d+):(\d+)px/g))if(Number(t[2])!==Number(t[1])*8)throw Error('Spacing token --space-'+t[1]+' must equal '+Number(t[1])*8+'px');

// 5) logo minimum sizes: wordmarks >= 240px, icons >= 48px, small screens swap to the icon
atLeast(px(firstRule('.brand-wordmark'),'width'),240,'.brand-wordmark');
atLeast(px(firstRule('.footer-logo'),'width'),240,'.footer-logo');
atLeast(px(firstRule('.brand-icon'),'width'),48,'.brand-icon');
if(!css.includes('.brand-icon{display:block}'))throw Error('.brand-icon must replace the wordmark on small screens');

// 6) no ad-hoc colors: literals only in :root, .color-lab or var() fallbacks
let scoped=css.replace(/:root\{[^}]*\}/g,'').replace(/\.color-lab\{[^}]*\}/g,'');
scoped=scoped.replace(/(?:rgba?|color-mix)\([^()]*(?:\([^()]*\)[^()]*)*\)/g,m=>m.includes('var(')?'':m).replace(/var\([^)]*\)/g,'');
const literals=[...scoped.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map(m=>m[0]);
if(literals.length)throw Error('Ad-hoc color literals (use tokens): '+literals.join(', '));

// --- i18n: every locale fully covers the base catalogue, and the bundle stays in sync ---
const baseCatalogue=JSON.parse(fs.readFileSync('i18n/zh-CN.json','utf8'));
const locales=i18nLocales();
if(!locales.length)throw Error('No i18n locales found under i18n/');
for(const locale of locales){
 const d=JSON.parse(fs.readFileSync('i18n/'+locale+'.json','utf8'));
 for(const kind of ['text','attr']){
  const base=baseCatalogue[kind],obj=d[kind]||{};
  const missing=Object.keys(base).filter(k=>!(k in obj));
  const extra=Object.keys(obj).filter(k=>!(k in base));
  if(missing.length||extra.length)throw Error('i18n '+locale+' '+kind+' key mismatch (missing '+missing.length+', extra '+extra.length+')');
  const ph=s=>(String(s).match(/\{\w+\}/g)||[]).slice().sort().join(',');
  for(const k of Object.keys(base))if(ph(base[k])!==ph(obj[k]))throw Error('i18n '+locale+' '+kind+' placeholder mismatch: '+k);
 }
}
if(!html.includes('i18n.js'))throw Error('index.html must load the i18n runtime');
if(fs.readFileSync('i18n-data.js','utf8')!==buildI18n())throw Error('i18n-data.js is out of date; run node scripts/build-i18n.mjs');

console.log('Validated version '+pkg.version+', '+svgs.length+' vector assets, '+locales.length+' locales, references, VI consistency and secret exclusion.');
