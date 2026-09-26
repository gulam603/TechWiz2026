/**
 * Every picture on MarketLink is a real photo (seed photos or farmer uploads), so it fills its frame.
 * Kept as a helper so image tiles have one place to decide their CSS class.
 */
export function imageKind() {
  return 'photo';
}
