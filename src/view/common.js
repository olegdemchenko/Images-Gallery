export default (elements) => {
  const {
    addForm, imagesContainer, alertTemplate, tagsContainer,
  } = elements;

  const clearContent = (container) => {
    container.innerHTML = '';// eslint-disable-line no-param-reassign
  };

  const downloadFile = ({ name, content }) => {
    const link = document.createElement('a');
    link.setAttribute('href', content);
    link.setAttribute('download', `${name}.zip`);
    link.click();
  };

  const renderErr = (err) => {
    const alert = alertTemplate.content.cloneNode(true);
    const alertTextBox = alert.querySelector('.errorMessage');
    alertTextBox.textContent = err.message;
    imagesContainer.before(alert);
  };

  const fillForm = async (data) => {
    addForm.reset();
    if (data) {
      const { title, description, collection } = addForm;
      title.value = data.title;
      description.value = data.description;
      collection.value = data.collection;
    }
  };

  const renderTags = (collections) => {
    collections.forEach((coll) => {
      const tag = document.createElement('a');
      tag.textContent = coll;
      tag.classList.add('mr-4');
      tag.setAttribute('href', '#');
      tag.setAttribute('data-action', 'showCollection');
      tag.setAttribute('data-collection', coll);
      tagsContainer.append(tag);
    });
  };

  return {
    fillForm, renderErr, clearContent, renderTags, downloadFile,
  };
};
