(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpacelibreMotion=api;})(typeof window==='undefined'?this:window,function(){
 'use strict';
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 const rise=(t,a,b)=>ease((t-a)/(b-a));
 const band=(t,a,b,c,d)=>rise(t,a,b)*(1-rise(t,c,d));
 const f=x=>Number(x.toFixed(4));
 function paint(master,p,id){return master.replace(/id="occlusion"/g,`id="${id}"`).replace(/url\(#occlusion\)/g,`url(#${id})`).replace(/stroke="#002044"/gi,`stroke="${p.planetOnDark}"`).replace(/fill="#002044"/gi,`fill="${p.surface}"`).replace(/fill="#007bff"/gi,`fill="${p.primaryOnDark}"`);}
 function label(text,y,opacity,p,size=22,spacing=7){return `<text x="960" y="${y}" text-anchor="middle" fill="${p.surface}" opacity="${f(opacity)}" font-family="Arial" font-size="${size}" letter-spacing="${spacing}">${text}</text>`;}
 function frame(time,p,m){
  const t=Math.min(27,Math.max(0,time)),opening=rise(t,0,.8),explore=band(t,12.5,15,21.2,24),hold=rise(t,22.4,26.5);
  let stars='';for(let i=0;i<74;i++){const x=80+(i*419.31)%1760,y=64+(i*239.17)%952,r=i%9===0?1.7:.8;stars+=`<circle cx="${f(x)}" cy="${f(y)}" r="${r}" opacity="${f((.08+.12*(.5+.5*Math.sin(i+t*.25)))*(1-hold*.85))}"/>`;}
  let grid='';for(let x=0;x<=1920;x+=120)grid+=`M${x} 0V1080`;for(let y=0;y<=1080;y+=120)grid+=`M0 ${y}H1920`;
  const ringProgress=rise(t,1.1,5.6),circumference=2*Math.PI*171,iconAlpha=opening*(1-rise(t,13,16));
  let icon=paint(m.icon,p,'planet-occlusion');
  // Until the front orbit is revealed, the planet is visibly one whole circle.
  icon=icon.replace(/(<circle[^>]*?) mask="[^"]+"/,`$1`).replace(/(<circle[^>]*?)\s*\/>/,`$1 stroke-dasharray="${circumference}" stroke-dashoffset="${f(circumference*(1-ringProgress))}" transform="rotate(-90 775 405)"/>`);
  if(ringProgress===1)icon=icon.replace(/ stroke-dasharray="[^"]*"/,'').replace(/ stroke-dashoffset="[^"]*"/,'');
  // The approved front path is revealed without changing its outline or tapered tips.
  icon=icon.replace(/(<path[^>]+fill=")[^"]+("\s*\/>)$/,`$1${p.primaryOnDark}$2`);
  const orbitD=m.orbit;
  icon=icon.replace(`d="${orbitD}" fill="${p.primaryOnDark}"`, `d="${orbitD}" fill="${p.primaryOnDark}" opacity="${f(rise(t,6.2,10.5))}" mask="url(#orbit-reveal)"`);
  // Apply the original occlusion once the front orbit becomes legible.
  if(t>=6.2)icon=icon.replace('<circle cx="775"', '<circle mask="url(#planet-occlusion)" cx="775"').replace(' transform="rotate(-90 775 405)"','').replace('stroke-linejoin="round" />',`stroke-linejoin="round" opacity="${f(rise(t,6.2,10.5))}" mask="url(#orbit-reveal)" />`);
  const maskEdge=-200+rise(t,6.2,10.5)*1550;
  const angle=(t-6)*1.6,rx=510,ry=155,rot=-24*Math.PI/180;
  const ox=rx*Math.cos(angle),oy=ry*Math.sin(angle),dotx=960+ox*Math.cos(rot)-oy*Math.sin(rot),doty=540+ox*Math.sin(rot)+oy*Math.cos(rot);
  let paths='';const spread=1+rise(t,13,20)*.4;
  const lines=[['M -220 1040 C 260 1210 1640 520 2090 -130',p.primaryOnDark,24],['M -190 710 C 420 1130 1720 790 2130 40',p.secondary,12],['M -280 500 C 400 1060 1620 1220 2160 360',p.accent,3],['M -240 1110 C 620 470 1440 210 2070 470',p.primaryOnDark,2]];
  for(let i=0;i<lines.length;i++){const [d,c,w]=lines[i],progress=rise(t,13+i*.65,18+i*.4);paths+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${f(1-progress)}" stroke-linecap="round" opacity="${i===0?.9:.6}"/>`;}
  const words=band(t,14.2,15.8,20.6,22.4);const stageText=t<6?'A WORLD OF POSSIBILITY':t<13?'BOUND BY NOTHING. CONNECTED BY ORBIT.':'';
  const final=paint(m.horizontal,p,'final-occlusion');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><title>spacelibre / Orbit Birth</title><defs><radialGradient id="atmosphere"><stop offset="0" stop-color="${p.primaryOnDark}" stop-opacity=".08"/><stop offset="1" stop-color="${p.deep}" stop-opacity="0"/></radialGradient><linearGradient id="reveal"><stop offset="0" stop-color="white"/><stop offset=".82" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="orbit-reveal" maskUnits="userSpaceOnUse" x="450" y="180" width="650" height="450"><rect x="${f(maskEdge-1300)}" y="120" width="1300" height="600" fill="url(#reveal)"/></mask><radialGradient id="content-fade"><stop offset="0" stop-color="${p.deep}" stop-opacity=".96"/><stop offset=".48" stop-color="${p.deep}" stop-opacity=".85"/><stop offset="1" stop-color="${p.deep}" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="${p.deep}"/><ellipse cx="960" cy="540" rx="900" ry="570" fill="url(#atmosphere)" opacity="${f(opening*(1-hold))}"/><g fill="${p.surface}">${stars}</g><path d="${grid}" fill="none" stroke="${p.surface}" stroke-opacity="${f(.024*explore)}" stroke-width="1"/><g opacity="${f(explore)}" transform="translate(960 540) scale(${f(spread)}) translate(-960 -540)">${paths}</g><ellipse cx="960" cy="540" rx="570" ry="275" fill="url(#content-fade)" opacity="${f(words)}"/><g opacity="${f(iconAlpha)}"><svg x="530" y="110" width="860" height="860" viewBox="0 0 256 256">${icon}</svg></g><g opacity="${f(band(t,6,6.6,10.5,12.2))}"><ellipse cx="960" cy="540" rx="510" ry="155" transform="rotate(-24 960 540)" fill="none" stroke="${p.primaryOnDark}" stroke-width="1" stroke-opacity=".4"/><circle cx="${f(dotx)}" cy="${f(doty)}" r="5" fill="${p.surface}"/></g>${label(stageText,905,band(t,1.5,2.8,11.5,13),p,20,5)}<g opacity="${f(words)}">${label('EXPLORE.',460,rise(t,14.5,15.7),p,66,3)}${label('CONNECT.',548,rise(t,16,17.1),p,66,3)}${label('CREATE.',636,rise(t,17.5,18.6),p,66,3)}</g><g id="final-lockup" opacity="${f(hold)}"><svg x="390" y="410" width="1140" height="253.3333" viewBox="0 0 810 180">${final}</svg></g></svg>`;
 }
 return {duration:30,fps:30,frame};
});
