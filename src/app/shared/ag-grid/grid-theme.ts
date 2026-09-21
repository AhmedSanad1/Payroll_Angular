import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';

// Registered here (imported only by the lazy-loaded grid components) rather than in
// main.ts — registering it eagerly at bootstrap pulled the whole grid engine into the
// initial bundle and blew the production budget by ~1MB. Every screen that uses
// ag-grid imports `payrollGridTheme`, so this side effect rides along into the same
// lazy chunk instead.
ModuleRegistry.registerModules([AllCommunityModule]);

// Mirrors the design tokens in styles.scss (teal primary / slate surfaces) so grids
// look like part of the app rather than a bolted-on widget — same flat colors and
// quiet shadows as .card/.dialog/table.data-table, no glow/lift effects.
export const payrollGridTheme = themeQuartz.withParams({
  accentColor: '#0f766e',
  backgroundColor: '#ffffff',
  foregroundColor: '#0f172a',
  borderColor: '#e2e8f0',
  borderRadius: 6,
  fontFamily: "'Segoe UI', 'Cairo', Roboto, Tahoma, Arial, sans-serif",
  fontSize: 13,
  spacing: 8,

  // Header — same slate-on-fog treatment as table.data-table's <thead>, with a
  // faint hover state so sortable columns read as clickable.
  headerBackgroundColor: '#f8fafc',
  headerTextColor: '#475569',
  headerFontWeight: 600,
  headerFontSize: 12.5,
  headerCellHoverBackgroundColor: '#f1f5f9',
  headerColumnBorder: false,
  headerRowBorder: true,

  // Rows — no zebra striping (flat, matches table.data-table), quiet hover/selected
  // tints already used for nav links and inputs elsewhere in the app.
  oddRowBackgroundColor: '#ffffff',
  rowHoverColor: '#f8fafc',
  selectedRowBackgroundColor: 'rgba(15, 118, 110, 0.07)',
  columnBorder: false,
  cellHorizontalPadding: 14,

  // Cell focus ring reuses the teal glow from .form-field input:focus instead of
  // ag-grid's default blue outline.
  focusShadow: '0 0 0 3px rgba(15, 118, 110, 0.16)',

  // Icons (sort arrows, column menu, filters) default to muted slate and pick up
  // the primary teal on hover/active, matching link and nav-icon behavior.
  iconColor: '#94a3b8',
  iconButtonHoverColor: '#0f766e',
  iconButtonHoverBackgroundColor: 'rgba(15, 118, 110, 0.07)',
  iconButtonActiveColor: '#0f766e',
  iconButtonActiveBackgroundColor: 'rgba(15, 118, 110, 0.07)',
  iconButtonBorderRadius: 6,

  // Column menus / filter popups borrow the same border + shadow as .dialog so they
  // look like the rest of the app's floating surfaces, not a stock ag-grid popup.
  menuBackgroundColor: '#ffffff',
  menuTextColor: '#0f172a',
  menuBorder: '1px solid #e2e8f0',
  menuSeparatorColor: '#e2e8f0',
  menuShadow: '0 6px 18px rgba(15, 23, 42, 0.1)',
  popupShadow: '0 6px 18px rgba(15, 23, 42, 0.1)',
  dropdownShadow: '0 6px 18px rgba(15, 23, 42, 0.1)',

  wrapperBorderRadius: 8,
  wrapperBorder: true,
  rowBorder: true
});
