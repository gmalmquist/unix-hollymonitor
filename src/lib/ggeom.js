var gg = function() {};

gg.L = function(a, b, s) {
	if (gg.IsVector(a)) {
		return a.d().lerp(s, b);
	}
	return (1.0-s)*a + s*b;
};

gg.Quadratic = function(a, b, c) {
	if (a == 0) return -1;
	var det = b*b - 4*a*c;
	if (det < 0) return -1;
	var sdet = Math.sqrt(det);
	var t0 = (-b - sdet)/(2*a);
	var t1 = (-b + sdet)/(2*a);
	if (t0 < 0) return t1;
	if (t1 < 0) return t0;
	return Math.min(t0, t1);
};

gg.IsVector = function(p) {
	try {
		return typeof(p.x) !== 'undefined';
	} catch (err) {}
	return false;
};

gg.P = function(x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	return this;
};

gg.V = function(x, y, z) {
	return new gg.P(x,y,z);
};

gg.P.prototype.get = function(i) {
	if (i == 0) return this.x;
	if (i == 1) return this.y;
	if (i == 2) return this.z;
	return 0;
};

gg.P.prototype.set = function(x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	return this;
};

gg.P.prototype.d = function() {
	return new gg.P(this.x, this.y, this.z);
}

gg.P.prototype.add = function(s, x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	this.x += s * x;
	this.y += s * y;
	this.z += s * z;
	return this;
};

gg.P.prototype.lerp = function(s, b) {
	return this.mul(1-s).add(s, b);
}

gg.P.prototype.mul = function(x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	x = x || 1;
	y = y || x;
	z = z || x;
	this.x *= x;
	this.y *= y;
	this.z *= z;
	return this;
};

gg.P.prototype.crossed = function(x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	var i =  (this.y*z - this.z*y);
	var j = -(this.x*z - this.z*x);
	var k =  (this.x*y - this.y*x);
	return this.set(i, j, k);
};

gg.P.prototype.normalized = function() {
	var m = this.mag2();
	if (m == 0) return this;
	return this.mul(1.0/Math.sqrt(m));
};

gg.P.prototype.normed = function(x, y, z) {
	return this.crossed(x, y, z).normalized();
};

gg.P.prototype.onAxis = function(x, y, z) {
	var d = this.dot(x, y, z);
	return this.set(x, y, z).mul(d);
};

gg.P.prototype.offAxis = function(x, y, z) {
	return this.add(-1.0, this.d().onAxis(x, y, z));
};

gg.P.prototype.rotate = function(angle, x, y, z) {
	var K = gg.V(x, y, z).normalized();
	var I = gg.V(0, 0, 1).normed(K);
	if (I.mag2() == 0) 
		I = gg.V(0, 1, 0).normed(K);
	var J = I.d().normed(K);

	var i = this.dot(I);
	var j = this.dot(J);
	var k = this.dot(K);

	var theta = Math.atan2(j, i) + angle;

	var m = Math.sqrt(i*i + j*j);
	i = m * Math.cos(theta);
	j = m * Math.sin(theta);

	return this.set(0,0,0).add(i, I).add(j, J).add(k, K);
};

gg.P.prototype.rotateAround = function(origin, angle, axis) {
	return this.add(-1, origin).rotate(angle, axis).add(1, origin);
};

gg.P.prototype.dot = function(x, y, z) {
	if (gg.IsVector(x)) { z = x.z; y = x.y; x = x.x; }
	return this.x*x + this.y*y + this.z*z;
};

gg.P.prototype.mag2 = function() {
	return this.dot(this);
};

gg.P.prototype.mag = function() {
	return Math.sqrt(this.mag2());
};

gg.P.prototype.toString = function() {
	return "<" + this.x + ", " + this.y + ", " + this.z + ">";
};

gg.Frame = function(O, I, J, K) {
	this.O = O || gg.V(0,0,0);
	this.I = I || gg.V(1,0,0);
	this.J = J || gg.V(0,1,0);
	this.K = K || gg.V(0,0,1);
};

gg.Frame.prototype.toGlobal = function(x,y,z) {
	var p = gg.V(x,y,z);
	return this.O.d().add(p.x, this.I).add(p.y, this.J).add(p.z, this.K);
};

