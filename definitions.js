const pos_mod = (a, b) => (b + a % b) % b;

//Vector functions to make code more compact
//Praying no one reads this later and calls me messy
const v = (x, y) => ({ x, y: y || x });
const ranv = (l, h) => vadd(l, vmul(vsub(h, l), v(Math.random(), Math.random())));
const angv = (a, m) => vscl(m, v(Math.sin(a), Math.cos(a)));
const vdec = (u) => [pos_mod(Math.atan2(...arr(u)), 2 * Math.PI), vlen(u)];
const vneg = (u) => ({ x: -u.x, y: -u.y });
const vadd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const vsub = (a, b) => vadd(a, vneg(b));
const vmul = (a, b) => ({ x: a.x * b.x, y: a.y * b.y });
const vdiv = (a, b) => ({ x: a.x / b.x, y: a.y / b.y });
const vscl = (c, u) => vmul(v(c), u);
const negy = (u) => vmul(v(1, -1), u);
const vlen = (u) => dist(u, v(0));
const unit = (u) => vscl(1 / vlen(u), u);
const intv = (u) => ({ x: Math.round(u.x), y: Math.round(u.y) });
const vpow = (u, n) => ({ x: Math.pow(u.x, n), y: Math.pow(u.y, n) });
const vmod = (a, b) => ({ x: pos_mod(a.x, b.x), y: pos_mod(a.y, b.y) });
const toln = (l, u) => vscl(l, unit(u));
const dist = (a, b) => {
	let diff = vsub(a, b);
	let dot = vmul(diff, diff);
	return Math.sqrt(dot.x + dot.y);
};
const arr = (u) => [u.x, u.y];
const sign = (x) => x / Math.abs(x);
const ccw_ordered = (a, b, c) => {
	if (c > a)
		return c > b && b > a;
	else if (c < a) {
		return (b < c) || (b > a);
	}
};
const rev = (a) => {
	let c = a.slice(0);
	c.reverse();
	return c;
}


function dbg(x) {
	console.log(x);
	return x;
}

const canvas = document.getElementById('screen');
canvas.width = 1500;
canvas.height = 1500;
canvas.style.width = '750px';
canvas.style.height = '750px';
canvas.style.cursor = 'none';

const cdims = v(canvas.width, canvas.height);
const gdims = v(30, 30);

const ctx = canvas.getContext('2d', { alpha: true });
ctx.scale(...arr(negy(vdiv(cdims, gdims))));
ctx.translate(gdims.x / 2, -gdims.y / 2);

const ui = {
	debug: false,
	mouse: v(0),
	keyMap: {},
	keyUpFuncs: {},
	keyDownFuncs: {},
	key: function (c) {
		if (!this.keyMap[c]) {
			this.keyMap[c] = { down: false, count: 0 }
		}
		return this.keyMap[c];
	},
	pkey: function (c) {
		return this.key(ccode(c));
	}
}

/* helpers */
const SHIFT_KC = 16;
const ENTER_KC = 13;

function ccode(ch) {
	let str = "" + ch;
	return str.charCodeAt(str[0]);
}

ui.keyUpFuncs[ccode('I')] = (ui) => {
	ui.debug = ui.pkey('I').count % 2 != 0;
	canvas.style.cursor = ui.debug ? 'crosshair' : 'none';
};

ui.keyUpFuncs[ENTER_KC] = (ui) => {
	ship.landing = ui.key(ENTER_KC).count % 2 != 0;
	ship.winding = { prev_ang: 0, barrier: 0, count: 0, dir: 0 };
};

function capMouse(e) {
	let rect = canvas.getBoundingClientRect();
	let mdims = vscl(.25, cdims);
	ui.mouse.x = e.clientX - rect.left - mdims.x;
	ui.mouse.y = rect.top + mdims.y - e.clientY;
	ui.mouse = vdiv(vmul(vscl(.5, gdims), ui.mouse), mdims);
}

function keyDown(e) {
	ui.keyMap[e.keyCode] = {
		down: true,
		count: ui.key(e.keyCode).count
	};
	if (ui.keyDownFuncs[e.keyCode]) {
		ui.keyDownFuncs[e.keyCode](ui);
	}
}

function keyUp(e) {
	ui.keyMap[e.keyCode] = {
		down: false,
		count: ui.key(e.keyCode).count + 1
	};
	if (ui.keyUpFuncs[e.keyCode]) {
		ui.keyUpFuncs[e.keyCode](ui);
	}
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);

function drawImage(image, x, y, w, h, theta) {
	ctx.save();
	ctx.scale(1, -1);
	ctx.translate(x, y);
	ctx.rotate(theta);
	ctx.translate(-x - w / 2, -y - h / 2);
	ctx.drawImage(image, x, y, w, h);
	ctx.restore();
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	this.beginPath();
	this.moveTo(x + r, y);
	this.arcTo(x + w, y, x + w, y + h, r);
	this.arcTo(x + w, y + h, x, y + h, r);
	this.arcTo(x, y + h, x, y, r);
	this.arcTo(x, y, x + w, y, r);
	this.closePath();
	return this;
}

const deg = (r) => (180 * r / Math.PI);