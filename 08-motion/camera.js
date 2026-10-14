(function(root){
 const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},lerp=(a,b,p)=>a.map((x,i)=>x+(b[i]-x)*p);
 function pose(t){t=Math.max(0,Math.min(30,t));let pos,target,fov,scale=1,model=[0,0,0];
  if(t<6){const p=ease(t/6),angle=1.15-p*1.05;target=[2.44*Math.cos(angle),2.44*Math.sin(angle),.12];pos=[target[0]+.95*Math.cos(angle),target[1]+.95*Math.sin(angle),.75];fov=34;}
  else if(t<13){const p=ease((t-6)/7),anchors=[[-3.64,-1.33,.35],[-2.21,-1.49,.35],[-.5,-1.11,.35],[1.21,-.414,.35],[2.79,.529,.35],[3.5,1.4,.35],[2.79,1.69,.35]],v=p*(anchors.length-1),i=Math.min(anchors.length-2,Math.floor(v));target=lerp(anchors[i],anchors[i+1],v-i);pos=[target[0]+.25,target[1]-.85,target[2]+1.15];fov=38;}
  else if(t<22){const p=ease((t-13)/9);pos=lerp([7,3,13],[-1,.4,-5],p);target=lerp([0,0,-8],[0,0,-20],p);fov=48;}
  else {const p=ease((t-22)/5);pos=lerp([2.5,1.4,8],[0,0,15],p);target=[0,0,0];fov=38-3*p;scale=1-.713*p;model=[-3.49*p,.029*p,0];}
  return {position:pos,target,fov,scale,model,finalOpacity:ease((t-25.5)/1.5),opening:ease(t/1.4),phase:t<6?1:t<13?2:t<22?3:t<27?4:5};
 }
 const api={duration:30,pose};if(typeof module==='object'&&module.exports)module.exports=api;else root.SpacelibreCamera=api;
})(typeof window==='undefined'?this:window);
