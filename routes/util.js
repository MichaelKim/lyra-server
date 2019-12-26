function readableViews(viewCount) {
  const length = 0 | Math.log10(viewCount);

  if (length < 3) return '' + viewCount;
  if (length < 6)
    return (
      (0 | (viewCount / Math.pow(10, length - 2))) / Math.pow(10, 5 - length) +
      'K'
    );
  if (length < 9)
    return (
      (0 | (viewCount / Math.pow(10, length - 2))) / Math.pow(10, 8 - length) +
      'M'
    );
  return (
    (0 | (viewCount / Math.pow(10, length - 2))) / Math.pow(10, 11 - length) +
    'B'
  );
}

module.exports = {
  readableViews
};
