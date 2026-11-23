import React, { useEffect, useRef, useState } from 'react';
import {
  addMonths,
  buildMondayFirstMonthGrid,
  DateValue,
  formatGuestsLabel,
  formatMonthYear,
  formatShortDate,
  selectDateRange,
} from '../utils/calendar';
import { CalendarIcon, PaperPlaneIcon, PeopleIcon, PinIcon } from './Icons';

export type SearchFieldKey = 'destination' | 'checkin' | 'checkout' | 'visitors';

interface SearchBarProps {
  destination: string;
  onDestinationChange: (dest: string) => void;
  checkIn: DateValue | null;
  checkOut: DateValue | null;
  onDatesChange: (checkIn: DateValue | null, checkOut: DateValue | null) => void;
  adults: number;
  childrenCount: number;
  onGuestsChange: (adults: number, children: number) => void;
  onSearchSubmit: () => void;
  introReady: boolean;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const BANGKOK_AREAS = [
  'Bangkok',
  'Khlong San, Bangkok',
  'Thonburi, Bangkok',
  'Sathorn, Bangkok',
  'Charoen Krung, Bangkok',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  destination,
  onDestinationChange,
  checkIn,
  checkOut,
  onDatesChange,
  adults,
  childrenCount,
  onGuestsChange,
  onSearchSubmit,
  introReady,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [activeField, setActiveField] = useState<SearchFieldKey>('checkin');
  const [hoveredField, setHoveredField] = useState<SearchFieldKey | null>(null);
  const [openPopover, setOpenPopover] = useState<'destination' | 'calendar' | 'visitors' | null>(
    null
  );
  // Start calendar view on December 2026 (aligned with current local time 2026-11 / Dec default dates)
  const [calView, setCalView] = useState<{ year: number; month: number }>({
    year: 2026,
    month: 11,
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const cells = buildMondayFirstMonthGrid(calView.year, calView.month, checkIn, checkOut);

  const handleDayClick = (date: DateValue | null, isDisabled: boolean) => {
    if (!date || isDisabled) return;
    const result = selectDateRange(date, checkIn, checkOut);
    onDatesChange(result.checkIn, result.checkOut);
    if (result.completed) {
      setActiveField('visitors');
      setOpenPopover('visitors');
    } else {
      setActiveField('checkout');
    }
  };

  const isElevated = (key: SearchFieldKey) =>
    activeField === key || hoveredField === key;

  const fieldBaseStyle = (key: SearchFieldKey): React.CSSProperties => ({
    backgroundColor: isElevated(key) ? '#ffffff' : 'transparent',
    boxShadow: isElevated(key) ? '0 8px 24px rgba(120, 80, 70, 0.14)' : 'none',
    transition: 'background-color 0.22s ease, box-shadow 0.25s var(--out)',
  });

  return (
    <div
      ref={barRef}
      className="absolute left-1/2 -translate-x-1/2 z-30 bottom-[16vh] min-[641px]:bottom-[calc(20vh+2px)]"
      style={{
        width: 'min(900px, calc(100% - 40px))',
        opacity: introReady ? 1 : 0,
        transform: introReady ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 1s var(--out), transform 1s var(--out)',
      }}
    >
      <div
        className="w-full rounded-[22px] min-[641px]:rounded-[26px] min-[641px]:h-[90px] p-2.5 min-[641px]:pl-[10px] min-[641px]:pr-[18px] min-[641px]:py-[9px] flex flex-col min-[641px]:flex-row items-stretch min-[641px]:items-center gap-2 min-[641px]:gap-1.5"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.93)',
          boxShadow: '0 18px 60px rgba(120, 70, 60, 0.16)',
        }}
      >
        {/* 2x2 grid on <=640px, 4 flex fields on desktop */}
        <div className="grid grid-cols-2 min-[641px]:flex min-[641px]:flex-1 items-center gap-1.5 min-[641px]:gap-1">
          {/* 1. Destination */}
          <button
            type="button"
            onClick={() => {
              setActiveField('destination');
              setOpenPopover((p) => (p === 'destination' ? null : 'destination'));
            }}
            onMouseEnter={() => setHoveredField('destination')}
            onMouseLeave={() => setHoveredField(null)}
            style={fieldBaseStyle('destination')}
            className="min-[641px]:flex-[1.35] h-[64px] min-[641px]:h-[72px] rounded-[14px] px-2.5 min-[641px]:px-5 flex flex-col justify-center text-left border-0 min-w-0"
          >
            <div className="flex items-center gap-1.5 min-[641px]:gap-2 text-[#1d1a1c]">
              <PinIcon size={15} className="shrink-0 opacity-80" />
              <span className="font-ui font-medium text-[17px] min-[641px]:text-[21px] leading-[1.15] truncate">
                {destination === 'Bangkok' ? 'Bangkok' : destination.split(',')[0]}
              </span>
            </div>
            <span className="font-ui text-[11px] min-[641px]:text-[13px] text-[#8a7f83] pl-[21px] min-[641px]:pl-6 truncate mt-0.5">
              {destination === 'Bangkok' ? 'Choose the destination' : destination}
            </span>
          </button>

          {/* 2. Check in */}
          <button
            type="button"
            onClick={() => {
              setActiveField('checkin');
              setOpenPopover('calendar');
            }}
            onMouseEnter={() => setHoveredField('checkin')}
            onMouseLeave={() => setHoveredField(null)}
            style={fieldBaseStyle('checkin')}
            className="min-[641px]:flex-1 h-[64px] min-[641px]:h-[72px] rounded-[14px] px-2.5 min-[641px]:px-4 flex flex-col justify-center text-left border-0 min-w-0"
          >
            <div className="flex items-center gap-1.5 min-[641px]:gap-2 text-[#1d1a1c]">
              <CalendarIcon size={15} className="shrink-0 opacity-80" />
              <span className="font-ui font-medium text-[17px] min-[641px]:text-[21px] leading-[1.15] whitespace-nowrap">
                Check in
              </span>
            </div>
            <span className="font-ui text-[11px] min-[641px]:text-[13px] text-[#8a7f83] pl-[21px] min-[641px]:pl-6 truncate mt-0.5">
              {formatShortDate(checkIn, 'Add date')}
            </span>
          </button>

          {/* 3. Check out */}
          <button
            type="button"
            onClick={() => {
              setActiveField('checkout');
              setOpenPopover('calendar');
            }}
            onMouseEnter={() => setHoveredField('checkout')}
            onMouseLeave={() => setHoveredField(null)}
            style={fieldBaseStyle('checkout')}
            className="min-[641px]:flex-1 h-[64px] min-[641px]:h-[72px] rounded-[14px] px-2.5 min-[641px]:px-4 flex flex-col justify-center text-left border-0 min-w-0"
          >
            <div className="flex items-center gap-1.5 min-[641px]:gap-2 text-[#1d1a1c]">
              <CalendarIcon size={15} className="shrink-0 opacity-80" />
              <span className="font-ui font-medium text-[17px] min-[641px]:text-[21px] leading-[1.15] whitespace-nowrap">
                Check out
              </span>
            </div>
            <span className="font-ui text-[11px] min-[641px]:text-[13px] text-[#8a7f83] pl-[21px] min-[641px]:pl-6 truncate mt-0.5">
              {formatShortDate(checkOut, 'Add date')}
            </span>
          </button>

          {/* 4. Visitors */}
          <button
            type="button"
            onClick={() => {
              setActiveField('visitors');
              setOpenPopover((p) => (p === 'visitors' ? null : 'visitors'));
            }}
            onMouseEnter={() => setHoveredField('visitors')}
            onMouseLeave={() => setHoveredField(null)}
            style={fieldBaseStyle('visitors')}
            className="min-[641px]:flex-1 h-[64px] min-[641px]:h-[72px] rounded-[14px] px-2.5 min-[641px]:px-4 flex flex-col justify-center text-left border-0 min-w-0"
          >
            <div className="flex items-center gap-1.5 min-[641px]:gap-2 text-[#1d1a1c]">
              <PeopleIcon size={15} className="shrink-0 opacity-80" />
              <span className="font-ui font-medium text-[17px] min-[641px]:text-[21px] leading-[1.15] whitespace-nowrap">
                Visitors
              </span>
            </div>
            <span className="font-ui text-[11px] min-[641px]:text-[13px] text-[#8a7f83] pl-[21px] min-[641px]:pl-6 truncate mt-0.5">
              {formatGuestsLabel(adults, childrenCount)}
            </span>
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => {
            setOpenPopover(null);
            onSearchSubmit();
          }}
          aria-label="Search stays in Bangkok"
          className="w-full min-[641px]:w-[40px] h-[42px] min-[641px]:h-[40px] rounded-[11px] bg-[#1d1a1c] text-white flex items-center justify-center shrink-0 border-0 transition-transform duration-200 hover:scale-110 hover:-rotate-[8deg] active:scale-95 min-[641px]:ml-2"
        >
          <PaperPlaneIcon size={17} />
        </button>
      </div>