gg.Frame.prototype.toLocal = function(x,y,z) {
	var p = gg.V(x,y,z);
	p = p.d().add(-1, this.O);
	return gg.V(
		this.I.dot(p) / this.I.mag2(),
		this.J.dot(p) / this.J.mag2(),
		this.K.dot(p) / this.K.mag2()
	);
};

gg.Frame.prototype.toGlobalVector = function(x,y,z) {
	var p = gg.V(x,y,z);
	return gg.V(0,0,0).add(p.x, this.I).add(p.y, this.J).add(p.z, this.K);
};

gg.Frame.prototype.toLocalVector = function(x,y,z) {
	var p = gg.V(x,y,z);
	return gg.V(
		this.I.dot(p) / this.I.mag2(),
		this.J.dot(p) / this.J.mag2(),
		this.K.dot(p) / this.K.mag2()
	);
};


gg.Color = function() {

};

// Uses code from https://raw.githubusercontent.com/eligrey/color.js/master/color.min.js
gg.Color.Hsl2Rgb = function(x, y, z) {
	var v = new gg.V(x, y, z);
	var c = Color.HSLtoRGB([v.x, v.y, v.z]);
	return new gg.V(c[0], c[1], c[2]);
}.bind(gg.Color);

gg.Color.Rgb2Hsl = function(x, y, z) {
	var v = new gg.V(x, y, z);
	var c = Color.RGBtoHSL([v.x, v.y, v.z]);
	return new gg.V(c[0], c[1], c[2]);
}.bind(gg.Color);

gg.Color.HexLerp = function(a, b, s) {
	var A = this.Hex2Vector(a);
	var B = this.Hex2Vector(b);
	var AlB = A.lerp(s, B);
	var c =  this.Vector2Hex(AlB);
  return c;
}.bind(gg.Color);

gg.Color.HexNiceLerp = function(a, b, s) {
	var A = this.Rgb2Hsl(this.Hex2Vector(a));
	var B = this.Rgb2Hsl(this.Hex2Vector(b));
	var AlB = this.Hsl2Rgb(A.lerp(s, B));
	var c =  this.Vector2Hex(AlB);
  return c;
};

gg.Color.Hex2Vector = function(s) {
	s = s.substring(1); // trim off pound sign
	return gg.V(
		parseInt(s.substring(0,2), 16) * 1.0,
		parseInt(s.substring(2,4), 16) * 1.0,
		parseInt(s.substring(4,6), 16) * 1.0
	);
}.bind(gg.Color);

gg.Color.Hex2 = function(i) {
	var s = Math.floor(i).toString(16);
	while (s.length < 2) s = '0' + s;
	return s;
}.bind(gg.Color);

gg.Color.Vector2Hex = function(v) {
	v = gg.V(v.x, v.y, v.z);
	v.x = Math.min(Math.max(v.x, 0), 255);
	v.y = Math.min(Math.max(v.y, 0), 255);
	v.z = Math.min(Math.max(v.z, 0), 255);

	return '#'
		+ this.Hex2(v.x) + ''
		+ this.Hex2(v.y) + ''
		+ this.Hex2(v.z);
}.bind(gg.Color);


gg.Scene = function(name) {
	if (typeof(name) === 'undefined') {
		name = 'anonscene-' + Object.keys(gg.Scene.SCENES).length;
	}
	gg.Scene.SCENES[name] = this;
	this.g = null;
	this.name = name;
	this.firstTime = true;
	this.pauseWhenUnfocused = true;
	this.visible = true;
	this.paused = false;

	this.draw = function(set) {
		if (typeof(set) === 'undefined') {
			if (!this.visible) {
				this.g.clearRect(0, 0, this.width+1, this.height+1);
			} else {
				this.doDraw(this.g, this.width, this.height);
			}
			return;
		}
		this.doDraw = set.bind(this);
		return this;
	}.bind(this);

	this.setup = function(set) {
		if (typeof(set) === 'undefined') {
			this.doSetup(this.width, this.height);
			return;
		}
		this.doSetup = set.bind(this);
		return this;
	}.bind(this);

	this.doDraw = function() {}.bind(this);
	this.doSetup = function() {}.bind(this);

	return this;
};
gg.Scene.SCENES = {};
gg.Scene.CANVASES = [];
gg.Scene.UPDATING = false;
gg.Scene.updateScenes = function() {
	for (var i = 0; i < this.CANVASES.length; i++) {
		var group = this.CANVASES[i];
		var scene = this.SCENES[group.scene];
		if (typeof(scene) !== 'undefined') {
			if (scene.paused || (scene.pauseWhenUnfocused && !document.hasFocus())) {
				continue;
			}
			scene.g = group.context;
			scene.canvas = group.canvas;
			scene.width = group.canvas.width;
			scene.height = group.canvas.height;
			if (scene.firstTime) {
				scene.time = 0;
				scene.dt = 0;
				scene.setup();
				scene.firstTime = false;
			}
			scene.draw();
			scene.dt = 0.020;
			scene.time += scene.dt;
		}
	}
}.bind(gg.Scene);

