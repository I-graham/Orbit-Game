const ship = {
	pos: v(0),
	vel: v(0),
	dir: 0,
	ang_vel: 0,
	update: function (ts) {
		let torque = ui.pkey('D').down - ui.pkey('A').down;

		let acc = angv(this.dir, ui.pkey(' ').down);
		acc = vadd(acc, angv(this.dir + Math.PI / 2, 0.75 * torque));
		this.pos = vadd(this.pos, vscl(ts, this.vel));
		this.vel = vadd(this.vel, vscl(ts, acc));

		this.dir += this.ang_vel * ts;
		this.ang_vel += torque * ts;

	},
	draw: function () {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		drawImage(
			images[ui.pkey(' ').down ? 'rocket' : 'rocket_nf'],
			...arr(negy(this.pos)), 1, 2, this.dir);
		ctx.fill();
	}
};

const world = {
	cam_pos: v(0),
	stars: genStars(500),
	update: function (timestep) {
		ship.update(timestep);

		//squircle fun
		const MAX = 8;
		let d = vsub(ship.pos, this.cam_pos)
		d = vpow(d, 6);
		d = Math.pow(d.x + d.y, 1 / 6);
		if (d > MAX) {
			let dir = vsub(ship.pos, this.cam_pos);
			let diff = vscl(d - MAX, unit(dir));
			this.cam_pos = vadd(this.cam_pos, diff);
		}
	},
	draw: function () {
		ctx.save();

		for (let s of this.stars) {
			ctx.fillStyle = 'white';

			const pos_mod = (a, b) => (b + a % b) % b;

			ctx.beginPath();
			let xc = pos_mod(s.x - this.cam_pos.x, 2 * gdims.x) - gdims.x;
			let yc = pos_mod(s.y - this.cam_pos.y, 2 * gdims.y) - gdims.y;
			ctx.arc(xc, yc, s.r, 0, 2 * Math.PI);

			ctx.fill();
		}

		ctx.translate(...arr(vneg(this.cam_pos)));
		ship.draw();
		ctx.restore();
		ctx.save();

		if (ui.debug) {
			ctx.scale(.5, -.5);
			ctx.font = "1px Arial";
			ctx.fillStyle = 'green';
			const texts = [
				`FPS: ${Number.parseInt(fps)}`,
				`X,Y: ${arr(intv(ship.pos))}`,
				`Cam: ${arr(intv(world.cam_pos))}`
			];
			for (let i = 0; i < texts.length; i++) {
				ctx.fillText(texts[i], -19.5, -19 + i);
			}
		}
		ctx.restore();
	}
};

let start, previousTimeStamp;
let fps;
function step(timestamp) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(...arr(vscl(-.5, gdims)), ...arr(gdims));

	timestamp /= 1000;
	if (start === undefined) {
		start = timestamp;
	}
	const timestep = timestamp - start;
	start = timestamp;
	fps = 1 / timestep;

	world.update(timestep);
	world.draw();

	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

function genStars(n) {
	let stars = [];
	for (let i = 0; i < n; i++) {
		stars.push({
			x: gdims.x * 2 * Math.random(),
			y: gdims.y * 2 * Math.random(),
			r: Math.pow(10 * Math.random(), 1 / 3) / 50,
		});
	}
	return stars;
}