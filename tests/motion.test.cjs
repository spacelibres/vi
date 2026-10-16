const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const motion=require('../08-motion/scene.js');
const masters=require('../08-motion/masters.js');
const palette=JSON.parse(fs.readFileSync('07-palettes/palette-tokens.json','utf8'))[0].colors;
test('motion is a finite 30-second timeline with a stable complete final lockup',()=>{
 assert.equal(motion.duration,30);assert.equal(motion.fps,30);
 for(let t=0;t<=30;t+=.25){const svg=motion.frame(t,palette,masters);assert.match(svg,/viewBox="0 0 1920 1080"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);}
 assert.equal(motion.frame(27,palette,masters),motion.frame(29.99,palette,masters));
});
test('final lockup preserves every approved path and the original circle geometry',()=>{
 const {DOMParser}=require('linkedom');const doc=new DOMParser().parseFromString(motion.frame(29,palette,masters),'image/svg+xml');
 const final=doc.querySelector('#final-lockup');assert.equal(final.getAttribute('opacity'),'1');
 const raw=new DOMParser().parseFromString(fs.readFileSync('01-logos/horizontal-primary.svg','utf8'),'image/svg+xml');
 assert.deepEqual([...final.querySelectorAll('path')].map(p=>p.getAttribute('d')),[...raw.querySelectorAll('path')].map(p=>p.getAttribute('d')));
 const c=final.querySelector('circle[r="171"]');assert.equal(c.getAttribute('stroke-width'),'30');assert.equal(c.getAttribute('stroke'),palette.planetOnDark);
});
test('sound and silent delivery masters match the verified media manifest',()=>{
 const crypto=require('node:crypto'),manifest=JSON.parse(fs.readFileSync('08-motion/manifest.json','utf8'));
 for(const [file,hash] of Object.entries(manifest.sourceSHA256||{}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('08-motion/'+file)).digest('hex'),hash,'recording must match its scene source');
 for(const media of manifest.media){const data=fs.readFileSync('08-motion/'+media.file);assert.equal(crypto.createHash('sha256').update(data).digest('hex'),media.sha256);assert.equal(data.subarray(4,8).toString(),'ftyp');assert.equal(media.frameCount,media.durationSeconds*media.fps);}
});
test('the early planet occlusion shares the visible orbit reveal mask',()=>{
 const {DOMParser}=require('linkedom');const doc=new DOMParser().parseFromString(motion.frame(8,palette,masters),'image/svg+xml');
 const cut=doc.querySelector('#planet-occlusion path');assert.equal(cut.getAttribute('mask'),'url(#orbit-reveal)');
 const front=[...doc.querySelectorAll('path')].find(n=>n.getAttribute('d')===masters.orbit&&!n.closest('mask'));assert.equal(front.getAttribute('mask'),cut.getAttribute('mask'));assert.equal(front.getAttribute('opacity'),cut.getAttribute('opacity'));
});
test('the embedded player never overwrites the manual\'s site-wide tokens',()=>{
 // setPalette used to write --ink/--surface/--primary/--border/--card onto
 // <html>; --card is a site token, so in dark mode the player forced it back to
 // its light value and the language/palette dropdowns stayed white.
 const player=fs.readFileSync('08-motion/three-player.js','utf8');
 const writes=[...player.matchAll(/setProperty\('--'\+key,value\)/g)];
 assert.equal(writes.length,1,'the palette write loop should appear exactly once');
 for(const key of ['ink','surface','primary','border','card']){
  assert.doesNotMatch(player,new RegExp("(?:^|[^a-z-])'"+key+"':"),'the player must not write the bare --'+key+' token');
 }
 // Both the player script and its stylesheet must use the --motion- namespace.
 const css=fs.readFileSync('08-motion/player.css','utf8');
 for(const key of ['ink','surface','primary','border','card']){
  assert.ok(css.includes('--motion-'+key),'player.css must define --motion-'+key);
  assert.doesNotMatch(css,new RegExp('var\\(--'+key+'[,)]'),'player.css must not consume the bare --'+key+' token');
 }
 assert.match(player,/\{'motion-ink':p\.ink,'motion-surface':p\.surface,'motion-primary':p\.primaryOnLight,'motion-border':p\.line,'motion-card':p\.card\}/,'the player must write namespaced motion tokens');
});
