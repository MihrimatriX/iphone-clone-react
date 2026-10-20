import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IconName } from "../ui/icons";
import { seedAlarms, seedCalls, seedContacts, seedEvents, seedNotes, seedNotifs, seedReminders, seedThreads } from "./seed";
import type { AppId, Notif, Overlay, Point, Weather } from "./types";

export type * from "./types";

const isTouchDevice = typeof window !== "undefined" && matchMedia("(hover: none) and (pointer: coarse)").matches;

/** Persisted user settings. */
const settings = {
  wallpaper: 0,
  dark: false,
  haptics: true,
  sound: true,
  textScale: 1,
  brightness: 1,
  volume: 0.6,
  silent: false,
  wifi: true,
  bluetooth: true,
  airplane: false,
  focus: false,
  cellular: true,
  /** Low Power Mode (Control Center / Settings > Pil). */
  lowPower: false,
  rotationLock: false,
  actionButton: "silent" as "silent" | "flashlight",
};

/** Persisted app data. */
const data = {
  notes: seedNotes,
  threads: seedThreads,
  alarms: seedAlarms,
  calls: seedCalls,
  contacts: seedContacts,
  events: seedEvents,
  reminders: seedReminders,
  weather: null as Weather | null,
  /** Project ids "installed" from App Store; each gets a home screen icon. */
  installed: [] as string[],
};

/** Runtime-only state. */
const system = {
  flat: isTouchDevice,
  screenOn: true,
  locked: true,
  openApp: null as AppId | null,
  origin: null as Point | null,
  recents: [] as AppId[],
  overlay: null as Overlay,
  jiggle: false,
  flashlight: false,
  volumeHudAt: 0,
  shake: { amp: 0, at: 0 },
  toast: null as { icon: IconName; text: string; at: number } | null,
  notifs: seedNotifs,
  call: null as { name: string; at: number } | null,
  timer: { endsAt: null as number | null, left: 0, total: 0 },
  stopwatch: { start: null as number | null, acc: 0, laps: [] as number[] },
  music: { track: 0, playing: false },
  /** Deep links: which note / conversation / contact / project an app should open on. */
  noteId: null as string | null,
  threadId: null as string | null,
  contactId: null as string | null,
  projectId: null as string | null,
  faceId: null as "scan" | "ok" | null,
};

type Actions = {
  launch: (id: AppId, origin?: Point) => void;
  goHome: () => void;
  closeApp: (id: AppId) => void;
  power: () => void;
  setVolume: (v: number) => void;
  kick: (amp: number) => void;
  showToast: (icon: IconName, text: string) => void;
  notify: (n: Omit<Notif, "id" | "at">) => void;
};

export type OS = typeof settings & typeof data & typeof system & Actions;

const persistedKeys = [...Object.keys(settings), ...Object.keys(data)] as (keyof OS)[];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const useOS = create<OS>()(
  persist(
    (set, get) => ({
      ...settings,
      ...data,
      ...system,
      launch: (id, origin) =>
        set(s => ({
          openApp: id,
          origin: origin ?? null,
          overlay: null,
          jiggle: false,
          recents: [id, ...s.recents.filter(r => r !== id)],
        })),
      goHome: () => set({ openApp: null, overlay: null }),
      closeApp: id =>
        set(s => ({
          recents: s.recents.filter(r => r !== id),
          openApp: s.openApp === id ? null : s.openApp,
        })),
      power: () =>
        set(s => (s.screenOn ? { screenOn: false, locked: true, overlay: null, jiggle: false } : { screenOn: true })),
      setVolume: v => set({ volume: clamp01(v), volumeHudAt: Date.now() }),
      kick: amp => set({ shake: { amp, at: performance.now() } }),
      showToast: (icon, text) => set({ toast: { icon, text, at: Date.now() } }),
      notify: n => {
        if (get().openApp === n.app && !get().locked) return;
        const notif = { ...n, id: crypto.randomUUID(), at: Date.now() };
        set(s => ({ notifs: [notif, ...s.notifs].slice(0, 20) }));
      },
    }),
    {
      name: "iphone-os",
      version: 1,
      // persist's default shallow merge keeps the initial value of keys older saves lack (e.g. `installed`).
      partialize: s => Object.fromEntries(persistedKeys.map(k => [k, s[k]])) as Partial<OS>,
    },
  ),
);
