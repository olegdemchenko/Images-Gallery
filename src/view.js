export default (elements) => {
  const {
    addForm, imagesContainer, imageCardTemplate, alertTemplate, imagesCountField, storageSizeBar,
  } = elements;

  const renderErr = (err) => {
    const alert = alertTemplate.content.cloneNode(true);
    const alertTextBox = alert.querySelector('.errorMessage');
    alertTextBox.textContent = err.message;
    imagesContainer.before(alert);
  };

  const renderStorageInfo = (size, count) => {
    imagesCountField.textContent = count;
    storageSizeBar.setAttribute('style', `width: ${size}%`);
    storageSizeBar.textContent = `${size}%`;
  };

  const renderForm = async (data) => {
    if (!data) {
      addForm.reset();
      return;
    }
    const { title, description } = addForm;
    title.value = data.title;
    description.value = data.description;
  };

  const renderImages = async (images) => {
    /* eslint-disable no-param-reassign */
    imagesContainer.innerHTML = '';
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
      changeButton.setAttribute('data-action', 'change');
      changeButton.setAttribute('data-id', id);
      const deleteButton = newCard.querySelector('.delete-button');
      deleteButton.setAttribute('data-action', 'delete');
      deleteButton.setAttribute('data-id', id);
      imagesContainer.append(newCard);
    });
    /* eslint-enable no-param-reassign */
  };
  return {
    renderForm, renderImages, renderStorageInfo, renderErr,
  };
};
