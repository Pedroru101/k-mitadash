#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
from dotenv import load_dotenv
from threading import Timer

# Cargar variables de entorno del archivo .env
load_dotenv()

# Configuración del servidor
PORT = 8080
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}/simple-dashboard.html')

if __name__ == "__main__":
    try:
        # Cambiar al directorio del proyecto
        os.chdir(os.path.dirname(os.path.abspath(__file__)))

        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Servidor iniciado en http://localhost:{PORT}")
            print(f"Dashboard disponible en: http://localhost:{PORT}/simple-dashboard.html")
            print("Presiona Ctrl+C para detener el servidor")

            # Abrir navegador después de 1 segundo
            Timer(1.0, open_browser).start()

            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServidor detenido")
                httpd.shutdown()
    except OSError as e:
        print(f"Error al iniciar el servidor: {e}. El puerto {PORT} podria estar ocupado.")
    except Exception as e:
        print(f"Error inesperado: {e}")