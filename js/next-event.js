import { $ } from "./utils.js";
import { state } from "./state.js";

const titleEl = $("#nextEventTitle");
const metaEl = $("#nextEventMeta");

const fmtLong = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function updateNextEvent() {
  const now = new Date();

  const upcoming = state.events
    .map((e) => ({ ...e, dt: new Date(`${e.date}T${e.time}:00`) }))
    .filter((e) => e.dt >= now)
    .sort((a, b) => a.dt - b.dt)[0];

  if (upcoming) {
    titleEl.textContent = upcoming.title;
    metaEl.textContent = fmtLong.format(upcoming.dt);
  } else {
    titleEl.textContent = "Aucun événement à venir";
    metaEl.textContent = "Planifiez votre prochain créneau";
  }
}