gg.Scene.bindCanvas = function(canvas, sceneName) {
	if (typeof(canvas) === 'string') {
		canvas = document.getElementById(canvas);
	}
	var obj = {
		'canvas': canvas,
		'scene': sceneName,
		'context': gg.addContextExtras(canvas.getContext("2d"), canvas),
	};

	obj.context.click = false;

	$(canvas).mousemove(function(e) {
		var c = $(this.canvas);
		var mx = e.pageX - c.offset().left;
		var my = e.pageY - c.offset().top;
		this.context.mouseX = mx;
		this.context.mouseY = my;
	}.bind(obj));

	$(canvas).mousedown(function(e) {
		var c = $(this.canvas);
		this.context.click = true;
	}.bind(obj));

	$(document).mouseup(function(e) {
		var c = $(this.canvas);
		this.context.click = false;
	}.bind(obj));

	gg.Scene.CANVASES.push(obj);

	if (!gg.Scene.UPDATING) {
		gg.Scene.UPDATING = true;
		setInterval(gg.Scene.updateScenes, 20);
	}
};

gg.Scene.prototype.bindTo = function(canvas) {
	gg.Scene.bindCanvas(canvas, this.name);
	return this;
};


gg.Matrix = function(rows, cols) {
	this.rows = rows;
	this.cols = cols;
	this.data = [];
	this.loadIdentity();
};

gg.Matrix.prototype.loadIdentity = function() {
	this.data = [];
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.cols; j++) {
			if (i == j) this.data.push(1);
			else this.data.push(0);
		}
	}
	return this;
};

gg.Matrix.prototype.get = function(r,c) {
	return this.data[r*this.cols + c];
};

gg.Matrix.prototype.set = function(v, r,c) {
	this.data[r*this.cols+c] = v;
	return this;
};

gg.Matrix.prototype.setC = function(v, c) {
	for (var i = 0; i < this.rows; i++) {
		this.set(v.get(i), i, c);
	}
	return this;
};

gg.Matrix.prototype.setR = function(v, r) {
	for (var i = 0; i < this.cols; i++) {
		this.set(v.get(i), r, i);
	}
	return this;
};

gg.Matrix.prototype.setM = function(m) {
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.cols; j++) {
			this.set(m.get(i,j), i,j);
		}
	}
	return this;
};

gg.Matrix.prototype.mul = function(B) {
	var M = new gg.Matrix(this.rows, B.cols);
	var A = this;

	if (A.cols != B.rows) {
		// invalid matrix multiplication!
		raise ("Invalid matrix multiplication [" 
			+ A.rows + "x" + A.cols 
			+ "] * [" 
			+ B.rows + "x" + B.cols + "]!");
	}

	for (var i = 0; i < M.rows; i++) {
		for (var j = 0; j < M.cols; j++) {
			var sum = 0.0;
			for (var k = 0; k < A.cols; k++) {
				sum += A.get(i, k) * B.get(k, j);
			}
			M.set(sum, i,j);
		}
	}

	return this.setM(M);
};

gg.Matrix.prototype.transpose = function() {
	var T = new gg.Matrix(this.cols, this.rows);
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.cols; j++) {
			T.set(this.get(i,j), j,i);
		}
	}
	this.rows = T.rows;
	this.cols = T.cols;
	this.data = T.data;
	return this;
};

