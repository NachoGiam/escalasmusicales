// 1) Datos base y Configuración Musical
// Define las notas, afinación y estructuras de datos para las tonalidades.

const strings = ["E", "A", "D", "G", "B", "e"];
const frets = Array.from({ length: 20 }, (_, i) => i + 1); // 20 trastes
const OPEN_FRET = 0;

const PC_TO_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PC_TO_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_TO_PC = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
  "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11,
  "E#": 5, "Cb": 11 // Enarmónicos especiales para escalas teóricas
};

// 12 Tonalidades
const NOTE_NAMES = ["C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab", "Eb", "Bb", "F"];

// Afinación Estándar (Pitch Class de cuerdas al aire)
const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4]; // Indices: 0=E grave, 1=A, 2=D, 3=G, 4=B, 5=e aguda

// Tonalidades que siempre usan bemoles
const FLAT_KEYS = new Set([
  "F", "Bb", "Eb", "Ab", "Db", "Gb",
  "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"
]);

// Intervalos que definen cada escala/modo (distancia en semitonos desde la tónica)
const SCALES_CONFIG = {
  "major": new Set([0, 2, 4, 5, 7, 9, 11]),
  "dorian": new Set([0, 2, 3, 5, 7, 9, 10]),
  "phrygian": new Set([0, 1, 3, 5, 7, 8, 10]),
  "lydian": new Set([0, 2, 4, 6, 7, 9, 11]),
  "mixolydian": new Set([0, 2, 4, 5, 7, 9, 10]),
  "minor": new Set([0, 2, 3, 5, 7, 8, 10]),
  "locrian": new Set([0, 1, 3, 5, 6, 8, 10])
};

// Offset para encontrar la tónica de la escala Mayor Relativa (en semitonos)
const RELATIVE_MAJOR_OFFSET = {
  "major": 0,
  "dorian": 10,
  "phrygian": 8,
  "lydian": 7,
  "mixolydian": 5,
  "minor": 3,
  "locrian": 1
};

// Diccionario de Nombres Correctos (Spelling)
const SCALE_SPELLINGS = {
  "C:major": { 0: "C", 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 11: "B" },
  "G:major": { 7: "G", 9: "A", 11: "B", 0: "C", 2: "D", 4: "E", 6: "F#" },
  "D:major": { 2: "D", 4: "E", 6: "F#", 7: "G", 9: "A", 11: "B", 1: "C#" },
  "A:major": { 9: "A", 11: "B", 1: "C#", 2: "D", 4: "E", 6: "F#", 8: "G#" },
  "E:major": { 4: "E", 6: "F#", 8: "G#", 9: "A", 11: "B", 1: "C#", 3: "D#" },
  "B:major": { 11: "B", 1: "C#", 3: "D#", 4: "E", 6: "F#", 8: "G#", 10: "A#" },
  "F#:major": { 6: "F#", 8: "G#", 10: "A#", 11: "B", 1: "C#", 3: "D#", 5: "E#" },
  "Gb:major": { 6: "Gb", 8: "Ab", 10: "Bb", 11: "Cb", 1: "Db", 3: "Eb", 5: "F" },
  "Db:major": { 1: "Db", 3: "Eb", 5: "F", 6: "Gb", 8: "Ab", 10: "Bb", 0: "C" },
  "Ab:major": { 8: "Ab", 10: "Bb", 0: "C", 1: "Db", 3: "Eb", 5: "F", 7: "G" },
  "Eb:major": { 3: "Eb", 5: "F", 7: "G", 8: "Ab", 10: "Bb", 0: "C", 2: "D" },
  "Bb:major": { 10: "Bb", 0: "C", 2: "D", 3: "Eb", 5: "F", 7: "G", 9: "A" },
  "F:major": { 5: "F", 7: "G", 9: "A", 10: "Bb", 0: "C", 2: "D", 4: "E" },
  "A:minor": { 9: "A", 11: "B", 0: "C", 2: "D", 4: "E", 5: "F", 7: "G" },
  "E:minor": { 4: "E", 6: "F#", 7: "G", 9: "A", 11: "B", 0: "C", 2: "D" },
  "B:minor": { 11: "B", 1: "C#", 2: "D", 4: "E", 6: "F#", 7: "G", 9: "A" },
  "F#:minor": { 6: "F#", 8: "G#", 9: "A", 11: "B", 1: "C#", 2: "D", 4: "E" },
  "C#:minor": { 1: "C#", 3: "D#", 4: "E", 6: "F#", 8: "G#", 9: "A", 11: "B" },
  "G#:minor": { 8: "G#", 10: "A#", 11: "B", 1: "C#", 3: "D#", 4: "E", 6: "F#" },
  "Eb:minor": { 3: "Eb", 5: "F", 6: "Gb", 8: "Ab", 10: "Bb", 11: "Cb", 1: "Db" },
  "Bb:minor": { 10: "Bb", 0: "C", 1: "Db", 3: "Eb", 5: "F", 6: "Gb", 8: "Ab" },
  "F:minor": { 5: "F", 7: "G", 8: "Ab", 10: "Bb", 0: "C", 1: "Db", 3: "Eb" },
  "C:minor": { 0: "C", 2: "D", 3: "Eb", 5: "F", 7: "G", 8: "Ab", 10: "Bb" },
  "G:minor": { 7: "G", 9: "A", 10: "Bb", 0: "C", 2: "D", 3: "Eb", 5: "F" },
  "D:minor": { 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 10: "Bb", 0: "C" }
};

