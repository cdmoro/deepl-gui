import { DEMO_LANGS } from "./demo";
import { save, load } from "./storage";

const sourceText = document.querySelector("#source-text")!;
const targetText = document.querySelector("#target-text")!;
const sourceLang = document.querySelector("#source-lang")!;
const targetLang = document.querySelector("#target-lang")!;
const translateBtn = document.querySelector("#translate")!;
const swapBtn = document.querySelector("#swap")!;
const counter = document.querySelector("#char-count")!;
const usage = document.querySelector("#usage")!;
const detected = document.querySelector("#detected")!;
const themeToggle = document.querySelector("#theme-toggle")!;

let demoMode = false;

async function detectDemo() {
  try {
    await fetch("/api/config");
    return false;
  } catch {
    return true;
  }
}

async function loadLanguages() {
  try {
    const res = await fetch("/api/languages");
    const data = await res.json();

    sourceLang.innerHTML = `<option value="">Auto detect</option>`;
    data.source.forEach((l: any) =>
      sourceLang.innerHTML += `<option value="${l.language}">${l.name}</option>`
    );

    targetLang.innerHTML = "";
    data.target.forEach((l: any) =>
      targetLang.innerHTML += `<option value="${l.language}">${l.name}</option>`
    );
  } catch {
    demoMode = true;
    sourceLang.innerHTML = `<option value="">Auto detect</option>`;
    DEMO_LANGS.forEach(l =>
      sourceLang.innerHTML += `<option value="${l.language}">${l.name}</option>`
    );
    DEMO_LANGS.forEach(l =>
      targetLang.innerHTML += `<option value="${l.language}">${l.name}</option>`
    );
  }
}

translateBtn.addEventListener("click", async () => {
  if (demoMode) return;

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: sourceText.value,
      sourceLang: sourceLang.value || null,
      targetLang: targetLang.value
    })
  });

  const data = await res.json();
  targetText.value = data.text;
  detected.textContent = data.detected
    ? `Detected: ${data.detected}`
    : "";
  loadUsage();
  persist();
});

swapBtn.addEventListener("click", () => {
  [sourceLang.value, targetLang.value] =
    [targetLang.value, sourceLang.value];
  [sourceText.value, targetText.value] =
    [targetText.value, sourceText.value];
  persist();
});

sourceText.addEventListener("input", () => {
  counter.textContent = sourceText.value.length.toString();
  persist();
});

themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const next =
    html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  persist();
});

async function loadUsage() {
  try {
    const res = await fetch("/api/usage");
    const data = await res.json();
    const pct = Math.round((data.used / data.limit) * 100);
    usage.textContent = `Usage: ${data.used} / ${data.limit} (${pct}%)`;
  } catch {
    usage.textContent = "Demo mode";
    translateBtn.setAttribute("disabled", "true");
  }
}

function persist() {
  save({
    sourceText: sourceText.value,
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    theme: document.documentElement.getAttribute("data-theme")
  });
}

function restore() {
  const state = load();
  if (!state) return;
  sourceText.value = state.sourceText || "";
  sourceLang.value = state.sourceLang || "";
  targetLang.value = state.targetLang || "EN";
  document.documentElement.setAttribute("data-theme", state.theme || "light");
}

(async function init() {
  demoMode = await detectDemo();
  await loadLanguages();
  restore();
  loadUsage();
})();
