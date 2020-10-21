import { openDB } from 'idb';
import application from './application';

export default async () => {
  const state = {
    formState: 'add',
    changedItemId: null,
    view: 'all',
    currentCollection: null,
    searchedName: null,
  };
  const db = await openDB('imagesStore', 2, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('images')) {
        const images = database.createObjectStore('images');
        images.createIndex('title_idx', 'title');
        images.createIndex('collection_idx', 'collection');
      }
      if (!database.objectStoreNames.contains('collections')) {
        database.createObjectStore('collections');
      }
    },
    blocking() {
      db.close();
      alert('The database if out of date. Please, reload the page.');
    },
  });
  application(state, db);
};
