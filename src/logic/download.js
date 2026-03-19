/**
 * Triggers a browser file download from a Blob.
 *
 * Creates a temporary anchor element, triggers a click, and cleans up.
 * Throws if the browser blocks the download or Blob creation fails.
 *
 * @param {Blob} blob - The file content as a Blob
 * @param {string} filename - Suggested filename for the download
 */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
