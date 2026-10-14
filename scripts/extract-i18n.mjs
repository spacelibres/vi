import fs from 'node:fs';
import { DOMParser } from 'linkedom';

// 从 index.html 抽取需要翻译的字符串：含中日韩字符的文本节点与属性值。
// 输出 i18n/zh-CN.json 作为基准目录（key = 中文原文，value = 中文原文）。
const CJK = /[\u3400-\u9fff]/;
const ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'content'];

const html = fs.readFileSync('index.html', 'utf8');
const doc = new DOMParser().parseFromString(html, 'text/html');

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
walk(doc.documentElement);

// 运行时由 app.js 通过 t('...') 生成的文案（含占位符模板）也要纳入词条。
const appJs = fs.readFileSync('app.js', 'utf8');
for (const m of appJs.matchAll(/\bt\(\s*'((?:[^'\\\n]|\\.)*)'/g)) {
  const key = m[1].replace(/\\'/g, "'");
  if (CJK.test(key)) text[key] = key;
}

const sort = (obj) => Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
const out = { text: sort(text), attr: sort(attr) };

fs.mkdirSync('i18n', { recursive: true });
fs.writeFileSync('i18n/zh-CN.json', JSON.stringify(out, null, 2) + '\n');
console.log('text keys:', Object.keys(text).length, '| attr keys:', Object.keys(attr).length);