const MODE_OFFSETS_FROM_MAJOR = {
  "dorian": 2,      // 2nd degree
  "phrygian": 4,    // 3rd degree
  "lydian": 5,      // 4th degree
  "mixolydian": 7,  // 5th degree
  "minor": 9,       // 6th degree
  "locrian": 11     // 7th degree
};

// Auto-generar spellings para los modos
Object.keys(SCALE_SPELLINGS).forEach(key => {
  const [root, type] = key.split(':');
  if (type === "major") {
    const rootPc = NOTE_TO_PC[root];
    const spellingDict = SCALE_SPELLINGS[key];
    Object.keys(MODE_OFFSETS_FROM_MAJOR).forEach(modeName => {
      const semitones = MODE_OFFSETS_FROM_MAJOR[modeName];
      const modeRootPc = (rootPc + semitones) % 12;
      const modeRootName = spellingDict[modeRootPc];
      if (modeRootName) {
        SCALE_SPELLINGS[`${modeRootName}:${modeName}`] = spellingDict;
      }
    });
  }
});

// --- Dibujos / Patrones Geométricos ---
const SHAPES_CONFIG = {
  "s1": {
    "name": "Dibujo 1",
    "ref_string": 0,
    "start_offset": 1,
    "patterns": {
      0: [0, 1, 3], 1: [0, 1, 3], 2: [0, 2, 3],
      3: [0, 2, 3], 4: [0, 1, 3], 5: [0, 1, 3]
    }
  },
  "s2": {
    "name": "Dibujo 2",
    "ref_string": 2,
    "start_offset": 0,
    "patterns": {
      0: [0, 2, 3], 1: [0, 2], 2: [-1, 0, 2],
      3: [-1, 0, 2], 4: [0, 2, 3], 5: [0, 2, 3]
    }
  },
  "s3": {
    "name": "Dibujo 3",
    "ref_string": 1,
    "start_offset": 3,
    "patterns": {
      0: [0, 1, 3], 1: [0, 2, 3], 2: [0, 2, 3],
      3: [0, 2], 4: [0, 1, 3], 5: [0, 1, 3]
    }
  },
  "s4": {
    "name": "Dibujo 4",
    "ref_string": 1,
    "start_offset": 0,
    "patterns": {
      0: [0, 2], 1: [-1, 0, 2], 2: [-1, 0, 2],
      3: [-1, 1, 2], 4: [0, 2, 3], 5: [0, 2]
    }
  },
  "s5": {
    "name": "Dibujo 5",
    "ref_string": 0,
    "start_offset": 0,
    "patterns": {
      0: [-3, -1, 0], 1: [-3, -1, 0], 2: [-3, -1],
      3: [-4, -3, -1], 4: [-3, -2, 0], 5: [-3, -1, 0]
    }
  }
};

