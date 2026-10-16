import {generatePalette} from '../skills/spacelibre-vi/assets/theme-engine.js';
import {OrbitIntro3D} from './three-intro.js';
const $=id=>document.getElementById(id);
const HERE=new URL('.',import.meta.url);
let palette=window.SpacelibrePalette||generatePalette('#007BFF','split'),time=2,playing=false,recording=false,engine=null,last=performance.now(),sound=false;
function t(key,vars={}){let s=window.t(key);for(const [k,v] of Object.entries(vars))s=s.replaceAll('{'+k+'}',String(v));return s;}
function translate(){$('play').textContent=t(playing?'暂停':'播放');draw();}
let audioContext,buffer,audioSource;
async function audioReady(){audioContext||=new AudioContext();await audioContext.resume();if(!buffer){const data=await fetch(new URL('orbit-birth-sound.m4a',HERE)).then(r=>r.arrayBuffer());buffer=await audioContext.decodeAudioData(data);}return audioContext;}
function stopAudio(){if(audioSource){try{audioSource.stop();}catch{}audioSource=null;}}
async function startAudio(offset,destination){await audioReady();stopAudio();const source=audioContext.createBufferSource();source.buffer=buffer;const gain=audioContext.createGain();gain.gain.value=sound?.65:0;source.connect(gain);gain.connect(audioContext.destination);if(destination)source.connect(destination);source.start(0,Math.min(29.99,offset));audioSource=source;}
function draw(){if(engine){const phase=engine.render(time);$('phase').textContent=t(PHASES[phase-1]||'');} $('timeline').value=time;$('clock').textContent='00:'+String(Math.floor(time)).padStart(2,'0')+' / 00:30';if(recording)$('export').textContent=t('正在录制… {seconds} 秒 / 30 秒',{seconds:Math.floor(time)});}
function pause(){playing=false;stopAudio();$('play').textContent=t('播放');}
async function setPalette(p){palette=p;for(const [key,value] of Object.entries({'motion-ink':p.ink,'motion-surface':p.surface,'motion-primary':p.primaryOnLight,'motion-border':p.line,'motion-card':p.card}))document.documentElement.style.setProperty('--'+key,value);$('motion-primary').value=p.primary;if(engine){await engine.setPalette(p,$('motion-mode').value==='white');draw();}}
function tick(now){if(playing){time=Math.min(30,time+(now-last)/1000);draw();if(time>=30){pause();if(recording)recorder.stop();}}last=now;requestAnimationFrame(tick);}
const PHASES=['抵近星球表面','卫星沿轨道绕行','跟随卫星掠过星球','拉远回到品牌标志','完整品牌定格'];
$('play').addEventListener('click',async()=>{if(playing)pause();else{if(time>=30)time=0;if(sound)await startAudio(time);playing=true;last=performance.now();$('play').textContent=t('暂停');}});
$('restart').addEventListener('click',async()=>{pause();time=0;if(sound)await startAudio(0);playing=true;last=performance.now();$('play').textContent=t('暂停');draw();});
$('timeline').addEventListener('input',()=>{pause();time=Number($('timeline').value);draw();});$('sound').addEventListener('change',async()=>{sound=$('sound').checked;if(sound&&playing)await startAudio(time);else stopAudio();});
$('motion-primary').addEventListener('input',()=>setPalette(generatePalette($('motion-primary').value,'auto')));$('motion-mode').addEventListener('change',()=>setPalette(palette));
for(const tab of ['three','movie'])$(tab+'-tab').addEventListener('click',()=>{pause();$('movie').pause();for(const name of ['three','movie']){$(name+'-pane').hidden=tab!==name;$(name+'-tab').setAttribute('aria-selected',String(tab===name));}draw();});
let recorder,recordStream;
function restoreRecording(){recording=false;playing=false;recordStream?.getTracks().forEach(track=>track.stop());stopAudio();for(const el of document.querySelectorAll('button,input,select'))el.disabled=false;$('export').textContent=t('导出 30 秒视频');$('play').textContent=t('播放');}
$('export').addEventListener('click',async()=>{if(!engine||recording)return;const mime=window.SpacelibreCapture.mime(window.MediaRecorder,$('stage3d'));if(!mime){$('status').textContent=t('此浏览器无法录制视频，请使用已渲染的 MP4。');return;}const wantSound=sound;let failed=false;
 try{pause();time=0;await setPalette(palette);let destination=null;recordStream=$('stage3d').captureStream(30);if(wantSound){const ctx=await audioReady();destination=ctx.createMediaStreamDestination();for(const track of destination.stream.getAudioTracks())recordStream.addTrack(track);}const chunks=[];recorder=new MediaRecorder(recordStream,{mimeType:mime,videoBitsPerSecond:12000000,audioBitsPerSecond:192000});
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=()=>{failed=true;pause();if(recorder.state!=='inactive')recorder.stop();else restoreRecording();$('status').textContent=t('此浏览器无法录制视频，请使用已渲染的 MP4。');};recorder.onstop=()=>{restoreRecording();$('status').textContent=t(failed?'此浏览器无法录制视频，请使用已渲染的 MP4。':'视频已导出');if(failed)return;const url=URL.createObjectURL(new Blob(chunks,{type:mime}));const a=document.createElement('a');a.href=url;a.download='spacelibre-orbit-birth-3d-recording'+(wantSound?'':'-silent')+'.'+(mime.startsWith('video/mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
 for(const el of document.querySelectorAll('button,input,select'))el.disabled=true;recording=true;$('status').textContent=t('录制时请保持此标签页可见。');draw();recorder.start(1000);if(destination)await startAudio(0,destination);last=performance.now();playing=true;
 }catch(error){failed=true;if(recorder&&recorder.state!=='inactive')recorder.stop();restoreRecording();$('status').textContent=t('此浏览器无法录制视频，请使用已渲染的 MP4。');}
});
window.addEventListener('message',async e=>{if(recording||e.origin!==location.origin||e.source!==parent||e.data?.type!=='spacelibre-theme')return;const p=e.data.palette;if(['primary','secondary','accent','deep','surface','ink','card','line','primaryOnLight','primaryOnDark','planetOnDark'].every(k=>/^#[0-9a-f]{6}$/i.test(p?.[k])))await setPalette(p);});
window.addEventListener('spacelibre-palette',async e=>{const p=e.detail;if(recording||!p)return;if(['primary','secondary','accent','deep','surface','ink','card','line','primaryOnLight','primaryOnDark','planetOnDark'].every(k=>/^#[0-9a-f]{6}$/i.test(p[k])))await setPalette(p);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!recording){pause();$('movie').pause();}});
translate();$('status').textContent=t('正在加载 3D 场景…');
try{engine=new OrbitIntro3D($('stage3d'),window.SpacelibreMasters,window.SpacelibreMotion.frame);await setPalette(palette);$('status').textContent='';}catch(error){$('status').textContent=t('此设备无法显示 3D 图形，请播放已渲染的视频。');$('play').disabled=$('restart').disabled=$('export').disabled=true;console.error(error);}
requestAnimationFrame(tick);
if(parent!==window)parent.postMessage({type:'spacelibre-motion-ready'},location.origin);
window.SpacelibreMotionPlayer={setPalette,translate,get playing(){return playing;}};
