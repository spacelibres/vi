const test=require('node:test'),assert=require('node:assert/strict'),camera=require('../08-motion/camera.js');
test('3D camera contains real close approaches, flythrough and a stable final hold',()=>{
 let nearest=100;for(let t=0;t<=30;t+=.1){const p=camera.pose(t);for(const n of [...p.position,...p.target,p.fov,p.scale])assert.ok(Number.isFinite(n));nearest=Math.min(nearest,Math.hypot(...p.position.map((v,i)=>v-p.target[i])));}
 assert.ok(nearest<1.5);assert.ok(camera.pose(27).position[2]>=15);assert.deepEqual(camera.pose(27),camera.pose(30));assert.equal(camera.pose(18).phase,3);assert.equal(camera.pose(29).finalOpacity,1);
});
