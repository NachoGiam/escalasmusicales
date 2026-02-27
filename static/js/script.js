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

const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4];

// Tonalidades que siempre usan bemoles
const FLAT_KEYS = new Set([
  "F", "Bb", "Eb", "Ab", "Db", "Gb",
  "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"
]);

// Mapeos específicos para evitar repetir letras 
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

// GLOBAL DATA
let currentScaleNotes = new Set(); // Stores "stringIndex:fret"
let currentRootNotes = new Set();  // Stores "stringIndex:fret" for roots
let noteNamesMap = new Map(); // Mapa para traducir posiciones a nombres de notas específicos

// Referencias a elementos del DOM
const grid = document.getElementById("grid");
const rootSelect = document.getElementById("rootSelect");
const shapeSelect = document.getElementById("shapeSelect");
const scaleSelect = document.getElementById("scaleSelect");

// 2) Lógica de Nombres de Notas
// Funciones auxiliares para decidir si usar sostenidos (#) o bemoles (b).

function shouldUseFlats(rootName, selectedScale) {
  const keyName = selectedScale === "minor" ? rootName + "m" : rootName;
  if (FLAT_KEYS.has(keyName) || rootName.includes("b")) return true;
  return false;
}

function pcToName(pc, rootName, selectedScale) {
  // ESTA FUNCION YA NO SE DEBERÍA USAR SI TENEMOS DATOS DEL BACKEND
  // PERO LA DEJAMOS COMO FALLBACK PARA CUANDO NO HAY ESCALA SELECCIONADA
  if (KEY_NAME_MAPS[rootName]) {
    const scaleNotes = KEY_NAME_MAPS[rootName];
    for (let name of scaleNotes) {
      if (NOTE_TO_PC[name] === pc) return name;
    }
  }
  const preferFlats = shouldUseFlats(rootName, selectedScale);
  return preferFlats ? PC_TO_FLAT[pc] : PC_TO_SHARP[pc];
}

// 3) Shapes / Dibujos del Sistema CAGED
// Lógica para filtrar escalas por patrones físicos en el diapasón.

const SHAPES = [
  {
    id: "all",
    name: "Todos",
    type: "range",
    from: 0,
    to: 20
  },
  {
    id: "s1",
    name: "Dibujo 1",
    type: "pattern",
    rootString: 0, // C6
    offsets: {
      major: [
        { s: 0, f: 0 }, { s: 0, f: 2 }, { s: 0, f: 4 }, // C6
        { s: 1, f: 0 }, { s: 1, f: 2 }, { s: 1, f: 4 }, // C5
        { s: 2, f: 1 }, { s: 2, f: 2 }, { s: 2, f: 4 }, // C4
        { s: 3, f: 1 }, { s: 3, f: 2 }, { s: 3, f: 4 }, // C3
        { s: 4, f: 0 }, { s: 4, f: 2 }, { s: 4, f: 4 }, // C2
        { s: 5, f: 0 }, { s: 5, f: 2 }, { s: 5, f: 4 }  // C1
      ]
    }
  },
  {
    id: "s2",
    name: "Dibujo 2",
    type: "pattern",
    rootString: 2, // C4
    offsets: {
      major: [
        { s: 2, f: 0 }, { s: 2, f: 2 }, { s: 2, f: 4 }, // C4
        { s: 3, f: 0 }, { s: 3, f: 2 }, { s: 3, f: 4 }, // C3
        { s: 4, f: 1 }, { s: 4, f: 2 }, { s: 4, f: 4 }, // C2
        { s: 5, f: 0 }, { s: 5, f: 2 }, { s: 5, f: 4 }, // C1
        { s: 0, f: 0 }, { s: 0, f: 2 }, { s: 0, f: 4 }, // C6
        { s: 1, f: 0 }, { s: 1, f: 2 }, { s: 1, f: 4 }  // C5
      ]
    }
  },
  {
    id: "s3",
    name: "Dibujo 3",
    type: "pattern",
    rootString: 1, // C5
    offsets: {
      major: [
        { s: 1, f: 0 }, { s: 1, f: 2 }, { s: 1, f: 3 }, // C5
        { s: 2, f: 0 }, { s: 2, f: 2 }, { s: 2, f: 3 }, // C4
        { s: 3, f: 0 }, { s: 3, f: 2 },                // C3
        { s: 4, f: 0 }, { s: 4, f: 1 }, { s: 4, f: 3 }, // C2
        { s: 5, f: 0 }, { s: 5, f: 2 }, { s: 5, f: 3 }, // C1
        { s: 0, f: 0 }, { s: 0, f: 2 }, { s: 0, f: 3 }  // C6
      ]
    }
  },
  {
    id: "s4",
    name: "Dibujo 4",
    type: "pattern",
    rootString: 1, // C5
    offsets: {
      major: [
        { s: 1, f: 0 }, { s: 1, f: 2 }, { s: 1, f: 4 }, // C5
        { s: 2, f: 0 }, { s: 2, f: 2 }, { s: 2, f: 4 }, // C4
        { s: 3, f: 0 }, { s: 3, f: 2 },                // C3
        { s: 4, f: 0 }, { s: 4, f: 2 }, { s: 4, f: 3 }, // C2
        { s: 5, f: 0 }, { s: 5, f: 2 }, { s: 5, f: 4 }, // C1
        { s: 0, f: 0 }, { s: 0, f: 2 }, { s: 0, f: 4 }  // C6
      ]
    }
  },
  {
    id: "s5",
    name: "Dibujo 5",
    type: "pattern",
    rootString: 1, // C5
    offsets: {
      major: [
        { s: 1, f: 0 }, { s: 1, f: 2 }, { s: 1, f: 4 }, // C5
        { s: 2, f: 0 }, { s: 2, f: 2 }, { s: 2, f: 4 }, // C4
        { s: 3, f: 1 }, { s: 3, f: 2 }, { s: 3, f: 4 }, // C3
        { s: 4, f: 2 }, { s: 4, f: 3 }, { s: 4, f: 5 }, // C2
        { s: 5, f: 2 }, { s: 5, f: 4 }, { s: 5, f: 5 }, // C1
        { s: 0, f: 0 }, { s: 0, f: 2 }, { s: 0, f: 4 }  // C6
      ]
    }
  }
];

