import { $, $$ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const todoInput = $("#todoInput");
const todoList = $("#todoList");
const todoCounter = $("#todoCounter");

export function renderTodos() {
  todoList.replaceChildren(); // plus propre que innerHTML = ""

  state.todos.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "todo-item" + (t.done ? " completed" : "");
    row.style.animation = "fadeIn 0.3s ease"; // micro-animation

    // ✅ Checkbox
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.setAttribute("aria-label", "Marquer la tâche comme terminée");
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      try {
        storage.set("vd_todos", state.todos);
        renderTodos();
      } catch (err) {
        console.error("Erreur stockage todos", err);
      }
    });

    // ✅ Texte de la tâche
    const label = document.createElement("div");
    label.textContent = t.text;
    label.style.flex = "1";

    // ✅ Bouton suppression
    const del = document.createElement("button");
    del.className = "icon-btn";
    del.setAttribute("aria-label", "Supprimer cette tâche");
    del.innerHTML = "🗑️";
    del.addEventListener("click", () => {
      row.style.animation = "fadeOut 0.2s ease forwards";
      setTimeout(() => {
        state.todos.splice(i, 1);
        try {
          storage.set("vd_todos", state.todos);
          renderTodos();
        } catch (err) {
          console.error("Erreur suppression todo", err);
        }
      }, 180);
    });

    row.append(cb, label, del);
    todoList.appendChild(row);
  });

  // ✅ Compteur à jour
  todoCounter.textContent = `${
    state.todos.filter((t) => !t.done).length
  } à faire`;
}

function addTodo() {
  const v = todoInput.value.trim();
  if (!v) return;

  state.todos.unshift({ text: v, done: false });
  try {
    storage.set("vd_todos", state.todos);
  } catch (err) {
    console.error("Erreur ajout todo", err);
  }
  todoInput.value = "";
  renderTodos();
}

// ✅ Liens UI
$("#addTodoBtn").onclick = addTodo;
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});
