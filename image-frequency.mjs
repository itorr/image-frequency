const src = 'IMG_9557_640.png';
// const src = '20190224-OAQ_0654.webp';


const getImageElBySrc = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.src = src;
  img.onload = () => resolve(img);
  img.onerror = reject;
});

const level = 4;

getImageElBySrc(src).then(sourceImage => {

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = sourceImage.naturalWidth;
	canvas.height = sourceImage.naturalHeight;

	document.body.appendChild(canvas);
	// 绘制原始图像到canvas
	ctx.drawImage(sourceImage, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const pixels = imageData.data;

	// 模糊程度的步长，可以根据需要调整，控制每次模糊变化的幅度
	const blurStep = 12; 
	// 最大模糊程度，也可以按需调整，决定了划分频率图像的次数和程度
	const maxBlurLevel = 3; 
	const frequencyImages = [];

	let currentPixels = pixels;
	let blurredPixels;
	for (let i = 1; i < maxBlurLevel; i++) {
		// 每次进行一定程度的模糊
		blurredPixels = applyBlur(currentPixels, canvas.width, canvas.height, i * blurStep);
		drawFrequencyImage(blurredPixels, canvas.width, canvas.height);
		// 用前一次（更清晰）的图像减去当前模糊后的图像，得到类似频率差异的图像
		const frequencyPixels = subtractPixels(currentPixels, blurredPixels, canvas.width, canvas.height);
		frequencyImages.push(frequencyPixels);
		currentPixels = blurredPixels;
	}
	frequencyImages.push(blurredPixels);


	// 将所有频率图像绘制回canvas（这里简单示例，可调整透明度等更好还原）
	for (let j = frequencyImages.length - 1; j >= 0; j--) {
		const alpha = 1 / (j + 1); // 简单设置透明度，越后面的频率图像透明度越低
		drawFrequencyImage(frequencyImages[j], canvas.width, canvas.height, alpha);
	}
}).catch(console.error);

// 模糊半径，可调整
function applyBlur(pixels, width, height, radius = 5) {
	console.log('applyBlur', radius);
	const newPixels = new Uint8ClampedArray(pixels.length);
	const kernelSize = radius * 2 + 1;
	const kernel = [];
	for (let i = 0; i < kernelSize; i++) {
		kernel.push(1 / kernelSize);
	}
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let r = 0, g = 0, b = 0, a = 0;
			let count = 0;
			for (let ky = -radius; ky <= radius; ky++) {
				for (let kx = -radius; kx <= radius; kx++) {
					const posX = x + kx;
					const posY = y + ky;
					if (posX >= 0 && posX < width && posY >= 0 && posY < height) {
						const index = (posY * width + posX) * 4;
						r += pixels[index];
						g += pixels[index + 1];
						b += pixels[index + 2];
						a += pixels[index + 3];
						count++;
					}
				}
			}
			const newIndex = (y * width + x) * 4;
			newPixels[newIndex] = r / count;
			newPixels[newIndex + 1] = g / count;
			newPixels[newIndex + 2] = b / count;
			newPixels[newIndex + 3] = a / count;
		}
	}
	return newPixels;
}

function subtractPixels(pixels1, pixels2, width, height) {
	const newPixels = new Uint8ClampedArray(pixels1.length);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			newPixels[index] = Math.abs(pixels1[index] - pixels2[index]);
			newPixels[index + 1] = Math.abs(pixels1[index + 1] - pixels2[index + 1]);
			newPixels[index + 2] = Math.abs(pixels1[index + 2] - pixels2[index + 2]);
			newPixels[index + 3] = pixels1[index + 3];
		}
	}
	return newPixels;
}

function drawFrequencyImage(pixels, width, height, alpha) {
	const imageData = new ImageData(pixels, width, height);

	const frequencyCanvas = document.createElement('canvas');
	const frequencyCtx = frequencyCanvas.getContext('2d');
	frequencyCanvas.width = width;
	frequencyCanvas.height = height;
	frequencyCtx.putImageData(imageData, 0, 0);

	document.body.appendChild(frequencyCanvas);
}