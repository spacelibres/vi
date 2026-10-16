import fs from 'node:fs';
import { DOMParser } from 'linkedom';

// 从站点自身的源文件抽取需要翻译的字符串：含中日韩字符的文本节点与属性值。
// 覆盖手册主页（index.html）与内嵌片头播放器（08-motion/），以及运行时拼接
// 文案的脚本（app.js、08-motion/three-player.js）。
// 输出 i18n/zh-CN.json 作为基准目录（key = 中文原文，value = 中文原文）。
// 注意：本脚本只是重新生成基准目录，语言文件（i18n/<locale>.json）需手动同步。
const CJK = /[\u3400-\u9fff]/;
const ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'content'];
const HTML_SOURCES = ['index.html', '08-motion/index.html'];
const JS_SOURCES = ['app.js', '08-motion/three-player.js'];

const text = {};
const attr = {};

function walk(node) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const t = (child.textContent || '').trim();
      if (t && CJK.test(t)) text[t] = t;
    } else if (child.nodeType === 1) {
      const tag = (child.tagName || '').toLowerCase();
      if (tag === 'script' || tag === 'style') continue;
      for (const name of ATTRS) {
        const v = child.getAttribute ? child.getAttribute(name) : null;
        if (v && CJK.test(v)) attr[v.trim()] = v.trim();
      }
      walk(child);
    }
  }
}

for (const file of HTML_SOURCES) {
  if (!fs.existsSync(file)) continue;
  const doc = new DOMParser().parseFromString(fs.readFileSync(file, 'utf8'), 'text/html');
  walk(doc.documentElement);
}

// 运行时由脚本通过 t('...') 生成的文案（含占位符模板）也要纳入词条。
// 第一个参数可能是三元表达式、双引号字符串等，因此扫描整个第一个实参
//（到顶层逗号或右括号为止）并把其中所有含中日韩字符的字面量都收进来，
// 避免像 t(cond?'a':'b',{...}) 这样的写法被漏掉。
function firstArgument(src, open) {
  let depth = 0, quote = null, start = open + 1;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === '(') depth++;
    else if (c === ')') { if (depth === 0) return src.slice(start, i); depth--; }
    else if (c === ',' && depth === 0) return src.slice(start, i);
  }
  return src.slice(start);
}

for (const file of JS_SOURCES) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const call of src.matchAll(/(?<!\w)t\(/g)) {
    const arg = firstArgument(src, call.index + 1);
    // t(PHASES[...]) 之类把整段字面量数组作为实参：收下实参里的所有字面量。
    for (const lit of arg.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)) {
      const key = (lit[1] ?? lit[2]).replace(/\\'/g, "'");
      if (CJK.test(key)) text[key] = key;
    }
  }
}

// 直接以字面量数组形式存放的运行时文案（如片头的阶段名称）。
for (const file of JS_SOURCES) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const arr of src.matchAll(/=\s*\[([^\]]*)\]/g)) {
    for (const lit of arr[1].matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) {
      const key = lit[1].replace(/\\'/g, "'");
      if (CJK.test(key)) text[key] = key;
    }
  }
}

const sort = (obj) => Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
const out = { text: sort(text), attr: sort(attr) };

fs.mkdirSync('i18n', { recursive: true });
fs.writeFileSync('i18n/zh-CN.json', JSON.stringify(out, null, 2) + '\n');
console.log('text keys:', Object.keys(text).length, '| attr keys:', Object.keys(attr).length);
