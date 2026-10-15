import * as THREE from 'three';
import {PlanetScene} from './planet-scene.js';
const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
export class OrbitIntro3D {
 constructor(canvas,masters,frame){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.masters=masters;this.frame=frame;
  this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.renderer.setSize(1920,1080);this.renderer.setPixelRatio(1);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;
  this.world=new PlanetScene();this.scene=this.world.scene;this.camera=new THREE.PerspectiveCamera(42,16/9,.03,200);this.finalImage=null;this.generation=0;
 }
 async setPalette(p,white=false){
  this.palette=p;this.white=white;await this.world.ready;this.world.setPalette(p,white);
  const colors={...p};if(white)colors.surface=colors.primaryOnDark=colors.planetOnDark=colors.secondary=colors.accent='#FFFFFF';
  const generation=++this.generation,img=new Image(),url=URL.createObjectURL(new Blob([this.frame(27,colors,this.masters)],{type:'image/svg+xml'}));try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});}finally{URL.revokeObjectURL(url);}if(generation===this.generation)this.finalImage=img;
 }
 render(t){
  const p=window.SpacelibreCamera.pose(t);this.camera.position.fromArray(p.position);this.camera.lookAt(...p.target);this.camera.fov=p.fov;this.camera.updateProjectionMatrix();this.world.update(t,p);this.renderer.render(this.scene,this.camera);
  const ctx=this.ctx;ctx.globalAlpha=1;ctx.fillStyle=this.palette.deep;ctx.fillRect(0,0,1920,1080);ctx.globalAlpha=p.opening*(1-ease((t-25)/2));ctx.drawImage(this.renderer.domElement,0,0);
  if(this.finalImage&&p.finalOpacity>0){ctx.globalAlpha=p.finalOpacity;ctx.drawImage(this.finalImage,0,0,1920,1080);}ctx.globalAlpha=1;return p.phase;
 }
 dispose(){this.world.dispose();this.renderer.dispose();}
}
