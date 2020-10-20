export default ({ imagesContainer, imageCardTemplate }) => {
  const renderImages = async (images) => {
    /* eslint-disable no-param-reassign */
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
  return renderImages;
};
