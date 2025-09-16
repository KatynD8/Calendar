import { storage } from "./storage.js";
import { startOfWeek, toISO } from "./utils.js";

export const state = {
  weekStart: startOfWeek(new Date()),
  selectedDate: toISO(new Date()),
  selectedSlot: null,
  events: storage.get("vd_events", []),
  todos: storage.get("vd_todos", []),
  notes: storage.get("vd_notes", ""),
  pomo: storage.get("vd_pomo", {
    work: 25,
    rest: 5,
    mode: "work",
    remaining: 25 * 60,
    running: false,
  }),
};
