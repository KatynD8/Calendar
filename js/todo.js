import { $, $$ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const todoInput = $("#todoInput");
const todoList = $("#todoList");

export function renderTodos() {
  todoList.innerHTML = "";

  state.todos.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "todo-item" + (t.done ? " completed" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.ariaLabel = "Valider la tâche";
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      storage.set("vd_todos", state.todos);
      renderTodos();
    });

    const label = document.createElement("div");
    label.textContent = t.text;
    label.style.flex = "1";

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.innerHTML = "🗑️";
    del.title = "Supprimer";
    del.addEventListener("click", () => {
      state.todos.splice(i, 1);
      storage.set("vd_todos", state.todos);
      renderTodos();
    });

    row.append(cb, label, del);
    todoList.appendChild(row);
  });

  $("#todoCounter").textContent = `${
    state.todos.filter((t) => !t.done).length
  } à faire`;
}

function addTodo() {
  const v = todoInput.value.trim();
  if (!v) return;
  state.todos.unshift({ text: v, done: false });
  storage.set("vd_todos", state.todos);
  todoInput.value = "";
  renderTodos();
}

$("#addTodoBtn").onclick = addTodo;
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});
