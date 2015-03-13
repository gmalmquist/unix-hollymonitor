#!/usr/bin/env python
# -*- coding: UTF-8 -*-# enable debugging
from __future__ import print_function
from subprocess import Popen, PIPE, STDOUT
import cgitb
import json
import os
import re
import sys

cgitb.enable()    
print("Content-Type: application/javascript;charset=utf-8")    
print()

p = Popen(['sensors'], stdout=PIPE, stderr=STDOUT)
out, err = p.communicate()
lines = out.split('\n')
#print('/* ', out, '*/')

def parse_info(info):
  if not re.match('[(].*?[)]', info): return {'text': info}
  info = info[1:-1]
  parts = info.split(',')
  data = {}
  for p in parts:
    key, val = p.split('=')
    data[key.strip()] = val.strip()
  return data

devices = []
device = None

def is_info(text):
  return re.match('[(].*?=.*?[)]', text)

extra_infos = {}
last_infos = {}


for line in lines:
  line = line.decode('unicode_escape').encode('ascii', 'ignore').strip()
  line = re.sub('([0-9])C', r'\1 C', line)
  if device:
    if not line:
      device = None
  if not line: continue
  #print('// LINE:', line)
  if device:
    if is_info(line):
      extra_infos = parse_info(line)
      #print('//', line)
      #print('//', json.dumps(extra_infos))
      last_infos.update(extra_infos)
    elif re.match('.*?:\\s+[+-]\\d+[.]\\d+.[CF]\\s+.*', line):
      # temperature
      colon = line.find(':')
      name = line[:colon].strip()
      line = line[colon+1:].strip()
      space = line.find('(')
      temp = line[:space].strip()
      info = parse_info(line[space:].strip())
      #info.update(extra_infos)
      #extra_infos = {}
      last_infos = info
      device['temps'].append({
        'name': name, 
        'temp': temp,
        'info': info,
      })
    else:
      device['description'] += line + '\n'
  else:
    device = {'name': line, 'description': '', 'temps': []}
    devices.append(device)

print(json.dumps(devices))
