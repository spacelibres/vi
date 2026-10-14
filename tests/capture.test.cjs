const test=require('node:test'),assert=require('node:assert/strict'),{mime}=require('../08-motion/capture.js');
test('recording safely declines missing browser APIs and selects an available codec',()=>{
 const canvas={captureStream(){}};assert.equal(mime(undefined,canvas),null);function Recorder(){};assert.equal(mime(Recorder,canvas),null);Recorder.isTypeSupported=()=>true;assert.equal(mime(Recorder,{}),null);assert.equal(mime(Recorder,canvas),'video/mp4;codecs=avc1.42E01E');Recorder.isTypeSupported=t=>t==='video/webm;codecs=vp8';assert.equal(mime(Recorder,canvas),'video/webm;codecs=vp8');Recorder.isTypeSupported=()=>false;assert.equal(mime(Recorder,canvas),null);
});
