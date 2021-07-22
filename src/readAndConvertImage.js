import imageCompression from 'browser-image-compression';

import loadTga from './loadTga';

async function readAndConvertImage(file, options) {
  const dotIndex = file.name.lastIndexOf('.');
  return {
    pageNumber: parseInt(file.name.substring(dotIndex - 5), 10),
    imageData: await getCompressedFromTga(file, options),
  };
}

async function getCompressedFromTga(file, options) {
  return getImageDataFromTga(file)
    .then((imageData) => getCanvasFromImageData(imageData, options))
    .then((canvas) => getPngOrJpgFromCanvas(canvas, options));
}

async function getImageDataFromTga(file) {
  return await new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (progressEvent) => {
      resolve(await loadTga(new Uint8Array(progressEvent.target.result)));
    };

    reader.readAsArrayBuffer(file);
  });
}

function getCanvasFromImageData(imageData, options) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(-10, -10, imageData.width + 20, imageData.height + 20);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

async function getPngOrJpgFromCanvas(canvas, options) {
  const png = await imageCompression.canvasToFile(canvas, 'image/png');

  const compressedPng = await imageCompression(png, { maxWidthOrHeight: Math.max(options.width, options.height) });
  const pngImageData = new Uint8Array(await compressedPng.arrayBuffer());

  const compressedJpg = await imageCompression(
    png,
    {
      maxWidthOrHeight: Math.max(options.width, options.height),
      initialQuality: 0.9,
      fileType: 'image/jpeg',
    },
  );
  const jpgImageData = new Uint8Array(await compressedJpg.arrayBuffer());

  if (pngImageData.length <= jpgImageData.length * 1.1) {
    return pngImageData;
  } else {
    return jpgImageData;
  }
}

export default readAndConvertImage;
