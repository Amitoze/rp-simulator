#!/usr/bin/env python3
"""Dev server: like `python3 -m http.server` but disables caching,
so edits to config.js / shader.frag / *.js show up on a normal reload.

Usage: python3 serve.py [port]   (default 8000)
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f'Serving http://localhost:{port} (caching disabled)')
HTTPServer(('', port), NoCacheHandler).serve_forever()
