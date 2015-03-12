var CUBE_SCENE = new gg.Scene().setup(function(width, height) {
  this.pauseWhenUnfocused = false;
  this.animRot = 0.0;
  this.animSpeed = 10.0;
  this.animColor = '#888888';
}).draw(function(g, width, height) {
  var V = gg.V;

  g.globalAlpha = 0.95;

  g.clear('#000000');
  g.clear();

  g.pushMatrix();
  g.translate(width/2.0, height/2.0);
  g.scale(width/100.0, width/100.0);

  var sin2 = function(x) { return Math.sin(x) * Math.sin(x); };

  var usage = 0.0;
  for (var i = 0; i < Page.usages().length; i++) {
    var us = Page.usages()[i];
    if (us.name == 'all') {
      usage = us.usage / 100.0;
    }
  }

  var tempColor = '#000000';
  var maxTemp = 0;
  for (var i = 0; i < Page.devices().length; i++) {
    var dev = Page.devices()[i];
    for (var j = 0; j < dev.temps.length; j++) {
      var cpu = dev.temps[j];
      var tt = ParseTemp(cpu.temp);
      if (tt > maxTemp) {
        maxTemp = tt;
        tempColor = ColorFor(cpu.temp, cpu.info);
      }
    }
  }

  var targetSpeed = gg.L(5.0, 360.0, usage);

  this.animColor = gg.Color.HexNiceLerp(this.animColor, tempColor, this.dt);
  this.animSpeed = gg.L(this.animSpeed, targetSpeed, this.dt);

  var hsl = gg.Color.Rgb2Hsl(gg.Color.Hex2Vector(this.animColor));
  hsl.x += 0.09 + hsl.x*0.2;
  var rgb = gg.Color.Hsl2Rgb(hsl);



  this.pulse0 = gg.Color.Vector2Hex(rgb); //'#0088DD'; //gg.Color.HexNiceLerp(this.animColor, , 0.5);
  this.pulse1 = gg.Color.HexNiceLerp(this.animColor, '#00FFFF', 0.1);

  var pulse0 = this.pulse0;
  var pulse1 = this.pulse1;

  var line0 = pulse0;
  var line1 = '#FFFFFF';

  g.strokeStyle = gg.Color.HexNiceLerp(line0, line1, sin2(this.time));
  g.fillStyle = gg.Color.HexLerp(pulse0, pulse1, sin2(this.time));
  g.lineWidth = 2.0;

  var cTLF = V(-10,  10,  10);
  var cTRF = V( 10,  10,  10);
  var cBLF = V(-10, -10,  10);
  var cBRF = V( 10, -10,  10);

  var cTLB = cTLF.d().add(-1, V(0,0,20));
  var cTRB = cTRF.d().add(-1, V(0,0,20));
  var cBLB = cBLF.d().add(-1, V(0,0,20));
  var cBRB = cBRF.d().add(-1, V(0,0,20));

  var Cw = function(a) {
    var ls = a.splice(0);
    ls.reverse();
    return ls;
  }

  var Cc = function(a) {
    return a;
  }

  var faces = [
    Cw([ cTLF, cTRF, cBRF, cBLF ]), // front face
    Cc([ cTLB, cTRB, cBRB, cBLB ]), // back face
    Cc([ cTLF, cTLB, cBLB, cBLF ]), // left face
    Cw([ cTRF, cTRB, cBRB, cBRF ]), // right face
    Cw([ cTLF, cTLB, cTRB, cTRF ]), // top face
    Cc([ cBLF, cBLB, cBRB, cBRF ]), // bottom face
  ];

  g.pushMatrix();
  this.animRot += this.animSpeed * this.dt;
  g.rotate(-this.animRot, 0, 1, 0);
  g.rotate(45, 1,0,0);
  g.rotate(45, 0,0,1);
  
  for (var f = 0; f < faces.length; f++) {
    var vA = faces[f][0];
    var vB = faces[f][1];
    var vC = faces[f][2];
    var AB = vB.d().add(-1, vA);
    var AC = vC.d().add(-1, vA);
    var N = AB.d().normed(AC);
    var forward = V(0, 0, -1);

    var vM = V(0,0,0).add(1, vA).add(1, vB).add(1, vC).mul(1.0/3.0);

    var tM  = g.transformPoint(vM);
    var tMN = g.transformPoint(vM.d().add(1.0, N));
    var tN  = tMN.d().add(-1.0, tM).normalized();

    if (tN.dot(forward) > 0) {
      continue;
    }

    g.beginShape(g.GL_POLY);
    for (var i = 0; i < faces[f].length; i++) {
      g.v(faces[f][i]);
    }
    g.endShape();

    for (var i = 0; i < faces[f].length; i++) {
      g.edge(faces[f][i], faces[f][(i+1)%faces[f].length]);
    }
  }

  g.popMatrix();

  g.popMatrix();

}).bindTo('perf-cube-can');