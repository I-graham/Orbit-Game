const GRAV = 6000; //Gravitational constant not based in reality to make game fun
const TOLERANCE = 8;
const PLAN_RAD = 8;
const LAP_GOAL = 3;

const planet = {
	pos: angv(2 * Math.PI * Math.random(), Math.random() * 100 + 100),
	rad: PLAN_RAD,
	draw: function () {
		ctx.arc(...arr(this.pos), this.rad, 0, 2 * Math.PI);
		let dir = vsub(this.pos, world.cam_pos);
		let [a, _] = vdec(dir);
		drawImage(images['arrow'], ...arr(negy(vadd(world.cam_pos, toln(1.4 * TOLERANCE, dir)))), 1, 1.5, a);
		ctx.fill();
	},
};

const ship = {
	pos: v(0),
	vel: v(0),
	dir: 0,
	ang_vel: 0,
	dead: false,
	landing: false,
	update: function (ts) {

		let d = dist(ship.pos, planet.pos);

		let acc = angv(this.dir, !this.landing && (ui.pkey(' ').down * 2 - ui.key(16).down * 1.5));

		let dir = vsub(planet.pos, this.pos);
		let [a, _] = vdec(dir);
		acc = vadd(acc, angv(a, GRAV / (d * d)));

		let torque = !this.landing && (ui.pkey('D').down - ui.pkey('A').down);
		acc = vadd(acc, angv(this.dir + torque * (Math.PI / 10), torque && 1));

		this.pos = vadd(this.pos, vscl(ts, this.vel));
		this.vel = vadd(this.vel, vscl(ts, acc));

		this.dir += this.ang_vel * ts;
		this.ang_vel += torque * ts;

		if (vlen(vsub(this.pos, planet.pos)) < PLAN_RAD)
			this.dead = true;

	},
	draw: function () {
		ctx.beginPath();
		ctx.fillStyle = 'white';

		if (!this.landing && ui.key(SHIFT_KC).down)
			drawImage(
				images['flame'],
				...arr(negy(
					vadd(this.pos, angv(this.dir, 0.25))
				)),
				.8, 2, this.dir + Math.PI);

		drawImage(images['rocket'], ...arr(negy(this.pos)), 1, 2, this.dir);

		const rotdir = !this.landing && (ui.pkey('D').down - ui.pkey('A').down);
		if (rotdir != 0)
			drawImage(images['flame'], ...arr(negy(this.pos)), 1, 2, this.dir + (Math.PI / 10) * rotdir);

		if (!this.landing && ui.pkey(' ').down)
			drawImage(images['flame'], ...arr(negy(this.pos)), 1, 2, this.dir);

		ctx.fill();
	}
};

