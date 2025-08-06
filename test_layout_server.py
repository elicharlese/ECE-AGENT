#!/usr/bin/env python3
"""
Simple HTTP server to test the layout system
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
from pathlib import Path

class LayoutTestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/workspaces/AGENT', **kwargs)
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def do_GET(self):
        # Route the root to our main layout
        if self.path == '/' or self.path == '/index.html':
            self.path = '/static/layouts/main-layout.html'
        
        # Handle missing files gracefully
        try:
            super().do_GET()
        except FileNotFoundError:
            self.send_error(404, f"File not found: {self.path}")

def start_server(port=8080):
    """Start the layout test server"""
    
    # Change to the workspace directory
    os.chdir('/workspaces/AGENT')
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, LayoutTestHandler)
    
    print(f"""
🚀 Layout Test Server Starting...

Server URL: http://localhost:{port}
Directory: /workspaces/AGENT
Layout File: /static/layouts/main-layout.html

Features to test:
✅ Main navigation (Terminal, Charts, Wallet, Docs buttons)
✅ Profile menu and dropdown
✅ Notification panel
✅ Chat rooms sidebar
✅ Message interface
✅ Apps modal (click Apps button or Ctrl+K)
✅ Responsive design

Press Ctrl+C to stop the server
""")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number, using default 8080")
    
    start_server(port)
