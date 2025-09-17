import { renderWeek } from "./calendar.js";
import { renderTodos } from "./todo.js";
import { initNotes } from "./notes.js";
import { initPomodoro } from "./pomodoro.js";
import { updateNextEvent } from "./next-event.js";
import { state } from "./state.js";
import { initBackground } from "./background.js"; // ✅ NEW

function resetDemo() {
  if (confirm("Réinitialiser les données locales ?")) {
    localStorage.removeItem("vd_events");
    localStorage.removeItem("vd_todos");
    localStorage.removeItem("vd_notes");
    localStorage.removeItem("vd_pomo");

    // Reset state
    state.events = [];
    state.todos = [];
    state.notes = "";
    state.pomo = {
      work: 25,
      rest: 5,
      mode: "work",
      remaining: 25 * 60,
      running: false,
    };

    // Re-render UI
    renderWeek();
    renderTodos();
    initNotes();
    initPomodoro();
    updateNextEvent();
  }
}

function boot() {
  renderWeek();
  renderTodos();
  initNotes();
  initPomodoro();
  updateNextEvent();
  initBackground(); // ✅ Appel du background

  // Bind bouton reset
  document.querySelector("#resetDemoBtn").onclick = resetDemo;
}

document.addEventListener("DOMContentLoaded", boot);
