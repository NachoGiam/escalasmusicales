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

rootSelect.addEventListener("change", () => { updateUI(); });
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
  document.getElementById("practiceBtn").textContent = "🎓 Practicar";
  document.querySelectorAll(".cell.active-practice").forEach(el => el.classList.remove("active-practice"));
}

function startPractice() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const isManualMode = document.getElementById("practiceModeSwitch").checked;
  let cells = [];

  if (isManualMode) {
    cells = Array.from(document.querySelectorAll(".cell.on"));
    if (cells.length === 0) {
      alert("Primero marca algunas notas manualmente (clic en el mástil).");
      return;
    }
  } else {
    cells = Array.from(document.querySelectorAll(".cell.scale, .cell.root"));
    if (cells.length === 0) {
      alert("Primero selecciona una escala y tónica.");
      return;
    }
  }

  // Mapear celdas a objetos con datos necesarios
  practiceSequence = cells.map(cell => {
    return {
      cell: cell,
      sIdx: Number(cell.dataset.stringIndex),
      fret: Number(cell.dataset.fret)
    };
  });

  // Orden: De Abajo (6ta, sIdx 0) hacia Arriba (1ra, sIdx 5)
  // Y de Izquierda (fret 0) hacia Derecha (fret 20)
  practiceSequence.sort((a, b) => {
    if (a.sIdx !== b.sIdx) return a.sIdx - b.sIdx; // 0, 1, 2, 3, 4, 5
    return a.fret - b.fret; // 0, 1, 2...
  });

  if (practiceSequence.length === 0) return;

  // Ida y vuelta
  const descendingPart = [...practiceSequence].reverse().slice(1, -1);
  practiceSequence = practiceSequence.concat(descendingPart);

  practiceIndex = 0;
  const bpm = document.getElementById("bpmInput").value;
  const ms = 60000 / bpm;
  practiceRunning = true;
  document.getElementById("practiceBtn").textContent = "⏹ Detener";
  runPracticeTick();
  practiceInterval = setInterval(runPracticeTick, ms);
}

