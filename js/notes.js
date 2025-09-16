import { $ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const notesArea = $("#notesArea");
const notesStatus = $("#notesStatus");
let notesTimer;

export function initNotes() {
  // Charger les notes depuis l'état
  notesArea.value = state.notes;

  notesArea.addEventListener("input", () => {
    notesStatus.textContent = "Enregistrement…";
    clearTimeout(notesTimer);

    notesTimer = setTimeout(() => {
      state.notes = notesArea.value;
      storage.set("vd_notes", state.notes);
      notesStatus.textContent = "Enregistré";
    }, 400);
  });
}