let selectedScale = "";
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

// La variable scaleSelect ya fue declarada en la sección de 'Datos Globales'.

// 4) Comunicación con el Backend
// Obtiene los datos de las notas de la escala desde la API de Flask.

async function fetchScaleData(rootName, scaleType, drawingId = "all") {
  const safeRoot = rootName.replace('#', 's');
  const url = drawingId === "all"
    ? `/api/escala/${safeRoot}/${scaleType}`
    : `/api/escala/${safeRoot}/${scaleType}/dibujo/${drawingId}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();

    currentScaleNotes.clear();
    currentRootNotes.clear();
    noteNamesMap.clear();

    data.positions.forEach(pos => {
      const key = `${pos.string}:${pos.fret}`;
      currentScaleNotes.add(key);
      if (pos.is_root) currentRootNotes.add(key);
      if (pos.note_name) noteNamesMap.set(key, pos.note_name);
    });

  } catch (err) {
    console.error("Error fetching scale:", err);
    currentScaleNotes.clear();
    currentRootNotes.clear();
    noteNamesMap.clear();
  }
}

// 5) Renderizado del Diapasón y UI
// Genera visualmente los trastes, cuerdas y marcadores de nota.

function renderBoard() {
  grid.innerHTML = "";

  // 1. Fila de etiquetas de trastes
  grid.appendChild(makeDiv("fret-label", "")); // Esquina superior izquierda
  grid.appendChild(makeDiv("fret-label", "0")); // Traste 0
  frets.forEach(f => grid.appendChild(makeDiv("fret-label", f)));

  const STRING_ORDER = [5, 4, 3, 2, 1, 0]; // De e aguda a E grave

  // 2. Generar Capa de Cuerdas y Celdas
  const stringsLayer = document.getElementById("strings");
  stringsLayer.innerHTML = "";

  STRING_ORDER.forEach((stringIndex) => {
    // Agregar etiqueta de cuerda a la grilla
    grid.appendChild(makeDiv("string-label", strings[stringIndex]));

    // Agregar celdas (traste 0 + trastes 1-20)
    grid.appendChild(createCell(stringIndex, 0, true));
    frets.forEach(fret => {
      grid.appendChild(createCell(stringIndex, fret, false));
    });

    // Agregar línea de cuerda a la capa de cuerdas
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
  // Se eliminan los números del traste de la parte inferior a pedido del usuario.
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

async function updateAndApply() {
  if (selectedScale) {
    await fetchScaleData(rootSelect.value, selectedScale, selectedShapeId);
  } else {
    currentScaleNotes.clear();
    currentRootNotes.clear();
  }
  applyScaleHighlight();
}

function applyScaleHighlight() {
  document.querySelectorAll(".cell.scale, .cell.root").forEach(el => el.classList.remove("scale", "root"));
  if (!selectedScale) return;

  // Renderizar lo que el backend devolvió (ya filtrado por dibujo si aplica)
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

// 6) Manejo de Eventos (Interacción del Usuario)
// Detecta cambios en los selectores y clics en los botones.

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
  refreshNoteLabels(); // Reset to default names when cleared
  updateUIButtons();
});

function updateUI() {
  updateUIButtons();
  refreshNoteLabels(); // Set defaults first
  updateAndApply();    // Then fetch and overwrite logic (async)
}

function updateUIButtons() {
  scaleSelect.value = selectedScale;
}

// Helpers
function makeDiv(cls, text) { const d = document.createElement("div"); d.className = cls; d.textContent = text; return d; }
function dotMarker() { const d = document.createElement("div"); d.className = "m"; return d; }
function doubleMarker() { const d = document.createElement("div"); d.className = "m"; return d; }

// 7) Herramientas: Metrónomo y Modo Práctica
// Lógica de sonido (AudioContext) y secuenciador de notas.

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

  runClickLogic(); // Primer beat inmediato
  metroInterval = setInterval(runClickLogic, ms);

  metroRunning = true;
  document.getElementById("metroToggle").textContent = "⏸ Metrónomo";
}

function runClickLogic() {
  const isAccent = (currentBeat === 0);

  // Feedback Visual (LED)
  const led = document.getElementById("metroVisual");
  if (led) {
    led.classList.remove("flash", "accent");
    void led.offsetWidth; // Reflow
    led.classList.add("flash");
    if (isAccent) led.classList.add("accent");

    // El fade out ocurre por CSS transition, pero quitamos las clases pronto
    setTimeout(() => led.classList.remove("flash", "accent"), 150);
  }

  // Audio (condicional)
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
  // Unificamos offsets: 0 es la cuerda más grave (E), 5 la más aguda (e)
  const STRING_OFFSETS = { 0: 0, 1: 5, 2: 10, 3: 15, 4: 19, 5: 24 };

  practiceSequence = cells.map(cell => {
    const sIdx = Number(cell.dataset.stringIndex);
    const fret = Number(cell.dataset.fret);
    const pitchVal = STRING_OFFSETS[sIdx] + fret;
    return { cell, sIdx, fret, pitchVal };
  });

  // 1. Fase Subida: Ordenar (Cuerda 6 a 1, Traste Ascendente)
  practiceSequence.sort((a, b) => {
    if (a.sIdx !== b.sIdx) return a.sIdx - b.sIdx;
    return a.fret - b.fret;
  });

  if (practiceSequence.length === 0) return;

  // 2. Fase Bajada: Invertir y quitar extremos para evitar duplicados en el loop (aguda y grave)
  const descendingPart = [...practiceSequence].reverse().slice(1, -1);

  // 3. Unión: Secuencia Completa
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

  // 0:E grave, 1:A, 2:D, 3:G, 4:B, 5:e agudo
  const STRING_OFFSETS = { 0: 0, 1: 5, 2: 10, 3: 15, 4: 19, 5: 24 };
  const semitones = STRING_OFFSETS[stringIndex] + fret;
  const freq = 82.41 * Math.pow(2, semitones / 12);

  // Feedback Visual: Pulso
  const cell = document.querySelector(`.cell[data-string-index="${stringIndex}"][data-fret="${fret}"]`);
  if (cell) {
    cell.classList.remove("playing");
    void cell.offsetWidth; // Trigger reflow
    cell.classList.add("playing");
    setTimeout(() => cell.classList.remove("playing"), 400);
  }

  // Audio Engine: Sintetizador con Envolvente (ADSR) y Filtro
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, audioCtx.currentTime); // Suaviza el timbre

  const now = audioCtx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02);      // Attack
  gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.15); // Decay
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);// Release (Fade out largo)

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 1.6);
}

renderBoard();
renderMarkers();
refreshNoteLabels();