gg.Matrix.prototype.d = function() {
	var M = new gg.Matrix(this.rows, this.cols);
	return M.setM(this);
};

gg.Matrix.prototype.transformPoint = function(v) {
	var M = new gg.Matrix(4, 1);
	M.data = [v.x, v.y, v.z, 1.0];
	M = this.d().mul(M);
	var p = new gg.P(M.data[0], M.data[1], M.data[2]);
	return p;
};

gg.Matrix.prototype.transformVector = function(v) {
	var M = new gg.Matrix(4, 1);
	M.data = [v.x, v.y, v.z, 0.0];
	M = this.d().mul(M);
	var p = new gg.P(M.data[0], M.data[1], M.data[2]);
	return p.mul(v.mag() / p.mag());
};

gg.Matrix.prototype.toString = function() {
	function pad(s, len) {
		s = s+"";
		while (s.length < len) {
			s = " " + s;
		}
		return s;
	};

	var s = "";
	for (var i = 0; i < this.rows; i++) {
		if (i > 0) s += "\n";
		s += "[";
		for (var j = 0; j < this.cols; j++) {
			s += pad(" " + (Math.floor(10*this.get(i,j))/10), 5);
		}
		s += "]";
	}
	return s;
};


gg.TransformStack = function() {
	this.ctm = new gg.Matrix(4,4); // defaults to identity.
	this.stack = [];
};

gg.TransformStack.prototype.loadIdentity = function() {
	this.ctm.loadIdentity();
};

gg.TransformStack.prototype.pushMatrix = function() {
	this.stack.push(this.ctm.d());
	return this.ctm;
};

gg.TransformStack.prototype.popMatrix = function() {
	this.ctm = this.stack.pop(0);
	return this.ctm;
};

gg.TransformStack.prototype.multiply = function(T) {
	// Put in a separate function in case order is wrong.
	this.ctm.mul(T);
};

gg.TransformStack.prototype.translate = function(x,y,z) {
	var v = new gg.P(x,y,z);
	var T = new gg.Matrix(4,4);
	T.setC(v, 3);
	T.set(1, 3,3);
	this.multiply(T);
};

gg.TransformStack.prototype.scale = function(x,y,z) {
	var v = new gg.P(x,y,z);
	var S = new gg.Matrix(4,4);
	S.set(v.x, 0,0);
	S.set(v.y, 1,1);
	S.set(v.z, 2,2);
	this.multiply(S);
};

gg.TransformStack.prototype.rotate = function(theta, ax,ay,az) {
	theta *= Math.PI / 180.0;

	var A = gg.V(ax,ay,az).normalized();
	var N = gg.V(0, 0, 1).normed(A);
	if (N.mag2() == 0) {
		N = gg.V(0, 1, 0).normed(A);
	}

	var I = A;
	var J = N;
	var K = I.d().normed(J);

	var R1 = new gg.Matrix(4,4);
	R1.setC(I, 0);
	R1.setC(J, 1);
	R1.setC(K, 2);

	var R2 = new gg.Matrix(4,4);
	var c = Math.cos(theta);
	var s = Math.sin(theta);
	R2.data = [
		1, 0, 0, 0,
		0, c,-s, 0,
		0, s, c, 0,
		0, 0, 0, 1,
	];

	var R3 = R1.d().transpose();

	var S = new gg.Matrix(4,4);
	// It's either this or the reverse.
	S.mul(R1).mul(R2).mul(R3);

	this.multiply(S);
};




gg.addContextExtras = function(g, canvas) {
	gg.addContextExtrasBase(g, canvas);
	gg.addContextExtrasTransform(g, canvas);
	gg.addContextExtrasShapes(g, canvas);
	gg.addContextExtrasDefaults(g, canvas);
	return g;
};

