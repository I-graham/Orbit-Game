const v = (x, y) => ({ x, y: y || x });
const vneg = (u) => ({ x: -u.x, y: -u.y });
const vadd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const vsub = (a, b) => vadd(a, vneg(b));
const vmul = (a, b) => ({ x: a.x * b.x, y: a.y * b.y });
const vdiv = (a, b) => ({ x: a.x / b.x, y: a.y / b.y });
const vscl = (c, u) => vmul(v(c), u);

let canvas = document.getElementById('screen');
let ctx = canvas.getContext('2d', { alpha: false });
canvas.width = 1500;
canvas.height = 1500;
canvas.style.width = '750px';
canvas.style.height = '750px';

let cdims = v(canvas.width, canvas.height);
let gdims = v(20, 20);

ctx.scale(cdims.x / gdims.x, -cdims.y / gdims.y);
ctx.translate(gdims.x / 2, -gdims.y / 2);

ctx.save();
ctx.restore();

let ui = {
	debug: false,
	mouse: v(0),
	keyMap: {},
	update: function () {
		this.debug = this.keyMap[toCode('D')]?.count % 2 != 0;
	},
}

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
	let count = ui.keyMap[e.keyCode]?.count || 0;
	ui.keyMap[e.keyCode] = { down: true, count };
}

function keyUp(e) {
	ui.keyMap[e.keyCode] = {
		down: false,
		count: ui.keyMap[e.keyCode].count + 1
	};
}

window.addEventListener("keydown", keyDown, false);
window.addEventListener("keyup", keyUp, false);