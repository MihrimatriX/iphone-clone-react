import { addDays, isoDate } from "../lib/util";
import type { Alarm, CalEvent, CallLog, Contact, Note, Notif, Reminder, Thread } from "./types";

const min = 60_000;
const now = Date.now();

export const seedNotes: Note[] = [
  { id: "n1", text: "Alışveriş\n- Süt\n- Ekmek\n- Zeytin\n- Kahve", updated: now - 50 * min },
  { id: "n2", text: "Proje fikirleri\nLiquid Glass bileşenini diğer projelerde de kullan.", updated: now - 300 * min },
];

export const seedThreads: Thread[] = [
  {
    id: "t1",
    name: "Elif",
    msgs: [
      { me: false, text: "Selam! Akşam yemeğe geliyor musun?", at: now - 40 * min },
      { me: true, text: "Gelirim, saat kaçta?", at: now - 38 * min },
      { me: false, text: "8 gibi olur 🙂", at: now - 37 * min },
    ],
  },
  { id: "t2", name: "Kerem", msgs: [{ me: false, text: "Maçı izledin mi?", at: now - 180 * min }] },
  { id: "t3", name: "Annem", msgs: [{ me: false, text: "Eve varınca haber ver.", at: now - 1440 * min }] },
];

export const seedNotifs: Notif[] = [
  { id: "w1", app: "messages", title: "Elif", body: "8 gibi olur 🙂", at: now - 37 * min },
  { id: "w2", app: "weather", title: "Hava Durumu", body: "Bugün güneşli, akşam serin olacak.", at: now - 90 * min },
];

export const seedAlarms: Alarm[] = [
  { id: "a1", time: "07:00", on: false },
  { id: "a2", time: "08:30", on: false },
];

export const seedCalls: CallLog[] = [
  { name: "Annem", at: now - 200 * min, out: false },
  { name: "Kerem", at: now - 1500 * min, out: true },
];

const people: [string, string, boolean][] = [
  ["Annem", "0532 111 22 33", true],
  ["Babam", "0533 222 33 44", true],
  ["Elif", "0542 333 44 55", true],
  ["Kerem", "0505 444 55 66", false],
  ["Selin", "0544 555 66 77", false],
  ["Zeynep", "0536 666 77 88", false],
  ["Mert", "0507 777 88 99", false],
  ["Deniz", "0555 888 99 00", false],
  ["Ömer", "0530 999 00 11", false],
  ["İpek", "0541 123 45 67", false],
];

export const seedContacts: Contact[] = people.map(([name, phone, fav], i) => ({ id: `c${i}`, name, phone, fav }));

const day = (offset: number) => isoDate(addDays(new Date(), offset));

export const seedEvents: CalEvent[] = [
  { id: "e1", date: day(0), time: "14:00", title: "Ekip toplantısı" },
  { id: "e2", date: day(1), time: "20:00", title: "Akşam yemeği · Elif" },
  { id: "e3", date: day(3), time: "10:30", title: "Diş hekimi" },
  { id: "e4", date: day(6), time: "", title: "Kerem'in doğum günü" },
];

export const seedReminders: Reminder[] = [
  { id: "r1", text: "Faturaları öde", done: false, list: "kisisel", due: day(0) },
  { id: "r2", text: "Sunumu bitir", done: false, list: "is", due: day(1) },
  { id: "r3", text: "Süt", done: false, list: "alisveris", due: null },
  { id: "r4", text: "Kahve çekirdeği", done: false, list: "alisveris", due: null },
  { id: "r5", text: "Spor salonu üyeliğini yenile", done: true, list: "kisisel", due: null },
];
