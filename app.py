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
# Cuerdas de abajo hacia arriba en la UI (0=E grave en backend logic, pero en UI often reversed)
# En script.js: strings = ["E", "A", "D", "G", "B", "e"] -> Indices 0..5
# UI String Index: 0=Hi E ... 5=Low E?
# Script.js: const STRING_ORDER = [5, 4, 3, 2, 1, 0];
# script.js: const OPEN_STRING_PC = [4, 9, 2, 7, 11, 4]; -> Indices match strings array
# Index 0: E (4)
# Index 1: A (9)
# Index 2: D (2)
# Index 3: G (7)
# Index 4: B (11)
# Index 5: e (4)
OPEN_STRING_PCS = [4, 9, 2, 7, 11, 4]


def get_scale_notes(root_name, scale_type):
    """
    Calcula todas las posiciones válidas para una escala en el diapasón.
    Retorna una lista de dicts: {'string': s, 'fret': f, 'note': pc, 'is_root': bool, 'note_name': str}
    """
    if root_name not in NOTE_TO_PC:
        return []
    
    scale_intervals = SCALES.get(scale_type, SCALES["major"])
    root_pc = NOTE_TO_PC[root_name]
    
    # Obtener el mapa de nombres para esta escala específica
    spelling_map = SCALE_SPELLINGS.get((root_name, scale_type))
    # Fallback por si falta alguna definición (usamos lógica básica sharps)
    fallback_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

    valid_positions = []
    
    # Recorremos 6 cuerdas y 21 trastes (0-20)
    for string_idx in range(6):
        open_pc = OPEN_STRING_PCS[string_idx]
        
        for fret in range(21):
            current_pc = (open_pc + fret) % 12
            interval = (current_pc - root_pc + 12) % 12
            
            if interval in scale_intervals:
                # Determinar nombre
                if spelling_map and current_pc in spelling_map:
                    note_name = spelling_map[current_pc]
                else:
                    note_name = fallback_names[current_pc]

                valid_positions.append({
                    "string": string_idx, # Coincide con el índice de script.js
                    "fret": fret,
                    "is_root": (current_pc == root_pc),
                    "note_name": note_name
                })
                
    return valid_positions


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/escala/<tonica>/<tipo>')
def api_escala(tonica, tipo):
    # Sanitize inputs
    tonica = tonica.replace('s', '#') # Por si viene como Cs (C sharp)
    positions = get_scale_notes(tonica, tipo)
    return {"positions": positions}

if __name__ == '__main__':
    app.run(debug=True)