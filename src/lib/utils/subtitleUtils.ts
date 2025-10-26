interface SubtitleEntry {
  startTime: string;
  endTime: string;
  text: string;
}

/**
 * Convert time string to seconds
 * Supports formats: HH:MM:SS.mmm, HH:MM:SS, MM:SS
 */
const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.replace(',', '.').split(':');

  if (parts.length === 2) {
    // Format is MM:SS
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // Format is HH:MM:SS
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
};

/**
 * Normalize time format: convert MM:SS to HH:MM:SS if needed
 */
const normalizeTime = (time: string): string => {
  const parts = time.split(':');
  if (parts.length === 2) {
    // Format is MM:SS, convert to HH:MM:SS
    return `00:${time}`;
  }
  return time;
};

/**
 * Extract subtitle text within a time range
 * @param subtitles - Array of parsed subtitle entries
 * @param startTime - Start time (e.g., '05:23' or '00:05:23')
 * @param endTime - End time (e.g., '05:45' or '00:05:45')
 * @returns Concatenated subtitle text
 */
export const extractTextByTiming = (
  subtitles: SubtitleEntry[],
  startTime: string,
  endTime: string
): string => {
  if (!subtitles || subtitles.length === 0) {
    return '';
  }

  if (!startTime || !endTime) {
    return '';
  }

  // Normalize time formats
  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);

  // Convert to seconds
  const startTimeWithMs = normalizedStart.includes('.') || normalizedStart.includes(',')
    ? normalizedStart
    : `${normalizedStart}.000`;
  const endTimeWithMs = normalizedEnd.includes('.') || normalizedEnd.includes(',')
    ? normalizedEnd
    : `${normalizedEnd}.000`;

  const startSeconds = timeToSeconds(startTimeWithMs);
  const endSeconds = timeToSeconds(endTimeWithMs);

  // Filter subtitles that overlap with the requested time range
  const matchingSubtitles = subtitles.filter((sub) => {
    const subStart = timeToSeconds(sub.startTime);
    const subEnd = timeToSeconds(sub.endTime);

    // Check if subtitle overlaps with requested range
    return (
      (subStart >= startSeconds && subStart <= endSeconds) ||
      (subEnd >= startSeconds && subEnd <= endSeconds) ||
      (subStart <= startSeconds && subEnd >= endSeconds)
    );
  });

  if (matchingSubtitles.length === 0) {
    return '';
  }

  // Concatenate text and remove HTML tags and duplicates
  const text = matchingSubtitles
    .map((sub) => sub.text)
    .join(' ')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return text;
};

/**
 * Clean subtitle text by removing formatting tags and special characters
 * @param text - Raw subtitle text with formatting tags
 * @returns Cleaned text
 */
export const cleanSubtitleText = (text: string): string => {
  if (!text) return '';

  let cleaned = text;

  // Remove subtitle formatting tags like {\i1}, {\i0}, {\b1}, {\b0}, etc.
  cleaned = cleaned.replace(/\{\\[a-z]\d+\}/gi, '');

  // Remove other common subtitle tags like <i>, </i>, <b>, </b>, <u>, </u>
  cleaned = cleaned.replace(/<\/?[ibu]>/gi, '');

  // Remove font tags
  cleaned = cleaned.replace(/<\/?font[^>]*>/gi, '');

  // Remove color tags
  cleaned = cleaned.replace(/\{\\c&H[0-9A-F]+&\}/gi, '');

  // Remove position tags
  cleaned = cleaned.replace(/\{\\pos\([^)]+\)\}/gi, '');

  // Remove alignment tags
  cleaned = cleaned.replace(/\{\\an?\d+\}/gi, '');

  // Remove any remaining curly braces tags
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');

  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
};
