/** 3D illustrations float on a coloured tile; real photos (seeded stock photos or farmer uploads) fill their frame. */
export function isIllustration(src = '') {
  return src.includes('/uploads/seed/') || src.includes('/illustrations/');
}

/** Product photos with the background removed (square, transparent): shown whole on the tile. */
export function isCutout(src = '') {
  return src.includes('/uploads/cutouts/');
}

/** CSS class for an image on a produce tile: 'cutout', '' (illustration) or 'photo'. */
export function imageKind(src = '') {
  if (isCutout(src)) return 'cutout';
  return isIllustration(src) ? '' : 'photo';
}
