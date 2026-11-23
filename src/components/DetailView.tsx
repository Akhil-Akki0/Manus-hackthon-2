import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AMENITIES,
  AVATAR_IMAGES,
  getSimilarStays,
  INTERIOR_THUMBNAILS,
  StayProperty,
} from '../data/bangkok';
import {
  DateValue,
  DEFAULT_DETAIL_CHECKIN,
  DEFAULT_DETAIL_CHECKOUT,
  formatFullDate,
} from '../utils/calendar';
import { AmenityIcon, HeartIcon, StarIcon } from './Icons';
import { StayCard } from './StayCard';

interface DetailViewProps {
  stay: StayProperty;
  originRect: DOMRect | null;
  checkIn: DateValue | null;
  checkOut: DateValue | null;
  guestsCount: number;
  onGuestsChange: (total: number) => void;
  likedIds: Record<string, boolean>;
  onToggleLike: (id: string) => void;
  onSelectSimilar: (stay: StayProperty, rect: DOMRect) => void;
  onClose: () => void;
  closing: boolean;
}

export const DetailView: React.FC<DetailViewProps> = ({
  stay,
  originRect,
  checkIn,
  checkOut,
  guestsCount,
  onGuestsChange,
  likedIds,
  onToggleLike,
  onSelectSimilar,
  onClose,
  closing,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainPhotoSlotRef = useRef<HTMLDivElement>(null);

  const [entered, setEntered] = useState(false);
  const [blocksRevealed, setBlocksRevealed] = useState(false);
  const [flightState, setFlightState] = useState<{
    active: boolean;
    from: DOMRect;
    to: DOMRect;
    landed: boolean;
  } | null>(null);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [booked, setBooked] = useState(false);
  const [rated, setRated] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  // Reset per stay
  useEffect(() => {
    setBooked(false);
    setRated(false);
    setSelectedGalleryImg(null);
    setHighResLoaded(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [stay.id]);

  // Fade overlay in + stagger detail blocks from 250ms
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = window.setTimeout(() => setBlocksRevealed(true), 250);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  // Measure target main photo rect and animate 900ms easeInOutCubic shared-element flight
  useLayoutEffect(() => {
    if (!originRect || !mainPhotoSlotRef.current) {
      setFlightState(null);
      return;
    }
    const targetRect = mainPhotoSlotRef.current.getBoundingClientRect();
    setFlightState({
      active: true,
      from: originRect,
      to: targetRect,
      landed: false,
    });

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlightState((prev) => (prev ? { ...prev, landed: true } : null));
      });
    });

    const timer = window.setTimeout(() => {
      setFlightState(null);
    }, 920);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(timer);
    };
  }, [stay.id, originRect]);

  const effectiveCheckIn = checkIn ?? DEFAULT_DETAIL_CHECKIN;
  const effectiveCheckOut = checkOut ?? DEFAULT_DETAIL_CHECKOUT;
  const isLiked = Boolean(likedIds[stay.id]);
  const similarStays = getSimilarStays(stay.id);

  const revealStyle = (stepIndex: number): React.CSSProperties => ({
    opacity: blocksRevealed && !closing ? 1 : 0,
    transform:
      blocksRevealed && !closing ? 'translate3d(0, 0, 0)' : 'translate3d(0, 26px, 0)',
    transition: `opacity 0.65s var(--out) ${stepIndex * 70}ms, transform 0.65s var(--out) ${
      stepIndex * 70
    }ms`,
  });

  const activeMainSrc = selectedGalleryImg ?? stay.photo1400;
  const isFlying = flightState !== null;

  return (
    <div
      ref={scrollContainerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${stay.name} property details`}
      className="fixed inset-0 z-40 overflow-y-auto bg-white"
      style={{
        opacity: entered && !closing ? 1 : 0,
        transition: 'opacity 0.55s var(--ease)',
      }}
    >
      {/* Top 290px Peach Band */}
      <div
        aria-hidden="true"
        className="w-full h-[290px] bg-[#f7d9c6] pointer-events-none"
      />

      {/* Content Container pulled up over peach band */}
      <div
        className="relative -mt-[290px] pt-[104px] pb-24"
        style={{
          paddingLeft: 'clamp(20px, 9.5vw, 170px)',
          paddingRight: 'clamp(20px, 9.5vw, 170px)',
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={revealStyle(0)}
          className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-[#1d1a1c] mb-6"
        >
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 p-0 text-[#1d1a1c] hover:underline font-medium"
          >
            Home
          </button>
          <span aria-hidden="true" className="text-[#8a7f83]">
            ›
          </span>
          <span>Type of places to stay</span>
          <span aria-hidden="true" className="text-[#8a7f83]">
            ›
          </span>
          <span>{stay.category}</span>
          <span aria-hidden="true" className="text-[#8a7f83]">
            ›
          </span>
          <span className="text-[#8a7f83]">
            {stay.name}, {stay.area}
          </span>
        </nav>

        {/* Two Columns (1.18fr / 1fr on desktop, 1 col <= 1000px) */}
        <div className="grid grid-cols-1 min-[1001px]:grid-cols-[1.18fr_1fr] gap-10 min-[1001px]:gap-14 items-start">
          {/* Left Column */}
          <div>
            {/* Main Photo Slot */}
            <div
              ref={mainPhotoSlotRef}
              className="relative w-full rounded-[10px] overflow-hidden bg-[#f7d9c6]"
              style={{
                aspectRatio: '512 / 445',
                opacity: isFlying ? 0 : 1,
              }}
            >
              {/* Cached w=700 base layer */}
              {!selectedGalleryImg && (
                <img
                  src={stay.photo700}
                  alt={stay.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* High-res w=1400 layer over w=700 */}
              <img
                src={activeMainSrc}
                alt={stay.name}
                referrerPolicy="no-referrer"
                onLoad={() => setHighResLoaded(true)}
                className="relative w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: highResLoaded || selectedGalleryImg ? 1 : 0 }}
              />

              {/* Heart Button */}
              <button
                type="button"
                onClick={() => onToggleLike(stay.id)}
                aria-label={
                  isLiked
                    ? `Remove ${stay.name} from favorites`
                    : `Save ${stay.name} to favorites`
                }
                aria-pressed={isLiked}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center border-0 shadow-md transition-transform hover:scale-105"
                style={{ color: isLiked ? '#ff4d5e' : '#1d1a1c' }}
              >
                <HeartIcon size={17} filled={isLiked} />
              </button>
            </div>

            {/* 3 Square Interior Thumbnails */}
            <div style={revealStyle(1)} className="grid grid-cols-3 gap-4 mt-4">
              {INTERIOR_THUMBNAILS.map((thumbUrl, idx) => {
                const isThird = idx === 2;
                const isSelected = selectedGalleryImg === thumbUrl;
                return (
                  <button
                    key={thumbUrl}
                    type="button"
                    aria-label={`View interior photo ${idx + 1}`}
                    onClick={() =>
                      setSelectedGalleryImg((prev) =>
                        prev === thumbUrl ? null : thumbUrl
                      )
                    }
                    className={`relative aspect-square rounded-[10px] overflow-hidden border-0 p-0 bg-[#fbe7da] transition-transform duration-300 hover:-translate-y-1 ${
                      isSelected ? 'ring-2 ring-[#f39419]' : ''
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`${stay.name} interior ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isThird && (
                      <div className="absolute inset-0 bg-[#1d1a1c]/55 flex items-center justify-center text-white font-ui font-semibold text-[22px]">
                        +9
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <div style={revealStyle(1)}>
              <h1 className="font-display text-[32px] sm:text-[38px] leading-[1.15] text-[#1d1a1c] m-0 font-normal">
                {stay.name}
              </h1>
              <div className="flex items-center gap-2 mt-2.5 text-[13.5px] text-[#5c5156]">
                <span>Hosted by</span>
                <img
                  src={AVATAR_IMAGES[0]}
                  alt="Ploy Sirikul"
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium text-[#1d1a1c]">Ploy Sirikul</span>
              </div>
            </div>

            <div style={revealStyle(2)} className="mt-6">
              <h2 className="font-display text-[22px] text-[#1d1a1c] m-0 font-normal">
                About {stay.name}
              </h2>
              <p className="font-ui text-[14.5px] leading-[1.68] text-[#5c5156] mt-2.5 mb-0">
                {stay.about}
              </p>
            </div>

            {/* Booking Card */}
            <div
              style={{
                ...revealStyle(3),
                boxShadow: '0 14px 40px rgba(70, 40, 35, 0.1)',
              }}
              className="mt-7 rounded-[18px] bg-white p-6 border border-[#1d1a1c]/6"
            >
              <div className="flex items-baseline gap-1">
                <span className="font-ui font-bold text-[26px] text-[#1d1a1c] tabular-nums">
                  ${stay.price.toLocaleString()}
                </span>
                <span className="text-[14px] text-[#8a7f83]">/night</span>
              </div>

              {/* Pale grey dates box */}
              <div className="mt-4 rounded-xl bg-[#f7f5f4] grid grid-cols-2 divide-x divide-[#1d1a1c]/10">
                <div className="p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7f83]">
                    Check In
                  </div>
                  <div className="text-[14px] font-semibold text-[#1d1a1c] mt-0.5 tabular-nums">
                    {formatFullDate(effectiveCheckIn)}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8a7f83]">
                    Check Out
                  </div>
                  <div className="text-[14px] font-semibold text-[#1d1a1c] mt-0.5 tabular-nums">
                    {formatFullDate(effectiveCheckOut)}
                  </div>
                </div>
              </div>

              {/* Guests row with steppers */}
              <div className="mt-4 flex items-center justify-between py-2">
                <div>
                  <div className="text-[13.5px] font-semibold text-[#1d1a1c]">Guests</div>
                  <div className="text-[12px] text-[#8a7f83] tabular-nums">
                    {guestsCount} {guestsCount === 1 ? 'guest' : 'guests'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease property guests"
                    disabled={guestsCount <= 1}
                    onClick={() => onGuestsChange(Math.max(1, guestsCount - 1))}
                    className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 bg-white flex items-center justify-center text-[16px] text-[#1d1a1c] disabled:opacity-35 hover:border-[#1d1a1c]"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[14px] font-semibold tabular-nums text-[#1d1a1c]">
                    {guestsCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase property guests"
                    onClick={() => onGuestsChange(Math.min(12, guestsCount + 1))}
                    className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 bg-white flex items-center justify-center text-[16px] text-[#1d1a1c] hover:border-[#1d1a1c]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Book Now Pill */}
              <button
                type="button"
                onClick={() => setBooked(true)}
                className="w-full mt-4 h-12 rounded-full font-ui font-semibold text-[15px] text-white border-0 transition-colors duration-300"
                style={{
                  backgroundColor: booked ? '#1d9a6c' : '#f39419',
                }}
              >
                {booked ? 'Booked ✓' : 'Book Now'}
              </button>
            </div>

            {/* Rating Row between hairlines */}
            <div
              style={revealStyle(4)}
              className="mt-7 py-4 border-y border-[#1d1a1c]/10 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-ui font-bold text-[18px] text-[#1d1a1c] tabular-nums">
                  4.8
                </span>
                <span className="text-[13px] text-[#8a7f83] tabular-nums">
                  ({rated ? stay.reviewsCount + 1 : stay.reviewsCount} reviews)
                </span>
                <div className="flex items-center gap-0.5 text-[#ff4d5e]" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={11} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {AVATAR_IMAGES.map((avatar, i) => (
                    <img
                      key={avatar}
                      src={avatar}
                      alt={`Reviewer ${i + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-[38px] h-[38px] rounded-full object-cover border-2 border-white"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRated((r) => !r)}
                  className="px-4 py-1.5 rounded-full text-[12.5px] font-medium border border-[#1d1a1c]/30 bg-transparent text-[#1d1a1c] hover:bg-[#1d1a1c] hover:text-white transition-colors"
                >
                  {rated ? 'Rated ★' : 'Rate Now'}
                </button>
              </div>
            </div>

            {/* Amenities 3x2 */}
            <div style={revealStyle(5)} className="mt-7">
              <h3 className="font-display text-[20px] text-[#1d1a1c] m-0 mb-4 font-normal">
                Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                {AMENITIES.map((am) => (
                  <div
                    key={am.id}
                    className="flex items-center gap-2.5 text-[13.5px] text-[#5c5156]"
                  >
                    <span className="text-[#1d1a1c] shrink-0">
                      <AmenityIcon id={am.id} size={18} />
                    </span>
                    <span className="whitespace-nowrap">{am.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Places to Stay */}
        <section style={revealStyle(6)} className="mt-20">
          <h2
            className="font-display text-[#1d1a1c] m-0 mb-7 font-normal"
            style={{ fontSize: 'clamp(24px, 2.2vw, 32px)' }}
          >
            Similar Places to Stay
          </h2>
          <div
            className="grid grid-cols-2 min-[1001px]:grid-cols-4"
            style={{ gap: 'clamp(14px, 2.2vw, 30px)' }}
          >
            {similarStays.map((sim, idx) => (
              <StayCard
                key={sim.id}
                stay={sim}
                columnIndex={idx}
                isLiked={Boolean(likedIds[sim.id])}
                onToggleLike={onToggleLike}
                onSelectStay={onSelectSimilar}
                immediate
              />
            ))}
          </div>
        </section>
      </div>

      {/* Shared-element Flying Photo Clone */}
      {flightState && (
        <div
          aria-hidden="true"
          className="fixed z-50 overflow-hidden pointer-events-none"
          style={{
            top: flightState.landed ? flightState.to.top : flightState.from.top,
            left: flightState.landed ? flightState.to.left : flightState.from.left,
            width: flightState.landed ? flightState.to.width : flightState.from.width,
            height: flightState.landed ? flightState.to.height : flightState.from.height,
            borderRadius: flightState.landed ? '10px' : '12px',
            transition:
              'top 900ms cubic-bezier(0.65, 0, 0.35, 1), left 900ms cubic-bezier(0.65, 0, 0.35, 1), width 900ms cubic-bezier(0.65, 0, 0.35, 1), height 900ms cubic-bezier(0.65, 0, 0.35, 1), border-radius 900ms cubic-bezier(0.65, 0, 0.35, 1)',
          }}
        >
          <img
            src={stay.photo700}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
