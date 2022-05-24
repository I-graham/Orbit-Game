const v = (x, y) => ({ x, y: y || x });
const vneg = (u) => ({ x: -u.x, y: -u.y });
const vadd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const vsub = (a, b) => vadd(a, vneg(b));
const vmul = (a, b) => ({ x: a.x * b.x, y: a.y * b.y });
const vdiv = (a, b) => ({ x: a.x / b.x, y: a.y / b.y });
const vscl = (c, u) => vmul(v(c), u);
const negy = (u) => vmul(v(1, -1), u);
const arr = (u) => [u.x, u.y];

let canvas = document.getElementById('screen');
canvas.width = 1500;
canvas.height = 1500;
canvas.style.width = '750px';
canvas.style.height = '750px';
canvas.style.cursor = 'none';

let cdims = v(canvas.width, canvas.height);
let gdims = v(20, 20);


let ctx = canvas.getContext('2d', { alpha: false });
ctx.scale(...arr(negy(vdiv(cdims, gdims))));
ctx.translate(gdims.x / 2, -gdims.y / 2);

ctx.save();
ctx.restore();

let ui = {
	debug: false,
	mouse: v(0),
	cam_pos: v(0),
	keyMap: {},
	keyUpFuncs: {},
	keyDownFuncs: {},
	getKey: function (c) {
		if (!this.keyMap[c]) {
			this.keyMap[c] = { down: false, count: 0 }
		}
		return this.keyMap[c];
	},
	getPKey: function (c) {
		return this.getKey(toCode(c));
	},
	update: function () {
		ctx.translate(...arr(this.cam_pos));
	},
}

ui.keyUpFuncs[toCode('I')] = (ui) => {
	ui.debug = ui.getPKey('I').count % 2 != 0;
	canvas.style.cursor = ui.debug ? 'crosshair' : 'none';
};

/* Boilerplate */
function toCode(ch) {
	let str = "" + ch;
	return str.charCodeAt(str[0]);
}

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
		count: ui.getKey(e.keyCode).count
	};
	if (ui.keyDownFuncs[e.keyCode]) {
		ui.keyDownFuncs[e.keyCode](ui);
	}
}

function keyUp(e) {
	ui.keyMap[e.keyCode] = {
		down: false,
		count: ui.getKey(e.keyCode).count + 1
	};
	if (ui.keyUpFuncs[e.keyCode]) {
		ui.keyUpFuncs[e.keyCode](ui);
	}
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);