#!/usr/bin/env python3
"""Dev server: like `python3 -m http.server` but disables caching,
so edits to config.js / shader chunks / *.js show up on a normal reload.
Threaded + keep-alive: the shader loads as 8 parallel chunk fetches,
which stall for seconds on a single-threaded HTTP/1.0 server.

Usage: python3 serve.py [port]   (default 8000)
"""
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f'Serving http://localhost:{port} (caching disabled)')
ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
