import { DEMO_LANGS } from "./demo";
import { setItem, getItem } from "./storage";

const sourceText = document.querySelector<HTMLTextAreaElement>("#source-text")!;
const targetText = document.querySelector<HTMLTextAreaElement>("#target-text")!;
const sourceLang = document.querySelector<HTMLSelectElement>("#source-lang")!;
const targetLang = document.querySelector<HTMLSelectElement>("#target-lang")!;
const translateBtn = document.querySelector<HTMLButtonElement>("#translate")!;
const swapBtn = document.querySelector<HTMLButtonElement>("#swap")!;
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
      sourceLang.innerHTML += `<option value="${l.code}">${l.name}</option>`
    );

    targetLang.innerHTML = "";
    data.target.forEach((l: any) =>
      targetLang.innerHTML += `<option value="${l.code}">${l.name}</option>`
    );
  } catch {
    demoMode = true;
    sourceLang.innerHTML = `<option value="">Auto detect</option>`;
    DEMO_LANGS.forEach(l =>
      sourceLang.innerHTML += `<option value="${l.code}">${l.name}</option>`
    );
    DEMO_LANGS.forEach(l =>
      targetLang.innerHTML += `<option value="${l.code}">${l.name}</option>`
    );
  }
}

sourceLang.addEventListener("change", (e) => setItem("sourceLang", (e.target as HTMLSelectElement).value));
targetLang.addEventListener("change", (e) => setItem("targetLang", (e.target as HTMLSelectElement).value));

translateBtn.addEventListener("click", async () => {
  if (demoMode || !sourceText.value) return;

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
  // persist();
});

swapBtn.addEventListener("click", () => {
  [sourceLang.value, targetLang.value] =
    [targetLang.value, sourceLang.value];
  [sourceText.value, targetText.value] =
    [targetText.value, sourceText.value];

  setItem("sourceLang", sourceLang.value);
  setItem("targetLang", targetLang.value);
});

sourceText.addEventListener("input", () => {
  counter.textContent = sourceText.value.length.toString();
  setItem("sourceText", sourceText.value);
});

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  setItem("theme", theme);
}

function detectTheme() {
  const saved = getItem("theme") as "light" | "dark" | null;
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

function formatUsage(used: number, limit: number) {
  const ratio = used / limit;
  const pct = ratio * 100;

  let pctText: string;

  if (pct === 0) {
    pctText = "0%";
  } else if (pct < 0.01) {
    pctText = "<0.01%";
  } else if (pct < 1) {
    pctText = `${pct.toFixed(2)}%`;
  } else {
    pctText = `${Math.round(pct)}%`;
  }

  const usedFmt = used.toLocaleString();
  const limitFmt = limit.toLocaleString();

  return `Usage: ${usedFmt} / ${limitFmt} (${pctText})`;
}


async function loadUsage() {
  try {
    const res = await fetch("/api/usage");
    const data = await res.json();

    usage.textContent = formatUsage(data.used, data.limit);
  } catch {
    usage.textContent = "Usage unavailable (demo mode)";
    translateBtn.setAttribute("disabled", "true");
  }
}

// function persist() {
//   save({
//     sourceText: sourceText.value,
//     sourceLang: sourceLang.value,
//     targetLang: targetLang.value,
//     theme: document.documentElement.getAttribute("data-theme")
//   });
// }

function restore() {
  sourceText.value = getItem("sourceText") || "";
  sourceLang.value = getItem("sourceLang") || "";
  targetLang.value = getItem("targetLang") || "EN";
  document.documentElement.setAttribute("data-theme", getItem("theme") || "light");
}

(async function init() {
  demoMode = await detectDemo();
  detectTheme();
  await loadLanguages();
  restore();
  loadUsage();
})();
