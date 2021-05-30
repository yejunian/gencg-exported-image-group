import TgaLoader from 'tga-js';

export default function openTga(url) {
  return new Promise((resolve) => {
    const tga = new TgaLoader();
    tga.open(url, () => {
      resolve(tga);
    });
  });
};
