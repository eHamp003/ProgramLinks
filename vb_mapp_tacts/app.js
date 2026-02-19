// VB-MAPP Tacts (Simple) — Slideshow + ✅/❌ + CSV export
// Supports exemplars (generalization), deck selection, and SD rules.

const SD_MAP = {
  nouns: "What is it?",
  actions: "What are they doing?",
  combos: "Tell me what’s happening?",
  pronouns: "Who is it?"
  // prepositions handled dynamically: Where is the (X)?
};

const STORAGE_KEYS = {
  MISSED_SET: "vbmapp_tacts_missed_set_v1",
  LAST_SETTINGS: "vbmapp_tacts_last_settings_v1"
};

let allTargets = [];
let session = null;

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  $("screenStart").classList.add("hidden");
  $("screenRun").classList.add("hidden");
  $("screenSummary").classList.add("hidden");
  $(name).classList.remove("hidden");
}

function setMsg(el, text) {
  el.textContent = text || "";
}

function uuid() {
  // simple unique ID, good enough for session IDs
  return "sess_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

function getSelectedDecks() {
  const checks = Array.from(document.querySelectorAll(".deckCheck"));
  return checks.filter(c => c.checked).map(c => c.value);
}

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SETTINGS);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.clientName === "string") $("clientName").value = s.clientName;
    if (typeof s.setSize === "string") $("setSize").value = s.setSize;
    if (typeof s.toggleGen === "boolean") $("toggleGen").checked = s.toggleGen;
    if (typeof s.toggleShuffleExemplars === "boolean") $("toggleShuffleExemplars").checked = s.toggleShuffleExemplars;

    if (Array.isArray(s.decks)) {
      const checks = Array.from(document.querySelectorAll(".deckCheck"));
      checks.forEach(c => c.checked = s.decks.includes(c.value));
    }
  } catch {
    // ignore
  }
}

function saveSettings() {
  const s = {
    clientName: $("clientName").value.trim(),
    setSize: $("setSize").value,
    toggleGen: $("toggleGen").checked,
    toggleShuffleExemplars: $("toggleShuffleExemplars").checked,
    decks: getSelectedDecks()
  };
  localStorage.setItem(STORAGE_KEYS.LAST_SETTINGS, JSON.stringify(s));
}

function hasSavedMissedSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSED_SET);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0;
  } catch {
    return false;
  }
}

