const fs=require('node:fs');const {DOMParser}=require('linkedom');
function inner(path){const source=fs.readFileSync(path,'utf8');return source.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1];}
const icon=inner('01-logos/icon-primary.svg'),horizontal=inner('01-logos/horizontal-primary.svg');
const doc=new DOMParser().parseFromString('<svg>'+icon+'</svg>','image/svg+xml');const paths=[...doc.querySelectorAll('path')];
const data={icon,horizontal,orbit:paths[paths.length-1].getAttribute('d')};
fs.mkdirSync('08-motion',{recursive:true});fs.writeFileSync('08-motion/masters.js','(function(root){const data='+JSON.stringify(data)+';if(typeof module==="object"&&module.exports)module.exports=data;else root.SpacelibreMasters=data;})(typeof window==="undefined"?this:window);\n');
console.log('Motion masters extracted from approved SVG geometry');