      {/* Destination Popover */}
      {openPopover === 'destination' && (
        <div
          className="popover-drop absolute left-0 min-[641px]:left-4 top-full mt-3 w-[270px] rounded-[18px] bg-white p-3 shadow-[0_22px_55px_rgba(70,35,30,0.22)] z-40"
          role="dialog"
          aria-label="Choose Bangkok destination"
        >
          <div className="px-2.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-[#8a7f83]">
            Bangkok Districts
          </div>
          {BANGKOK_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => {
                onDestinationChange(area);
                setActiveField('checkin');
                setOpenPopover('calendar');
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1a1c] hover:bg-[#fbe7da] transition-colors flex items-center gap-2.5"
            >
              <PinIcon size={14} className="text-[#5c5156] shrink-0" />
              <span>{area}</span>
            </button>
          ))}
        </div>
      )}

      {/* Calendar Popover */}
      {openPopover === 'calendar' && (
        <div
          className="popover-drop absolute left-1/2 -translate-x-1/2 min-[641px]:left-[42%] top-full mt-3 w-[290px] rounded-[18px] bg-white p-4 shadow-[0_24px_60px_rgba(70,35,30,0.22)] z-40"
          role="dialog"
          aria-label="Select check-in and check-out dates"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setCalView((v) => addMonths(v.year, v.month, -1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1a1c] hover:bg-[#fbe7da] transition-colors text-[18px] leading-none border-0 bg-transparent"
            >
              ‹
            </button>
            <div className="font-ui font-semibold text-[15px] text-[#1d1a1c]">
              {formatMonthYear(calView.year, calView.month)}
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setCalView((v) => addMonths(v.year, v.month, 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1a1c] hover:bg-[#fbe7da] transition-colors text-[18px] leading-none border-0 bg-transparent"
            >
              ›
            </button>
          </div>

          {/* Weekday headings */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="h-7 flex items-center justify-center text-[11.5px] font-medium text-[#8a7f83]"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 7 columns x 34px */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, idx) => {
              if (!cell.date || cell.dayNumber === null) {
                return <div key={`blank-${idx}`} className="h-[34px]" />;
              }
              const isEndpoint = cell.isCheckIn || cell.isCheckOut;
              return (
                <div
                  key={`${calView.year}-${calView.month}-${cell.dayNumber}`}
                  className="h-[34px] flex items-center justify-center relative"
                  style={{
                    backgroundColor: cell.isInRange ? '#fbe7da' : 'transparent',
                    borderTopLeftRadius: cell.isCheckIn ? '9px' : 0,
                    borderBottomLeftRadius: cell.isCheckIn ? '9px' : 0,
                    borderTopRightRadius: cell.isCheckOut ? '9px' : 0,
                    borderBottomRightRadius: cell.isCheckOut ? '9px' : 0,
                  }}
                >
                  {isEndpoint && checkIn && checkOut && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 bg-[#fbe7da]"
                      style={{
                        left: cell.isCheckOut ? 0 : '50%',
                        right: cell.isCheckIn ? 0 : '50%',
                      }}
                    />
                  )}
                  <button
                    type="button"
                    disabled={cell.isDisabled}
                    onClick={() => handleDayClick(cell.date, cell.isDisabled)}
                    aria-label={`${formatMonthYear(calView.year, calView.month)} ${cell.dayNumber}`}
                    className="relative z-10 w-[34px] h-[34px] rounded-[9px] text-[13px] font-medium tabular-nums flex items-center justify-center border-0 transition-colors"
                    style={{
                      backgroundColor: isEndpoint ? '#1d1a1c' : 'transparent',
                      color: isEndpoint
                        ? '#ffffff'
                        : cell.isDisabled
                        ? '#c8bfc2'
                        : '#1d1a1c',
                    }}
                  >
                    {cell.dayNumber}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visitors Popover */}
      {openPopover === 'visitors' && (
        <div
          className="popover-drop absolute right-0 min-[641px]:right-14 top-full mt-3 w-[280px] rounded-[18px] bg-white p-4 shadow-[0_24px_60px_rgba(70,35,30,0.22)] z-40"
          role="dialog"
          aria-label="Select number of visitors"
        >
          <div className="flex items-center justify-between py-2.5 border-b border-[#1d1a1c]/10">
            <div>
              <div className="text-[14.5px] font-semibold text-[#1d1a1c]">Adults</div>
              <div className="text-[12px] text-[#8a7f83]">Ages 13 or above</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease adults"
                disabled={adults <= 0}
                onClick={() => onGuestsChange(Math.max(0, adults - 1), childrenCount)}
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[16px] text-[#1d1a1c] disabled:opacity-35 hover:border-[#1d1a1c] transition-colors bg-white"
              >
                −
              </button>
              <span className="w-4 text-center text-[14px] font-semibold tabular-nums text-[#1d1a1c]">
                {adults}
              </span>
              <button
                type="button"
                aria-label="Increase adults"
                onClick={() => onGuestsChange(Math.min(12, adults + 1), childrenCount)}
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[16px] text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors bg-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 pb-1">
            <div>
              <div className="text-[14.5px] font-semibold text-[#1d1a1c]">Children</div>
              <div className="text-[12px] text-[#8a7f83]">Ages 2–12</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease children"
                disabled={childrenCount <= 0}
                onClick={() => onGuestsChange(adults, Math.max(0, childrenCount - 1))}
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[16px] text-[#1d1a1c] disabled:opacity-35 hover:border-[#1d1a1c] transition-colors bg-white"
              >
                −
              </button>
              <span className="w-4 text-center text-[14px] font-semibold tabular-nums text-[#1d1a1c]">
                {childrenCount}
              </span>
              <button
                type="button"
                aria-label="Increase children"
                onClick={() => onGuestsChange(adults, Math.min(8, childrenCount + 1))}
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[16px] text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors bg-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
