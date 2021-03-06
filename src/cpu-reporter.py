#!/usr/bin/env python
# -*- coding: UTF-8 -*-# enable debugging
from __future__ import print_function
from subprocess import Popen, PIPE, STDOUT
import json
import os
import re
import sys
import time

def get_json():
  frames = 2
  delay = 3

  p = Popen(['mpstat', '-P', 'ALL', str(delay), str(frames)], stdout=PIPE, stderr=STDOUT)
  out, err = p.communicate()
  lines = out.split('\n')

  cpus = []

  labels = {}
  for line in lines:
    if not line: continue
    parts = line.split(' ')
    parts = [p.strip() for p in parts if p.strip()]

    if '%idle' in line:
      # header line detected
      for i,v in enumerate(parts):
        labels[v] = i
    elif labels and line:
      name = parts[labels['CPU']]
      # %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest   %idle
      idle = float(parts[labels['%idle']])
      usr = float(parts[labels['%usr']])
      sys = float(parts[labels['%sys']])
      usage = usr + sys
      # Remove outdated cpus
      cpus = [cpu for cpu in cpus if cpu['name'] != name]
      # Add new cpu data
      cpus.append({
        'name': name,
        'usage': int(100*(usage))/100.0
      })
 
  meta = { 'id': time.time(), 'data': cpus, }
 
  return json.dumps(meta)

out_path = sys.argv[1]
while True:
  dump = get_json()
  h = open(out_path, 'w')
  h.write(dump)
  h.close()
  time.sleep(2)

