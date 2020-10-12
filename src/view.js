export default (state, { addForm, imagesContainer, imageCardTemplate }) => {
  const renderForm = (form) => {
    form.reset();
    if (state.formState === 'change') {
      const { title, description } = form;
      const imageItem = state.images.filter(({ id }) => state.changedItemId === id)[0];
      title.value = imageItem.title;
      description.value = imageItem.description;
    }
  };

  const renderImages = (container, template) => {
    /* eslint-disable no-param-reassign */
    container.innerHTML = '';
    state.images.forEach(({
      id, title, description, dataUrl,
    }) => {
      const newCard = template.content.cloneNode(true);
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
      deleteButton.addEventListener('click', () => {
        state.images = state.images.filter(({ id: imgId }) => imgId !== id);
        renderImages(imagesContainer, imageCardTemplate);
      });
      container.append(newCard);
    });
    /* eslint-enable no-param-reassign */
  };
  return { renderForm, renderImages };
};
