#!/usr/bin/env python3
"""
Servidor HTTP simple para K-mita Dashboard
Ejecuta: python start-server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración del servidor
PORT = 8080
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers CORS para evitar problemas de seguridad
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Log personalizado
        print(f"[{self.log_date_time_string()}] {format % args}")

    def do_GET(self):
        if self.path == '/config.js':
            self.serve_config_js()
        else:
            super().do_GET()

    def serve_config_js(self):
        config_path = os.path.join(os.getcwd(), 'config.js')
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

def main():
    # Cambiar al directorio del script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print("🚀 Iniciando K-mita Dashboard Server...")
    print(f"📁 Directorio: {script_dir}")
    print(f"🌐 URL: http://{HOST}:{PORT}")
    print("📊 Dashboard: http://localhost:8080/shopify-analytics-dashboard.html")
    print("🧪 Tests: http://localhost:8080/test-dashboard.html")
    print("\n⚠️  Presiona Ctrl+C para detener el servidor\n")
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"✅ Servidor iniciado en http://{HOST}:{PORT}")
            
            # Abrir automáticamente el dashboard en el navegador
            dashboard_url = f"http://{HOST}:{PORT}/shopify-analytics-dashboard.html"
            print(f"🔗 Abriendo dashboard: {dashboard_url}")
            webbrowser.open(dashboard_url)
            
            # Iniciar el servidor
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Puerto en uso
            print(f"❌ Error: El puerto {PORT} ya está en uso")
            print("💡 Intenta con otro puerto o cierra la aplicación que lo está usando")
        else:
            print(f"❌ Error del sistema: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()