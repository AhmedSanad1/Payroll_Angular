// Builds the same `.badge` markup the plain-table screens used for status/type columns.
// Safe as innerHTML here: label/className always come from a fixed enum mapping in the
// calling component, never from user-entered text.
export function badgeHtml(label: string, className: string): string {
  return `<span class="badge ${className}">${label}</span>`;
}
