from flask import Flask, render_template

# Creamos la aplicación
app = Flask(__name__)

# --- Lógica de Música (Backend) ---

# Mapeo de Notas a Pitch Class (0-11)
NOTE_TO_PC = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
    "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
}

# Intervalos de escalas (Semitonos desde la tónica)
SCALES = {
    "major": {0, 2, 4, 5, 7, 9, 11},
    "minor": {0, 2, 3, 5, 7, 8, 10}  # Menor Natural
}

# Diccionario de Nombres Correctos (Spelling)
# Mapea (Tónica, TipoEscala, PitchClass) -> NombreNota
# Se define explícitamente para garantizar teoría correcta (ej: Gb vs F#)
SCALE_SPELLINGS = {
    # --- MAYORES ---
    ("C", "major"):  {0: "C", 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 11: "B"},
    ("G", "major"):  {7: "G", 9: "A", 11: "B", 0: "C", 2: "D", 4: "E", 6: "F#"},
    ("D", "major"):  {2: "D", 4: "E", 6: "F#", 7: "G", 9: "A", 11: "B", 1: "C#"},
    ("A", "major"):  {9: "A", 11: "B", 1: "C#", 2: "D", 4: "E", 6: "F#", 8: "G#"},
    ("E", "major"):  {4: "E", 6: "F#", 8: "G#", 9: "A", 11: "B", 1: "C#", 3: "D#"},
    ("B", "major"):  {11: "B", 1: "C#", 3: "D#", 4: "E", 6: "F#", 8: "G#", 10: "A#"},
    ("F#", "major"): {6: "F#", 8: "G#", 10: "A#", 11: "B", 1: "C#", 3: "D#", 5: "E#"}, # E# es F(5)
    ("Gb", "major"): {6: "Gb", 8: "Ab", 10: "Bb", 11: "Cb", 1: "Db", 3: "Eb", 5: "F"}, # Cb es B(11)

    ("Db", "major"): {1: "Db", 3: "Eb", 5: "F", 6: "Gb", 8: "Ab", 10: "Bb", 0: "C"},
    ("Ab", "major"): {8: "Ab", 10: "Bb", 0: "C", 1: "Db", 3: "Eb", 5: "F", 7: "G"},
    ("Eb", "major"): {3: "Eb", 5: "F", 7: "G", 8: "Ab", 10: "Bb", 0: "C", 2: "D"},
    ("Bb", "major"): {10: "Bb", 0: "C", 2: "D", 3: "Eb", 5: "F", 7: "G", 9: "A"},
    ("F", "major"):  {5: "F", 7: "G", 9: "A", 10: "Bb", 0: "C", 2: "D", 4: "E"},

    # --- MENORES (Naturales) ---
    ("A", "minor"):  {9: "A", 11: "B", 0: "C", 2: "D", 4: "E", 5: "F", 7: "G"},
    ("E", "minor"):  {4: "E", 6: "F#", 7: "G", 9: "A", 11: "B", 0: "C", 2: "D"},
    ("B", "minor"):  {11: "B", 1: "C#", 2: "D", 4: "E", 6: "F#", 7: "G", 9: "A"},
    ("F#", "minor"): {6: "F#", 8: "G#", 9: "A", 11: "B", 1: "C#", 2: "D", 4: "E"},
    ("C#", "minor"): {1: "C#", 3: "D#", 4: "E", 6: "F#", 8: "G#", 9: "A", 11: "B"},
    ("G#", "minor"): {8: "G#", 10: "A#", 11: "B", 1: "C#", 3: "D#", 4: "E", 6: "F#"},
    
    ("Eb", "minor"): {3: "Eb", 5: "F", 6: "Gb", 8: "Ab", 10: "Bb", 11: "Cb", 1: "Db"},
    ("Bb", "minor"): {10: "Bb", 0: "C", 1: "Db", 3: "Eb", 5: "F", 6: "Gb", 8: "Ab"},
    ("F", "minor"):  {5: "F", 7: "G", 8: "Ab", 10: "Bb", 0: "C", 1: "Db", 3: "Eb"},
    ("C", "minor"):  {0: "C", 2: "D", 3: "Eb", 5: "F", 7: "G", 8: "Ab", 10: "Bb"},
    ("G", "minor"):  {7: "G", 9: "A", 10: "Bb", 0: "C", 2: "D", 3: "Eb", 5: "F"},
    ("D", "minor"):  {2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 10: "Bb", 0: "C"},
}


# Afinación Estándar (Pitch Class de cuerdas al aire)
OPEN_STRING_PCS = [4, 9, 2, 7, 11, 4] # Indices: 0=E, 1=A, 2=D, 3=G, 4=B, 5=e

