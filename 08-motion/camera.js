(function(root){
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},lerp=(a,b,p)=>a.map((x,i)=>x+(b[i]-x)*p);
 function orbitPoint(a){const x=3.65*Math.cos(a),y=-3.65*Math.sin(a)*.14,z=3.65*Math.sin(a)*Math.sqrt(1-.14**2),r=.42;return [x*Math.cos(r)-y*Math.sin(r),x*Math.sin(r)+y*Math.cos(r),z];}
 function satellitePoint(t){return orbitPoint(-1.8+(t-7)*.32);}
 function pose(t){t=Math.max(0,Math.min(27,t));let pos,target,fov=42,model=[0,0,0];
  if(t<7){const p=ease(t/7);pos=lerp([.1,1.22,2.65],[.8,.8,7.9],p);target=lerp([0,1.3,0],[0,.15,0],p);fov=50-8*p;}
  else if(t<14){const p=ease((t-7)/7);pos=lerp([.8,.8,7.9],[2.5,1.3,11.2],p);target=lerp([0,.15,0],[0,0,0],p);}
  else if(t<21){const p=ease((t-14)/7);pos=lerp([2.5,1.3,11.2],[.6,.3,10.5],p);const track=satellitePoint(t),weight=Math.sin(Math.PI*p)**2;pos=lerp(pos,[track[0]*.35,.1,7.5],weight);target=[0,0,0];}
  else {const p=ease((t-21)/3);pos=lerp([.6,.3,10.5],[0,0,44.8],p);target=[0,0,0];fov=42-6*p;model=[-10.78*p,.04*p,0];}
  return {position:pos,target,fov,scale:1,model,finalOpacity:ease((t-25)/2),opening:ease(t/1.2),phase:t<7?1:t<14?2:t<21?3:t<27?4:5};
 }
 const api={duration:30,radius:2.4,orbitPoint,satellitePoint,pose};if(typeof module==='object'&&module.exports)module.exports=api;else root.SpacelibreCamera=api;
})(typeof window==='undefined'?this:window);
