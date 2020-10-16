const getImage = async (db, storeName, key) => {
  const value = await db.get(storeName, key);
  return value;
};

const setImage = async (db, storeName, value, key) => {
  await db.put(storeName, value, key);
};

const getAllImages = async (db, storeName) => {
  const images = await db.getAll(storeName);
  return images;
};

const getAllFromIndex = async (db, storeName, index, key) => {
  const res = await db.getAllFromIndex(storeName, index, key);
  return res;
};

const deleteImage = async (db, storeName, key) => {
  await db.delete(storeName, key);
};

const getCount = async (db, storeName) => {
  const count = await db.count(storeName);
  return count;
};

const clearStore = async (db, storeName) => {
  await db.clear(storeName);
};

export {
  getImage, setImage, getAllImages, deleteImage, clearStore, getCount, getAllFromIndex,
};
