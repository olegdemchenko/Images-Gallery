export default ({ imagesCountField, storageSizeBar }) => {
  const renderStorageInfo = (storageInfo, count) => {
    /* eslint-disable no-param-reassign */
    imagesCountField.textContent = count;
    const errorMessage = document.querySelector('p[data-error="storageSpaceError"]');
    if (storageInfo === null && errorMessage) {
      return;
    }
    if (storageInfo === null && !errorMessage) {
      const error = document.createElement('p');
      error.classList.add('text-danger');
      error.textContent = 'Application can`t determine storage size and usage space';
      error.setAttribute('data-error', 'storageSpaceError');
      storageSizeBar.replaceWith(error);
      return;
    }
    const { usageInGb, quotaInGb } = storageInfo;
    const message = storageSizeBar.firstElementChild;
    message.textContent = `Занято ${usageInGb}  Всего доступно ${quotaInGb}`;
    /* eslint-enable no-param-reassign */
  };
  return renderStorageInfo;
};
