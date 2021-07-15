import TgaLoader from 'tga-js';

export default function loadTga(uint8Array) {
  const tga = new TgaLoader();
  tga.load(uint8Array);
  return tga.getImageData();
};
