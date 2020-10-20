import JSZip from 'jszip';

const estimateStorageSpace = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const res = await navigator.storage.estimate();
    return res;
  }
  return null;
};

const getDataUrl = (file) => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
  })
);

const getImageDimensions = (dataUrl) => (
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.addEventListener('load', () => {
      let format = '';
      switch (true) {
        case img.width > img.height:
          format = 'album';
          break;
        case img.height > img.width:
          format = 'portrait';
          break;
        case img.width === img.height:
          format = 'square';
          break;
        default:
          throw new Error('unexpected width/height ratio');
      }
      return resolve({
        width: img.width, height: img.height, format,
      });
    });
    img.addEventListener('error', () => reject(new Error('Error in getting width, height process')));
  })
);

const createZip = async (content) => {
  const zip = new JSZip();
  content.forEach(({ name, dataUrl }) => {
    const mimeTypeLastSymbolIndex = dataUrl.indexOf(',');
    const trimmedUrl = dataUrl.slice(mimeTypeLastSymbolIndex);
    zip.file(name, trimmedUrl, { base64: true });
  });
  const convertedZip = await zip.generateAsync({ type: 'base64' });
  const res = `data:application/zip;base64,${convertedZip}`;
  return res;
};

const catchError = async (f, errorHandler, ...args) => {
  let result;
  try {
    result = await f(...args);
  } catch (e) {
    errorHandler(e);
  }
  return result;
};

export {
  catchError, createZip, getImageDimensions, getDataUrl, estimateStorageSpace,
};
