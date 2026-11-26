import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampCropPan,
  computeCanvasCropPlan,
  getCoverBaseSize,
  getOrientedDimensions,
} from './avatarCropUtils';

test('getOrientedDimensions swaps dimensions on 90 and 270 degree rotations', () => {
  assert.deepEqual(getOrientedDimensions(800, 400, 0), { width: 800, height: 400 });
  assert.deepEqual(getOrientedDimensions(800, 400, 90), { width: 400, height: 800 });
  assert.deepEqual(getOrientedDimensions(800, 400, 180), { width: 800, height: 400 });
  assert.deepEqual(getOrientedDimensions(800, 400, 270), { width: 400, height: 800 });
});

test('getCoverBaseSize scales shortest side to fill square crop viewport', () => {
  const landscape = getCoverBaseSize(1200, 600, 0, 240);
  assert.equal(landscape.coverHeight, 240);
  assert.equal(landscape.coverWidth, 480);

  const rotated = getCoverBaseSize(1200, 600, 90, 240);
  assert.equal(rotated.coverWidth, 240);
  assert.equal(rotated.coverHeight, 480);
});

test('clampCropPan prevents dragging past image bounds at any zoom', () => {
  // 480x240 base cover in 240 viewport at 1x -> maxX = 120, maxY = 0
  assert.deepEqual(clampCropPan(300, 80, 480, 240, 1, 240), { x: 120, y: 0 });
  assert.deepEqual(clampCropPan(-300, -80, 480, 240, 1, 240), { x: -120, y: 0 });

  // At 2x zoom: scaled size 960x480 -> maxX = 360, maxY = 120
  assert.deepEqual(clampCropPan(250, -90, 480, 240, 2, 240), { x: 250, y: -90 });
  assert.deepEqual(clampCropPan(500, -200, 480, 240, 2, 240), { x: 360, y: -120 });
});

test('computeCanvasCropPlan maps preview coordinates proportionally to export size', () => {
  const plan = computeCanvasCropPlan({
    naturalWidth: 1000,
    naturalHeight: 1000,
    rotationDeg: 0,
    zoom: 2,
    panX: 30,
    panY: -15,
    viewportSize: 240,
    outputSize: 256,
  });

  const ratio = 256 / 240;
  assert.ok(Math.abs(plan.drawWidth - 240 * 2 * ratio) < 0.001);
  assert.ok(Math.abs(plan.translateX - (128 + 30 * ratio)) < 0.001);
  assert.ok(Math.abs(plan.translateY - (128 - 15 * ratio)) < 0.001);
  assert.equal(plan.rotationRad, 0);
});
