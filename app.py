from flask import Flask, render_template

# Creamos la aplicación
app = Flask(__name__)

# Definimos qué pasa cuando entras a la página principal
@app.route('/')
def home():
    return render_template('index.html')

# Arrancamos el servidor
if __name__ == '__main__':
    app.run(debug=True)