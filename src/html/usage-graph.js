var USAGE_SCENE = {
  'visible': true,
  'pleasant': true,
};

function UpdateUsageGraph(dontSave) {
  var time = getTime();

  if (typeof(dontSave) === 'undefined') {
    for (var i = 0; i < Page.usages().length; i++) {
      var cpu = Page.usages()[i];
      if (typeof(Page.usageStream[cpu.name]) === 'undefined') {
        Page.usageStream[cpu.name] = [];
      }
      Page.usageStream[cpu.name].push({
        'name': cpu.name,
        'x': time,
        'y': cpu.usage,
      });
      if (Page.usageStream[cpu.name].length > 50) {
        Page.usageStream[cpu.name].shift();
      }
    }
  }

  var can = document.getElementById('usage-graph-can');
  var g = can.getContext('2d');

  var width = $(can).width();
  var height = $(can).height();

  g.fillStyle='#000000';
  g.clearRect(0, 0, width+1, height+1);

  if (!USAGE_SCENE.visible) {
    return;
  }

  function map(n, a, b, A, B) {
    return (n-a)/(b-a)*(B-A) + A;
  }

  var duration = 60*1000;
  var range = 100;

  var padding = 20;

  function toPx(pt) {
    return {
      'x': map(pt.x, time-duration, time, padding, width-padding),
      'y': map(pt.y, 0, range, height-padding, padding),
    };
  } 

  var N = 5;
  for (var i = 0; i < N; i++) {
    var x = time-duration + duration * (i+1.0)/(N+1.0);
    var pa = toPx({'x': x, 'y': 0});
    var pb = toPx({'x': x, 'y': 0});
    pa.y = height-padding;
    pb.y = height;

    g.lineWidth = 3.0;
    g.strokeStyle = '#888888';
    g.beginPath();
    g.moveTo(pa.x, pa.y);
    g.lineTo(pb.x, (pa.y+pb.y)/2);
    g.stroke();
    g.closePath();

    g.lineWidth = 1.0;
    g.fillStyle = '#ffffff';
    g.font = '12px monospace';
    g.textAlign = 'center';
    g.fillText('' + Math.floor((time-x)/1000), pb.x, pb.y-2);
  }

  var READIBLE = [
    '#FFFFFF',
    '#DD0000',
    '#00BBCC',
    '#00AA00',
    '#DDAA00',
  ];

  var PLEASANT = [
    '#00DDDD',
    '#00DD88',
    '#0088DD',
  ];

  var TONED = PLEASANT;
  if (typeof(CUBE_SCENE) !== 'undefined' 
      && typeof(gg) !== 'undefined'
      && typeof(CUBE_SCENE.animColor) !== 'undefined') {
    var A = gg.Color.HexNiceLerp(CUBE_SCENE.pulse0, PLEASANT[2], 0.2);
    var B = CUBE_SCENE.pulse1;
    TONED = [
      gg.Color.HexNiceLerp(A, B, 0.10) || PLEASANT[0],
      gg.Color.HexNiceLerp(A, B, 0.50) || PLEASANT[1],
      gg.Color.HexNiceLerp(A, B, 0.90) || PLEASANT[2],
    ];
  }

  var colors = USAGE_SCENE.pleasant ? TONED : READIBLE;

  var labels = Object.keys(Page.usageStream);
  for (var li = 0; li < labels.length; li++) {
    var stream = Page.usageStream[labels[li]];
    g.strokeStyle = colors[li % colors.length];
    g.fillStyle = g.strokeStyle;
    g.beginPath();
    var moved = false;
    for (var i = 0; i < stream.length; i++) {
      var p = toPx(stream[i]);
      if (p.x < padding) continue;
      if (!moved) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
      moved = true;
    }
    g.stroke();
    g.closePath();
    for (var i = 0; i < stream.length; i++) {
      var p = toPx(stream[i]);
      if (p.x < padding) continue;
      g.fillRect(p.x-3, p.y-3, 6, 6);
    }

    for (var i = 0; i < Page.usages().length; i++) {
      if (Page.usages()[i].name == labels[li]) {
        Page.usages()[i].color = g.strokeStyle;
      }
    }
  }
  var us = Page.usages();
  Page.usages([]);
  Page.usages(us.slice(0));
};