const SHAPES_SELECT = [
  { id: "all", name: "Todos" },
  { id: "s1", name: "Dibujo 1" },
  { id: "s2", name: "Dibujo 2" },
  { id: "s3", name: "Dibujo 3" },
  { id: "s4", name: "Dibujo 4" },
  { id: "s5", name: "Dibujo 5" }
];

// GLOBAL DATA
let currentScaleNotes = new Set(); // Stores "stringIndex:fret"
let currentRootNotes = new Set();  // Stores "stringIndex:fret" for roots
let noteNamesMap = new Map();

// Referencias a elementos del DOM
const grid = document.getElementById("grid");
const rootSelect = document.getElementById("rootSelect");
const shapeSelect = document.getElementById("shapeSelect");
const scaleSelect = document.getElementById("scaleSelect");

// 2) Lógica Musical (Migrada de Backend)

function getScaleNotes(rootName, scaleType, drawingId = "all") {
  if (!(rootName in NOTE_TO_PC)) return [];

  const scaleIntervals = SCALES_CONFIG[scaleType] || SCALES_CONFIG["major"];
  const rootPc = NOTE_TO_PC[rootName];
  const spellingMap = SCALE_SPELLINGS[`${rootName}:${scaleType}`];
  const fallbackNames = PC_TO_SHARP;

  // Caso: Filtrado por Dibujo Geométrico
  if (drawingId !== "all" && SHAPES_CONFIG[drawingId]) {
    const shape = SHAPES_CONFIG[drawingId];
    const anchorPc = (rootPc + (RELATIVE_MAJOR_OFFSET[scaleType] || 0)) % 12;
    const refString = shape.ref_string;
    const openPc = OPEN_STRING_PC[refString];

    let minRelFret = 0;
    Object.values(shape.patterns).forEach(relFrets => {
      if (relFrets.length) minRelFret = Math.min(minRelFret, Math.min(...relFrets));
    });

    let tonicFret = null;
    for (let f = 0; f < 21; f++) {
      if ((openPc + f) % 12 === anchorPc) {
        if ((f - shape.start_offset + minRelFret) >= 0) {
          tonicFret = f;
          break;
        }
      }
    }

    if (tonicFret === null) return [];

    const startFret = tonicFret - shape.start_offset;
    const drawingPositions = [];

    Object.entries(shape.patterns).forEach(([sIdxStr, relativeFrets]) => {
      const sIdx = Number(sIdxStr);
      relativeFrets.forEach(fOff => {
        const targetFret = startFret + fOff;
        if (targetFret >= 0 && targetFret <= 20) {
          const currentPc = (OPEN_STRING_PC[sIdx] + targetFret) % 12;
          const interval = (currentPc - rootPc + 12) % 12;
          if (scaleIntervals.has(interval)) {
            const noteName = (spellingMap && spellingMap[currentPc]) ? spellingMap[currentPc] : fallbackNames[currentPc];
            drawingPositions.push({
              string: sIdx,
              fret: targetFret,
              is_root: (currentPc === rootPc),
              note_name: noteName
            });
          }
        }
      });
    });
    return drawingPositions;
  }

  // Caso: Todo el mástil
  const validPositions = [];
  for (let sIdx = 0; sIdx < 6; sIdx++) {
    const openPc = OPEN_STRING_PC[sIdx];
    for (let fret = 0; fret < 21; fret++) {
      const currentPc = (openPc + fret) % 12;
      const interval = (currentPc - rootPc + 12) % 12;
      if (scaleIntervals.has(interval)) {
        const noteName = (spellingMap && spellingMap[currentPc]) ? spellingMap[currentPc] : fallbackNames[currentPc];
        validPositions.push({
          string: sIdx,
          fret: fret,
          is_root: (currentPc === rootPc),
          note_name: noteName
        });
      }
    }
  }
  return validPositions;
}

