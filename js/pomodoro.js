import { $, $$ } from "./utils.js";
import { state } from "./state.js";
import { storage } from "./storage.js";

const progress = $("#progress");
const timerLabel = $("#timerLabel");
const modePill = $("#modePill");
const pomoStatus = $("#pomoStatus");

const CIRC = 2 * Math.PI * 54; // circonférence du cercle SVG
let tick;

// --- Helpers ---
function durationFor(mode) {
  return (mode === "work" ? state.pomo.work : state.pomo.rest) * 60;
}

function setMode(mode) {
  state.pomo.mode = mode;
  modePill.textContent = mode === "work" ? "Focus" : "Break";
  storage.set("vd_pomo", state.pomo);
}

function setRemaining(sec) {
  state.pomo.remaining = sec;
  updateTimerUI();
  storage.set("vd_pomo", state.pomo);
}

function updateTimerUI() {
  const total = durationFor(state.pomo.mode);
  const p = 1 - state.pomo.remaining / total;
  progress.style.strokeDashoffset = String(CIRC * (1 - p));

  const m = Math.floor(state.pomo.remaining / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(state.pomo.remaining % 60)
    .toString()
    .padStart(2, "0");

  timerLabel.textContent = `${m}:${s}`;
  pomoStatus.textContent = state.pomo.running ? "En cours…" : "Prêt";
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
      beep();
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
  if (state.pomo.mode === "work") {
    setMode("rest");
  } else {
    setMode("work");
  }
  setRemaining(durationFor(state.pomo.mode));
  startTimer();
}

function skipPhase() {
  nextPhase();
}

// Petit bip sonore
function beep() {
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
    }, 160);
  } catch (e) {
    console.warn("Beep non supporté", e);
  }
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
