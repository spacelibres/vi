import fs from 'node:fs';
const version=process.argv[2];if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Expected MAJOR.MINOR.PATCH');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.version=version;fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');fs.writeFileSync('VERSION',version+'\n');
if(fs.existsSync('package-lock.json')){const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));lock.version=version;if(lock.packages?.[''])lock.packages[''].version=version;fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\n');}
let html=fs.readFileSync('index.html','utf8');html=html.replace(/VI \d+\.\d+(?:\.\d+)?/g,'VI '+version).replace(/visual identity \d+\.\d+(?:\.\d+)?/g,'visual identity '+version).replace(/(styles\.css|app\.js|svg-sources\.js|i18n-data\.js|i18n\.js)\?v=[^"']+/g,'$1?v='+version);fs.writeFileSync('index.html',html);
if(fs.existsSync('sw.js')){const sw=fs.readFileSync('sw.js','utf8').replace(/spacelibre-vi-v\d+\.\d+\.\d+/g,'spacelibre-vi-v'+version);fs.writeFileSync('sw.js',sw);}
console.log('Version synchronized: '+version);
