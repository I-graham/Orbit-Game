let ship = {
	pos: { x: 0, y: 0 },
	dir: 0,
	ang_vel: 0,
	update: function (ts) {
		let torque = ui.getPKey('D').down - ui.getPKey('A').down;
		this.dir += this.ang_vel * ts;
		this.ang_vel += torque * ts;
	},
	draw: function () {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.save();
		ctx.scale(1, -1);
		ctx.rotate(this.dir);
		ctx.drawImage(images['arrow'], ...arr(vadd(v(-.5), negy(this.pos))), 1, 1);
		ctx.restore();
		ctx.fill();
	}
};

let start, previousTimeStamp;
function step(timestamp) {
	ctx.save();

	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(...arr(vscl(.5, vneg(gdims))), ...arr(gdims));
	ui.update();

	if (start === undefined) {
		start = timestamp / 1000;
	}
	const timestep = timestamp / 1000 - start;
	start = timestamp / 1000;

	ship.update(timestep);
	ship.draw();

	if (ui.debug) {
		ctx.save();
		ctx.scale(.5, -.5);
		ctx.font = "1px Arial";
		ctx.fillStyle = 'green';
		ctx.fillText(`FPS: ${Number.parseInt(1000 / timestep)}`, -19.5, -19);
		ctx.restore();
	}

	ctx.restore();
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);