gg.addContextExtrasBase = function(g, canvas) {
	g.GL_LINES = 0;
	g.GL_POLY = 1;
	g.GL_MODELVIEW = 0;
	g.GL_PROJECTION = 1;
	g.matrices = {};
	g.matrices[g.GL_MODELVIEW] = new gg.TransformStack();
	g.matrices[g.GL_PROJECTION] = new gg.TransformStack();

	g.matrixMode = g.GL_MODELVIEW;

	g.shape = g.GL_LINES;
	g.vertices = [];

	g.glMatrixMode = function(m) {
		this.matrixMode = m;
	}.bind(g);

	g.transform = function() {
		return this.matrices[this.matrixMode];
	}.bind(g);

	g.clear = function(color) {
		if (typeof(color) === 'undefined') {
			this.clearRect(0, 0, canvas.width+1, canvas.height+1);
			return;
		}

		var fs = this.fillStyle;
		
		this.fillStyle = color || "#FFFFFF";
		this.beginPath();
		this.rect(-1, -1, canvas.width+2, canvas.height+2);
		this.closePath();
		this.fill();

		this.fillStyle = fs;
	}.bind(g);

	g.beginShape = function(type) {
		this.shape = type;
	}.bind(g);

	g.transformPoint = function(x,y,z) {
		var p = new gg.P(x,y,z);
		p = this.matrices[this.GL_MODELVIEW].ctm.transformPoint(p);
		p = this.matrices[this.GL_PROJECTION].ctm.transformPoint(p);
		return p;
	}

	g.transformVector = function(x,y,z) {
		var p = new gg.P(x,y,z);
		p = this.matrices[this.GL_MODELVIEW].ctm.transformVector(p);
		p = this.matrices[this.GL_PROJECTION].ctm.transformVector(p);
		return p;
	}

	g.v = function(x,y,z) {
		this.vertices.push(this.transformPoint(x,y,z));
		return this;
	}.bind(g);

	g.endShape = function() {
		this.beginPath();
		for (var i = 0; i < this.vertices.length; i++) {
			var p = this.vertices[i];
			if (i == 0) {
				this.moveTo(p.x, p.y);
			} else {
				this.lineTo(p.x, p.y);
			}
		}
		this.closePath();
		if (this.shape == this.GL_LINES)
			this.stroke(); // just draw some lines for now.
		if (this.shape == this.GL_POLY)
			this.fill();
		this.vertices = [];
	}.bind(g);
}

gg.addContextExtrasTransform = function(g) {
	g.rotate = function(a,x,y,z) {
		return this.transform().rotate(a,x,y,z);
	}.bind(g);

	g.translate = function(x,y,z) {
		return this.transform().translate(x,y,z);
	}.bind(g);

	g.scale = function(x,y,z) {
		if (typeof(z) === 'undefined') {
			z = 1.0;
		}
		return this.transform().scale(x,y,z);
	}.bind(g);

	g.loadIdentity = function() {
		return this.transform().loadIdentity();
	}.bind(g);

	g.pushMatrix = function() {
		return this.transform().pushMatrix();
	}.bind(g);

	g.popMatrix = function() {
		return this.transform().popMatrix();
	}.bind(g);
}

