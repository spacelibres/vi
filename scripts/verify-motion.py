"""Verify delivery masters without changing their recorded provenance.

Run from the repository root: python scripts/verify-motion.py --ffmpeg /path/to/ffmpeg
After recording and encoding new masters, explicitly add:
    --record-new-master /path/to/raw-browser-capture.webm
"""
from pathlib import Path
import argparse, array, hashlib, json, math, re, subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', default='ffmpeg')
parser.add_argument('--record-new-master', type=Path, metavar='CAPTURE_FILE',
                    help='record new source/media provenance after all checks pass, including the raw capture SHA256')
args = parser.parse_args()
root = Path('08-motion')
manifest_path = root/'manifest.json'
source_names = ['camera.js', 'planet-scene.js', 'three-intro.js', 'textures/earth-blue-marble.jpg']
delivery_names = ['spacelibre-orbit-birth-3d-1080p.mp4', 'spacelibre-orbit-birth-3d-silent-1080p.mp4']
def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

sources = {name: sha256(root/name) for name in source_names}
media_hashes = {name: sha256(root/name) for name in delivery_names}
raw_capture = None
if args.record_new_master:
    capture = args.record_new_master
    if not capture.is_file() or capture.stat().st_size == 0:
        parser.error('CAPTURE_FILE must be an existing, nonempty raw browser capture')
    if capture.resolve() in {(root/name).resolve() for name in delivery_names}:
        parser.error('CAPTURE_FILE must be the raw browser capture, not an encoded delivery master')
    raw_capture = dict(file=capture.name, sha256=sha256(capture), bytes=capture.stat().st_size)
else:
    if not manifest_path.is_file():
        parser.error('No recorded manifest; use --record-new-master CAPTURE_FILE after recording new masters')
    recorded = json.loads(manifest_path.read_text(encoding='utf-8'))
    if recorded.get('sourceSHA256') != sources:
        parser.error('Source provenance mismatch: record and encode new masters before using --record-new-master CAPTURE_FILE')
    expected_media = {entry['file']: entry['sha256'] for entry in recorded.get('media', [])}
    if expected_media != media_hashes:
        parser.error('Media provenance mismatch: delivery files do not match the recorded manifest')

media = []
for name, has_audio in [('spacelibre-orbit-birth-3d-1080p.mp4', True),
                        ('spacelibre-orbit-birth-3d-silent-1080p.mp4', False)]:
    path = root / name
    result = subprocess.run([args.ffmpeg, '-hide_banner', '-i', str(path), '-f', 'null', '-'], capture_output=True)
    log = result.stderr.decode('utf-8', errors='replace')
    assert result.returncode == 0, log
    assert 'Duration: 00:00:30.00' in log and '1920x1080' in log and '30 fps' in log, log
    assert re.search(r'frame=\s*900\b', log), log
    assert ('Audio: aac' in log) == has_audio, log
    media.append(dict(file=name, sha256=media_hashes[name],
                      bytes=path.stat().st_size, durationSeconds=30, width=1920, height=1080,
                      fps=30, frameCount=900, videoCodec='H.264', audioCodec='AAC stereo' if has_audio else None))
audio = subprocess.check_output([args.ffmpeg, '-loglevel', 'error', '-i', str(root/media[0]['file']),
                                 '-vn', '-f', 'f32le', '-ac', '2', '-ar', '48000', 'pipe:1'])
samples = array.array('f')
samples.frombytes(audio)
rms = math.sqrt(sum(v*v for v in samples)/len(samples))
peak = max(abs(v) for v in samples)
assert rms > .001 and peak < .98, (rms, peak)
manifest = dict(title='Orbit Birth: Planet and Satellite', renderer='Three.js 0.186.1 / WebGL',
                concept='Solid Earth, orbiting satellite and blue orbital trajectory; exact approved SVG closing',
                palette='01-electric-orbit', originalAudio=True, verifiedFullDecode=True,
                localeCount=22, audioRMS=rms, audioPeak=peak, sourceSHA256=sources, media=media)
if args.record_new_master:
    manifest['rawCapture'] = raw_capture
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(manifest, indent=2))
else:
    print('Verified recorded source/media hashes, full decode, and audio levels; manifest unchanged.')