function runPracticeTick() {
  document.querySelectorAll(".cell.active-practice").forEach(el => el.classList.remove("active-practice"));
  const item = practiceSequence[practiceIndex];
  if (item && item.cell) {
    item.cell.classList.add("active-practice");
    if (document.getElementById("metroSound").checked) {
      playNote(item.sIdx, item.fret);
    }
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

// --- 9) Diatonic Chord Engine ---

const CHORD_LIBRARY = {
  "maj": [
    { name: "E-Shape", rootString: 0, frets: [0, 2, 2, 1, 0, 0] },
    { name: "A-Shape", rootString: 1, frets: [null, 0, 2, 2, 2, 0] }
  ],
  "min": [
    { name: "Em-Shape", rootString: 0, frets: [0, 2, 2, 0, 0, 0] },
    { name: "Am-Shape", rootString: 1, frets: [null, 0, 2, 2, 1, 0] }
  ],
  "dim": [
    { name: "Dim-Shape", rootString: 0, frets: [0, 1, 2, null, null, null] },
    { name: "Dim-Shape", rootString: 1, frets: [null, 0, 1, 2, 1, null] }
  ],
  "maj7": [
    { name: "E-Maj7", rootString: 0, frets: [0, null, 1, 1, 0, null] },
    { name: "A-Maj7", rootString: 1, frets: [null, 0, 2, 1, 2, 0] }
  ],
  "m7": [
    { name: "E-m7", rootString: 0, frets: [0, 2, 0, 0, 0, 0] },
    { name: "A-m7", rootString: 1, frets: [null, 0, 2, 0, 1, 0] }
  ],
  "7": [
    { name: "E-7", rootString: 0, frets: [0, 2, 0, 1, 0, 0] },
    { name: "A-7", rootString: 1, frets: [null, 0, 2, 0, 2, 0] }
  ],
  "m7b5": [
    { name: "m7b5-Shape", rootString: 0, frets: [0, 1, 1, 0, null, null] },
    { name: "m7b5-Shape", rootString: 1, frets: [null, 0, 1, 1, 1, null] }
  ]
};

const DIATONIC_MODES = {
  "major": {
    triads: ["maj", "min", "min", "maj", "maj", "min", "dim"],
    sevenths: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"],
    degrees: ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
  },
  "minor": {
    triads: ["min", "dim", "maj", "min", "min", "maj", "maj"],
    sevenths: ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"],
    degrees: ["i", "ii°", "III", "iv", "v", "VI", "VII"]
  }
};

let chordVariations = {}; // Store current variation index per degree

// --- 9) Diatonic Chord Engine (Floating Pop-up Version) ---

// ... (CHORD_LIBRARY y DIATONIC_MODES se mantienen igual) ...

let currentPopupChord = null; // { degreeIndex, shapeIndex, rootName, fullName, degreeLabel, type }

const chordsListEl = document.getElementById("chords-list");
const chordTypeToggle = document.getElementById("chordTypeToggle");
const chordPopup = document.getElementById("chord-popup");
const popupName = document.getElementById("popup-chord-name");
const popupDegree = document.getElementById("popup-chord-degree");
const popupDiagContainer = document.getElementById("popup-diagram-container");
const popupVarLabel = document.getElementById("popup-var-label");
const popupPrev = document.getElementById("popup-prev");
const popupNext = document.getElementById("popup-next");

if (chordTypeToggle) {
  chordTypeToggle.addEventListener("change", () => {
    closeChordPopup();
    updateChordsPanel();
  });
}

function updateChordsPanel() {
  if (!selectedScale || !DIATONIC_MODES[selectedScale]) {
    chordsListEl.innerHTML = '<div class="no-selection" style="font-size:0.7rem; color:var(--muted); text-align:center;">Selecciona escala</div>';
    return;
  }

  const rootName = rootSelect.value;
  const modeConfig = DIATONIC_MODES[selectedScale];
  const isSevenths = chordTypeToggle.checked;
  const chordTypes = isSevenths ? modeConfig.sevenths : modeConfig.triads;

  const rootPc = NOTE_TO_PC[rootName];
  const scaleIntervals = Array.from(SCALES_CONFIG[selectedScale]).sort((a, b) => a - b);
  const spellingMap = SCALE_SPELLINGS[`${rootName}:${selectedScale}`];

  chordsListEl.innerHTML = "";

  scaleIntervals.forEach((interval, index) => {
    const degreeRootPc = (rootPc + interval) % 12;
    const degreeRootName = (spellingMap && spellingMap[degreeRootPc]) ? spellingMap[degreeRootPc] : PC_TO_SHARP[degreeRootPc];
    const chordTag = chordTypes[index];
    const degreeLabel = modeConfig.degrees[index];

    let chordName = degreeRootName;
    if (chordTag === "min") chordName += "m";
    if (chordTag === "dim") chordName += "°";
    if (chordTag === "maj7") chordName += "Maj7";
    if (chordTag === "m7") chordName += "m7";
    if (chordTag === "7") chordName += "7";
    if (chordTag === "m7b5") chordName += "m7b5";

    renderChordCard(degreeRootName, chordName, degreeLabel, chordTag, index);
  });
}

function renderChordCard(rootName, fullName, degreeLabel, type, index) {
  const card = document.createElement("div");
  card.className = "chord-card";

  card.innerHTML = `
        <div class="chord-info">
            <span class="chord-name">${fullName}</span>
            <span class="chord-degree">${degreeLabel}</span>
        </div>
    `;

  card.addEventListener("click", (e) => {
    e.stopPropagation();
    showChordPopup(card, {
      degreeIndex: index,
      rootName: rootName,
      fullName: fullName,
      degreeLabel: degreeLabel,
      type: type
    });
  });

  chordsListEl.appendChild(card);
}

function showChordPopup(anchorEl, data) {
  // Activar visualmente la tarjeta
  document.querySelectorAll(".chord-card.active").forEach(c => c.classList.remove("active"));
  anchorEl.classList.add("active");

  const degreeIndex = data.degreeIndex;
  if (chordVariations[degreeIndex] === undefined) chordVariations[degreeIndex] = 0;

  const shapes = CHORD_LIBRARY[data.type] || [];
  const currentVarIdx = chordVariations[degreeIndex] % shapes.length;
  const shape = shapes[currentVarIdx];

  // Actualizar contenido del Popup
  popupName.textContent = data.fullName;
  popupDegree.textContent = data.degreeLabel;
  popupVarLabel.textContent = `Var. ${currentVarIdx + 1}`;

  popupDiagContainer.innerHTML = "";
  renderChordDiagram(popupDiagContainer, shape, data.rootName);

  // Posicionamiento
  chordPopup.style.display = "block";
  const rect = anchorEl.getBoundingClientRect();
  const popupRect = chordPopup.getBoundingClientRect();

  // Calcular posición centrada verticalmente respecto a la tarjeta
  // (Top de la tarjeta + mitad de su altura) - mitad de la altura del popup
  let topPos = (rect.top + window.scrollY + rect.height / 2) - (popupRect.height / 2);

  // Evitar que el popup se salga por arriba de la pantalla
  if (topPos < window.scrollY + 10) topPos = window.scrollY + 10;

  chordPopup.style.top = `${topPos}px`;
  chordPopup.style.left = `${rect.left - popupRect.width - 20}px`;

  // Ajustar la flecha para que siempre apunte al centro de la tarjeta clickeada
  const arrow = chordPopup.querySelector(".popup-arrow");
  if (arrow) {
    const arrowTop = (rect.top + window.scrollY + rect.height / 2) - topPos - 7;
    arrow.style.top = `${arrowTop}px`;
  }

  // Guardar estado actual para controles
  currentPopupChord = { ...data, shapeIndex: currentVarIdx };

  // Resaltar en el mástil
  highlightChordOnBoard(shape, data.rootName);
}

function updatePopupContent() {
  if (!currentPopupChord) return;
  const data = currentPopupChord;
  const shapes = CHORD_LIBRARY[data.type] || [];
  const currentVarIdx = chordVariations[data.degreeIndex] % shapes.length;
  const shape = shapes[currentVarIdx];

  popupVarLabel.textContent = `Var. ${currentVarIdx + 1}`;
  popupDiagContainer.innerHTML = "";
  renderChordDiagram(popupDiagContainer, shape, data.rootName);

  currentPopupChord.shapeIndex = currentVarIdx;
  highlightChordOnBoard(shape, data.rootName);
}

popupPrev.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentPopupChord) return;
  const shapes = CHORD_LIBRARY[currentPopupChord.type] || [];
  chordVariations[currentPopupChord.degreeIndex] = (chordVariations[currentPopupChord.degreeIndex] - 1 + shapes.length) % shapes.length;
  updatePopupContent();
});

