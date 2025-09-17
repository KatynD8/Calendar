import { $ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";
import { updateNextEvent } from "./next-event.js";
import { showConfirmation } from "./confirm.js";
import { renderWeek } from "./calendar.js";

const slotBooker = $("#slotBooker");
const slotsGrid = $("#slotsGrid");
const slotTitle = $("#slotTitle");
const START_HOUR = 8;
const END_HOUR = 18;
const SLOT_STEP = 60; // minutes → garder cohérent avec calendar.js
const SLOT_COUNT = (END_HOUR - START_HOUR) * (60 / SLOT_STEP);

export function openSlotBooker(keepSelected = false) {
  slotBooker.classList.remove("closing");
  slotBooker.classList.add("active");

  const d = new Date(state.selectedDate);
  slotTitle.textContent = `Créneaux du ${d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })}`;

  renderSlots();

  if (state.selectedSlot) {
    $("#bookingForm").style.display = "grid";
    $("#eventTitle").focus();
  } else if (!keepSelected) {
    $("#bookingForm").style.display = "none";
  }
}

function renderSlots() {
  slotsGrid.innerHTML = "";

  const dayEvents = state.events.filter((e) => e.date === state.selectedDate);
  const busyMatrix = Array(SLOT_COUNT).fill(false);

  // Marquer les créneaux occupés
  dayEvents.forEach((e) => {
    const [h] = e.time.split(":").map(Number);
    const idx = (h - START_HOUR) / (SLOT_STEP / 60);
    const span = Math.ceil(e.duration / SLOT_STEP);
    for (let i = 0; i < span; i++) {
      if (idx + i < busyMatrix.length) busyMatrix[idx + i] = true;
    }
  });

  // Générer les créneaux
  for (let i = 0; i < SLOT_COUNT; i++) {
    const h = START_HOUR + i * (SLOT_STEP / 60);
    const label = `${String(h).padStart(2, "0")}:00`;

    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "slot" +
      (busyMatrix[i] ? " busy" : "") +
      (state.selectedSlot === label ? " selected" : "");
    b.textContent = label;
    b.setAttribute("aria-label", label);

    if (!busyMatrix[i]) {
      b.addEventListener("click", () => {
        state.selectedSlot = label;
        document.querySelector(".slot.selected")?.classList.remove("selected");
        b.classList.add("selected");
        $("#bookingForm").style.display = "grid";
        $("#eventTitle").focus();
      });
    } else {
      b.disabled = true;
      b.setAttribute("aria-disabled", "true");
    }

    slotsGrid.appendChild(b);
  }
}

// Bouton "Nouvel événement"
$("#newEventBtn").onclick = () => {
  state.selectedDate = new Date().toISOString().slice(0, 10);
  state.selectedSlot = null;
  renderSlots();
  openSlotBooker();
};

// Bouton "Fermer" (avec animation)
$("#closeSlotBooker").addEventListener("click", () => {
  slotBooker.classList.add("closing");
  slotBooker.addEventListener(
    "animationend",
    () => {
      if (slotBooker.classList.contains("closing")) {
        slotBooker.classList.remove("closing", "active");
        slotBooker.style.display = "none";
      }
    },
    { once: true }
  );

  state.selectedDate = null;
  state.selectedSlot = null;
  $("#bookingForm").style.display = "none";
});

// Soumission du formulaire
$("#bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#eventTitle").value.trim();
  const duration = parseInt($("#eventDuration").value, 10);

  if (!state.selectedSlot || !title) return;

  // Vérif conflit
  const conflict = state.events.find(
    (ev) => ev.date === state.selectedDate && ev.time === state.selectedSlot
  );
  if (conflict) {
    alert("⚠️ Ce créneau est déjà réservé.");
    return;
  }

  const btn = $("#confirmBtn");
  btn.disabled = true;
  btn.textContent = "Réservation…";

  setTimeout(() => {
    state.events.push({
      id: crypto.randomUUID(),
      date: state.selectedDate,
      time: state.selectedSlot,
      title,
      duration,
    });

    storage.set("vd_events", state.events);

    $("#eventTitle").value = "";
    state.selectedSlot = null;
    renderSlots();

    btn.disabled = false;
    btn.textContent = "Réserver";

    showConfirmation(title);
    updateNextEvent();
    renderWeek();
  }, 600);
});
