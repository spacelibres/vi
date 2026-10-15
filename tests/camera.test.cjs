const test=require('node:test'),assert=require('node:assert/strict'),camera=require('../08-motion/camera.js');
test('camera stays outside the solid planet, moves continuously and holds the exact ending',()=>{
 assert.equal(camera.radius,2.4);
 for(let t=0;t<=30;t+=.025){const p=camera.pose(t);for(const n of [...p.position,...p.target,p.fov])assert.ok(Number.isFinite(n));assert.ok(Math.hypot(...p.position)>camera.radius+.08);const q=camera.pose(t+.001);assert.ok(Math.hypot(...q.position.map((v,i)=>v-p.position[i]))<.04);}
 assert.ok(Math.hypot(...camera.pose(0).position)<camera.radius+1);assert.ok(Math.hypot(...camera.pose(12).position)>9);assert.deepEqual(camera.pose(27),camera.pose(30));assert.equal(camera.pose(29).finalOpacity,1);
 assert.ok(Math.hypot(...camera.pose(17).position.map((v,i)=>v-camera.satellitePoint(17)[i]))<5,'satellite close approach');
});
test('satellite follows one closed orbit outside the planet with front and back segments',()=>{
 assert.equal(typeof camera.orbitPoint,'function');let front=false,back=false;
 for(let a=0;a<Math.PI*2;a+=.05){const p=camera.orbitPoint(a);assert.ok(Math.hypot(...p)>camera.radius+.5);front||=p[2]>2;back||=p[2]<-2;}
 assert.ok(front&&back);const a=camera.orbitPoint(0),b=camera.orbitPoint(Math.PI*2);assert.ok(Math.hypot(...a.map((v,i)=>v-b[i]))<1e-10);
});
test('the visible foreground arc follows the approved logo lower-left to upper-right direction',()=>{
 const front=camera.orbitPoint(Math.PI/2),right=camera.orbitPoint(0),left=camera.orbitPoint(Math.PI);
 assert.ok(front[2]>0&&front[1]<0,'front arc must cross the lower hemisphere, not sit behind Earth');
 assert.ok(right[0]>left[0]&&right[1]>left[1],'right end rises in world Y, matching SVG screen direction');
 for(const t of [10,14,17,20,21]){const pos=camera.pose(t).position;assert.ok(Math.abs(pos[0]/pos[2])<.3,'camera preserves the logo-facing orientation');}
});
