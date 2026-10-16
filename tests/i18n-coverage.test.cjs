const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
// Guard the bug where a t(cond?'a':'b',{...}) call hid its two templates from the
// extractor, so the colour-lab summary stayed Chinese in every translation.
// Every CJK literal that reaches t() must exist as a key in the base catalogue
// and therefore, per validate.mjs, in every locale.
const CJK=/[\u3400-\u9fff]/;
const SOURCES=['app.js','08-motion/three-player.js'];

function firstArgument(src,open){
 let depth=0,quote=null,start=open+1;
 for(let i=start;i<src.length;i++){
  const c=src[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote=null;continue;}
  if(c==="'"||c==='"'){quote=c;continue;}
  if(c==='(')depth++;
  else if(c===')'){if(depth===0)return src.slice(start,i);depth--;}
  else if(c===','&&depth===0)return src.slice(start,i);
 }
 return src.slice(start);
}

function cjkKeysInSource(src){
 const keys=new Set();
 for(const call of src.matchAll(/(?<!\w)t\(/g)){
  const arg=firstArgument(src,call.index+1);
  for(const lit of arg.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)){
   const key=(lit[1]??lit[2]).replace(/\\'/g,"'");
   if(CJK.test(key))keys.add(key);
  }
 }
 return keys;
}

test('every CJK literal passed to t() is a catalogue key',()=>{
 const base=JSON.parse(fs.readFileSync('i18n/zh-CN.json','utf8')).text;
 const missing=[];
 for(const file of SOURCES){
  for(const key of cjkKeysInSource(fs.readFileSync(file,'utf8'))){
   if(!(key in base))missing.push(file+' -> '+JSON.stringify(key));
  }
 }
 assert.deepEqual(missing,[],'t() literals missing from i18n/zh-CN.json:\n'+missing.join('\n'));
});

test('the colour-lab summary renders through explicit catalogue keys',()=>{
 const app=fs.readFileSync('app.js','utf8');
 // The two templates must be plain literals so the extractor can see them.
 const auto='自动推荐：{relation} · 已生成 16 个色彩角色，并自动适配浅色 / 深色背景。';
 const cur='当前关系：{relation} · 已生成 16 个色彩角色，并自动适配浅色 / 深色背景。';
 const base=JSON.parse(fs.readFileSync('i18n/zh-CN.json','utf8')).text;
 for(const key of [auto,cur]){
  assert.ok(base[key],'base catalogue missing '+JSON.stringify(key));
  assert.ok(app.includes(key),'app.js must pass '+JSON.stringify(key)+' literally to t()');
 }
 assert.doesNotMatch(app,/\bt\(mode==='auto'\?/,'the summary must not hide its templates inside a t() ternary');
});
