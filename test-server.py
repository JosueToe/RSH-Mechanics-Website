#!/usr/bin/env python3
"""
Simple HTTP server for testing the RSG Mobile Mechanics website locally.
Run this script and open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 RSG Mobile Mechanics Test Server")
        print(f"📱 Open your browser and go to: http://localhost:{PORT}")
        print(f"🔧 Press Ctrl+C to stop the server")
        print(f"")
        print(f"📋 Testing Instructions:")
        print(f"   1. Open http://localhost:{PORT} in your browser")
        print(f"   2. Open Developer Tools (F12)")
        print(f"   3. Click the device icon to simulate mobile")
        print(f"   4. Select iPhone XR or similar device")
        print(f"   5. Test the mobile menu (hamburger icon)")
        print(f"")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n👋 Server stopped")
