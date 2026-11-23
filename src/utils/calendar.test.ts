import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMondayFirstMonthGrid,
  formatGuestsLabel,
  formatShortDate,
  selectDateRange,
  addMonths,
} from './calendar';

test('Monday-first calendar grid places Dec 1, 2026 (Tuesday) at column index 1', () => {
  const cells = buildMondayFirstMonthGrid(2026, 11, null, null);
  assert.equal(cells[0].dayNumber, null); // Monday blank
  assert.equal(cells[1].dayNumber, 1); // Tuesday Dec 1
  assert.equal(cells.length % 7, 0);
});

test('selectDateRange sets check-in, disables earlier dates, and completes check-out', () => {
  const step1 = selectDateRange({ year: 2026, month: 11, day: 18 }, null, null);
  assert.equal(step1.completed, false);
  assert.deepEqual(step1.checkIn, { year: 2026, month: 11, day: 18 });
  assert.equal(step1.checkOut, null);

  const gridMid = buildMondayFirstMonthGrid(2026, 11, step1.checkIn, step1.checkOut);
  const day17 = gridMid.find((c) => c.dayNumber === 17);
  const day18 = gridMid.find((c) => c.dayNumber === 18);
  const day22 = gridMid.find((c) => c.dayNumber === 22);
  assert.equal(day17?.isDisabled, true);
  assert.equal(day18?.isCheckIn, true);
  assert.equal(day22?.isDisabled, false);

  const step2 = selectDateRange({ year: 2026, month: 11, day: 23 }, step1.checkIn, step1.checkOut);
  assert.equal(step2.completed, true);
  assert.deepEqual(step2.checkOut, { year: 2026, month: 11, day: 23 });

  const gridDone = buildMondayFirstMonthGrid(2026, 11, step2.checkIn, step2.checkOut);
  const day20 = gridDone.find((c) => c.dayNumber === 20);
  assert.equal(day20?.isInRange, true);
});

test('formatShortDate and formatGuestsLabel format display labels accurately', () => {
  assert.equal(formatShortDate(null), 'Add date');
  assert.equal(formatShortDate({ year: 2026, month: 11, day: 18 }), 'Dec 18');
  assert.equal(formatGuestsLabel(0, 0), 'Add guests');
  assert.equal(formatGuestsLabel(1, 0), '1 guest');
  assert.equal(formatGuestsLabel(2, 1), '3 guests');
});

test('addMonths wraps across year boundaries', () => {
  assert.deepEqual(addMonths(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepEqual(addMonths(2026, 0, -1), { year: 2025, month: 11 });
});