const world = {
	cam_pos: v(0),
	stars: genStars(300),
	winding: { prev_ang: 0, barrier: 0, count: 0, dir: 0 },
	update: function (timestep) {
		ship.update(timestep);

		//squircle fun
		//makes camera to follow ship
		let d = vsub(ship.pos, this.cam_pos)
		d = vpow(d, 6);
		d = Math.pow(d.x + d.y, 1 / 6);
		if (d > TOLERANCE) {
			let dir = vsub(ship.pos, this.cam_pos);
			let diff = toln(d - TOLERANCE, dir);
			this.cam_pos = vadd(this.cam_pos, diff);
		}

		let [angle, _] = vdec(vsub(ship.pos, planet.pos));

		if (ship.landing) {

			if (this.winding.dir === 0) {
				this.winding.barrier = angle;
				this.winding.dir = sign(pos_mod(angle - this.winding.prev_ang, 2 * Math.PI) - Math.PI);
			}

			let angs = [this.winding.prev_ang, this.winding.barrier, angle];
			let ordered = ccw_ordered(this.winding.prev_ang, this.winding.barrier, angle);
			if ((this.winding.dir < 0 && ccw_ordered(...angs))
				|| (this.winding.dir > 0 && ccw_ordered(...rev(angs)))) {
				this.winding.count += 1;
			}

		}
		this.winding.prev_ang = angle;

	},
	draw: function () {
		ctx.save();

		for (let s of this.stars) {
			ctx.fillStyle = 'white';

			ctx.beginPath();
			let sgdims = vscl(1.5, gdims);
			// star coordinate shifting math
			// let coord = (star-cam)%sgdims-sgdims/2
			let coords = vsub(vmod(vsub(s, this.cam_pos), sgdims), vscl(.5, sgdims));
			ctx.arc(...arr(coords), s.r, 0, 2 * Math.PI);

			ctx.fill();
		}

		if (ship.dead) {
			ctx.scale(1, -1);
			ctx.fillStyle = 'rgb(5,0,25)';
			ctx.fillRect(...arr(vscl(-.5, gdims)), ...arr(gdims));
			ctx.fillStyle = 'rgb(255,255,255)';
			ctx.fillText(`You crashed :(`, -4, -2);
			ctx.fillText(`Time: ${((prevts - start) * 1000).toFixed(0)} ms`, -4, 0);
			return;
		}

		if (world.winding.count >= LAP_GOAL) {
			ctx.scale(.2, -.2);
			ctx.fillStyle = 'rgb(25,160,0)';
			ctx.fillRect(...arr(vscl(-10, gdims)), ...arr(vscl(20,gdims)));
			ctx.fillStyle = 'rgb(0,0,0)';
			ctx.fillText(`You win!`, -20, -2);
			ctx.fillText(`Orbit reached in ${prevts.toFixed(2)} s`, -50, 10);
			return;
		}

		ctx.translate(...arr(vneg(this.cam_pos)));
		ship.draw();
		planet.draw();
		ctx.restore();
		ctx.save();

		ctx.scale(.5, -.5);
		ctx.font = "1px monospace";
		if (ui.debug) {
			ctx.fillStyle = 'green';
			const texts = [
				`FPS: ${Number.parseInt(fps)}`,
			];
			for (let i = 0; i < texts.length; i++) {
				ctx.fillText(texts[i], -29.75, -29 + i);
			}
		}

		//HUD / Stox
		//Dimensions are trial&error-ed, but no one has to know...
		let col = '120,140,250';
		ctx.fillStyle = `rgba(${col},0.25)`;
		ctx.strokeStyle = `rgba(${col},0.5)`;
		ctx.lineWidth = .25;
		ctx.roundRect(-29.75, 19.25, 18.5, 10.25, 0.25);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = `white`;
		let d_to_p = dist(ship.pos, planet.pos);
		const texts = [
			`position       : (${arr(intv(ship.pos))}) km`,
			`velocity       : (${arr(intv(ship.vel))}) km`,
			`speed          : ${vlen(ship.vel).toFixed(1)} km/s`,
			`vel. angle     : ${pos_mod(deg(vdec(ship.vel)[0]), 360).toFixed(0)}\xB0`,
			`angle          : ${pos_mod(deg(ship.dir), 360).toFixed(0)}\xB0`,
			`angular vel.   : ${deg(ship.ang_vel).toFixed(1)}\xB0/s`,
			`dist. to target: ${(d_to_p - PLAN_RAD).toFixed(0)} km`,
			`grav. accel.   : ${(GRAV / (d_to_p * d_to_p)).toFixed(2)} km/s\xB2`
		];
		for (let i = 0; i < texts.length; i++) {
			ctx.fillText(texts[i], -29, 20.75 + 1.15 * i);
		}

		//Landing box
		if (ship.landing) {
			col = `235,50,105`;
			ctx.fillStyle = `rgba(${col},0.25)`;
			ctx.strokeStyle = `rgba(${col},0.5)`;
			ctx.lineWidth = .25;
			ctx.roundRect(-15, 10, 30, 5, 0.25);
			ctx.stroke();
			ctx.fill();

			if (prevts % 2 < 1) {
				ctx.save();
				ctx.fillStyle = `white`;
				ctx.scale(2, 2);
				ctx.fillText(`Orbiting! (Lap #${this.winding.count+1})`, -5, 6.525);
				ctx.restore();
			}
		}

		ctx.restore();
	}
};

let prevts, start, fps;
function step(timestamp) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(...arr(vscl(-.5, gdims)), ...arr(gdims));

	timestamp /= 1000;
	if (prevts === undefined) {
		start = timestamp;
		prevts = timestamp;
	}
	const timestep = timestamp - prevts;
	prevts = timestamp;
	fps = 1 / timestep;

	world.update(timestep * (ship.landing ? 8 : 1));
	world.draw();


	if (!ship.dead && world.winding.count < LAP_GOAL) {
		window.requestAnimationFrame(step);
	}
}
window.requestAnimationFrame(step);

function genStars(n) {
	let stars = [];
	for (let i = 0; i < n; i++) {
		stars.push({
			...ranv(v(0), vscl(1.5, gdims)),
			r: Math.pow(10 * Math.random(), 1 / 3) / 50,
		});
	}
	return stars;
}