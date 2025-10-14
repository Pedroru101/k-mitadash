#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
from threading import Timer

# Configuración del servidor
PORT = 3001
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Agregar headers para prevenir cache del navegador
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    webbrowser.open(f'http://localhost:{PORT}/shopify-analytics-dashboard.html')

if __name__ == "__main__":
    try:
        # Cambiar al directorio del proyecto
        os.chdir(os.path.dirname(os.path.abspath(__file__)))

        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Servidor iniciado en http://localhost:{PORT}")
            print(f"Dashboard disponible en: http://localhost:{PORT}/shopify-analytics-dashboard.html")
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