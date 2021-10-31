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

function parseDurationFromRegex(time: string, regex: RegExp) {
  const matches = time.match(regex);
  // [1] = hours, [2] = minutes, [3] = seconds
  if (matches == null) {
    return 0;
  }

  return (
    Number(matches[1] || 0) * 3600 +
    Number(matches[2] || 0) * 60 +
    Number(matches[3] || 0)
  );
}

export function parseDuration(iso: string) {
  // Format: PT1H2M34S
  return parseDurationFromRegex(iso, /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
}

export function parseReadableDuration(time: string | null) {
  // Format: HH:MM:SS or MM:SS or M:SS
  if (time == null) return 0;
  return parseDurationFromRegex(time, /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
}
