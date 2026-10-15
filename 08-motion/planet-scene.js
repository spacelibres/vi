import * as THREE from 'three';

const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
const vertex=`varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`;

// An actual opaque sphere supplies both the surface and depth occlusion.
export class PlanetScene {
 constructor(){
  this.scene=new THREE.Scene();this.system=new THREE.Group();this.scene.add(this.system);
  this.surface=new THREE.ShaderMaterial({uniforms:{earth:{value:null},mono:{value:0},morph:{value:0},outlineTint:{value:new THREE.Color('#ff3b30')},sun:{value:new THREE.Vector3(-.65,.28,.8).normalize()}},vertexShader:vertex,fragmentShader:`
   uniform sampler2D earth;uniform float mono;uniform float morph;uniform vec3 outlineTint;uniform vec3 sun;varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;
   void main(){vec3 n=normalize(vNormal);vec3 tex=texture2D(earth,vUv).rgb;tex=mix(tex,vec3(dot(tex,vec3(.2126,.7152,.0722))),mono);float light=dot(n,sun);float day=smoothstep(-.14,.7,light);vec3 color=tex*(.018+1.05*day);float facing=max(dot(n,normalize(cameraPosition-vWorld)),0.);float edge=sqrt(max(0.,1.-facing*facing));float alpha=mix(1.,smoothstep(.82,.86,edge),morph);color=mix(color,outlineTint,morph);gl_FragColor=vec4(color,alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`,transparent:true});
  // Write Earth's depth before the transparent orbit. Otherwise the surface
  // fade material can paint over the near arc when transparent sorting ties.
  this.earth=new THREE.Mesh(new THREE.SphereGeometry(2.4,192,128),this.surface);this.earth.renderOrder=-1;this.system.add(this.earth);
  this.atmosphere=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color('#489cff')},strength:{value:1}},vertexShader:vertex,fragmentShader:`
   uniform vec3 tint;uniform float strength;varying vec3 vNormal;varying vec3 vWorld;
   void main(){vec3 n=normalize(vNormal);float edge=pow(1.-max(dot(n,normalize(cameraPosition-vWorld)),0.),3.5);float daylight=.3+.7*max(dot(n,normalize(vec3(-.65,.28,.8))),0.);gl_FragColor=vec4(tint,edge*daylight*.65*strength);
   #include <colorspace_fragment>
   }`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  this.haze=new THREE.Mesh(new THREE.SphereGeometry(2.455,160,96),this.atmosphere);this.system.add(this.haze);
  this.orbitMaterial=new THREE.MeshBasicMaterial({color:'#007bff',transparent:true,opacity:.9,depthWrite:false});this.glowMaterial=new THREE.MeshBasicMaterial({color:'#007bff',transparent:true,opacity:.1,depthWrite:false});
  const pts=Array.from({length:769},(_,i)=>new THREE.Vector3(...window.SpacelibreCamera.orbitPoint(-1.8+i/768*Math.PI*2)));
  const curve=new THREE.CatmullRomCurve3(pts,true);this.orbit=new THREE.Mesh(new THREE.TubeGeometry(curve,768,.012,8,true),this.orbitMaterial);this.glow=new THREE.Mesh(new THREE.TubeGeometry(curve,768,.045,6,true),this.glowMaterial);this.orbit.renderOrder=2;this.glow.renderOrder=1;this.system.add(this.orbit,this.glow);
  this.satellite=new THREE.Group();this.system.add(this.satellite);
  this.silver=new THREE.MeshStandardMaterial({color:'#e0e5ec',metalness:.25,roughness:.4});this.panelMaterial=new THREE.MeshStandardMaterial({color:'#124d9c',metalness:.2,roughness:.45});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,.2),this.silver);this.satellite.add(body);
  for(const side of [-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(.45,.22,.012),this.panelMaterial);panel.position.x=side*.36;this.satellite.add(panel);for(let j=0;j<4;j++){const rail=new THREE.Mesh(new THREE.BoxGeometry(.003,.225,.016),this.silver);rail.position.set(side*.36-.16+j*.108,0,.012);this.satellite.add(rail);}}
  const dish=new THREE.Mesh(new THREE.SphereGeometry(.1,24,12,0,Math.PI*2,0,Math.PI*.4),this.silver);dish.rotation.x=Math.PI/2;dish.position.z=.13;this.satellite.add(dish);
  const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.3,8),this.silver);antenna.rotation.x=Math.PI/2;antenna.position.z=.25;this.satellite.add(antenna);
  for(const side of [-1,1])for(const y of [-.07,0,.07]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.45,.003,.016),this.silver);rail.position.set(side*.36,y,.012);this.satellite.add(rail);}
  this.scene.add(new THREE.AmbientLight(0xffffff,.4));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-5,3,6);this.scene.add(sun);
  const positions=[],sizes=1200;for(let i=0;i<sizes;i++){const a=i*2.399963,b=Math.acos(1-2*(i+.5)/sizes);positions.push(85*Math.sin(b)*Math.cos(a),85*Math.cos(b),85*Math.sin(b)*Math.sin(a));}const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.starMaterial=new THREE.PointsMaterial({color:'#c9d6ed',size:.045,transparent:true,opacity:.55});this.scene.add(new THREE.Points(stars,this.starMaterial));
  this.ready=new THREE.TextureLoader().loadAsync('textures/earth-blue-marble.jpg').then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;this.texture=texture;this.surface.uniforms.earth.value=texture;});
 }
 setPalette(p,white){this.white=white;this.scene.background=new THREE.Color(p.deep);this.surface.uniforms.mono.value=white?1:0;this.surface.uniforms.outlineTint.value.set(white?'#ffffff':p.planetOnDark);this.atmosphere.uniforms.tint.value.set(white?'#ffffff':'#489cff');this.orbitMaterial.color.set(white?'#ffffff':p.primaryOnDark);this.glowMaterial.color.copy(this.orbitMaterial.color);this.panelMaterial.color.set(white?'#ffffff':p.primaryOnDark);this.starMaterial.color.set(white?'#ffffff':p.surface);}
 update(t,p){
  this.system.position.fromArray(p.model);this.earth.rotation.y=-.85+t*.028;this.earth.rotation.z=.12;this.surface.uniforms.morph.value=ease((t-23.5)/2.5);
  this.satellite.position.fromArray(window.SpacelibreCamera.satellitePoint(t));this.satellite.rotation.set(.15,-.35,.42);this.satellite.visible=t>=6.5&&t<24;
  const reveal=ease((t-6.5)/7.5),end=1-ease((t-25)/2);this.orbit.geometry.setDrawRange(0,Math.floor(this.orbit.geometry.index.count*reveal/6)*6);this.glow.geometry.setDrawRange(0,Math.floor(this.glow.geometry.index.count*reveal/6)*6);this.orbitMaterial.opacity=.88*end;this.glowMaterial.opacity=.1*end;this.atmosphere.uniforms.strength.value=1-ease((t-23)/3);this.starMaterial.opacity=.55*(1-ease((t-23)/4));
 }
 dispose(){this.texture?.dispose();this.scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});}
}
