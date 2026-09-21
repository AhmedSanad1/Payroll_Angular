// Opens a PDF blob in a new tab so the user can view/print it. Popup blockers may refuse a
// window opened after an async response; in that case fall back to a download so the user
// still gets the file. The object URL is revoked once the browser has taken it.
export function openPdf(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank');

  if (!opened) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
