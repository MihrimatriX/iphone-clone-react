import { addDays, isoDate } from "../../lib/util";
import type { Reminder, ReminderList } from "../../os/store";
import type { IconName } from "../../ui/icons";

export const LISTS: { id: ReminderList; name: string; color: string }[] = [
  { id: "kisisel", name: "Kişisel", color: "#ff9500" },
  { id: "is", name: "İş", color: "#0a84ff" },
  { id: "alisveris", name: "Alışveriş", color: "#34c759" },
];

export type SmartId = "today" | "scheduled" | "all" | "done";

/** Built-in filtered views; `today` also catches anything overdue. */
export const SMART: { id: SmartId; name: string; icon: IconName; color: string; match: (r: Reminder, today: string) => boolean }[] = [
  { id: "today", name: "Bugün", icon: "calendar", color: "#0a84ff", match: (r, today) => !r.done && r.due !== null && r.due <= today },
  { id: "scheduled", name: "Planlanmış", icon: "clock", color: "#ff3b30", match: r => !r.done && r.due !== null },
  { id: "all", name: "Tümü", icon: "tray", color: "#5a5a60", match: r => !r.done },
  { id: "done", name: "Tamamlanan", icon: "check", color: "#8e8e93", match: r => r.done },
];

/** "Bugün", "Yarın", "Dün" or a short date. */
export function dueLabel(due: string, now = new Date()): string {
  if (due === isoDate(now)) return "Bugün";
  if (due === isoDate(addDays(now, 1))) return "Yarın";
  if (due === isoDate(addDays(now, -1))) return "Dün";
  return new Date(`${due}T00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
