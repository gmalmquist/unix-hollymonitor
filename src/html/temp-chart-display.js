var TEMP_SCENE = new gg.Scene().setup(function(width, height) {
  this.pauseWhenUnfocused = false;
  this.temps = {};
  this.colors = {};
}).draw(function(g, width, height) {
  var V = gg.V;

  g.clear();
  g.globalAlpha = 0.6;

  for (var i = 0; i < Page.devices().length; i++) {
    var device = Page.devices()[i];
    for (var t = 0; t < device.temps.length; t++) {
      var temp = device.temps[t];
      var name = device.name + ' ' + temp.name;
      if (typeof(this.temps[name]) === 'undefined') {
        this.temps[name] = 0.0;
      }

      this.temps[name] = gg.L(this.temps[name], ParseTemp(temp.temp), this.dt);
      this.colors[name] = ColorFor(this.temps[name], temp.info);
    }
  }

  g.pushMatrix();

  g.translate(0, height);

  var keys = Object.keys(this.temps);
  keys.sort();

  var fontSize = 12;

  g.font = 'bold ' + fontSize + 'px monospace';
  g.fontWeight = 'bold';

  var barHeight = Math.min(20, Math.max(fontSize+4, 50.0/keys.length));

  var barPad = 4;

  g.translate(0, -(barHeight+barPad)*keys.length);

  for (var i = 0; i < keys.length; i++) {
    var name = keys[i];
    var temp = this.temps[name];

    var sname = name.substring(0, 2) + ' ' + name.substring(name.indexOf(' ')+1);

    var color = this.colors[name];
    color = gg.Color.HexLerp(color, '#000000', 0.4);

    g.fillStyle = color;
    g.strokeStyle = color;

    var tempWidth = temp*2;

    g.fillStyle = color;
    g.beginShape(g.GL_POLY);
    g.v(0, 0, 0);
    g.v(tempWidth, 0, 0);
    g.v(tempWidth, barHeight, 0);
    g.v(0, barHeight, 0);
    g.endShape();

    g.fillStyle = gg.Color.HexLerp(color, '#FFFFFF', 0.7);
    var tp = g.transformPoint(V(0,0,0));
    g.textAlign = 'left';
    g.fillText(sname + ' +' + Math.floor(temp) + ' C', tp.x + barPad, tp.y + barHeight/2 + fontSize/2 - barPad/2);

    g.translate(0, (barHeight+barPad));
  }

  g.popMatrix();

}).bindTo('temp-chart-can');