function pcToNameFallback(pc, rootName, selectedScale) {
  const preferFlats = (FLAT_KEYS.has(selectedScale === "minor" ? rootName + "m" : rootName) || rootName.includes("b"));
  return preferFlats ? PC_TO_FLAT[pc] : PC_TO_SHARP[pc];
}

let selectedScale = "";
let selectedShapeId = "all";

// Inicializar Selectores
NOTE_NAMES.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n; opt.textContent = n;
  rootSelect.appendChild(opt);
});

SHAPES_SELECT.forEach(s => {
  const opt = document.createElement("option");
  opt.value = s.id; opt.textContent = s.name;
  shapeSelect.appendChild(opt);
});

// 4) Aplicación de Escalas (Locales)

function fetchScaleData(rootName, scaleType, drawingId = "all") {
  // Ahora es sincrono y local
  const positions = getScaleNotes(rootName, scaleType, drawingId);

  currentScaleNotes.clear();
  currentRootNotes.clear();
  noteNamesMap.clear();

  positions.forEach(pos => {
    const key = `${pos.string}:${pos.fret}`;
    currentScaleNotes.add(key);
    if (pos.is_root) currentRootNotes.add(key);
    if (pos.note_name) noteNamesMap.set(key, pos.note_name);
  });
}

// 5) Renderizado del Diapasón y UI

function renderBoard() {
  grid.innerHTML = "";

  grid.appendChild(makeDiv("fret-label", ""));
  grid.appendChild(makeDiv("fret-label", "0"));
  frets.forEach(f => grid.appendChild(makeDiv("fret-label", f)));

  const STRING_ORDER = [5, 4, 3, 2, 1, 0];
  const stringsLayer = document.getElementById("strings");
  stringsLayer.innerHTML = "";

  STRING_ORDER.forEach((stringIndex) => {
    grid.appendChild(makeDiv("string-label", strings[stringIndex]));
    grid.appendChild(createCell(stringIndex, 0, true));
    frets.forEach(fret => {
      grid.appendChild(createCell(stringIndex, fret, false));
    });

    const sLine = document.createElement("div");
    sLine.className = "string-line";
    sLine.dataset.string = stringIndex;
    stringsLayer.appendChild(sLine);
  });

  renderInlays();
}

function createCell(stringIndex, fret, isOpen) {
  const cell = document.createElement("div");
  cell.className = isOpen ? "cell open" : "cell";
  cell.dataset.stringIndex = stringIndex;
  cell.dataset.fret = fret;

  const noteEl = document.createElement("div");
  noteEl.className = "note";
  cell.appendChild(noteEl);

  cell.addEventListener("click", () => {
    cell.classList.toggle("on");
    playNote(stringIndex, fret);
  });
  return cell;
}

function renderInlays() {
  const inlaysLayer = document.getElementById("inlays");
  if (!inlaysLayer) return;
  inlaysLayer.innerHTML = "";
  const inlayTrastes = [3, 5, 7, 9, 12, 15, 17, 19];
  for (let f = 1; f <= 20; f++) {
    const pos = document.createElement("div");
    pos.className = "inlay-pos";
    if (inlayTrastes.includes(f)) {
      if (f === 12) {
        pos.classList.add("double");
        pos.innerHTML = '<div class="inlay-dot"></div><div class="inlay-dot"></div>';
      } else {
        pos.innerHTML = '<div class="inlay-dot"></div>';
      }
    }
    inlaysLayer.appendChild(pos);
  }
}

