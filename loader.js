images = {}

for(const filename of [
	"arrow"
]) {
	let img = new Image();
	img.src = `assets/${filename}.png`;
	images[filename] = img;
}