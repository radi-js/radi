const skipInProductionAndTest = fn => {
  if (process
    && (process.env.NODE_ENV === 'production'
    || process.env.NODE_ENV === 'test')) {
    return false;
  }
  return fn && fn();
};

export default skipInProductionAndTest;