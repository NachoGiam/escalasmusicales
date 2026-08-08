/**
 * Lógica del Afinador de Guitarra
 * Utiliza Web Audio API y el algoritmo de autocorrelación para detectar la frecuencia.
 */

const tunerStartBtn = document.getElementById('tunerStartBtn');
const tunerStatus = document.getElementById('tunerStatus');
const tunerNoteName = document.getElementById('tunerNoteName');
const tunerOctave = document.getElementById('tunerOctave');
const tunerCentsValue = document.getElementById('tunerCentsValue');
const tunerNeedle = document.getElementById('tunerNeedle');

let audioContext;
let analyser;
let microphone;
let isTuning = false;
let animationId;

// Notas musicales estándar
const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Afinación estándar de guitarra (frecuencias aproximadas de referencia)
const standardTuning = [
    { note: "E", octave: 2, id: "peg-E2" },
    { note: "A", octave: 2, id: "peg-A2" },
    { note: "D", octave: 3, id: "peg-D3" },
    { note: "G", octave: 3, id: "peg-G3" },
    { note: "B", octave: 3, id: "peg-B3" },
    { note: "E", octave: 4, id: "peg-E4" }
];

function noteFromPitch(frequency) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
    return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
}

// Algoritmo de autocorrelación para encontrar el "pitch" fundamental
function autoCorrelate(buf, sampleRate) {
    // Implements the ACF2+ algorithm
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        let val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) // Not enough signal
        return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function updatePitch() {
    let buf = new Float32Array(2048);
    analyser.getFloatTimeDomainData(buf);
    let ac = autoCorrelate(buf, audioContext.sampleRate);

    if (ac !== -1) {
        let pitch = ac;
        let note = noteFromPitch(pitch);
        let noteName = noteStrings[note % 12];
        let octave = Math.floor(note / 12) - 1;
        let cents = centsOffFromPitch(pitch, note);

        // Actualizar UI - Nombre de nota y centésimas
        tunerNoteName.textContent = noteName;
        tunerOctave.textContent = octave;
        tunerCentsValue.textContent = cents > 0 ? "+" + cents : cents;

        // Animar aguja (-50 a +50 cents -> -60deg a +60deg aprox para visual)
        let rotation = Math.max(-50, Math.min(50, cents)); 
        let degrees = (rotation / 50) * 60; 
        
        tunerNeedle.style.transform = `translateX(-50%) rotate(${degrees}deg)`;

        // Cambiar color si está afinado (tolerancia de +/- 5 cents)
        if (Math.abs(cents) < 5) {
            tunerNeedle.classList.add('in-tune');
        } else {
            tunerNeedle.classList.remove('in-tune');
        }

        // Iluminar peg si corresponde a afinación estándar de guitarra
        document.querySelectorAll('.tuning-peg').forEach(peg => {
            peg.classList.remove('active-peg', 'in-tune-peg');
        });

        const matchedPeg = standardTuning.find(p => p.note === noteName && p.octave === octave);
        if (matchedPeg) {
            const pegEl = document.getElementById(matchedPeg.id);
            if (pegEl) {
                pegEl.classList.add('active-peg');
                if (Math.abs(cents) < 5) {
                    pegEl.classList.add('in-tune-peg');
                }
            }
        }

    } else {
        // No signal
        // tunerNeedle.style.transform = `translateX(-50%) rotate(0deg)`; // Opcional volver al centro
    }

    if (!isTuning) return;
    animationId = requestAnimationFrame(updatePitch);
}

async function startTuner() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        microphone.connect(analyser);
        
        isTuning = true;
        tunerStartBtn.innerHTML = '⏹️ Detener Afinador';
        tunerStartBtn.classList.add('active');
        tunerStatus.textContent = 'Escuchando...';
        tunerStatus.classList.add('active');
        
        updatePitch();
    } catch (err) {
        console.error('Error al acceder al micrófono:', err);
        alert('No se pudo acceder al micrófono. Por favor, revisá los permisos de tu navegador.');
    }
}

function stopTuner() {
    isTuning = false;
    cancelAnimationFrame(animationId);
    
    if (audioContext) {
        audioContext.close();
    }
    
    tunerStartBtn.innerHTML = '🎙️ Activar Micrófono';
    tunerStartBtn.classList.remove('active');
    tunerStatus.textContent = 'Apagado';
    tunerStatus.classList.remove('active');
    tunerNeedle.style.transform = `translateX(-50%) rotate(0deg)`;
    tunerNeedle.classList.remove('in-tune');
    tunerNoteName.textContent = '-';
    tunerOctave.textContent = '';
    tunerCentsValue.textContent = '0';
    
    document.querySelectorAll('.tuning-peg').forEach(peg => {
        peg.classList.remove('active-peg', 'in-tune-peg');
    });
}

tunerStartBtn.addEventListener('click', () => {
    if (isTuning) {
        stopTuner();
    } else {
        startTuner();
    }
});

// Detener el afinador si se cambia de pestaña para no gastar recursos
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab !== 'tab-tuner' && isTuning) {
            stopTuner();
        }
    });
});
