import { audio } from "../../lib/sound";
import { useOS } from "../../os/store";
import { tracks, type Track } from "./tracks";

const STEPS_PER_BAR = 16;
const LOOKAHEAD_S = 0.15;
const TICK_MS = 25;

let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let stepTime = 0;
/** AudioContext time at which step 0 played (or would have), for the progress bar. */
let origin = 0;

const currentTrack = (): Track => tracks[useOS.getState().music.track] ?? tracks[0]!;
const stepSeconds = (t: Track) => 60 / t.bpm / 4;
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

function note(ac: AudioContext, freq: number, at: number, dur: number, type: OscillatorType, gain: number, attack = 0.005) {
  if (!master) return;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(gain, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(master);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

function hat(ac: AudioContext, at: number) {
  if (!master) return;
  noise ??= (() => {
    const buffer = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  })();
  const src = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const env = ac.createGain();
  src.buffer = noise;
  filter.type = "highpass";
  filter.frequency.value = 7000;
  env.gain.setValueAtTime(0.08, at);
  env.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  src.connect(filter).connect(env).connect(master);
  src.start(at);
}

/** One 16th step: kick, hat, bass, pad and arpeggio, all derived from the track numbers. */
function playStep(ac: AudioContext, t: Track, index: number, at: number) {
  const inBar = index % STEPS_PER_BAR;
  const chord = t.chords[Math.floor(index / STEPS_PER_BAR) % t.chords.length] ?? [0];
  const beat = stepSeconds(t) * 4;
  if (inBar % 4 === 0) note(ac, 55, at, 0.25, "sine", 0.5);
  if (inBar % 4 === 2) hat(ac, at);
  if (inBar % 8 === 0) note(ac, hz(t.root - 24 + (chord[0] ?? 0)), at, beat * 1.8, "triangle", 0.28);
  if (inBar === 0) for (const semi of chord) note(ac, hz(t.root + semi), at, beat * 4, "sine", 0.05, 0.4);
  const arpIndex = t.arp[inBar] ?? -1;
  const arpNote = chord[arpIndex % chord.length];
  if (arpIndex >= 0 && arpNote !== undefined) note(ac, hz(t.root + 12 + arpNote), at, 0.18, "square", 0.03);
}

function tick() {
  const ac = audio();
  if (!ac) return;
  const t = currentTrack();
  while (stepTime < ac.currentTime + LOOKAHEAD_S) {
    if (step >= t.bars * STEPS_PER_BAR) return skip(1);
    playStep(ac, t, step, stepTime);
    step += 1;
    stepTime += stepSeconds(t);
  }
}

function start() {
  const ac = audio();
  if (!ac) return useOS.setState(s => ({ music: { ...s.music, playing: false } }));
  if (!master) {
    master = ac.createGain();
    master.connect(ac.destination);
  }
  master.gain.value = useOS.getState().volume;
  stepTime = ac.currentTime + 0.05;
  origin = stepTime - step * stepSeconds(currentTrack());
  timer ??= setInterval(tick, TICK_MS);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

/** Seconds into the current track. */
export function musicPosition(): number {
  const ac = audio();
  if (!timer || !ac) return step * stepSeconds(currentTrack());
  return Math.max(0, ac.currentTime - origin);
}

export const togglePlay = () => useOS.setState(s => ({ music: { ...s.music, playing: !s.music.playing } }));

export function skip(direction: 1 | -1) {
  useOS.setState(s => ({
    music: { track: (s.music.track + direction + tracks.length) % tracks.length, playing: s.music.playing },
  }));
}

useOS.subscribe((s, prev) => {
  if (master && s.volume !== prev.volume) master.gain.value = s.volume;
  if (s.music === prev.music) return;
  if (s.music.track !== prev.music.track) step = 0;
  stop();
  if (s.music.playing) start();
});
