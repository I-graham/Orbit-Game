images = {}

for(const filename of [
	"rocket",
	"flame"
]) {
	let img = new Image();
	img.src = `assets/${filename}.png`;
	images[filename] = img;
}

