import filesize from 'filesize';
import uniqid from 'uniqid';
import _ from 'lodash';
import $ from 'jquery';
import initImage from './view/image';
import initCollection from './view/collection';
import initStoreInfo from './view/storeInfo';
import initViewElems from './view/common';

import {
  getElem, setElem, getAllElems, getAllFromIndex,
  deleteElem, getCount, clearStore,
} from './idbOperations';
import {
  catchError, createZip, getImageDimensions, getDataUrl, estimateStorageSpace,
} from './utils';

export default async (state, db) => {
  const addImageButton = document.getElementById('addImage');
  const addForm = document.getElementById('informationForm');
  const imagesContainer = document.getElementById('imagesContainer');
  const galleryContent = document.getElementById('galleryContent');
  const imageCardTemplate = document.getElementById('cardTemplate');
  const alertTemplate = document.getElementById('alertTemplate');
  const clearStoreButton = document.getElementById('clearStore');
  const findByNameForm = document.getElementById('findByNameForm');
  const showAllButton = document.getElementById('showAll');
  const storageSizeBar = document.getElementById('storageSize');
  const imagesCountField = document.getElementById('imagesCount');
  const collectionTemplate = document.getElementById('collectionTemplate');
  const controlPanelTemplate = document.getElementById('controlPanelTemplate');
  const controlPanelContainer = document.getElementById('controlPanelContainer');
  const tagsContainer = document.getElementById('tagsContainer');

  const renderImages = initImage({ imagesContainer, imageCardTemplate });
  const { renderCollection, renderControlPanel } = initCollection({
    collectionTemplate, controlPanelTemplate, controlPanelContainer, imagesContainer,
  });
  const renderStorageInfo = initStoreInfo({ imagesCountField, storageSizeBar });
  const {
    fillForm, renderErr, clearContent, renderTags, downloadFile,
  } = initViewElems({
    addForm, imagesContainer, alertTemplate, tagsContainer,
  });

  const showCollections = async () => {
    const allCollections = await getAllElems(db, 'collections');
    const commonCollection = _.remove(allCollections, (name) => name === '');
    clearContent(controlPanelContainer);
    clearContent(imagesContainer);
    allCollections.forEach((collName) => renderCollection(collName));
    if (!_.isEmpty(commonCollection)) {
      const commonCollContent = await getAllFromIndex(db, 'images', 'collection_idx', '');
      renderImages(commonCollContent);
    }
  };

  const showTags = async () => {
    const collections = await getAllElems(db, 'collections');
    clearContent(tagsContainer);
    renderTags(collections.filter((coll) => coll !== ''));
  };

  const showCollectionContent = async (name) => {
    const images = await getAllFromIndex(db, 'images', 'collection_idx', name);
    clearContent(imagesContainer);
    clearContent(controlPanelContainer);
    renderControlPanel(name);
    renderImages(images);
  };

  const showStorageInfo = async () => {
    const imagesCount = await getCount(db, 'images');
    const storageInfo = await estimateStorageSpace();
    if (!storageInfo) {
      renderStorageInfo(null, imagesCount);
      return;
    }
    const { usage, quota } = storageInfo;
    const usageInGb = filesize(usage, { exponent: 3 });
    const quotaInGb = filesize(quota, { exponent: 3 });
    renderStorageInfo({ usageInGb, quotaInGb }, imagesCount);
  };

  const show = async (appState) => {
    switch (state.view) {
      case 'collectionContent': {
        showStorageInfo();
        showTags();
        showCollectionContent(appState.currentCollection);
        break;
      }
      case 'search': {
        const results = await getAllFromIndex(db, 'images', 'title_idx', appState.searchedName);
        clearContent(imagesContainer);
        clearContent(controlPanelContainer);
        renderImages(results);
        break;
      }
      default: {
        showStorageInfo();
        showTags();
        showCollections();
        break;
      }
    }
  };
  /* eslint-disable no-param-reassign */
  showAllButton.addEventListener('click', () => {
    state.view = 'all';
    show(state);
  });

  clearStoreButton.addEventListener('click', () => catchError(async () => {
    await clearStore(db, 'images');
    await clearStore(db, 'collections');
    state.view = 'all';
    show(state);
  }, renderErr));

  findByNameForm.addEventListener('submit', async (e) => catchError(async (evt) => {
    evt.preventDefault();
    const findData = new FormData(findByNameForm);
    state.searchedName = findData.get('name');
    state.view = 'search';
    show(state);
  }, renderErr, e));

  addImageButton.addEventListener('click', () => {
    state.formState = 'add';
    state.changedItemId = null;
    fillForm(null);
  });

  galleryContent.addEventListener('click', (evt) => catchError(async (e) => {
    if (!e.target.dataset || !e.target.dataset.action) {
      return;
    }
    const { action, id, collection: collectionName } = e.target.dataset;
    switch (action) {
      case 'downloadCollection': {
        const collectionContent = await getAllFromIndex(db, 'images', 'collection_idx', collectionName);
        const zip = await createZip(collectionContent);
        downloadFile({ name: collectionName, content: zip });
        break;
      }
      case 'showCollection': {
        state.view = 'collectionContent';
        state.currentCollection = collectionName;
        show(state);
        break;
      }
      case 'deleteCollection': {
        await deleteElem(db, 'collections', collectionName);
        const collectionElems = await getAllFromIndex(db, 'images', 'collection_idx', collectionName);
        await Promise.all(collectionElems.map(({ id: elemId }) => deleteElem(db, 'images', elemId)));
        const commonCollectionElements = collectionElems.map((elem) => ({ ...elem, collection: '' }));
        await Promise.all(commonCollectionElements.map((elem) => setElem(db, 'images', elem, elem.id)));
        state.view = 'all';
        show(state);
        break;
      }
      case 'deleteCollection&Content': {
        await deleteElem(db, 'collections', collectionName);
        const collectionElems = await getAllFromIndex(db, 'images', 'collection_idx', collectionName);
        await Promise.all(collectionElems.map(({ id: elemId }) => deleteElem(db, 'images', elemId)));
        state.view = 'all';
        show(state);
        break;
      }
      case 'back': {
        state.view = 'all';
        show(state);
        break;
      }
      case 'change': {
        state.formState = 'change';
        state.changedItemId = id;
        const { title, description, collection } = await getElem(db, 'images', id);
        fillForm({ title, description, collection });
        break;
      }
      case 'delete': {
        await deleteElem(db, 'images', id);
        show(state);
        break;
      }
      default:
        break;
    }
  }, renderErr, evt));

  addForm.addEventListener('submit', (evt) => catchError(async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);
    const imgFile = formData.get('file');
    if (!imgFile.type.startsWith('image/')) {
      throw new Error('Wrong type of file');
    }
    const id = state.formState === 'add' ? uniqid() : state.changedItemId;
    const collection = formData.get('collection');
    const doesCollectionExist = await getElem(db, 'collections', collection);
    if (!doesCollectionExist) {
      await setElem(db, 'collections', collection, collection);
    }
    const metaData = {
      id,
      collection,
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
      await deleteElem(db, 'images', state.changedItemId);
    }
    await setElem(db, 'images', data, id);
    $('#modalWindow').modal('hide');
    show(state);
  }, renderErr, evt));
  catchError(show, renderErr, state);
};