function renderMarkers() {
  const markersContainer = document.getElementById("markers");
  if (!markersContainer) return;
  markersContainer.innerHTML = "";
}

function refreshNoteLabels() {
  const rootName = rootSelect.value;
  const scale = selectedScale || "major";
  document.querySelectorAll(".cell").forEach(cell => {
    const stringIndex = Number(cell.dataset.stringIndex);
    const fret = Number(cell.dataset.fret);
    const pc = (OPEN_STRING_PC[stringIndex] + fret) % 12;
    const noteEl = cell.querySelector(".note");
    // Fallback simple si no hay escala
    if (noteEl) noteEl.textContent = pcToNameFallback(pc, rootName, scale);
  });
}

function updateAndApply() {
  if (selectedScale) {
    fetchScaleData(rootSelect.value, selectedScale, selectedShapeId);
  } else {
    currentScaleNotes.clear();
    currentRootNotes.clear();
  }
  applyScaleHighlight();
}

function applyScaleHighlight() {
  document.querySelectorAll(".cell.scale, .cell.root").forEach(el => el.classList.remove("scale", "root"));
  if (!selectedScale) return;

  currentScaleNotes.forEach(key => {
    const [sStr, fStr] = key.split(":");
    const sIdx = Number(sStr);
    const fret = Number(fStr);

    const cell = document.querySelector(`.cell[data-string-index="${sIdx}"][data-fret="${fret}"]`);
    if (cell) {
      cell.classList.add("scale");
      if (currentRootNotes.has(key)) cell.classList.add("root");

      if (noteNamesMap.has(key)) {
        const noteEl = cell.querySelector(".note");
        if (noteEl) noteEl.textContent = noteNamesMap.get(key);
      }
    }
  });
}

// 6) Manejo de Eventos

rootSelect.addEventListener("change", () => { refreshNoteLabels(); updateAndApply(); });
shapeSelect.addEventListener("change", () => { selectedShapeId = shapeSelect.value; updateAndApply(); });

scaleSelect.addEventListener("change", () => {
  selectedScale = scaleSelect.value;
  updateUI();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelectorAll(".cell.on, .cell.scale, .cell.root").forEach(el => el.classList.remove("on", "scale", "root"));
  selectedScale = "";
  scaleSelect.value = "";
  currentScaleNotes.clear();
  currentRootNotes.clear();
  noteNamesMap.clear();
  refreshNoteLabels();
  updateUIButtons();
});

function updateUI() {
  updateUIButtons();
  refreshNoteLabels();
  updateAndApply();
}

function updateUIButtons() {
  scaleSelect.value = selectedScale;
}

function makeDiv(cls, text) { const d = document.createElement("div"); d.className = cls; d.textContent = text; return d; }

// 7) Herramientas: Metrónomo y Modo Práctica

let audioCtx;
let metroInterval;
let metroRunning = false;
let currentBeat = 0;

document.getElementById("metroToggle").addEventListener("click", () => {
  if (metroRunning) {
    clearInterval(metroInterval);
    metroRunning = false;
    document.getElementById("metroToggle").textContent = "▶️ Metrónomo";
    currentBeat = 0;
  } else {
    startMetro();
  }
});

function startMetro() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bpm = document.getElementById("bpmInput").value;
  const ms = 60000 / bpm;
  currentBeat = 0;
  runClickLogic();
  metroInterval = setInterval(runClickLogic, ms);
  metroRunning = true;
  document.getElementById("metroToggle").textContent = "⏸ Metrónomo";
}

