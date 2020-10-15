import { getImage, getAllImages, deleteImage } from './idbOperations';
import catchError from './common';

export default (state, db, elements) => {
  const {
    addForm, imagesContainer, imageCardTemplate, alertTemplate,
  } = elements;

  const renderErr = (err) => {
    const alert = alertTemplate.content.cloneNode(true);
    const alertTextBox = alert.querySelector('.errorMessage');
    alertTextBox.textContent = err.message;
    imagesContainer.before(alert);
  };

  const renderForm = async () => {
    addForm.reset();
    if (state.formState === 'change') {
      const { title, description } = addForm;
      const { title: imgTitle, description: imgDescription } = await catchError(getImage, renderErr, db, 'images', state.changedItemId);
      title.value = imgTitle;
      description.value = imgDescription;
    }
  };

  const renderImages = async () => {
    /* eslint-disable no-param-reassign */
    imagesContainer.innerHTML = '';
    const images = await catchError(getAllImages, renderErr, db, 'images');
    console.log(images);
    images.forEach(({
      id, title, description, dataUrl,
    }) => {
      const newCard = imageCardTemplate.content.cloneNode(true);
      const cardImg = newCard.querySelector('.card-img-top');
      cardImg.src = dataUrl;
      const cardTitle = newCard.querySelector('.card-title');
      cardTitle.textContent = title;
      const cardText = newCard.querySelector('.card-text');
      cardText.textContent = description;
      const downloadLink = newCard.querySelector('.download-link');
      downloadLink.setAttribute('href', dataUrl);
      downloadLink.setAttribute('download', title);
      const changeButton = newCard.querySelector('.change-button');
      changeButton.addEventListener('click', () => {
        state.formState = 'change';
        state.changedItemId = id;
        renderForm(addForm);
      });
      const deleteButton = newCard.querySelector('.delete-button');
      deleteButton.addEventListener('click', async () => {
        await deleteImage(db, 'images', id);
        renderImages(imagesContainer, imageCardTemplate);
      });
      imagesContainer.append(newCard);
    });
    /* eslint-enable no-param-reassign */
  };
  return { renderForm, renderImages, renderErr };
};
