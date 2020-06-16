const getImageFromUrl = (url) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", reject);
		// image.setAttribute("crossOrigin", "anonymous") // needed to avoid cross-origin issues on CodeSandbox
		image.src = url
	})

const getBlobFromCanvas = (canvas, file) =>
	new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				blob.name = file.name;
				blob.lastModified = file.lastModified;
				resolve(blob);
			} else {
				reject(new Error("Canvas is empty"));
			}
		}, file.type); //"image/jpeg");
	});

export default async (imageUrl, file, crop) => {
	const image = await getImageFromUrl(imageUrl),
		canvas = document.createElement("canvas"),
		scaleX = image.naturalWidth / image.width,
		scaleY = image.naturalHeight / image.height,
		ctx = canvas.getContext("2d");

	canvas.width = crop.width;
	canvas.height = crop.height;

	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		crop.width,
		crop.height
	);

	return await getBlobFromCanvas(canvas, file);
}