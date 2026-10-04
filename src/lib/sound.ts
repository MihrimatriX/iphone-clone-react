import { useOS } from "../os/store";

let ctx: AudioContext | null = null;

/** Shared AudioContext. Null until the user has interacted, otherwise Chrome warns and keeps it suspended. */
export function audio(): AudioContext | null {
  if (!navigator.userActivation?.hasBeenActive) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** UI sounds obey the sound toggle and silent mode; media (music) only obeys volume. */
function uiOut(): GainNode | null {
  const { sound, silent, volume } = useOS.getState();
  const ac = audio();
  if (!ac || !sound || silent || volume === 0) return null;
  const gain = ac.createGain();
  gain.gain.value = volume;
  gain.connect(ac.destination);
  return gain;
}

type ToneOpts = { type?: OscillatorType; gain?: number; delay?: number };

function tone(out: AudioNode, freq: number, ms: number, opts: ToneOpts = {}) {
  const { type = "sine", gain = 0.2, delay = 0 } = opts;
  const ac = out.context;
  const start = ac.currentTime + delay / 1000;
  const end = start + ms / 1000;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(gain, start + 0.005);
  env.gain.setValueAtTime(gain, Math.max(start + 0.005, end - 0.012));
  env.gain.linearRampToValueAtTime(0, end);
  osc.connect(env).connect(out);
  osc.start(start);
  osc.stop(end + 0.02);
}

function noise(out: AudioNode, ms: number, delay: number, gain: number) {
  const ac = out.context;
  const length = Math.floor((ac.sampleRate * ms) / 1000);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = ac.createBufferSource();
  const env = ac.createGain();
  src.buffer = buffer;
  env.gain.value = gain;
  src.connect(env).connect(out);
  src.start(ac.currentTime + delay / 1000);
}

/** Haptic stand-in: ~150 Hz buzz, pulses follow the vibrate pattern (on, off, on, ...). */
export function buzz(pattern: number[]) {
  const out = uiOut();
  if (!out) return;
  let at = 0;
  pattern.forEach((ms, i) => {
    if (i % 2 === 0) tone(out, 150, Math.min(120, Math.max(40, ms)), { type: "square", gain: 0.05, delay: at });
    at += ms;
  });
}

/** Very short, quiet click for taps and selection changes. */
export function tick() {
  const out = uiOut();
  if (out) tone(out, 2600, 6, { type: "square", gain: 0.012 });
}

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
};

export function dtmf(key: string) {
  const pair = DTMF[key];
  const out = uiOut();
  if (!pair || !out) return;
  for (const freq of pair) tone(out, freq, 160, { gain: 0.12 });
}

export function shutter() {
  const out = uiOut();
  if (!out) return;
  noise(out, 40, 0, 0.5);
  noise(out, 70, 80, 0.35);
}

export function chime() {
  const out = uiOut();
  if (!out) return;
  [880, 1175, 1568, 1175, 1568].forEach((freq, i) => tone(out, freq, 180, { gain: 0.15, delay: i * 160 }));
}

export function whoosh() {
  const out = uiOut();
  if (!out) return;
  tone(out, 900, 60, { gain: 0.08 });
  tone(out, 1400, 70, { gain: 0.06, delay: 50 });
}

export function lockClick() {
  const out = uiOut();
  if (!out) return;
  tone(out, 2400, 12, { type: "square", gain: 0.05 });
  tone(out, 900, 30, { gain: 0.12, delay: 10 });
}
