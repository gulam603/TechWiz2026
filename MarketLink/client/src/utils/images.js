/** 3D illustrations float on a coloured tile; real photos (seeded stock photos or farmer uploads) fill their frame. */
export function isIllustration(src = '') {
  return src.includes('/uploads/seed/') || src.includes('/illustrations/');
}
