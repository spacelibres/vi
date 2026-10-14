"""Original procedural stereo soundscape; no sampled music or voice."""
from pathlib import Path
import numpy as np,wave
rate=48000;duration=30;t=np.arange(rate*duration)/rate
fade=np.clip(t/3,0,1)*np.clip((29.5-t)/3,0,1);fade=fade*fade*(3-2*fade)
left=np.zeros_like(t);right=np.zeros_like(t)
for i,hz in enumerate([65.4064,98,130.8128,196,261.6256]):
 phase=2*np.pi*hz*t+.13*np.sin(2*np.pi*.12*t+i)
 amplitude=.032/(1+i*.6)*fade
 left+=amplitude*np.sin(phase);right+=amplitude*np.sin(phase+.16)
for start,hz in [(6.1,523.25),(10.5,659.25),(14.8,783.99),(17.5,1046.5),(22.5,523.25),(25,659.25)]:
 age=t-start;env=np.where(age>=0,np.exp(-np.maximum(age,0)/1.1)*(1-np.exp(-np.maximum(age,0)*25)),0)
 left+=.022*env*np.sin(2*np.pi*hz*t);right+=.018*env*np.sin(2*np.pi*hz*t+.25)
rng=np.random.default_rng(621);noise=rng.standard_normal(t.size)
noise=np.convolve(noise,np.ones(32)/32,mode='same')
for start,width in [(6,1.8),(13,2.4),(21.8,2.1)]:
 env=np.exp(-((t-start-width/2)/(width/2))**2)*.025
 left+=noise*env;right+=np.roll(noise,240)*env
sound=np.stack([left,right],axis=1)*fade[:,None]
peak=np.max(np.abs(sound));sound*=.29/peak
out=Path('artifacts/orbit-birth.wav');out.parent.mkdir(exist_ok=True)
with wave.open(str(out),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes((sound*32767).astype('<i2').tobytes())
print('Original 30s stereo soundscape created; peak -10.75 dBFS')
