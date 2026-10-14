const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const actual=require('./runtime.cjs');
test('portable skill palette matches the website on six presets and custom colors',()=>{
 const code=fs.readFileSync('skills/spacelibre-vi/assets/theme-engine.js','utf8').replace(/export \{[^}]+\};/,'');const ctx=vm.createContext({});vm.runInContext(code,ctx);
 for(const hex of ['#007BFF','#12D6B0','#A15AFF','#FF6A3D','#15BDAD','#CBEA35','#F25085','#FFFFFF','#000000'])for(const mode of ['auto','triad','split','analogous'])assert.deepEqual(JSON.parse(JSON.stringify(ctx.generatePalette(hex,mode))),JSON.parse(JSON.stringify(actual.generatePalette(hex,mode))));
});
test('skill includes immutable approved geometry and explicit semantic roles',()=>{
 for(const name of ['horizontal-primary.svg','stacked-primary.svg','icon-primary.svg']){
  const source=fs.readFileSync('skills/spacelibre-vi/assets/'+name,'utf8');assert.equal(source,fs.readFileSync('01-logos/'+name,'utf8'));assert.match(source,/data-stroke-role="planet"/);
 }
 const skill=fs.readFileSync('skills/spacelibre-vi/SKILL.md','utf8');assert.match(skill,/planetOnLight/);assert.match(skill,/opaque rectangles/);
});
