import { expect, test } from "bun:test";
import { upNext } from "./upNext";

const now = new Date("2026-10-04T12:00").getTime();
const ev = (id: string, date: string, time: string) => ({ id, date, time, title: id });

test("picks the earliest upcoming event, skipping past ones", () => {
  const events = [ev("later", "2026-10-05", "20:00"), ev("past", "2026-10-04", "09:00"), ev("soon", "2026-10-04", "14:00")];
  expect(upNext(events, [], now)).toEqual({ kind: "event", title: "soon", when: "14:00" });
});

test("labels tomorrow and keeps today's all-day events", () => {
  expect(upNext([ev("x", "2026-10-05", "20:00")], [], now)?.when).toBe("Yarın 20:00");
  expect(upNext([ev("bday", "2026-10-04", "")], [], now)?.when).toBe("Tüm gün");
});

test("an enabled alarm wins when it is sooner; disabled alarms are ignored", () => {
  const alarms = [{ id: "a", time: "07:00", on: true }, { id: "b", time: "13:00", on: false }];
  expect(upNext([ev("x", "2026-10-06", "10:00")], alarms, now)).toEqual({ kind: "alarm", title: "Alarm", when: "Yarın 07:00" });
  expect(upNext([], [], now)).toBeNull();
});
