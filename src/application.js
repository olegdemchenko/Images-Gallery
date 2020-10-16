import filesize from 'filesize';
import uniqid from 'uniqid';
import initView from './view';
import {
  getImage, setImage, getAllImages, getAllFromIndex, deleteImage, getCount, clearStore,
} from './idbOperations';
import catchError from './common';

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

export default (state, db) => {
  const addImageButton = document.getElementById('addImage');
  const addForm = document.getElementById('informationForm');
  const imagesContainer = document.getElementById('imagesContainer');
  const imageCardTemplate = document.getElementById('cardTemplate');
  const alertTemplate = document.getElementById('alertTemplate');
  const clearStoreButton = document.getElementById('clearStore');
  const findByNameForm = document.getElementById('findByNameForm');
  const showAllButton = document.getElementById('showAll');
  const storageSizeBar = document.getElementById('storageSize');
  const imagesCountField = document.getElementById('imagesCount');

  const elements = {
    addForm, imagesContainer, imageCardTemplate, alertTemplate, imagesCountField, storageSizeBar,
  };

  const {
    renderImages, renderForm, renderStorageInfo, renderErr,
  } = initView(elements);

  const showAllImages = async () => {
    const images = await catchError(getAllImages, renderErr, db, 'images');
    renderImages(images);
  };

  const showStorageInfo = async () => {
    const res = await estimateStorageSpace();
    if (!res) {
      return;
    }
    const { usage, quota } = res;
    const percent = Math.round(usage / quota) * 100;
    const imagesCount = await getCount(db, 'images');
    renderStorageInfo(percent, imagesCount);
  };

  showAllButton.addEventListener('click', showAllImages);

  clearStoreButton.addEventListener('click', async () => {
    await catchError(clearStore, renderErr, db, 'images');
    showStorageInfo();
    showAllImages();
  });

  findByNameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const findData = new FormData(findByNameForm);
    const results = await getAllFromIndex(db, 'images', 'title_idx', findData.get('name'));
    renderImages(results);
  });

  addImageButton.addEventListener('click', () => {
    /* eslint-disable no-param-reassign */
    state.formState = 'add';
    state.changedItemId = null;
    renderForm(null);
    /* eslint-enable no-param-reassign */
  });

  imagesContainer.addEventListener('click', async (e) => {
    if (!e.target.dataset || !e.target.dataset.action) {
      return;
    }
    const { action, id } = e.target.dataset;
    switch (action) {
      case 'change': {
        /* eslint-disable no-param-reassign */
        state.formState = 'change';
        state.changedItemId = id;
        /* eslint-enable no-param-reassign */
        const { title, description } = await catchError(getImage, renderErr, db, 'images', id);
        renderForm({ title, description });
        break;
      }
      case 'delete': {
        await deleteImage(db, 'images', id);
        showStorageInfo();
        showAllImages();
        break;
      }
      default:
        break;
    }
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
      showStorageInfo();
      showAllImages();
    }, renderErr, e);
  });
  showStorageInfo();
  showAllImages();
};
