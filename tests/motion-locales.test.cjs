const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('3D player fully covers all 22 site languages and recording placeholders',()=>{
 const all=JSON.parse(fs.readFileSync('08-motion/locales.json','utf8')),languages=fs.readdirSync('i18n').filter(n=>n.endsWith('.json')).map(n=>n.slice(0,-5));
 assert.equal(languages.length,22);assert.deepEqual(Object.keys(all).sort(),languages.sort());
 const keys=Object.keys(all.en).sort();for(const [locale,data] of Object.entries(all)){assert.deepEqual(Object.keys(data).sort(),keys,locale);for(const key of keys)assert.ok(data[key].trim());assert.ok(data.exporting.includes('{seconds}'));}
 assert.equal(all.ja.play,'再生');assert.equal(all.ar.play,'تشغيل');
});
