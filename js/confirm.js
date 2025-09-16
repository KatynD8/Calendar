import { $ } from "./utils.js";

const overlay = $("#confirmOverlay");
const conf = $(".confetti");

export function showConfirmation(title) {
  $("#confirmText").textContent = `${title} est programmé.`;

  // Génération confettis
  conf.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.transform = `translateY(${Math.random() * 40}px)`;
    conf.appendChild(s);
  }

  overlay.classList.add("active");
}

$("#closeConfirm").onclick = () => overlay.classList.remove("active");
