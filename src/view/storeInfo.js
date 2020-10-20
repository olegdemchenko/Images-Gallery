export default ({ imagesCountField, storageSizeBar }) => {
  const renderStorageInfo = (size, count) => {
    /* eslint-disable no-param-reassign */
    imagesCountField.textContent = count;
    const errorMessage = document.querySelector('p[data-error="storageSpaceError"]');
    if (size === null && errorMessage) {
      return;
    }
    if (size === null && !errorMessage) {
      const message = document.createElement('p');
      message.classList.add('text-danger');
      message.textContent = 'Application can`t determine storage size and usage space';
      message.setAttribute('data-error', 'storageSpaceError');
      storageSizeBar.parentElement.replaceWith(message);
      return;
    }
    storageSizeBar.setAttribute('style', `width: ${size}%`);
    storageSizeBar.textContent = `${size}%`;
    /* eslint-enable no-param-reassign */
  };
  return renderStorageInfo;
};
