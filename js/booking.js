import { $ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";
import { updateNextEvent } from "./next-event.js";
import { showConfirmation } from "./confirm.js";
import { renderWeek } from "./calendar.js"; // ✅ ajout

const slotBooker = $("#slotBooker");
const slotsGrid = $("#slotsGrid");
const slotTitle = $("#slotTitle");

export function openSlotBooker(keepSelected = false) {
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
  const busyMatrix = Array(10).fill(false);

  dayEvents.forEach((e) => {
    const [h] = e.time.split(":").map(Number);
    const idx = h - 8; // START_HOUR = 8
    const span = Math.ceil(e.duration / 60);
    for (let i = 0; i < span; i++) {
      if (idx + i < busyMatrix.length) busyMatrix[idx + i] = true;
    }
  });

  for (let i = 0; i < 10; i++) {
    const h = 8 + i;
    const label = `${String(h).padStart(2, "0")}:00`;

    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "slot" +
      (busyMatrix[i] ? " busy" : "") +
      (state.selectedSlot === label ? " selected" : "");
    b.textContent = label;

    if (!busyMatrix[i]) {
      b.addEventListener("click", () => {
        state.selectedSlot = label;
        document.querySelector(".slot.selected")?.classList.remove("selected");
        b.classList.add("selected");
        $("#bookingForm").style.display = "grid";
        $("#eventTitle").focus();
      });
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

// Bouton "Fermer"
$("#closeSlotBooker").addEventListener("click", () => {
  slotBooker.classList.remove("active");
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
    renderWeek(); // ✅ rafraîchit le calendrier pour marquer la case busy
  }, 600);
});
