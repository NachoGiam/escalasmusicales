// =========================
// 1) Datos base
// =========================

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

// 12 Tonalidades sugeridas por el profesor
const NOTE_NAMES = ["C", "G", "D", "A", "E", "B", "F#", "Gb", "Db", "Ab", "Eb", "Bb", "F"];

const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4];
const MAJOR = new Set([0, 2, 4, 5, 7, 9, 11]);
const MINOR_NATURAL = new Set([0, 2, 3, 5, 7, 8, 10]);

// Tonalidades que siempre usan bemoles
const FLAT_KEYS = new Set([
  "F", "Bb", "Eb", "Ab", "Db", "Gb",
  "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"
]);

// Mapeos específicos para evitar repetir letras (Regla del profesor)
const KEY_NAME_MAPS = {
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "Gb": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  "B": ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "Db": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  "Ab": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  "Eb": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  "Bb": ["Bb", "C", "D", "Eb", "F", "G", "A"],
  "F": ["F", "G", "A", "Bb", "C", "D", "E"]
};

// =========================
// 2) Lógica de Nombres (ÚNICA Y CORREGIDA)
// =========================

function shouldUseFlats(rootName, selectedScale) {
  const keyName = selectedScale === "minor" ? rootName + "m" : rootName;
  if (FLAT_KEYS.has(keyName) || rootName.includes("b")) return true;
  return false;
}

function pcToName(pc, rootName, selectedScale) {
  // 1. Prioridad: Mapas teóricos (E#, Cb, etc.)
  if (KEY_NAME_MAPS[rootName]) {
    const scaleNotes = KEY_NAME_MAPS[rootName];
    for (let name of scaleNotes) {
      if (NOTE_TO_PC[name] === pc) return name;
    }
  }
  // 2. Fallback: Lógica estándar
  const preferFlats = shouldUseFlats(rootName, selectedScale);
  return preferFlats ? PC_TO_FLAT[pc] : PC_TO_SHARP[pc];
}

// =========================
// 3) Render y UI
// =========================

const grid = document.getElementById("grid");
const markers = document.getElementById("markers");
const rootSelect = document.getElementById("rootSelect");
const shapeSelect = document.getElementById("shapeSelect");

const SHAPES = [
  { id: "all", name: "Todos" },
  { id: "p1", name: "Dibujo 1", from: 0, to: 4 },
  { id: "p2", name: "Dibujo 2", from: 3, to: 7 },
  { id: "p3", name: "Dibujo 3", from: 5, to: 9 },
  { id: "p4", name: "Dibujo 4", from: 7, to: 11 },
  { id: "p5", name: "Dibujo 5", from: 8, to: 12 },
];

let selectedScale = null;
let selectedShapeId = "all";

// Inicializar Selectores
NOTE_NAMES.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n; opt.textContent = n;
  rootSelect.appendChild(opt);
});

SHAPES.forEach(s => {
  const opt = document.createElement("option");
  opt.value = s.id; opt.textContent = s.name;
  shapeSelect.appendChild(opt);
});

// Dibujar Grilla
function renderBoard() {
  grid.innerHTML = "";
  grid.appendChild(makeDiv("fret-label open", "0"));
  grid.appendChild(makeDiv("fret-label", ""));
  frets.forEach(f => grid.appendChild(makeDiv("fret-label", f)));

  const STRING_ORDER = [5, 4, 3, 2, 1, 0];
  STRING_ORDER.forEach((stringIndex) => {
    const s = strings[stringIndex];

    // Traste 0
    const openCell = createCell(stringIndex, 0, true);
    grid.appendChild(openCell);

    // Etiqueta cuerda
    grid.appendChild(makeDiv("string-label", s));

    // Trastes 1..20
    frets.forEach(fret => {
      grid.appendChild(createCell(stringIndex, fret, false));
    });
  });
}

function createCell(stringIndex, fret, isOpen) {
  const cell = document.createElement("div");
  cell.className = isOpen ? "cell open" : "cell";
  cell.dataset.stringIndex = stringIndex;
  cell.dataset.fret = fret;

  // ESTO ES LO QUE HACE QUE APAREZCA EL PUNTO AL HACER CLICK
  const dot = document.createElement("div");
  dot.className = "dot";
  cell.appendChild(dot);

  const noteEl = document.createElement("div");
  noteEl.className = "note";
  cell.appendChild(noteEl);

  cell.addEventListener("click", () => cell.classList.toggle("on"));
  return cell;
}

