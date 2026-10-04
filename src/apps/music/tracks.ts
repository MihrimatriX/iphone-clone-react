/** Procedural demo tracks: everything is generated from these numbers, so there is no audio file to license. */
export type Track = {
  title: string;
  artist: string;
  bpm: number;
  /** MIDI note of the key centre. */
  root: number;
  /** One chord per bar, semitones relative to root. */
  chords: number[][];
  /** Arpeggio: chord-tone index per 16th step (-1 = rest). */
  arp: number[];
  bars: number;
  cover: string;
};

export const tracks: Track[] = [
  {
    title: "Gece Sürüşü",
    artist: "Sentez Kulübü",
    bpm: 92,
    root: 57,
    chords: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]],
    arp: [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, -1],
    bars: 32,
    cover: "linear-gradient(135deg, #3b1d8f, #e0457b 60%, #ffb36b)",
  },
  {
    title: "Kıyı Kasabası",
    artist: "Dalga",
    bpm: 76,
    root: 60,
    chords: [[0, 4, 7], [-5, -1, 2], [-3, 0, 4], [-7, -3, 0]],
    arp: [0, -1, 2, -1, 1, -1, 2, 0, -1, 2, -1, 1, 0, -1, 1, -1],
    bars: 24,
    cover: "linear-gradient(160deg, #0bb4d6, #7ee8c7 55%, #fff1b8)",
  },
  {
    title: "Neon Bulvar",
    artist: "Piksel",
    bpm: 118,
    root: 62,
    chords: [[0, 3, 7, 10], [5, 9, 12], [0, 3, 7, 10], [-2, 2, 5]],
    arp: [0, 2, 3, 2, 1, 3, 2, 0, 3, 2, 1, 2, 0, 3, 1, 2],
    bars: 40,
    cover: "linear-gradient(200deg, #12002b, #7b2ff7 50%, #00f0ff)",
  },
];

export const trackDuration = (t: Track) => (t.bars * 4 * 60) / t.bpm;
