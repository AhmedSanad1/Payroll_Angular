import type { GridApi } from 'ag-grid-community';

// Report grids use `domLayout: 'normal'` (fixed height + row virtualization) so large
// reports stay fast on screen. Virtualized rows outside the viewport aren't in the DOM,
// so `window.print()` would otherwise only print whatever happened to be scrolled into
// view. Ag-Grid's `print` dom layout renders every row for the duration of the print.
// Call the returned cleanup function from ngOnDestroy.
export function wireGridPrintMode(getApi: () => GridApi | undefined): () => void {
  const onBeforePrint = () => getApi()?.setGridOption('domLayout', 'print');
  const onAfterPrint = () => getApi()?.setGridOption('domLayout', 'normal');

  window.addEventListener('beforeprint', onBeforePrint);
  window.addEventListener('afterprint', onAfterPrint);

  return () => {
    window.removeEventListener('beforeprint', onBeforePrint);
    window.removeEventListener('afterprint', onAfterPrint);
  };
}
