images = {}

for(const filename of [
	"rocket",
	"rocket_nf"
]) {
	let img = new Image();
	img.src = `assets/${filename}.png`;
	images[filename] = img;
}

