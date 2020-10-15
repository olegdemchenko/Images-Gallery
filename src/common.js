const catchError = async (f, errorHandle, ...args) => {
  let result;
  try {
    result = await f(...args);
  } catch (e) {
    errorHandle(e);
  }
  return result;
};

export default catchError;
