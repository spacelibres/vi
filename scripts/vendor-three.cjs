const fs=require('node:fs');fs.mkdirSync('08-motion/vendor',{recursive:true});
for(const [src,dest] of [['build/three.module.js','three.module.js'],['build/three.core.js','three.core.js'],['examples/jsm/loaders/SVGLoader.js','SVGLoader.js'],['examples/jsm/environments/RoomEnvironment.js','RoomEnvironment.js'],['LICENSE','LICENSE-three.txt']])fs.copyFileSync('node_modules/three/'+src,'08-motion/vendor/'+dest);
console.log('Vendored pinned Three.js runtime and required addons for offline playback');
