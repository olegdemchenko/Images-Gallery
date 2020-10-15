import { openDB } from 'idb';
import application from './application';

export default async () => {
  const state = {
    images: [],
    formState: 'add',
    changedItemId: null,
  };
  const db = await openDB('imagesStore', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('images')) {
        console.log('create store');
        database.createObjectStore('images');
      }
    },
    blocking() {
      db.close();
      console.log('The database if out of date. Please, reload the page.');
    },
  });
  application(state, db);
};
