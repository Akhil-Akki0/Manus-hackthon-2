export interface DateValue {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
}

export interface CalendarCell {
  date: DateValue | null;
  dayNumber: number | null;
  isDisabled: boolean;
  isCheckIn: boolean;
  isCheckOut: boolean;
  isInRange: boolean;
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DEFAULT_DETAIL_CHECKIN: DateValue = { year: 2026, month: 11, day: 22 };
export const DEFAULT_DETAIL_CHECKOUT: DateValue = { year: 2026, month: 11, day: 27 };

export function toComparable(d: DateValue): number {
  return d.year * 10000 + (d.month + 1) * 100 + d.day;
}

export function isSameDate(a: DateValue | null, b: DateValue | null): boolean {
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatShortDate(d: DateValue | null, fallback = 'Add date'): string {
  if (!d) return fallback;
  return `${MONTH_SHORT[d.month]} ${d.day}`;
}

export function formatFullDate(d: DateValue): string {
  return `${MONTH_SHORT[d.month]} ${d.day}, ${d.year}`;
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_LONG[month]} ${year}`;
}

export function formatGuestsLabel(adults: number, children: number): string {
  const total = adults + children;
  if (total <= 0) return 'Add guests';
  return total === 1 ? '1 guest' : `${total} guests`;
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function buildMondayFirstMonthGrid(
  year: number,
  month: number,
  checkIn: DateValue | null,
  checkOut: DateValue | null,
  minDate?: DateValue
): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert JS Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({
      date: null,
      dayNumber: null,
      isDisabled: true,
      isCheckIn: false,
      isCheckOut: false,
      isInRange: false,
    });
  }

  const checkInNum = checkIn ? toComparable(checkIn) : null;
  const checkOutNum = checkOut ? toComparable(checkOut) : null;
  const minNum = minDate ? toComparable(minDate) : null;

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate: DateValue = { year, month, day };
    const cellNum = toComparable(cellDate);
    const isCheckIn = checkInNum !== null && cellNum === checkInNum;
    const isCheckOut = checkOutNum !== null && cellNum === checkOutNum;
    const isInRange =
      checkInNum !== null &&
      checkOutNum !== null &&
      cellNum > checkInNum &&
      cellNum < checkOutNum;

    let isDisabled = false;
    if (minNum !== null && cellNum < minNum) {
      isDisabled = true;
    }
    // Disable days before check-in when check-in is selected and check-out is not yet chosen
    if (checkInNum !== null && checkOutNum === null && cellNum < checkInNum) {
      isDisabled = true;
    }

    cells.push({
      date: cellDate,
      dayNumber: day,
      isDisabled,
      isCheckIn,
      isCheckOut,
      isInRange,
    });
  }

  // Pad trailing cells so rows are complete multiples of 7
  while (cells.length % 7 !== 0) {
    cells.push({
      date: null,
      dayNumber: null,
      isDisabled: true,
      isCheckIn: false,
      isCheckOut: false,
      isInRange: false,
    });
  }

  return cells;
}

export function selectDateRange(
  clicked: DateValue,
  currentCheckIn: DateValue | null,
  currentCheckOut: DateValue | null
): { checkIn: DateValue; checkOut: DateValue | null; completed: boolean } {
  const clickedNum = toComparable(clicked);

  if (!currentCheckIn || (currentCheckIn && currentCheckOut)) {
    return { checkIn: clicked, checkOut: null, completed: false };
  }

  const checkInNum = toComparable(currentCheckIn);
  if (clickedNum < checkInNum) {
    return { checkIn: clicked, checkOut: null, completed: false };
  }

  if (clickedNum === checkInNum) {
    // Allow clicking next day or resetting; keeping check-in when same day clicked
    return { checkIn: clicked, checkOut: null, completed: false };
  }

  return { checkIn: currentCheckIn, checkOut: clicked, completed: true };
}
