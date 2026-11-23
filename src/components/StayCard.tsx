import React, { useEffect, useRef, useState } from 'react';
import { StayProperty } from '../data/bangkok';
import { HeartIcon, PinIcon, StarIcon } from './Icons';

interface StayCardProps {
  stay: StayProperty;
  columnIndex: number;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onSelectStay: (stay: StayProperty, cardRect: DOMRect) => void;
  immediate?: boolean;
}

export const StayCard: React.FC<StayCardProps> = ({
  stay,
  columnIndex,
  isLiked,
  onToggleLike,
  onSelectStay,
  immediate = false,
}) => {
  const cardRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const handleCardClick = () => {
    const rect = (photoRef.current || cardRef.current)?.getBoundingClientRect();
    if (rect) {
      onSelectStay(stay, rect);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopping(true);
    onToggleLike(stay.id);
    window.setTimeout(() => setPopping(false), 360);
  };

  const staggerMs = (columnIndex % 4) * 90;

  return (
    <article
      ref={cardRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 40px, 0)',
        transition: `opacity 0.75s var(--out) ${staggerMs}ms, transform 0.75s var(--out) ${staggerMs}ms`,
      }}
    >
      <div
        ref={photoRef}
        className="group relative w-full rounded-[12px] overflow-hidden select-none transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[6px]"
        style={{
          aspectRatio: '203 / 268',
          boxShadow: '0 12px 30px rgba(110, 60, 50, 0.16)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 22px 44px rgba(110, 60, 50, 0.25)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 12px 30px rgba(110, 60, 50, 0.16)';
        }}
      >
        {/* Main clickable card button (no nested interactive elements inside) */}
        <button
          type="button"
          aria-label={`${stay.name} in ${stay.area}, $${stay.price.toLocaleString()} per night`}
          onClick={handleCardClick}
          className="relative block w-full h-full p-0 border-0 bg-transparent text-left focus-visible:outline-2 focus-visible:outline-[#1d1a1c]"
        >
          {/* Full-bleed Photo */}
          <img
            src={stay.photo700}
            alt={stay.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />

          {/* Bottom Darkening Gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(16,12,14,0) 0%, rgba(16,12,14,0.42) 52%, rgba(16,12,14,0.78) 100%)',
            }}
          />

          {/* Top-left Price Pill */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold text-[#1d1a1c] tabular-nums"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <span>${stay.price.toLocaleString()}</span>
            <span className="opacity-60 font-medium">/night</span>
          </div>

          {/* Bottom-left Info */}
          <div className="absolute inset-x-3.5 bottom-3.5 text-white">
            <h3 className="font-ui font-semibold text-[15.5px] leading-[1.2] m-0 truncate">
              {stay.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[11.5px] text-white/85">
              <PinIcon size={11} className="shrink-0 opacity-90" />
              <span className="truncate">{stay.area}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5 text-[#f7c325]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} size={10} />
                ))}
              </div>
              <span className="text-[11.5px] font-semibold text-white/95 tabular-nums">
                {stay.rating}
              </span>
            </div>
          </div>
        </button>

        {/* Top-right 30px White Heart Button (sibling to avoid nested interactive elements) */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isLiked ? `Remove ${stay.name} from favorites` : `Save ${stay.name} to favorites`}
          aria-pressed={isLiked}
          className={`absolute top-3 right-3 z-10 w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center border-0 shadow-sm transition-transform ${
            popping ? 'heart-pop' : ''
          }`}
          style={{
            color: isLiked ? '#ff4d5e' : '#1d1a1c',
          }}
        >
          <HeartIcon size={14} filled={isLiked} />
        </button>
      </div>
    </article>
  );
};
