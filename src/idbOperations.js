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

const deleteImage = async (db, storeName, key) => {
  await db.delete(storeName, key);
};

export {
  getImage, setImage, getAllImages, deleteImage,
};
