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
PORT = 8888
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

    def do_GET(self):
        if self.path == '/config.js':
            self.serve_config_js()
        else:
            super().do_GET()

    def serve_config_js(self):
        config_path = os.path.join(DIRECTORY, 'config.js')
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Reemplazar placeholders con variables de entorno
            content = content.replace('__DASHBOARD_USERNAME__', os.getenv('DASHBOARD_USERNAME', ''))
            content = content.replace('__DASHBOARD_PASSWORD__', os.getenv('DASHBOARD_PASSWORD', ''))

            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except FileNotFoundError:
            self.send_error(404, "Config file not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

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