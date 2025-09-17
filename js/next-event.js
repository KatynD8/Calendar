import { $ } from "./utils.js";
import { state } from "./state.js";

const titleEl = $("#nextEventTitle");
const metaEl = $("#nextEventMeta");

const fmtDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});
const fmtTime = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function updateNextEvent() {
  const now = new Date();

  // 🔎 Cherche le prochain event sans trier toute la liste
  const upcoming = state.events.reduce((next, e) => {
    const dt = new Date(`${e.date}T${e.time}:00`);
    if (dt >= now && (!next || dt < next.dt)) {
      return { ...e, dt };
    }
    return next;
  }, null);

  if (upcoming) {
    titleEl.textContent = upcoming.title;

    const dateStr = fmtDate.format(upcoming.dt);
    const timeStr = fmtTime.format(upcoming.dt);
    const durationStr = upcoming.duration
      ? ` (${Math.round(upcoming.duration / 60)}h)`
      : "";

    metaEl.textContent = `${dateStr} — ${timeStr}${durationStr}`;
  } else {
    titleEl.textContent = "Aucun événement à venir";
    metaEl.textContent = "Planifiez votre prochain créneau";
  }
}
