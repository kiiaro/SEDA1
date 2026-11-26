export interface CropDimensions {
  width: number;
  height: number;
}

export interface CoverBaseSize {
  coverWidth: number;
  coverHeight: number;
}

export interface PanOffset {
  x: number;
  y: number;
}

/**
 * Returns image dimensions after applying 90-degree step rotation.
 */
export function getOrientedDimensions(
  naturalWidth: number,
  naturalHeight: number,
  rotationDeg: number
): CropDimensions {
  const w = Math.max(1, naturalWidth);
  const h = Math.max(1, naturalHeight);
  const normalized = ((Math.round(rotationDeg / 90) * 90) % 360 + 360) % 360;
  if (normalized === 90 || normalized === 270) {
    return { width: h, height: w };
  }
  return { width: w, height: h };
}

/**
 * Computes cover-fit size so the oriented image completely fills a square viewport.
 */
export function getCoverBaseSize(
  naturalWidth: number,
  naturalHeight: number,
  rotationDeg: number,
  viewportSize: number
): CoverBaseSize {
  const { width, height } = getOrientedDimensions(naturalWidth, naturalHeight, rotationDeg);
  const minSide = Math.min(width, height);
  const scale = viewportSize / minSide;
  return {
    coverWidth: width * scale,
    coverHeight: height * scale,
  };
}

/**
 * Clamps drag/pan offsets so the scaled image always covers the crop viewport with zero gaps.
 */
export function clampCropPan(
  offsetX: number,
  offsetY: number,
  coverWidth: number,
  coverHeight: number,
  zoom: number,
  viewportSize: number
): PanOffset {
  const safeZoom = Math.max(1, Math.min(4, zoom));
  const maxX = Math.max(0, (coverWidth * safeZoom - viewportSize) / 2);
  const maxY = Math.max(0, (coverHeight * safeZoom - viewportSize) / 2);
  return {
    x: Math.max(-maxX, Math.min(maxX, offsetX)) || 0,
    y: Math.max(-maxY, Math.min(maxY, offsetY)) || 0,
  };
}

export interface CanvasCropPlan {
  drawWidth: number;
  drawHeight: number;
  translateX: number;
  translateY: number;
  rotationRad: number;
}

/**
 * Computes exact 2D canvas transform parameters matching the interactive preview viewport.
 */
export function computeCanvasCropPlan(params: {
  naturalWidth: number;
  naturalHeight: number;
  rotationDeg: number;
  zoom: number;
  panX: number;
  panY: number;
  viewportSize: number;
  outputSize: number;
}): CanvasCropPlan {
  const {
    naturalWidth,
    naturalHeight,
    rotationDeg,
    zoom,
    panX,
    panY,
    viewportSize,
    outputSize,
  } = params;

  const { coverWidth, coverHeight } = getCoverBaseSize(
    naturalWidth,
    naturalHeight,
    rotationDeg,
    viewportSize
  );
  const safeZoom = Math.max(1, Math.min(4, zoom));
  const clamped = clampCropPan(panX, panY, coverWidth, coverHeight, safeZoom, viewportSize);
  const ratio = outputSize / viewportSize;

  const normalizedRot = ((Math.round(rotationDeg / 90) * 90) % 360 + 360) % 360;
  const orientedW = coverWidth * safeZoom * ratio;
  const orientedH = coverHeight * safeZoom * ratio;
  const isSwapped = normalizedRot === 90 || normalizedRot === 270;

  return {
    drawWidth: isSwapped ? orientedH : orientedW,
    drawHeight: isSwapped ? orientedW : orientedH,
    translateX: outputSize / 2 + clamped.x * ratio,
    translateY: outputSize / 2 + clamped.y * ratio,
    rotationRad: (normalizedRot * Math.PI) / 180,
  };
}
