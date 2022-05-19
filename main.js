let ship = {
	pos: { x: 0, y: 0 },
	draw: function () {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.arc(this.pos.x, this.pos.y, .5, 0, 2 * Math.PI);
		ctx.fill();
	}
};

let start, previousTimeStamp;
function step(timestamp) {
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(-gdims.x / 2, -gdims.y / 2, gdims.x, gdims.y);
	ui.update();

	if (start === undefined) {
		start = timestamp;
	}
	const elapsed = timestamp - start;
	start = timestamp;

	ship.pos = ui.mouse;
	console.log(ui.mouse);
	ship.draw();

	if (ui.debug) {
		ctx.save();
		ctx.scale(.5, -.5);
		ctx.font = "1px Arial";
		ctx.fillStyle = 'green';
		ctx.fillText(`FPS: ${Number.parseInt(1000 / elapsed)}`, -19.5, -19);
		ctx.restore();
	}

	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);