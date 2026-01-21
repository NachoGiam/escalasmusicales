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
    Retorna una lista de dicts: {'string': s, 'fret': f, 'note': pc, 'is_root': bool}
    """
    if root_name not in NOTE_TO_PC:
        return []
    
    scale_intervals = SCALES.get(scale_type, SCALES["major"])
    root_pc = NOTE_TO_PC[root_name]
    
    valid_positions = []
    
    # Recorremos 6 cuerdas y 21 trastes (0-20)
    for string_idx in range(6):
        open_pc = OPEN_STRING_PCS[string_idx]
        
        for fret in range(21):
            current_pc = (open_pc + fret) % 12
            interval = (current_pc - root_pc + 12) % 12
            
            if interval in scale_intervals:
                valid_positions.append({
                    "string": string_idx, # Coincide con el índice de script.js
                    "fret": fret,
                    "is_root": (current_pc == root_pc)
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