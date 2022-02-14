const getBlobFromCanvas = (canvas, file, withUrl) =>
	new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				blob.name = file.name;
				blob.lastModified = file.lastModified;

                let blobUrl, revokeUrl;

                if (withUrl) {
                    blobUrl = URL.createObjectURL(blob);
                    revokeUrl = () => URL.revokeObjectURL(blobUrl);
                }

                resolve({ blob, blobUrl, revokeUrl });
			} else {
				reject(new Error("Canvas is empty"));
			}
		}, file.type);
	});

const cropImage = async (imageElm, file, crop, withUrl = false) => {
    const canvas = document.createElement("canvas"),
        scaleX = imageElm.naturalWidth / imageElm.width,
        scaleY = imageElm.naturalHeight / imageElm.height,
        pixelRatio = window.devicePixelRatio,
        ctx = canvas.getContext("2d");

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        imageElm,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
    );

    return await getBlobFromCanvas(canvas, file, withUrl);
};

export default cropImage;
