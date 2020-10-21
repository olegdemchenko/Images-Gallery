export default ({
  collectionTemplate, controlPanelTemplate, controlPanelContainer, imagesContainer,
}) => {
  const createControlPanel = (name) => {
    const controlPanel = controlPanelTemplate.content.cloneNode(true);
    const backButton = controlPanel.querySelector('.back');
    backButton.setAttribute('data-action', 'back');
    const downloadButton = controlPanel.querySelector('.download');
    downloadButton.setAttribute('data-action', 'downloadCollection');
    downloadButton.setAttribute('data-collection', name);
    const deleteButton = controlPanel.querySelector('.delete');
    deleteButton.setAttribute('data-action', 'deleteCollection');
    deleteButton.setAttribute('data-collection', name);
    const deleteAllButton = controlPanel.querySelector('.deleteAll');
    deleteAllButton.setAttribute('data-action', 'deleteCollection&Content');
    deleteAllButton.setAttribute('data-collection', name);
    return controlPanel;
  };

  const renderControlPanel = (name) => {
    const controlPanel = createControlPanel(name);
    controlPanel.firstElementChild.classList.add('row-cols-md-4');
    const header = document.createElement('h4');
    header.textContent = name;
    header.classList.add('mt-4', 'mb-4', 'text-center');
    controlPanel.prepend(header);
    controlPanelContainer.append(controlPanel);
  };

  const renderCollection = (name) => {
    const collection = collectionTemplate.content.cloneNode(true);
    const header = collection.querySelector('.card-header');
    header.textContent = name;
    const controlPanel = createControlPanel(name);
    controlPanel.firstElementChild.classList.add('row-cols-2');
    const backButton = controlPanel.querySelector('.back');
    backButton.removeAttribute('data-action');
    backButton.setAttribute('data-action', 'showCollection');
    backButton.setAttribute('data-collection', name);
    backButton.textContent = 'Cмотреть';
    const collectionFooter = collection.querySelector('.card-footer');
    collectionFooter.append(controlPanel);
    imagesContainer.append(collection);
  };
  return { renderCollection, renderControlPanel };
};
