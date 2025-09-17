import { $, addDays, toISO } from "./utils.js";
import { state } from "./state.js";
import { openSlotBooker } from "./booking.js";

const fmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const weekTitle = $("#weekTitle");
const weekEl = $("#weekCalendar");

// ✅ Paramètres configurables
const START_HOUR = 8;
const END_HOUR = 18;
const SLOT_STEP = 60; // minutes → peut devenir 30 si besoin
const SLOT_COUNT = (END_HOUR - START_HOUR) * (60 / SLOT_STEP);
const REPERES = ["09:00", "12:00", "17:00"]; // repères visuels

export function renderWeek() {
  weekEl.innerHTML = "";
  const end = addDays(state.weekStart, 4); // ✅ Lundi → Vendredi
  weekTitle.textContent = `Semaine du ${fmt.format(
    state.weekStart
  )} au ${fmt.format(end)}`;

  for (let i = 0; i < 5; i++) {
    const d = addDays(state.weekStart, i);
    const iso = toISO(d);

    const col = document.createElement("div");
    col.className = "day-col" + (iso === state.selectedDate ? " selected" : "");

    // 🗓️ En-tête du jour
    const head = document.createElement("div");
    head.className = "day-header";
    head.textContent = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
    });
    col.appendChild(head);

    // 🕒 Créneaux horaires
    const busyMatrix = getBusyMatrix(iso);
    for (let j = 0; j < SLOT_COUNT; j++) {
      const h = START_HOUR + j * (SLOT_STEP / 60);
      const label = `${String(h).padStart(2, "0")}:00`;

      // ✅ slot en <button> pour accessibilité clavier
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "slot " + (busyMatrix[j] ? "busy" : "free");
      slot.dataset.time = label;
      slot.title = label;
      slot.setAttribute(
        "aria-label",
        `${label} le ${d.toLocaleDateString("fr-FR")}`
      );

      // Repères horaires
      if (REPERES.includes(label)) {
        const mark = document.createElement("span");
        mark.className = "time-marker";
        mark.textContent = label;
        slot.appendChild(mark);
      }

      // Sélection d’un créneau
      if (!busyMatrix[j]) {
        slot.addEventListener("click", () => {
          state.selectedDate = iso;
          state.selectedSlot = label;

          openSlotBooker(); // ouvre le booking
          const form = $("#bookingForm");
          form.style.display = "grid";
          $("#eventTitle").focus();
        });
      } else {
        slot.disabled = true; // évite confusion
      }

      col.appendChild(slot);
    }

    weekEl.appendChild(col);
  }
}

function getBusyMatrix(dateISO) {
  const busy = Array(SLOT_COUNT).fill(false);
  const dayEvents = state.events.filter((e) => e.date === dateISO);

  dayEvents.forEach((e) => {
    const [h] = e.time.split(":").map(Number);
    const idx = (h - START_HOUR) / (SLOT_STEP / 60);
    const span = Math.ceil(e.duration / SLOT_STEP);
    for (let i = 0; i < span; i++) {
      if (idx + i < busy.length) busy[idx + i] = true;
    }
  });

  return busy;
}

// 📅 Navigation simple (séparée du booking)
$("#prevWeek").onclick = () => {
  state.weekStart = addDays(state.weekStart, -7);
  renderWeek();
};

$("#nextWeek").onclick = () => {
  state.weekStart = addDays(state.weekStart, 7);
  renderWeek();
};
