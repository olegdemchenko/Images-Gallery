import filesize from 'filesize';
import uniqid from 'uniqid';
import initView from './view';
import { setImage, deleteImage } from './idbOperations';
import catchError from './common';

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

export default (state, db) => {
  const addImageButton = document.getElementById('addImageButton');
  const addForm = document.getElementById('informationForm');
  const imagesContainer = document.getElementById('imagesContainer');
  const imageCardTemplate = document.getElementById('cardTemplate');
  const alertTemplate = document.getElementById('alertTemplate');

  const elements = {
    addForm, imagesContainer, imageCardTemplate, alertTemplate,
  };

  const { renderImages, renderForm, renderErr } = initView(state, db, elements);

  addImageButton.addEventListener('click', () => {
    /* eslint-disable no-param-reassign */
    state.formState = 'add';
    state.changedItemId = null;
    renderForm();
    /* eslint-enable no-param-reassign */
  });

  addForm.addEventListener('submit', (e) => {
    catchError(async (evt) => {
      evt.preventDefault();
      const formData = new FormData(addForm);
      const imgFile = formData.get('file');
      if (!imgFile.type.startsWith('image/')) {
        throw new Error('Wrong type of file');
      }
      const metaData = {
        id: state.formState === 'add' ? uniqid() : state.changedItemId,
        title: formData.get('title'),
        name: imgFile.name,
        description: formData.get('description'),
        size: filesize(imgFile.size, { exponent: 2 }),
        file: imgFile,
        createdOn: new Date(),
        type: imgFile.type,
      };
      const dataUrl = await getDataUrl(imgFile);
      const dimensions = await getImageDimensions(dataUrl);
      const data = { ...metaData, dataUrl, ...dimensions };
      if (state.formState === 'change') {
        await deleteImage(db, 'images', state.changedItemId);
      }
      await setImage(db, 'images', data, data.id);
      renderImages();
    }, renderErr, e);
  });
  renderImages();
};
