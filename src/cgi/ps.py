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

p = Popen(['ps', 'aux'], stdout=PIPE, stderr=STDOUT)
out, err = p.communicate()
lines = out.split('\n')

data = []

labels = {}
header = []
for line in lines:
  if not line: continue
  parts = line.split(' ')
  parts = [p.strip() for p in parts if p.strip()]

  if '%CPU' in line:
    # header line detected
    for i,v in enumerate(parts):
      labels[v] = i
    header = parts
  elif labels and line:
    if len(parts) >= len(labels):
      point = {}
      for i,v in enumerate(parts):
        if i < len(header):
          point[header[i]] = parts[i]
      point[header[-1]] = ' '.join(parts[len(header)-1:])
      data.append(point) 

data = sorted(data, key=lambda d: -float(d['%CPU']))

print(json.dumps(data))