function clearSavedMissedSet() {
  localStorage.removeItem(STORAGE_KEYS.MISSED_SET);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomUnique(arr, n) {
  const copy = arr.slice();
  shuffle(copy);
  return copy.slice(0, Math.min(n, copy.length));
}

function buildTrialsFromConcepts(concepts, genMode, shuffleExemplars) {
  // Each "concept" is one target entry from targets.json.
  // If genMode ON: create a trial for each exemplar.
  // If OFF: pick a single exemplar per concept (random).
  const trials = [];

  for (const c of concepts) {
    const exemplars = Array.isArray(c.exemplars) ? c.exemplars.slice() : [];
    if (exemplars.length === 0) continue;

    let exList = exemplars.slice();
    if (genMode && shuffleExemplars) shuffle(exList);

    if (genMode) {
      exList.forEach((src, idx) => {
        trials.push({
          concept_id: c.id,
          concept_label: c.label,
          deck: c.deck,
          prompt_object: c.prompt_object || "",
          exemplar_index: idx + 1,
          exemplar_total: exList.length,
          src
        });
      });
    } else {
      const src = exemplars[Math.floor(Math.random() * exemplars.length)];
      trials.push({
        concept_id: c.id,
        concept_label: c.label,
        deck: c.deck,
        prompt_object: c.prompt_object || "",
        exemplar_index: 1,
        exemplar_total: 1,
        src
      });
    }
  }

  // Shuffle overall trial order so decks + exemplars are mixed
  shuffle(trials);
  return trials;
}

function sdForTrial(trial) {
  if (trial.deck === "prepositions") {
    const obj = (trial.prompt_object || "it").trim();
    return `Where is the ${obj}?`;
  }
  return SD_MAP[trial.deck] || "What is it?";
}

function initSessionFromConcepts(concepts) {
  const client = $("clientName").value.trim();
  const genMode = $("toggleGen").checked;
  const shuffleEx = $("toggleShuffleExemplars").checked;

  const trials = buildTrialsFromConcepts(concepts, genMode, shuffleEx);

  session = {
    session_id: uuid(),
    client,
    created_at: new Date().toISOString(),
    genMode,
    concepts_count: concepts.length,
    trials,
    index: 0,
    results: [] // one per trial: { trial_index, correct, timestamp }
  };
}

function renderTrial() {
  if (!session) return;

  const t = session.trials[session.index];
  if (!t) {
    endSession();
    return;
  }

  $("sdText").textContent = sdForTrial(t);

  const prog = `Trial ${session.index + 1} / ${session.trials.length}  •  Concept: ${t.concept_label} (${t.exemplar_index}/${t.exemplar_total})  •  Deck: ${t.deck}`;
  $("progressText").textContent = prog;

  // Load image/gif
  const img = $("mediaImg");
  img.classList.remove("hidden");
  img.src = t.src;
  img.alt = `${t.concept_label}`;

  img.onerror = () => {
    setMsg($("runMsg"), `Missing file: ${t.src}  (Add it to your repo or fix targets.json path)`);
    img.removeAttribute("src");
    img.classList.add("hidden");
  };

  setMsg($("runMsg"), "");
}

function recordResponse(isCorrect) {
  if (!session) return;

  const t = session.trials[session.index];
  session.results[session.index] = {
    trial_index: session.index + 1,
    concept_id: t.concept_id,
    concept_label: t.concept_label,
    deck: t.deck,
    sd_text: sdForTrial(t),
    exemplar_index: t.exemplar_index,
    exemplar_total: t.exemplar_total,
    src: t.src,
    result: isCorrect ? "correct" : "incorrect",
    timestamp: new Date().toISOString()
  };

  // Auto-advance
  if (session.index < session.trials.length - 1) {
    session.index += 1;
    renderTrial();
  } else {
    endSession();
  }
}

function goNext() {
  if (!session) return;
  if (session.index < session.trials.length - 1) {
    session.index += 1;
    renderTrial();
  } else {
    endSession();
  }
}

function goBack() {
  if (!session) return;
  if (session.index > 0) {
    session.index -= 1;
    renderTrial();
  }
}

function computeSummary() {
  const rows = session.results.filter(Boolean);
  const total = rows.length;
  const correct = rows.filter(r => r.result === "correct").length;

  const byDeck = {};
  const missedConcepts = new Map(); // concept_id -> label

  for (const r of rows) {
    if (!byDeck[r.deck]) byDeck[r.deck] = { total: 0, correct: 0 };
    byDeck[r.deck].total += 1;
    if (r.result === "correct") byDeck[r.deck].correct += 1;
    if (r.result === "incorrect") missedConcepts.set(r.concept_id, r.concept_label);
  }

  return {
    total,
    correct,
    accuracy: total ? (correct / total) : 0,
    byDeck,
    missedConcepts: Array.from(missedConcepts.entries()).map(([id, label]) => ({ id, label }))
  };
}

function endSession() {
  if (!session) return;
  showScreen("screenSummary");

  const sum = computeSummary();

  const pct = (sum.accuracy * 100).toFixed(0);
  $("overallStats").textContent = `${pct}% (${sum.correct}/${sum.total})`;

  const deckLines = Object.entries(sum.byDeck).map(([deck, s]) => {
    const p = s.total ? ((s.correct / s.total) * 100).toFixed(0) : "0";
    return `${deck}: ${p}% (${s.correct}/${s.total})`;
  });
  $("byDeckStats").textContent = deckLines.join(" • ") || "—";

  $("missedCount").textContent = `${sum.missedConcepts.length}`;
  $("missedList").textContent = sum.missedConcepts.map(m => m.label).slice(0, 60).join(", ") || "—";

  // Enable download even if some trials unanswered (Next/Back without scoring)
  setMsg($("summaryMsg"), "Tip: Save Missed Set to quickly re-run the incorrect concepts next session.");
}

function saveMissedSet() {
  if (!session) return;
  const sum = computeSummary();
  const missedIds = sum.missedConcepts.map(m => m.id);
  localStorage.setItem(STORAGE_KEYS.MISSED_SET, JSON.stringify(missedIds));
  setMsg($("summaryMsg"), `Saved ${missedIds.length} missed concepts for next session.`);
  refreshStartButtons();
}

function refreshStartButtons() {
  $("btnStartMissed").disabled = !hasSavedMissedSet();
}

function buildConceptPool(decks, conceptIdsOrNull) {
  // Filter targets by decks, and optionally by specific concept IDs
  let pool = allTargets.filter(t => decks.includes(t.deck));

  if (Array.isArray(conceptIdsOrNull) && conceptIdsOrNull.length) {
    const set = new Set(conceptIdsOrNull);
    pool = pool.filter(t => set.has(t.id));
  }

  // Only keep valid targets with exemplars
  pool = pool.filter(t => Array.isArray(t.exemplars) && t.exemplars.length > 0);
  return pool;
}

async function loadTargets() {
  const res = await fetch("targets.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load targets.json (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("targets.json must be an array.");
  // minimal validation
  for (const t of data) {
    if (!t.id || !t.deck || !t.label) throw new Error("Each target must have id, deck, label.");
    if (!Array.isArray(t.exemplars) || t.exemplars.length === 0) throw new Error(`Target ${t.id} needs exemplars.`);
  }
  allTargets = data;
}

function toCsv(rows) {
  const headers = [
    "session_id","client","created_at",
    "deck","concept_id","concept_label",
    "sd_text","exemplar_index","exemplar_total",
    "src","result","timestamp"
  ];

  const esc = (v) => {
    const s = (v ?? "").toString();
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const lines = [headers.join(",")];
  for (const r of rows) {
    const line = [
      session.session_id,
      session.client,
      session.created_at,
      r.deck,
      r.concept_id,
      r.concept_label,
      r.sd_text,
      r.exemplar_index,
      r.exemplar_total,
      r.src,
      r.result,
      r.timestamp
    ].map(esc).join(",");
    lines.push(line);
  }
  return lines.join("\n");
}

function downloadCsv() {
  if (!session) return;
  const rows = session.results.filter(Boolean);
  if (rows.length === 0) {
    setMsg($("summaryMsg"), "No scored trials found yet. Make at least one ✅/❌ to export.");
    return;
  }
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0,10);
  const client = (session.client || "Client").replace(/[^a-z0-9_-]/gi, "_");
  const filename = `${client}_VBMAPP_Tacts_${date}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  setMsg($("summaryMsg"), `Downloaded ${filename}`);
}

function startFresh() {
  saveSettings();

  const decks = getSelectedDecks();
  if (decks.length === 0) {
    setMsg($("startMsg"), "Select at least one deck.");
    return;
  }

  const pool = buildConceptPool(decks, null);
  const setSize = parseInt($("setSize").value, 10);

  if (pool.length === 0) {
    setMsg($("startMsg"), "No valid targets found for selected decks. Check targets.json.");
    return;
  }

  const concepts = pickRandomUnique(pool, setSize);
  initSessionFromConcepts(concepts);

  showScreen("screenRun");
  renderTrial();
}

function startMissed() {
  saveSettings();

  const decks = getSelectedDecks();
  if (decks.length === 0) {
    setMsg($("startMsg"), "Select at least one deck.");
    return;
  }

  let missedIds = [];
  try {
    missedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSED_SET) || "[]");
  } catch { missedIds = []; }

  if (!missedIds.length) {
    setMsg($("startMsg"), "No saved missed set found.");
    refreshStartButtons();
    return;
  }

  const pool = buildConceptPool(decks, missedIds);
  if (pool.length === 0) {
    setMsg($("startMsg"), "Saved missed set doesn't match the selected decks (or targets missing).");
    return;
  }

  initSessionFromConcepts(pool);

  showScreen("screenRun");
  renderTrial();
}

function wireUI() {
  $("btnStartFresh").addEventListener("click", startFresh);
  $("btnStartMissed").addEventListener("click", startMissed);

  $("btnCorrect").addEventListener("click", () => recordResponse(true));
  $("btnIncorrect").addEventListener("click", () => recordResponse(false));
  $("btnNext").addEventListener("click", goNext);
  $("btnBack").addEventListener("click", goBack);
  $("btnEnd").addEventListener("click", endSession);

  $("btnDownloadCsv").addEventListener("click", downloadCsv);
  $("btnSaveMissed").addEventListener("click", saveMissedSet);
  $("btnRestart").addEventListener("click", () => {
    session = null;
    showScreen("screenStart");
    refreshStartButtons();
    setMsg($("startMsg"), "");
  });

  $("btnResetAll").addEventListener("click", () => {
    clearSavedMissedSet();
    refreshStartButtons();
    setMsg($("startMsg"), "Cleared saved missed set.");
  });

  // Save settings when toggles change
  ["clientName","setSize","toggleGen","toggleShuffleExemplars"].forEach(id => {
    $(id).addEventListener("change", saveSettings);
  });
  document.querySelectorAll(".deckCheck").forEach(cb => cb.addEventListener("change", saveSettings));

  // keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if ($("screenRun").classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") goBack();
    if (e.key === "ArrowRight") goNext();
    if (e.key.toLowerCase() === "z") recordResponse(true);
    if (e.key.toLowerCase() === "x") recordResponse(false);
  });
}

(async function main() {
  try {
    await loadTargets();
    loadSavedSettings();
    refreshStartButtons();

    setMsg($("startMsg"),
      `Loaded ${allTargets.length} concepts from targets.json. Add your images/GIFs into /assets/ and update targets.json as you expand.`
    );
  } catch (err) {
    setMsg($("startMsg"), `Error: ${err.message}`);
  }

  wireUI();
})();

