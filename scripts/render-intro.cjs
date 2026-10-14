const fs=require('node:fs'),path=require('node:path'),{spawn,execFileSync}=require('node:child_process'),{once}=require('node:events'),sharp=require('sharp');
const motion=require('../08-motion/scene.js'),masters=require('../08-motion/masters.js');
const palette=JSON.parse(fs.readFileSync('07-palettes/palette-tokens.json','utf8'))[0].colors;
const ffmpeg=process.env.FFMPEG_BINARY||'ffmpeg';
async function review(){fs.mkdirSync('artifacts/motion-review',{recursive:true});for(const t of [0,2,5.8,8,10.5,13,16,20,23,25,29]){const svg=motion.frame(t,palette,masters);fs.writeFileSync(`artifacts/motion-review/${t}.svg`,svg);await sharp(Buffer.from(svg)).resize(960,540).png().toFile(`artifacts/motion-review/${t}.png`);}fs.writeFileSync('08-motion/final-frame.svg',motion.frame(29,palette,masters));console.log('11 review frames and final SVG ready');}
async function encode(){await review();const silent='08-motion/spacelibre-orbit-birth-silent-1080p.mp4';
 const args=['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',silent];
 const child=spawn(ffmpeg,args,{stdio:['pipe','ignore','pipe']});let errors='';child.stderr.on('data',b=>errors+=b.toString());const done=once(child,'close');
 for(let i=0;i<900;i++){const rgb=await sharp(Buffer.from(motion.frame(i/30,palette,masters))).flatten().removeAlpha().raw().toBuffer();if(!child.stdin.write(rgb))await once(child.stdin,'drain');if(i%90===0)console.log(`Rendered ${i}/900 frames`);}
 child.stdin.end();const [code]=await done;if(code!==0)throw Error(errors);console.log('Rendered 900 frames / 30fps / 1080p');
 execFileSync(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',silent,'-i','artifacts/orbit-birth.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','30','-movflags','+faststart','08-motion/spacelibre-orbit-birth-1080p.mp4']);console.log('Sound and silent MP4 masters ready');
}
(process.argv.includes('--review')?review():encode()).catch(e=>{console.error(e);process.exit(1);});
