export function readableViews(viewCount: number) {
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

// Format: PT1H2M34S
export function parseDuration(iso: string) {
  const matches = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (matches == null) {
    return 0;
  }

  return (
    Number(matches[1] || 0) * 3600 +
    Number(matches[2] || 0) * 60 +
    Number(matches[3] || 0)
  );
}
