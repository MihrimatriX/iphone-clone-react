/** Shapes of the data the OS and its apps keep in the store. */

export type AppId = string;
export type Point = { x: number; y: number };
export type Overlay = "control" | "notifications" | "switcher" | "spotlight" | null;
export type Notif = { id: string; app: AppId; title: string; body: string; at: number };
export type Note = { id: string; text: string; updated: number };
export type Msg = { me: boolean; text: string; at: number };
export type Thread = { id: string; name: string; msgs: Msg[] };
export type Alarm = { id: string; time: string; on: boolean };
export type CallLog = { name: string; at: number; out: boolean };
export type Contact = { id: string; name: string; phone: string; fav: boolean };
/** `date` is a local "YYYY-MM-DD"; an empty `time` means all day. */
export type CalEvent = { id: string; date: string; time: string; title: string };
export type ReminderList = "kisisel" | "is" | "alisveris";
export type Reminder = { id: string; text: string; done: boolean; list: ReminderList; due: string | null };
export type Weather = {
  place: string;
  temp: number;
  code: number;
  isDay: boolean;
  hourly: { hour: number; temp: number; code: number }[];
  daily: { day: string; code: number; hi: number; lo: number }[];
};