# --- Dibujos / Patrones Geométricos (Bloques Dinámicos) ---
# ref_string: Cuerda para buscar la tónica
# start_offset: Cuánto restar al traste de la tónica para hallar el Traste_Inicio
# patterns: Mapas de trastes relativos por cuerda (Índice 0=E grave ... 5=e aguda)
SHAPES = {
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
            0: [0, 2, 3],  # C6: [TI, TI+2, TI+3]
            1: [0, 2],     # C5: [TI, TI+2]
            2: [-1, 0, 2], # C4: [TI-1, TI, TI+2]
            3: [-1, 0, 2], # C3: [TI-1, TI, TI+2]
            4: [0, 2, 3],  # C2: [TI, TI+2, TI+3]
            5: [0, 2, 3]   # C1: [TI, TI+2, TI+3]
        }
    },
    "s3": {
        "name": "Dibujo 3",
        "ref_string": 1,
        "start_offset": 3,
        "patterns": {
            0: [0, 1, 3], # C6: [E, F, G] en DO traste 12
            1: [0, 2, 3], # C5: [A, B, C]
            2: [0, 2, 3], # C4: [D, E, F]
            3: [0, 2],    # C3: [G, A]
            4: [0, 1, 3], # C2: [B, C, D]
            5: [0, 1, 3]  # C1: [E, F, G]
        }
    },
    "s4": {
        "name": "Dibujo 4",
        "ref_string": 1,
        "start_offset": 0,
        "patterns": {
            0: [0, 2],     # C6: [T, +2]
            1: [-1, 0, 2], # C5: [-1, T, +2]
            2: [-1, 0, 2], # C4: [-1, T, +2]
            3: [-1, 1, 2], # C3: [-2, T, +1] (Semítonos relativos ajustados)
            4: [0, 2, 3],  # C2: [+2, +4, +5]
            5: [0, 2]      # C1: [+7, +9]
        }
    },
    "s5": {
        "name": "Dibujo 5",
        "ref_string": 0,
        "start_offset": 0,
        "patterns": {
            0: [-3, -1, 0], # C6: [E, F#, G] en G traste 15
            1: [-3, -1, 0], # C5: [A, B, C]
            2: [-3, -1],    # C4: [D, E]
            3: [-4, -3, -1],# C3: [F#, G, A] (Agregado -4 para el F#)
            4: [-3, -2, 0], # C2: [B, C, D]
            5: [-3, -1, 0]  # C1: [E, F#, G]
        }
    }
}


def get_scale_notes(root_name, scale_type, drawing_id=None):
    """
    Calcula las posiciones basadas en bloques geométricos si se pasa drawing_id.
    """
    if root_name not in NOTE_TO_PC:
        return []
    
    scale_intervals = SCALES.get(scale_type, SCALES["major"])
    root_pc = NOTE_TO_PC[root_name]
    spelling_map = SCALE_SPELLINGS.get((root_name, scale_type))
    fallback_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

    # Caso: Filtrado por Dibujo Geométrico (Traste_Inicio + Patterns)
    if drawing_id and drawing_id in SHAPES and drawing_id != "all":
        shape = SHAPES[drawing_id]
        
        # 1. Encontrar traste de la tónica en la cuerda de referencia
        # Nota: Usamos la relativa mayor para anclar si es menor, para mantener coherencia física
        anchor_pc = root_pc
        if scale_type == "minor":
            # Para que el dibujo físico sea el mismo, buscamos la tónica de la relativa mayor
            anchor_pc = (root_pc + 3) % 12
            
        ref_string = shape["ref_string"]
        open_pc = OPEN_STRING_PCS[ref_string]
        
        # 1. Encontrar traste de la tónica en la cuerda de referencia
        # Nota: Usamos la relativa mayor para anclar si es menor
        anchor_pc = root_pc
        if scale_type == "minor":
            # Para que el dibujo físico sea el mismo, buscamos la tónica de la relativa mayor
            anchor_pc = (root_pc + 3) % 12
            
        ref_string = shape["ref_string"]
        open_pc = OPEN_STRING_PCS[ref_string]
        
        # Calcular el mínimo offset global del patrón para evitar trastes negativos
        min_rel_fret = 0
        for rel_frets in shape["patterns"].values():
            if rel_frets:
                min_rel_fret = min(min_rel_fret, min(rel_frets))

        tonic_fret = None
        for f in range(21):
            if (open_pc + f) % 12 == anchor_pc:
                # REGLA DE BLOQUE: El inicio del bloque (TI = f - offset)
                # sumado al min_rel_fret debe ser >= 0. 
                # Si no, buscamos la siguiente octava (fret + 12).
                if (f - shape["start_offset"] + min_rel_fret) >= 0:
                    tonic_fret = f
                    break
        
        if tonic_fret is None: return []

        # 2. Calcular Traste_Inicio
        start_fret = tonic_fret - shape["start_offset"]
        
        # 3. Aplicar patrones sumando al Traste_Inicio
        drawing_positions = []
        for s_idx, relative_frets in shape["patterns"].items():
            for f_off in relative_frets:
                target_fret = start_fret + f_off
                
                # Validar rango del diapasón
                if 0 <= target_fret <= 20:
                    current_pc = (OPEN_STRING_PCS[s_idx] + target_fret) % 12
                    interval = (current_pc - root_pc + 12) % 12
                    
                    # Validar si la nota pertenece a la escala
                    if interval in scale_intervals:
                        note_name = spelling_map[current_pc] if spelling_map and current_pc in spelling_map else fallback_names[current_pc]
                        drawing_positions.append({
                            "string": s_idx,
                            "fret": target_fret,
                            "is_root": (current_pc == root_pc),
                            "note_name": note_name
                        })
        return drawing_positions

    # Caso: Todas las posiciones (rango completo)
    valid_positions = []
    for string_idx in range(6):
        open_pc = OPEN_STRING_PCS[string_idx]
        for fret in range(21):
            current_pc = (open_pc + fret) % 12
            interval = (current_pc - root_pc + 12) % 12
            if interval in scale_intervals:
                note_name = spelling_map[current_pc] if spelling_map and current_pc in spelling_map else fallback_names[current_pc]
                valid_positions.append({
                    "string": string_idx,
                    "fret": fret,
                    "is_root": (current_pc == root_pc),
                    "note_name": note_name
                })
    return valid_positions
    return valid_positions


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/escala/<tonica>/<tipo>')
@app.route('/api/escala/<tonica>/<tipo>/dibujo/<drawing_id>')
def api_escala(tonica, tipo, drawing_id=None):
    # Sanitize inputs
    tonica = tonica.replace('s', '#') # Por si viene como Cs (C sharp)
    positions = get_scale_notes(tonica, tipo, drawing_id)
    return {"positions": positions}

if __name__ == '__main__':
    app.run(debug=True)