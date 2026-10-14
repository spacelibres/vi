const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {generatePalette,renderThemedSvg,DOMParser}=require('./runtime.cjs');
test('all nine monochrome masters keep one original ink under every theme',()=>{
 for(const shape of ['horizontal','stacked','icon'])for(const [variant,color] of [['black','#000000'],['white','#FFFFFF'],['navy','#002044']]){
  const raw=fs.readFileSync(`01-logos/${shape}-${variant}.svg`,'utf8');
  for(const hex of ['#007BFF','#12D6B0','#A15AFF','#FF6A3D','#15BDAD','#CBEA35','#F25085']){
   const p=generatePalette(hex,'auto');p.planet=p.planetOnLight;
   const doc=new DOMParser().parseFromString(renderThemedSvg(raw,p),'image/svg+xml');
   const colors=new Set();for(const el of doc.querySelectorAll('[fill],[stroke]')){
    if(el.closest('mask,clipPath'))continue;
    for(const attr of ['fill','stroke']){const v=el.getAttribute(attr);if(v&&v!=='none')colors.add(v.toUpperCase());}
   }
   assert.deepEqual([...colors],[color],`${shape}-${variant} must stay entirely ${color}`);
  }
 }
});
