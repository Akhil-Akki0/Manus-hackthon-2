import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRailLayout,
  computeScrollChoreography,
  computeWipeState,
  easeInOutCubic,
} from './heroMath';

test('computeWipeState produces 35% soft edge and sin(pi*t)*0.95 mist opacity', () => {
  const start = computeWipeState(0);
  assert.equal(start.transparentStopPct, 0);
  assert.equal(start.opaqueStopPct, -35);
  assert.ok(Math.abs(start.mistOpacity) < 1e-9);
  assert.equal(start.incomingScale, 1.12);

  const mid = computeWipeState(0.5);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(mid.transparentStopPct - mid.opaqueStopPct, 35);
  assert.ok(Math.abs(mid.mistOpacity - 0.95) < 1e-6);

  const end = computeWipeState(1);
  assert.equal(end.opaqueStopPct, 100);
  assert.equal(end.incomingScale, 1.04);
  assert.equal(end.outgoingScale, 1.09);
});

test('computeRailLayout centers thumbnails at 85.5% width and expands active item', () => {
  const layout = computeRailLayout(1440, 900, 2);
  assert.ok(Math.abs(layout.centerX - 1440 * 0.855) < 0.01);
  assert.ok(layout.activeSize >= 96 && layout.activeSize <= 190);
  assert.ok(layout.inactiveSize >= 46 && layout.inactiveSize <= 92);
  assert.equal(layout.items[2].isActive, true);
  assert.equal(layout.items[2].size, layout.activeSize);
  assert.equal(layout.items[0].size, layout.inactiveSize);
  assert.ok(layout.outerRingRadius > layout.innerRingRadius);
});

test('computeScrollChoreography switches nav solid past 30% vh and fades rail by 50% vh', () => {
  const top = computeScrollChoreography(0, 900);
  assert.equal(top.navSolid, false);
  assert.equal(top.railOpacity, 1);
  assert.equal(top.topCloudOpacity, 0);

  const mid = computeScrollChoreography(300, 900);
  assert.equal(mid.navSolid, true);
  assert.ok(mid.slideTranslateY > 0);
  assert.ok(mid.bottomCloudTranslateY < 0);
  assert.ok(mid.bottomCloudScale > 1);

  const half = computeScrollChoreography(450, 900);
  assert.equal(half.railOpacity, 0);
  assert.equal(half.topCloudOpacity, 1);
});
