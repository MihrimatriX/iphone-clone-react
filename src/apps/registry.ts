import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { isoDate } from "../lib/util";
import type { OS } from "../os/store";
import type { IconName } from "../ui/icons";
import { CalendarFace } from "./calendar/Face";

export type AppDef = {
  id: string;
  name: string;
  icon: IconName;
  accent: string;
  tint?: string;
  /** Always dark UI (status bar turns white). */
  dark?: boolean;
  /** Live icon contents, replacing the glyph. */
  Face?: ComponentType<{ size: number }>;
  /** Red badge count shown on the home screen. */
  badge?: (os: OS) => number;
  Component: LazyExoticComponent<ComponentType>;
};

/** Open reminders due today or earlier. */
const dueReminders = (os: OS) => os.reminders.filter(r => !r.done && r.due !== null && r.due <= isoDate(new Date())).length;

/** New app = one folder + one line here. */
export const apps: AppDef[] = [
  { id: "phone", name: "Telefon", icon: "phone", accent: "linear-gradient(#6af58a, #12b83a)", Component: lazy(() => import("./phone")) },
  { id: "messages", name: "Mesajlar", icon: "message", accent: "linear-gradient(#74f88c, #0fbf35)", Component: lazy(() => import("./messages")) },
  { id: "camera", name: "Kamera", icon: "camera", accent: "linear-gradient(#ececf0, #a4a4aa)", tint: "#2c2c2e", dark: true, Component: lazy(() => import("./camera")) },
  { id: "photos", name: "Fotoğraflar", icon: "photo", accent: "conic-gradient(from 200deg, #ff9f0a, #ff375f, #bf5af2, #0a84ff, #30d158, #ffd60a, #ff9f0a)", Component: lazy(() => import("./photos")) },
  { id: "calculator", name: "Hesap Makinesi", icon: "calculator", accent: "linear-gradient(#4a4a4e, #1c1c1e)", tint: "#ff9f0a", dark: true, Component: lazy(() => import("./calculator")) },
  { id: "calendar", name: "Takvim", icon: "calendar", accent: "#fff", Face: CalendarFace, Component: lazy(() => import("./calendar")) },
  { id: "reminders", name: "Hatırlatıcılar", icon: "list", accent: "linear-gradient(#ffffff, #e9e9ee)", tint: "#ff9500", badge: dueReminders, Component: lazy(() => import("./reminders")) },
  { id: "contacts", name: "Kişiler", icon: "person", accent: "linear-gradient(#d6d6db, #a9a9b0)", tint: "#5a5a60", Component: lazy(() => import("./contacts")) },
  { id: "clock", name: "Saat", icon: "clock", accent: "linear-gradient(#2c2c2e, #000)", dark: true, Component: lazy(() => import("./clock")) },
  { id: "weather", name: "Hava Durumu", icon: "sunCloud", accent: "linear-gradient(#5db5ff, #1468d8)", dark: true, Component: lazy(() => import("./weather")) },
  { id: "notes", name: "Notlar", icon: "note", accent: "linear-gradient(#ffe57f, #ffc300)", tint: "#6b5200", Component: lazy(() => import("./notes")) },
  { id: "music", name: "Müzik", icon: "music", accent: "linear-gradient(#ff7088, #f5223c)", Component: lazy(() => import("./music")) },
  { id: "settings", name: "Ayarlar", icon: "gear", accent: "linear-gradient(#c3c3c8, #7a7a80)", Component: lazy(() => import("./settings")) },
  { id: "safari", name: "Safari", icon: "compass", accent: "linear-gradient(#4fd0ff, #1673f0)", Component: lazy(() => import("./safari")) },
  { id: "projects", name: "Projelerim", icon: "briefcase", accent: "linear-gradient(#7b5cff, #3a1fa8)", Component: lazy(() => import("./projects")) },
  { id: "appstore", name: "App Store", icon: "appStore", accent: "linear-gradient(#1ecbff, #1673f0)", Component: lazy(() => import("./appstore")) },
];

/** The props every AppIcon of this app needs. */
export const iconProps = ({ icon, accent, tint, Face }: AppDef) => ({ icon, accent, tint, Face });

export const appById = (id: string | null) => apps.find(app => app.id === id);