gg.addContextExtrasShapes = function(g) {
	g.edge = function(v0, v1) {
		var g = this;
		g.beginShape(g.GL_LINES);
		g.v(v0); g.v(v1);
		g.endShape();
	}.bind(g);

	g.dashed = function(v0, v1, dashes) {
		var g = this;
		for (var i = 0; i < dashes; i += 2) {
			g.beginShape(g.GL_LINES);
			g.v(v0.d().lerp((i+0.0)/dashes, v1));
			g.v(v0.d().lerp((i+1.0)/dashes, v1));
			g.endShape();
		}
	}.bind(g);

	g.arrow = function(p, v, shaft, head, points) {
		var g = this;
		points = points || 8;
		shaft = shaft || v.mag();
		head = head || (shaft * 0.2);

		var vn = v.d().normalized();
		
		// Find tangent vector.
		var T = v.d().normed(gg.V(0,0,1));
		if (T.mag2() == 0) {
			T = v.d().normed(gg.V(0,1,0));
		}
		var off = T.d().add(-1.5, vn).normalized().mul(head);
		var end = p.d().add(shaft, vn);

		g.edge(p, end);
		for (var i = 0; i < points; i++) {
			var t0 = end.d().add(1, 
					off.d().rotate((i+0)*Math.PI*2.0/points, vn));
			var t1 = end.d().add(1, 
					off.d().rotate((i+1)*Math.PI*2.0/points, vn));

			g.edge(end, t0);
			g.edge(t0, t1);
		}
	}.bind(g);

	g.text = function(s, x, y, z) {
		var g = this;
		var p = g.transformPoint(x,y,z);
		g.fillText(s, p.x, p.y);
	}.bind(g);

	g.circle = function(center, normal, radius, points) {
		points = points || 16;

		var N = normal.d().normalized();
		var T = gg.V(0,0,1).crossed(normal);
		if (T.mag2() == 0)
			T = gg.V(0,1,0).crossed(normal);
		T.normalized().mul(radius);

		g.beginShape(g.GL_LINES);
		for (var i = 0; i <= points; i++) {
			g.v(T.d().rotate(Math.PI*2*i/points, N).add(1, center));
		}
		g.endShape();
	}.bind(g);

	g.cylinder = function(center, tangent, radius, points) {
		points = points || 16;
		g.circle(center.d().add(1, tangent), tangent, radius, points);
		g.circle(center.d().add(-1, tangent), tangent, radius, points);

		var N = tangent.d().normalized();
		var T = gg.V(0,0,1).crossed(tangent);
		if (T.mag2() == 0)
			T = gg.V(0,1,0).crossed(tangent);
		T.normalized().mul(radius);

		for (var i = 0; i <= points; i++) {
			g.beginShape(g.GL_LINES);
			g.v(T.d().rotate(Math.PI*2*i/points, N).add(1, center.d().add(1, tangent)));
			g.v(T.d().rotate(Math.PI*2*i/points, N).add(1, center.d().add(-1, tangent)));
			g.endShape();
		}
	};

	g.sphere = function(p, radius, points) {
		points = points || 16;

		var N = gg.V(0, 1, 0);

		// This should be possible to calculate explicitly
		// with a little trig; put it on the todo list.
		// The problem is that the method below computes
		// a polygonal approximation of a sphere, which 
		// will be fully contained within the convex
		// hull of the sphere. This creates the unfortunate
		// effect that, at small numbers of points, the average
		// radius of each polyloop is a bit smaller than the
		// radius of the actual sphere. This factor compensates
		// for this visually.
		var inflate = 1.1;

		for (var i = 0; i < points; i++) {
			var a = Math.PI * (i+1.0) / (points+1.0);
			var R = Math.sin(a)*radius*inflate;
			var y = Math.cos(a)*radius;
			var C = p.d().add(y, N);
			this.circle(C, N, R, points);
		}
	}.bind(g);

	g.diagPlane = function(p, v, size, pLabel, vLabel) {
		var g = this;
		pLabel = pLabel || " ";
		vLabel = vLabel || " ";

		var T = gg.V(0, 0, 1).crossed(v);
		if (T.mag2() == 0) T = gg.V(0, 1, 0).crossed(v);
		T.normalized();

		var K = T.d().normed(v);

		var vn = v.d().normalized();
		var e = p.d().add(size/2.0, T).add(size/2.0, K);

		var n = 4;
		for (var i = 0; i < n; i++) {
			g.edge(
				e.d().rotateAround(p, Math.PI*2.0*(i+0)/n, vn),
				e.d().rotateAround(p, Math.PI*2.0*(i+1)/n, vn)
			);	
		}

		g.arrow(p, vn, size);

		g.text(pLabel, p);
		g.text(vLabel, p.d().add(size*1.1, vn));
	}.bind(g);

	g.grid = function(p, I, J, Ni, Nj) {
		Nj = Nj || Ni;
		for (var i = 0; i < Ni; i++) {
			var s = i / (Ni - 1.0);
			var A = p.d().add(s, I);
			var B = p.d().add(s, I).add(1, J);
			g.edge(A, B);
		}
		for (var j = 0; j < Nj; j++) {
			var t = j / (Nj - 1.0);
			var A = p.d().add(t, J);
			var B = p.d().add(t, J).add(1, I);
			g.edge(A, B);
		}
	}

};

gg.addContextExtrasDefaults = function(g, canvas) {
	g.textAlign = "center";
	g.font = "bold 12px monospace";
	g.mouseX = 0.0;
	g.mouseY = 0.0;
};

