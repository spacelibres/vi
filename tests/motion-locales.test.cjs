const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
// The motion player no longer carries its own catalogue: its strings live in the
// shared i18n/ framework, keyed by their Chinese source text like the rest of the site.
const MOTION_STRINGS=['轨道诞生','30 秒电影感品牌片头','3D 预览','渲染视频','播放','暂停','重播',
 '时间轴（秒）','主色','主色变体','全彩','白色单色','声音','开启声音','导出 30 秒视频',
 '正在录制… {seconds} 秒 / 30 秒','视频已导出','此浏览器无法录制视频，请使用已渲染的 MP4。',
 '正在加载 3D 场景…','此设备无法显示 3D 图形，请播放已渲染的视频。','抵近星球表面','卫星沿轨道绕行',
 '跟随卫星掠过星球','拉远回到品牌标志','完整品牌定格','下载 1080p MP4','下载无声 MP4','动画源文件',
 '原创合成音效 · 无旁白','00:30 / 1080p / 30fps','录制时请保持此标签页可见。','spacelibre 3D 片头播放器'];
test('the 3D player is served by the one shared i18n framework, not its own catalogue',()=>{
 assert.equal(fs.existsSync('08-motion/locales.json'),false,'the motion player must not keep a separate locale file');
 const html=fs.readFileSync('08-motion/index.html','utf8');
 assert.match(html,/\.\.\/i18n\.js/,'the player must load the shared i18n runtime');
 assert.doesNotMatch(html,/id="lang-select"/,'the player must not ship its own language switcher');
 const player=fs.readFileSync('08-motion/three-player.js','utf8');
 assert.doesNotMatch(player,/locales\.json/,'the player must not fetch a private catalogue');
});
test('every site language covers the motion player strings through the shared catalogue',()=>{
 const languages=fs.readdirSync('i18n').filter(n=>n.endsWith('.json')).map(n=>n.slice(0,-5));
 assert.equal(languages.length,22);
 for(const locale of languages){
  const data=JSON.parse(fs.readFileSync('i18n/'+locale+'.json','utf8')).text;
  for(const key of MOTION_STRINGS){assert.ok(data[key]&&String(data[key]).trim(),locale+' missing "'+key+'"');}
  assert.ok(String(data['正在录制… {seconds} 秒 / 30 秒']).includes('{seconds}'),locale+' must keep the {seconds} placeholder');
 }
 const ja=JSON.parse(fs.readFileSync('i18n/ja.json','utf8')).text,ar=JSON.parse(fs.readFileSync('i18n/ar.json','utf8')).text;
 assert.equal(ja['播放'],'再生');assert.equal(ar['播放'],'تشغيل');
});
