import { $ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const notesArea = $("#notesArea");
const notesStatus = $("#notesStatus");
let notesTimer;
const SAVE_DELAY = 500; // ms

export function initNotes() {
  // Charger les notes depuis l'état
  notesArea.value = state.notes || "";

  notesArea.addEventListener("input", () => {
    // ⏳ Indiquer que ça enregistre
    setStatus("Enregistrement…", "saving");

    clearTimeout(notesTimer);
    notesTimer = setTimeout(saveNotes, SAVE_DELAY);
  });
}

function saveNotes() {
  try {
    state.notes = notesArea.value;
    storage.set("vd_notes", state.notes);

    // ✅ Succès
    setStatus("Enregistré", "success");
  } catch (err) {
    // ❌ Erreur stockage
    console.error("Erreur sauvegarde notes:", err);
    setStatus("Erreur de sauvegarde", "error");
  }
}

function setStatus(text, type) {
  notesStatus.textContent = text;
  notesStatus.className = ""; // reset classes
  notesStatus.classList.add(type);
  // accessibilité screen reader
  notesStatus.setAttribute("role", "status");
  notesStatus.setAttribute("aria-live", "polite");
}
