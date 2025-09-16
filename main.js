// ==============================
// Navigation entre étapes
// ==============================
const steps = document.querySelectorAll(".step-section");
const progressSteps = document.querySelectorAll("#progress .step");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");

const nextToSlots = document.getElementById("nextToSlots");
const nextToForm = document.getElementById("nextToForm");
const bookingForm = document.getElementById("bookingForm");
const restartBtn = document.getElementById("restart");

// Boutons retour dynamiques
let backButtons = [];

function showStep(index) {
  steps.forEach((s, i) => {
    s.classList.toggle("active", i === index);
    progressSteps[i].classList.toggle("active", i <= index);
  });
}

// ==============================
// Calendrier simple (7 jours à venir)
// ==============================
const calendar = document.querySelector(".calendar");
let selectedDate = null;

function generateWeek() {
  const today = new Date();
  calendar.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    const day = date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
    });

    const btn = document.createElement("button");
    btn.classList.add("day");
    btn.textContent = day;

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".day")
        .forEach((d) => d.classList.remove("selected"));
      btn.classList.add("selected");
      selectedDate = date;
      nextToSlots.disabled = false;
    });

    calendar.appendChild(btn);
  }
}

generateWeek();

// ==============================
// Gestion des créneaux horaires
// ==============================
const slots = document.querySelectorAll(".slot");
let selectedSlot = null;

slots.forEach((slot) => {
  slot.addEventListener("click", () => {
    if (!slot.classList.contains("disabled")) {
      // Toggle verrouillage si Ctrl ou Cmd pressé
      if (window.event.ctrlKey || window.event.metaKey) {
        slot.classList.toggle("locked");
      } else {
        // Sélection simple
        document
          .querySelectorAll(".slot")
          .forEach((s) => s.classList.remove("selected"));
        slot.classList.add("selected");
        selectedSlot = slot.textContent.replace(" 🔒", "");
        nextToForm.disabled = false;
      }
    }
  });
});

// ==============================
// Navigation entre étapes
// ==============================
nextToSlots.addEventListener("click", () => {
  showStep(1);
  addBackButton(step2, 0);
});

nextToForm.addEventListener("click", () => {
  showStep(2);
  addBackButton(step3, 1);
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showStep(3);
  addBackButton(step4, 2);
});

restartBtn.addEventListener("click", () => {
  selectedDate = null;
  selectedSlot = null;
  nextToSlots.disabled = true;
  nextToForm.disabled = true;
  document
    .querySelectorAll(".day")
    .forEach((d) => d.classList.remove("selected"));
  document
    .querySelectorAll(".slot")
    .forEach((s) => s.classList.remove("selected"));
  showStep(0);
});

// ==============================
// Bouton retour
// ==============================
function addBackButton(section, backIndex) {
  // Supprime l'ancien bouton s'il existe
  let oldBtn = section.querySelector(".back-btn");
  if (oldBtn) oldBtn.remove();

  const btn = document.createElement("button");
  btn.textContent = "⬅ Retour";
  btn.classList.add("btn", "back-btn");
  btn.style.marginRight = "10px";

  btn.addEventListener("click", () => {
    showStep(backIndex);
  });

  section.insertBefore(btn, section.firstChild);
}
