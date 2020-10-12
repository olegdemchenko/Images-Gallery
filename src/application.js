import filesize from 'filesize';
import _ from 'lodash';
import initView from './view';

export default () => {
  const state = {
    images: [],
    formState: 'add',
    changedItemId: null,
  };

  const addImageButton = document.getElementById('addImageButton');
  const addForm = document.getElementById('informationForm');
  const imagesContainer = document.getElementById('imagesContainer');
  const imageCardTemplate = document.getElementById('cardTemplate');

  const elements = { addForm, imagesContainer, imageCardTemplate };

  const { renderImages, renderForm } = initView(state, elements);

  addImageButton.addEventListener('click', () => {
    state.formState = 'add';
    state.changedItemId = null;
    renderForm(addForm);
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);
    const imgFile = formData.get('file');
    if (!imgFile.type.startsWith('image/')) {
      throw new Error('Wrong type of file');
    }
    const metaData = {
      id: state.formState === 'add' ? _.uniqueId() : state.changedItemId,
      title: formData.get('title'),
      name: imgFile.name,
      description: formData.get('description'),
      size: filesize(imgFile.size, { exponent: 2 }),
      file: imgFile,
      createdOn: new Date(),
      type: imgFile.type,
    };
    const dataUrlPromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imgFile);
      reader.addEventListener('load', () => resolve({ ...metaData, dataUrl: reader.result }));
      reader.addEventListener('error', () => reject(reader.error));
    });
    dataUrlPromise.then((meta) => (
      new Promise((resolve, reject) => {
        const img = new Image();
        img.src = meta.dataUrl;
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
            ...meta, width: img.width, height: img.height, format,
          });
        });
        img.addEventListener('error', () => reject(new Error('Error in getting width, height process')));
      })
    )).then((data) => {
      if (state.formState === 'add') {
        state.images.push(data);
      }
      const oldImageItem = state.images.filter(({ id }) => id === data.id);
      _.merge(oldImageItem, data);
      renderImages(imagesContainer, imageCardTemplate);
    })
      .catch((err) => console.error(err));
  });
};
