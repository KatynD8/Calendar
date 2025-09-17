import { $ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const progress = $("#progress");
const timerLabel = $("#timerLabel");
const modePill = $("#modePill");
const pomoStatus = $("#pomoStatus");

const CIRC = 2 * Math.PI * 54;
let tick;

// --- Helpers ---
function durationFor(mode) {
  return (mode === "work" ? state.pomo.work : state.pomo.rest) * 60;
}

function setMode(mode) {
  state.pomo.mode = mode;
  modePill.textContent = mode === "work" ? "Focus" : "Break";
  modePill.className = "pill " + (mode === "work" ? "focus" : "break"); // 🎨 ajout style
  storage.set("vd_pomo", state.pomo);
}

function setRemaining(sec) {
  state.pomo.remaining = sec;
  updateTimerUI();
  storage.set("vd_pomo", state.pomo);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerUI() {
  const total = durationFor(state.pomo.mode);
  const progressRatio = 1 - state.pomo.remaining / total;
  progress.style.strokeDashoffset = String(CIRC * (1 - progressRatio));

  timerLabel.textContent = formatTime(state.pomo.remaining);

  if (state.pomo.running) {
    pomoStatus.textContent = "⏳ En cours…";
  } else if (state.pomo.remaining === total) {
    pomoStatus.textContent = "Prêt à démarrer";
  } else {
    pomoStatus.textContent = "⏸️ En pause";
  }
  pomoStatus.setAttribute("aria-live", "polite"); // ✅ accessibilité
}

// --- Core functions ---
function startTimer() {
  if (state.pomo.running) return;

  state.pomo.running = true;
  storage.set("vd_pomo", state.pomo);

  tick = setInterval(() => {
    if (state.pomo.remaining > 0) {
      setRemaining(state.pomo.remaining - 1);
    } else {
      notifyPhaseEnd();
      nextPhase();
    }
  }, 1000);

  updateTimerUI();
}

function pauseTimer() {
  if (!state.pomo.running) return;

  state.pomo.running = false;
  storage.set("vd_pomo", state.pomo);
  clearInterval(tick);

  updateTimerUI();
}

function resetTimer() {
  pauseTimer();
  setRemaining(durationFor(state.pomo.mode));
}

function nextPhase() {
  pauseTimer();
  const nextMode = state.pomo.mode === "work" ? "rest" : "work";
  setMode(nextMode);
  setRemaining(durationFor(nextMode));
  startTimer();
}

function skipPhase() {
  nextPhase();
}

// ✅ Notification sonore + visuelle
function notifyPhaseEnd() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.05;
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 200);
  } catch (e) {
    console.warn("Beep non supporté", e);
  }

  // 🔔 Ajout visuel
  pomoStatus.textContent = "✔️ Phase terminée !";
}

// --- Init ---
export function initPomodoro() {
  setMode(state.pomo.mode);
  if (state.pomo.running) {
    startTimer();
  } else {
    setRemaining(state.pomo.remaining || durationFor(state.pomo.mode));
  }
}

// --- UI bindings ---
$("#startTimer").onclick = startTimer;
$("#pauseTimer").onclick = pauseTimer;
$("#resetTimer").onclick = resetTimer;
$("#skipTimer").onclick = skipPhase;

$("#settingsTimer").onclick = () => {
  const w = prompt(
    "Durées (minutes) Focus, Break",
    `${state.pomo.work}, ${state.pomo.rest}`
  );
  if (!w) return;
  const parts = w
    .split(/[;,\\s]+/)
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n));

  if (parts.length >= 2) {
    state.pomo.work = Math.max(1, parts[0]);
    state.pomo.rest = Math.max(1, parts[1]);
    storage.set("vd_pomo", state.pomo);
    resetTimer();
  }
};
