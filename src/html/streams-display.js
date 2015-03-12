var STREAMS_SCENE = new gg.Scene().setup(function(width, height) {
  this.pauseWhenUnfocused = false;
  this.simTime = 0.0;

  this.positions = [];

  this.getPosition = function(i) {
    while (i >= this.positions.length) {
      this.positions.push(
        gg.V(Math.random(), Math.random())
      );
    }
    return this.positions[i];
  }.bind(this);

  this.nextString = function() {
    if (Page.processes().length == 0) {
      var N = 50 * this.rand();
      var s = '';
      for (var j = 0; j < N; j++) {
        s += Math.floor(this.rand()*2);
      }
      return s;
    }
    var i = Math.floor(Math.random() * Page.processes().length);
    if (Math.random() < 0.5) {
      i = Math.floor(Math.random() * Math.min(10, Page.processes().length));
    }
    var proc = Page.processes()[i];
    var name = proc.COMMAND;
    var maxLength = 50;
    if (name.length > maxLength)
      name = name.substring(0, maxLength);
    return name;
  }

  this.strings = [ '0001010101010100010111' ];
}).draw(function(g, width, height) {
  var V = gg.V;

  g.clear();

  g.pushMatrix();

  g.fillStyle = '#888888';

  g.fillStyle = CUBE_SCENE.animColor;

  this.rseed = 1;
  this.rand = function() {
    var n = parseFloat('0.'+Math.sin(this.rseed).toString().substr(6));
    this.rseed++;
    return n;
  }.bind(this);
  var code = Page.scrollCode();

  var strings = this.strings;
  while (strings.length < 40) {
    strings.push(this.nextString());
  }

  var stringCount = 50;

  this.simDt = gg.L(1, 4, CUBE_SCENE.animSpeed/360.0) * this.dt;
  this.simTime += this.simDt;

  var minSpeed = 50.0;
  var maxSpeed = minSpeed*2;

  var fontHeight = Math.min(20, 12 * width / 600.0);

  g.font = fontHeight + 'px monospace';

  g.textAlign = 'left';
  for (var i = 0; i < Math.min(code.length, height/fontHeight); i++) {
    var y = this.simTime * (maxSpeed+minSpeed)/2.0 + (code.length-i-1)*fontHeight;
    y = height - (y % height);
    g.fillText(code[i], width*3/5, y);
  }

  fontHeight = 12 * width / 600.0;
  g.font = fontHeight + 'px monospace';
  g.textAlign = 'center';
  for (var count = 0; count < strings.length; count++) {
    var s = strings[count];
    var point = this.getPosition(count);
    point.y += this.simDt * gg.L(minSpeed, maxSpeed, this.rand()) / height;
    var yMax = (height + 1.5*fontHeight * s.length) / height;
    while (point.y > yMax) {
      strings[count] = this.nextString();
      point.y -= yMax;
      point.x = Math.random();
    }

    var x = point.x * width;
    var y = point.y * height;

    for (var i = 0; i < s.length; i++) {
      g.fillText(s.charAt(i), x, y + (i-s.length)*fontHeight);
    }
  }

  g.popMatrix();
}).bindTo('streams-can');