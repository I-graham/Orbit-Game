images = {}

for (const filename of [
	"rocket",
	"arrow",
	"flame",
]) {
	let img = new Image();
	img.src = `assets/${filename}.png`;
	images[filename] = img;
}