popupNext.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentPopupChord) return;
  const shapes = CHORD_LIBRARY[currentPopupChord.type] || [];
  chordVariations[currentPopupChord.degreeIndex] = (chordVariations[currentPopupChord.degreeIndex] + 1) % shapes.length;
  updatePopupContent();
});

function closeChordPopup() {
  chordPopup.style.display = "none";
  currentPopupChord = null;
  document.querySelectorAll(".chord-card.active").forEach(c => c.classList.remove("active"));
}

window.addEventListener("click", (e) => {
  if (chordPopup.style.display === "block" && !chordPopup.contains(e.target)) {
    closeChordPopup();
  }
});

function renderChordDiagram(container, shape, rootName) {
  const diag = document.createElement("div");
  diag.className = "chord-diagram";

  let html = `
        <div class="diag-nut"></div>
        <div class="diag-strings">
            ${[0, 1, 2, 3, 4, 5].map(() => '<div class="diag-string"></div>').join('')}
        </div>
        <div class="diag-frets">
            ${[0, 1, 2, 3, 4].map(() => '<div class="diag-fret"></div>').join('')}
        </div>
    `;

  shape.frets.forEach((fretRel, sIdx) => {
    if (fretRel === null) {
      html += `<div class="diag-mute" style="left: ${sIdx * (100 / 5) + 5}px">×</div>`;
    } else if (fretRel === 0) {
      html += `<div class="diag-open" style="left: ${sIdx * (100 / 5) + 5}px"></div>`;
    } else {
      const top = (fretRel - 0.5) * (130 / 5);
      const left = sIdx * (100 / 5) + 5;
      const isRoot = (sIdx === shape.rootString);
      html += `<div class="diag-note ${isRoot ? 'root' : ''}" style="top: ${top}px; left: ${left}px"></div>`;
    }
  });

  diag.innerHTML = html;
  container.appendChild(diag);
}

function highlightChordOnBoard(shape, rootName) {
  const rootPc = NOTE_TO_PC[rootName];
  const refString = shape.rootString;
  const openPc = OPEN_STRING_PC[refString];
  let rootFret = (rootPc - openPc + 12) % 12;

  // Si la tónica está muy baja (ej: traste 1), intentar moverla al traste 13 si es necesario?
  // Por ahora, usamos el traste más bajo posible.

  const notesToHighlight = [];
  shape.frets.forEach((fRel, sIdx) => {
    if (fRel !== null) {
      const absoluteFret = rootFret + fRel;
      if (absoluteFret >= 0 && absoluteFret <= 20) {
        notesToHighlight.push({ string: sIdx, fret: absoluteFret });
      }
    }
  });

  // Limpiar marcas manuales ('on')
  document.querySelectorAll(".cell.on").forEach(el => el.classList.remove("on"));
  notesToHighlight.forEach(n => {
    const cell = document.querySelector(`.cell[data-string-index="${n.string}"][data-fret="${n.fret}"]`);
    if (cell) {
      cell.classList.add("on");
    }
  });

  // Tocar el acorde (arpegio rápido)
  notesToHighlight.forEach((n, i) => {
    setTimeout(() => playNote(n.string, n.fret), i * 50);
  });
}

// Sobrescribir updateUI para incluir el panel de acordes
const oldUpdateUI = updateUI;
updateUI = function () {
  oldUpdateUI();
  updateChordsPanel();
};

// --- Inicialización ---
renderBoard();
renderMarkers();
refreshNoteLabels();
updateChordsPanel();

// 8) Modal Cafecito
const cafecitoBtn = document.getElementById("cafecitoBtn");
const cafecitoModal = document.getElementById("cafecitoModal");
const closeBtn = document.querySelector(".close-btn");
if (cafecitoBtn && cafecitoModal) {
  cafecitoBtn.addEventListener("click", () => {
    cafecitoModal.style.display = "grid";
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      cafecitoModal.style.display = "none";
    });
  }
  window.addEventListener("click", (event) => {
    if (event.target === cafecitoModal) {
      cafecitoModal.style.display = "none";
    }
  });
}