function renderMarkers() {
  const markersContainer = document.getElementById("markers");
  if (!markersContainer) return;

  markersContainer.innerHTML = "";

  // 1. Espacio para la columna del traste 0
  markersContainer.appendChild(makeDiv("marker", ""));
  // 2. Espacio para la columna de la letra (E, A, D...)
  markersContainer.appendChild(makeDiv("marker", ""));

  // 3. Generar los puntos para los trastes 1 al 20
  frets.forEach(f => {
    const m = document.createElement("div");
    m.className = "marker";

    if ([3, 5, 7, 9, 15, 17, 19].includes(f)) {
      m.appendChild(dotMarker());
    } else if (f === 12) {
      m.classList.add("double");
      m.appendChild(doubleMarker());
    }
    markersContainer.appendChild(m);
  });
}

function refreshNoteLabels() {
  const rootName = rootSelect.value;
  const scale = selectedScale || "major";
  document.querySelectorAll(".cell").forEach(cell => {
    const stringIndex = Number(cell.dataset.stringIndex);
    const fret = Number(cell.dataset.fret);
    const pc = (OPEN_STRING_PC[stringIndex] + fret) % 12;
    const noteEl = cell.querySelector(".note");
    if (noteEl) noteEl.textContent = pcToName(pc, rootName, scale);
  });
}

function applyScaleHighlight() {
  document.querySelectorAll(".cell.scale, .cell.root").forEach(el => el.classList.remove("scale", "root"));
  if (!selectedScale) return;

  const rootName = rootSelect.value;
  const rootPc = NOTE_TO_PC[rootName];
  const intervals = (selectedScale === "major") ? MAJOR : MINOR_NATURAL;
  const shape = SHAPES.find(s => s.id === selectedShapeId) || SHAPES[0];

  document.querySelectorAll(".cell").forEach(cell => {
    const fret = Number(cell.dataset.fret);
    const sIdx = Number(cell.dataset.stringIndex);
    if (fret !== 0 && shape.id !== "all" && (fret < shape.from || fret > shape.to)) return;

    const notePc = (OPEN_STRING_PC[sIdx] + fret) % 12;
    const rel = (notePc - rootPc + 12) % 12;

    if (intervals.has(rel)) cell.classList.add("scale");
    if (notePc === rootPc) cell.classList.add("root");
  });
}

// =========================
// 4) Eventos y Metrónomo
// =========================

rootSelect.addEventListener("change", () => { refreshNoteLabels(); applyScaleHighlight(); });
shapeSelect.addEventListener("change", () => { selectedShapeId = shapeSelect.value; refreshNoteLabels(); applyScaleHighlight(); });

document.getElementById("majorBtn").addEventListener("click", (e) => {
  selectedScale = (selectedScale === "major") ? null : "major";
  updateUI();
});

document.getElementById("minorBtn").addEventListener("click", (e) => {
  selectedScale = (selectedScale === "minor") ? null : "minor";
  updateUI();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  document.querySelectorAll(".cell.on, .cell.scale, .cell.root").forEach(el => el.classList.remove("on", "scale", "root"));
  selectedScale = null;
  updateUI();
});

function updateUI() {
  document.getElementById("majorBtn").classList.toggle("active", selectedScale === "major");
  document.getElementById("minorBtn").classList.toggle("active", selectedScale === "minor");
  refreshNoteLabels();
  applyScaleHighlight();
}

// Helpers
function makeDiv(cls, text) { const d = document.createElement("div"); d.className = cls; d.textContent = text; return d; }
function dotMarker() { const d = document.createElement("div"); d.className = "m"; return d; }
function doubleMarker() { const d = document.createElement("div"); d.className = "m"; return d; }

// Metrónomo (Mejorado: Sonido suave + Acento en 1)
let audioCtx;
let metroInterval;
let metroRunning = false;
let currentBeat = 0; // 0, 1, 2, 3

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

  currentBeat = 0; // Reseteamos al arrancar

  // Tocamos el primero inmediatamente para que no haya delay
  if (document.getElementById("metroSound").checked) runClickLogic();

  metroInterval = setInterval(() => {
    if (document.getElementById("metroSound").checked) runClickLogic();
  }, ms);

  metroRunning = true;
  document.getElementById("metroToggle").textContent = "⏸ Metrónomo";
}

function runClickLogic() {
  playClick(currentBeat === 0);
  currentBeat = (currentBeat + 1) % 4;
}

function playClick(isAccent) {
  // Crear oscilador y ganancia
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Configurar sonido "amable" (Sine)
  osc.type = "sine";

  // Acento: Tono más agudo (880Hz vs 440Hz) y un poco más fuerte
  if (isAccent) {
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  } else {
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  }

  // Envelope corto (tipo stick/woodblock suave)
  // Baja la ganancia exponencialmente rápido
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

// Al final del archivo script.js
renderBoard();    // Dibuja las cuerdas y trastes
renderMarkers();  // Dibuja los puntos guía (3, 5, 7...)
refreshNoteLabels(); // Pone los nombres de las notas