function runClickLogic() {
  const isAccent = (currentBeat === 0);
  const led = document.getElementById("metroVisual");
  if (led) {
    led.classList.remove("flash", "accent");
    void led.offsetWidth;
    led.classList.add("flash");
    if (isAccent) led.classList.add("accent");
    setTimeout(() => led.classList.remove("flash", "accent"), 150);
  }
  if (document.getElementById("metroSound").checked) {
    playClick(isAccent);
  }
  currentBeat = (currentBeat + 1) % 4;
}

function playClick(isAccent) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.type = "sine";
  if (isAccent) {
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  } else {
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  }
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

// Práctica
let practiceInterval;
let practiceRunning = false;
let practiceSequence = [];
let practiceIndex = 0;

document.getElementById("practiceBtn").addEventListener("click", () => {
  if (practiceRunning) {
    stopPractice();
  } else {
    startPractice();
  }
});

function stopPractice() {
  clearInterval(practiceInterval);
  practiceRunning = false;
  document.getElementById("practiceBtn").textContent = "🎓 Practicar Escala";
  document.querySelectorAll(".cell.active-practice").forEach(el => el.classList.remove("active-practice"));
}

function startPractice() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const cells = Array.from(document.querySelectorAll(".cell.scale, .cell.root"));
  if (cells.length === 0) {
    alert("Primero selecciona una escala y tónica.");
    return;
  }
  const STRING_OFFSETS = { 0: 0, 1: 5, 2: 10, 3: 15, 4: 19, 5: 24 };
  practiceSequence = cells.map(cell => {
    const sIdx = Number(cell.dataset.stringIndex);
    const fret = Number(cell.dataset.fret);
    const pitchVal = STRING_OFFSETS[sIdx] + fret;
    return { cell, sIdx, fret, pitchVal };
  });
  practiceSequence.sort((a, b) => {
    if (a.sIdx !== b.sIdx) return a.sIdx - b.sIdx;
    return a.fret - b.fret;
  });
  if (practiceSequence.length === 0) return;
  const descendingPart = [...practiceSequence].reverse().slice(1, -1);
  practiceSequence = practiceSequence.concat(descendingPart);
  practiceIndex = 0;
  const bpm = document.getElementById("bpmInput").value;
  const ms = 60000 / bpm;
  practiceRunning = true;
  document.getElementById("practiceBtn").textContent = "⏹ Detener Práctica";
  runPracticeTick();
  practiceInterval = setInterval(runPracticeTick, ms);
}

function runPracticeTick() {
  document.querySelectorAll(".cell.active-practice").forEach(el => el.classList.remove("active-practice"));
  const item = practiceSequence[practiceIndex];
  item.cell.classList.add("active-practice");
  if (document.getElementById("metroSound").checked) {
    playNote(item.sIdx, item.fret);
  }
  practiceIndex = (practiceIndex + 1) % practiceSequence.length;
}

function playNote(stringIndex, fret) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const STRING_OFFSETS = { 0: 0, 1: 5, 2: 10, 3: 15, 4: 19, 5: 24 };
  const semitones = STRING_OFFSETS[stringIndex] + fret;
  const freq = 82.41 * Math.pow(2, semitones / 12);
  const cell = document.querySelector(`.cell[data-string-index="${stringIndex}"][data-fret="${fret}"]`);
  if (cell) {
    cell.classList.remove("playing");
    void cell.offsetWidth;
    cell.classList.add("playing");
    setTimeout(() => cell.classList.remove("playing"), 400);
  }
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.6);
}

renderBoard();
renderMarkers();
refreshNoteLabels();

// 8) Modal Cafecito
const cafecitoBtn = document.getElementById("cafecitoBtn");
const cafecitoModal = document.getElementById("cafecitoModal");
const closeBtn = document.querySelector(".close-btn");
if (cafecitoBtn && cafecitoModal) {
  cafecitoBtn.addEventListener("click", () => {
    cafecitoModal.style.display = "grid";
  });
  closeBtn.addEventListener("click", () => {
    cafecitoModal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === cafecitoModal) {
      cafecitoModal.style.display = "none";
    }
  });
}