#!/usr/bin/env python

# This is a script to run the hollymonitor in a little
# standalone webserver, rather than being integrated
# into a larger application.

from __future__ import print_function
from BaseHTTPServer import BaseHTTPRequestHandler
from subprocess import Popen, PIPE, STDOUT
import mimetypes
import os
import re
import SocketServer
import shutil
import sys

SCRIPT_DIR = None

def execute_maybe(file_path):
  try:
    h = open(file_path, 'r')
    line = h.readline()
    h.close()
  except:
    return None
  #print(file_path, line)
  if line and line.startswith('#!'):
    command = line[2:].split(' ')
    command = [c.strip() for c in command]
    try:
      p = Popen(command + [file_path], cwd=SCRIPT_DIR, stdout=PIPE, stderr=STDOUT)
      out, err = p.communicate()
      return out
    except Exception as e:
      pass
  return None

class HollyHandler(BaseHTTPRequestHandler):

  def do_GET(self):
    file_path = os.path.join(SCRIPT_DIR, self.path[1:])
    file_path = os.path.abspath(file_path)
    file_path = os.path.relpath(file_path, SCRIPT_DIR)
    if '..' in file_path:
      self.send_response(403)
      self.end_headers()
      return
    file_path = os.path.abspath(os.path.join(SCRIPT_DIR, file_path))

    content_type = 'text/html; charset=utf-8'

    if self.path == '/' or self.path == '':
      status_html = os.path.join(SCRIPT_DIR, 'html', 'status.html') 
      if os.path.exists(status_html):
        host = self.headers['Host']
        self.send_response(301)
        self.send_header('Location', 'http://{host}/html/status.html'.format(host=host))
        self.end_headers()
        return

    if os.path.exists(file_path):
      self.send_response(200)
      if os.path.isdir(file_path):
        message = '''<html>
        <head><title>Directory {rel_path}</title></head>
        <body>
        <h1>Directory {rel_path}</h2>
        <ul>
        '''.format(rel_path = os.path.relpath(file_path, SCRIPT_DIR))
        for f in sorted(os.listdir(file_path), 
              key = lambda f: (0, f) if os.path.isdir(os.path.join(file_path, f)) else (1, f)):
          path = os.path.join(os.path.relpath(file_path, SCRIPT_DIR), f)
          name = f
          if os.path.isdir(os.path.join(SCRIPT_DIR, path)):
            name = name + '/'
          message += '<li>'
          message += '<a href="{path}">{name}</a>'.format(path=name, name=name)
          message += '</li>\n'
        message += '</ul>\n</body>\n</html>\n'
      else:
        message = execute_maybe(file_path)
        if message is not None:
          self.wfile.write(message)
          return

        h = open(file_path, 'rb')
        message = h.read()
        h.close()

        mime_type, mime_encoding = mimetypes.guess_type(file_path)
        if not mime_type:
          #print('Mime-type unknown, defaulting to text/html.')
          content_type = 'text/html; charset=utf-8'
        else:
          #print('Mime-type is', mime_type, mime_encoding)
          if not mime_encoding:
            content_type = mime_type
          else:
            content_type = '%s; %s' % (mime_type, mime_encoding)
    else:
      self.send_response(404)
      return

    self.send_header('Content-type', content_type)
    self.send_header('content-length', len(message))
    self.end_headers()

    self.wfile.write(message)

def start_cpu_recorder():
  p = Popen([
    'python', 
    os.path.join(SCRIPT_DIR, 'cpu-reporter.py'), 
    os.path.join(SCRIPT_DIR, 'cpu-usage.js')
  ])

def main(args, script_dir, script_path):
  global SCRIPT_DIR
  SCRIPT_DIR = script_dir

  VARS = {}
  FLAGS = set()

  for arg in args:
    if '=' in arg:
      key, val = arg.split('=')
      VARS[key] = val
    else:
      FLAGS.add(arg)

  port = 8080
  if 'port' in VARS:
    if not re.match('^[0-9]+$', VARS['port']):
      print('Port "%s"' % VARS['port'], 'is not valid, must be a number.')
    else:
      port = int(VARS['port'])

  print('Starting CPU recorder...')
  start_cpu_recorder()

  print('Starting standalone webserver on port', port)
  print('Use the command-line argument port=xxxx to change the port.')
  httpd = SocketServer.TCPServer(('', port), HollyHandler)
  httpd.serve_forever()

main(sys.argv[1:], os.path.dirname(sys.argv[0]), sys.argv[0])
