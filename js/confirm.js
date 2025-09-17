import { $ } from "./utils.js";

const overlay = $("#confirmOverlay");
const conf = $(".confetti");
const closeBtn = $("#closeConfirm");

export function showConfirmation(title) {
  $("#confirmText").innerHTML = `<strong>${title}</strong> est programmé.`;

  // Génération confettis
  conf.innerHTML = "";
  const confettiCount = 40; // ✅ réduit pour perf
  for (let i = 0; i < confettiCount; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    s.style.transform = `translateY(${Math.random() * 40}px)`;
    conf.appendChild(s);
  }

  overlay.classList.add("active");

  // ✅ Focus sur le bouton pour accessibilité
  closeBtn.focus();
}

// Bouton "OK"
closeBtn.onclick = () => closeOverlay();

// Fermeture par clic extérieur
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

// Fermeture par Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("active")) {
    closeOverlay();
  }
});

function closeOverlay() {
  overlay.classList.remove("active");
}
