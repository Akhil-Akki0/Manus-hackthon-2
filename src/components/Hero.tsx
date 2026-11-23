import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CLOUD_IMAGE_URL, HERO_SLIDES, RAIL_THUMBS } from '../data/bangkok';
import { DateValue } from '../utils/calendar';
import {
  computeRailLayout,
  computeScrollChoreography,
  computeWipeState,
  WipeMaskState,
} from '../utils/heroMath';
import { SearchBar } from './SearchBar';

interface HeroProps {
  activeSlide: number;
  onSelectSlide: (slideIndex: number) => void;
  destination: string;
  onDestinationChange: (dest: string) => void;
  checkIn: DateValue | null;
  checkOut: DateValue | null;
  onDatesChange: (checkIn: DateValue | null, checkOut: DateValue | null) => void;
  adults: number;
  childrenCount: number;
  onGuestsChange: (adults: number, children: number) => void;
  onSearchSubmit: () => void;
}

const WIPE_DURATION_MS = 1250;
const AUTO_ADVANCE_MS = 5200;

export const Hero: React.FC<HeroProps> = ({
  activeSlide,
  onSelectSlide,
  destination,
  onDestinationChange,
  checkIn,
  checkOut,
  onDatesChange,
  adults,
  childrenCount,
  onGuestsChange,
  onSearchSubmit,
}) => {
  const [outgoingSlide, setOutgoingSlide] = useState<number | null>(null);
  const [wipeState, setWipeState] = useState<WipeMaskState | null>(null);

  // Intro & caption choreography states
  const [wordsRevealed, setWordsRevealed] = useState(false);
  const [thumbsRevealed, setThumbsRevealed] = useState(false);
  const [ringsRevealed, setRingsRevealed] = useState(false);
  const [searchRevealed, setSearchRevealed] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);

  // Viewport geometry for rail
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1440,
    h: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  // DOM refs for zero-re-render Ken Burns, parallax, and scroll choreography
  const activePhotoRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const slideStackRef = useRef<HTMLDivElement>(null);
  const bottomCloudRef = useRef<HTMLDivElement>(null);
  const topCloudRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const activeSlideRef = useRef(activeSlide);
  const outgoingSlideRef = useRef<number | null>(null);
  const wipeRafRef = useRef<number>(0);
  const captionTimerRef = useRef<number>(0);
  const autoTimerRef = useRef<number>(0);
  const kbStartRef = useRef<number>(performance.now());

  // Intro sequence
  useEffect(() => {
    const tWords = window.setTimeout(() => setWordsRevealed(true), 250);
    const tThumbs = window.setTimeout(() => setThumbsRevealed(true), 350);
    const tRings = window.setTimeout(() => setRingsRevealed(true), 400);
    const tSearch = window.setTimeout(() => setSearchRevealed(true), 450);
    const tCaption = window.setTimeout(() => setCaptionVisible(true), 900);

    return () => {
      window.clearTimeout(tWords);
      window.clearTimeout(tThumbs);
      window.clearTimeout(tRings);
      window.clearTimeout(tSearch);
      window.clearTimeout(tCaption);
    };
  }, []);

  // Viewport resize listener
  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Trigger soft misty right-to-left wipe whenever activeSlide changes
  const startTransitionTo = useCallback((nextIndex: number) => {
    const prevIndex = activeSlideRef.current;
    if (nextIndex === prevIndex) return;

    if (wipeRafRef.current) cancelAnimationFrame(wipeRafRef.current);
    if (captionTimerRef.current) window.clearTimeout(captionTimerRef.current);

    activeSlideRef.current = nextIndex;
    outgoingSlideRef.current = prevIndex;
    setOutgoingSlide(prevIndex);
    setCaptionVisible(false);
    kbStartRef.current = performance.now();

    const startTime = performance.now();
    const tick = (now: number) => {
      const rawT = Math.min(1, (now - startTime) / WIPE_DURATION_MS);
      setWipeState(computeWipeState(rawT));
      if (rawT < 1) {
        wipeRafRef.current = requestAnimationFrame(tick);
      } else {
        outgoingSlideRef.current = null;
        setOutgoingSlide(null);
        setWipeState(null);
        kbStartRef.current = performance.now();
        wipeRafRef.current = 0;
      }
    };

    setWipeState(computeWipeState(0));
    wipeRafRef.current = requestAnimationFrame(tick);

    captionTimerRef.current = window.setTimeout(() => {
      setCaptionVisible(true);
    }, 650);
  }, []);

  // Sync external activeSlide prop changes
  useEffect(() => {
    if (activeSlide !== activeSlideRef.current) {
      startTransitionTo(activeSlide);
    }
  }, [activeSlide, startTransitionTo]);

  // Auto-advance every 5.2s
  useEffect(() => {
    if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    autoTimerRef.current = window.setInterval(() => {
      const next = (activeSlideRef.current + 1) % HERO_SLIDES.length;
      onSelectSlide(next);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, [activeSlide, onSelectSlide]);

  // Direct DOM Ken Burns (0.0035 per second up to 12s) + parallax without React setState
  useEffect(() => {
    let kbRaf = 0;
    const step = (now: number) => {
      if (outgoingSlideRef.current === null && activePhotoRef.current) {
        const elapsedSec = Math.min(12, Math.max(0, (now - kbStartRef.current) / 1000));
        const scale = 1.04 + 0.0035 * elapsedSec;
        const { x, y } = parallaxRef.current;
        activePhotoRef.current.style.transform = `scale(${scale}) translate3d(${x}%, ${y}%, 0)`;
      }
      kbRaf = requestAnimationFrame(step);
    };
    kbRaf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(kbRaf);
  }, []);

  // Scroll choreography
  useEffect(() => {
    let raf = 0;
    const applyScroll = () => {
      const ch = computeScrollChoreography(window.scrollY, window.innerHeight);
      if (slideStackRef.current) {
        slideStackRef.current.style.transform = `translate3d(0, ${ch.slideTranslateY}px, 0)`;
      }
      if (bottomCloudRef.current) {
        bottomCloudRef.current.style.transform = `translate3d(0, ${ch.bottomCloudTranslateY}px, 0) scale(${ch.bottomCloudScale})`;
      }
      if (topCloudRef.current) {
        topCloudRef.current.style.opacity = `${ch.topCloudOpacity}`;
        topCloudRef.current.style.transform = `translate3d(0, ${ch.topCloudTranslateY}px, 0)`;
      }
      if (railRef.current) {
        railRef.current.style.transform = `translate3d(0, ${ch.railTranslateY}px, 0)`;
        railRef.current.style.opacity = `${ch.railOpacity}`;
      }
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(applyScroll);
    };

    applyScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Pointer parallax (±0.6% horizontal, ±0.5% vertical)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const nx = (e.clientX / Math.max(1, viewport.w) - 0.5) * 2;
    const ny = (e.clientY / Math.max(1, viewport.h) - 0.5) * 2;
    parallaxRef.current = { x: nx * 0.6, y: ny * 0.5 };
  };

  const currentSlide = HERO_SLIDES[activeSlide];
  const railLayout = computeRailLayout(viewport.w, viewport.h, currentSlide.thumbOrderIndex);
  const isMobile = viewport.w <= 640;

  const renderSlide = (slideIdx: number, role: 'active' | 'outgoing') => {
    const slide = HERO_SLIDES[slideIdx];
    const isTransitioning = outgoingSlide !== null && wipeState !== null;

    let zIndex = 1;
    let maskStyle: React.CSSProperties = {};
    let photoTransform = 'scale(1.04) translate3d(0%, 0%, 0)';

    if (isTransitioning && wipeState) {
      if (role === 'outgoing') {
        zIndex = 2;
        photoTransform = `scale(${wipeState.outgoingScale}) translate3d(${wipeState.outgoingOffsetPct}%, 0, 0)`;
      } else {
        zIndex = 3;
        const mask = `linear-gradient(to left, rgba(0,0,0,1) ${wipeState.opaqueStopPct}%, rgba(0,0,0,0.6) ${wipeState.midStopPct}%, rgba(0,0,0,0) ${wipeState.transparentStopPct}%)`;
        maskStyle = {
          maskImage: mask,
          WebkitMaskImage: mask,
        };
        photoTransform = `scale(${wipeState.incomingScale}) translate3d(${wipeState.incomingOffsetPct}%, 0, 0)`;
      }
    } else if (role === 'active') {
      zIndex = 2;
    }

    let wordCounter = 0;

    return (
      <div
        key={`slide-${slide.id}-${role}`}
        aria-hidden={role === 'outgoing'}
        className="absolute inset-0 overflow-hidden"
        style={{ zIndex, ...maskStyle }}
      >
        {/* Photo Layer (-3% inset, base scale 1.04) */}
        <div
          ref={role === 'active' ? activePhotoRef : undefined}
          className="absolute -inset-[3%] bg-cover bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url("${slide.photo}")`,
            backgroundPosition: slide.photoPosition,
            transform: photoTransform,
          }}
        />

        {/* Mauve top tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(84,64,74,0.42) 0%, rgba(84,64,74,0.08) 26%, transparent 46%)',
          }}
        />

        {/* Giant Title inside slide so wipe reveals title + photo together */}
        <h1
          className="absolute m-0 font-ui font-bold uppercase select-none pointer-events-none"
          style={{
            left: isMobile ? '6vw' : slide.titleLeft,
            top: isMobile ? 'calc(74px + 4.5vh)' : slide.titleTop,
            maxWidth: isMobile ? '80vw' : 'none',
            fontSize: isMobile
              ? slide.id === 2
                ? '13.5vw'
                : '13vw'
              : slide.titleSizeDesktop,
            lineHeight: isMobile ? 0.95 : slide.titleLineHeight,
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            letterSpacing: '-0.02em',
          }}
        >
          {slide.titleLines.map((line, lineIdx) => {
            const words = line.split(' ');
            return (
              <span key={lineIdx} className="block">
                {words.map((word, wIdx) => {
                  const delayMs = wordCounter * 90;
                  wordCounter += 1;
                  return (
                    <span
                      key={`${lineIdx}-${wIdx}`}
                      className="hero-word-mask mr-[0.24em] last:mr-0"
                    >
                      <span
                        className="hero-title-word"
                        style={{
                          transform: wordsRevealed
                            ? 'translate3d(0, 0%, 0)'
                            : 'translate3d(0, 105%, 0)',
                          transition: `transform 1.15s var(--out) ${delayMs}ms`,
                        }}
                      >
                        {word}
                      </span>
                    </span>
                  );
                })}
              </span>
            );
          })}
        </h1>
      </div>
    );
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      aria-label="Welcome to Bangkok Hero Showcase"
      className="relative w-full h-[100vh] min-h-[680px]"
    >
      {/* Clipped visual stage at z-10 (so StaysSection at z-20 pulls up cleanly over bottom fade) */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* Parallax Slide Stack */}
        <div ref={slideStackRef} className="absolute inset-0 will-change-transform">
          {outgoingSlide !== null && renderSlide(outgoingSlide, 'outgoing')}
          {renderSlide(activeSlide, 'active')}
        </div>

        {/* Travelling Mist Band during wipe */}
        {outgoingSlide !== null && wipeState !== null && (
          <div
            aria-hidden="true"
            className="absolute inset-y-[-10%] pointer-events-none z-[5]"
            style={{
              width: '34vw',
              right: `calc(${wipeState.mistCenterFromRightPct}% - 17vw)`,
              opacity: wipeState.mistOpacity,
              background:
                'radial-gradient(ellipse at center, rgba(255,236,226,0.75) 0%, rgba(255,236,226,0.42) 48%, rgba(255,236,226,0) 76%)',
              filter: 'blur(10px)',
            }}
          />
        )}

        {/* Top Cloud Layer (flipped vertically, fades in on scroll) */}
        <div
          ref={topCloudRef}
          aria-hidden="true"
          className="absolute left-[-4%] right-[-4%] top-[-30%] h-[80%] pointer-events-none z-[6]"
          style={{
            opacity: 0,
            mixBlendMode: 'screen',
            maskImage: 'linear-gradient(to top, transparent 0%, black 42%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 42%)',
          }}
        >
          <img
            src={CLOUD_IMAGE_URL}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-bottom"
            style={{ transform: 'scaleY(-1)' }}
          />
        </div>

        {/* Bottom Volumetric Cloud Bank (screen-blended, dual drifting layers) */}
        <div
          ref={bottomCloudRef}
          aria-hidden="true"
          className="absolute left-[-4%] right-[-4%] bottom-[-6%] h-[78%] pointer-events-none z-[7] will-change-transform"
          style={{ mixBlendMode: 'screen' }}
        >
          <div
            className="absolute inset-0 opacity-85"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
            }}
          >
            <img
              src={CLOUD_IMAGE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="cloud-back-anim w-full h-full object-cover object-bottom"
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 38%)',
            }}
          >
            <img
              src={CLOUD_IMAGE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="cloud-front-anim w-full h-full object-cover object-bottom"
            />
          </div>
        </div>

        {/* Bottom Peach Fade (lowest 46% of hero) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[46%] pointer-events-none z-[8]"
          style={{
            background:
              'linear-gradient(180deg, rgba(247,217,198,0) 0%, rgba(247,217,198,0.45) 45%, rgba(247,217,198,0.92) 82%, #f7d9c6 100%)',
          }}
        />

        {/* Right Rail: Concentric Rings, Thumbnails, Connector & Caption */}
        <div
          ref={railRef}
          className="absolute inset-0 pointer-events-none z-[15]"
        >
          {/* Inner Concentric Ring */}
          <div
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: railLayout.innerRingRadius * 2,
              height: railLayout.innerRingRadius * 2,
              left: railLayout.centerX - railLayout.innerRingRadius,
              top: railLayout.activeCenterY - railLayout.innerRingRadius,
              border: '1.6px solid rgba(255, 255, 255, 0.5)',
              opacity: ringsRevealed ? 1 : 0,
              transition:
                'top 0.9s var(--ease), left 0.9s var(--ease), width 0.9s var(--ease), height 0.9s var(--ease), opacity 0.9s var(--out)',
            }}
          />

          {/* Outer Concentric Ring */}
          <div
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: railLayout.outerRingRadius * 2,
              height: railLayout.outerRingRadius * 2,
              left: railLayout.centerX - railLayout.outerRingRadius,
              top: railLayout.activeCenterY - railLayout.outerRingRadius,
              border: '1.6px solid rgba(255, 255, 255, 0.5)',
              opacity: ringsRevealed ? 1 : 0,
              transition:
                'top 0.9s var(--ease), left 0.9s var(--ease), width 0.9s var(--ease), height 0.9s var(--ease), opacity 1.1s var(--out)',
            }}
          />

          {/* Three Round Thumbnails */}
          {RAIL_THUMBS.map((thumb, orderIdx) => {
            const item = railLayout.items[orderIdx];
            const introDelay = 350 + orderIdx * 140;
            return (
              <button
                key={thumb.id}
                type="button"
                aria-label={thumb.label}
                aria-pressed={item.isActive}
                onClick={() => onSelectSlide(thumb.slideIndex)}
                className="pointer-events-auto absolute rounded-full p-0 bg-transparent group focus-visible:outline-2 focus-visible:outline-white"
                style={{
                  top: item.top,
                  left: item.left,
                  width: item.size,
                  height: item.size,
                  border: '3px solid rgba(255, 255, 255, 0.92)',
                  boxShadow: item.isActive
                    ? '0 10px 26px rgba(60, 30, 30, 0.28), 0 0 0 9px rgba(255, 255, 255, 0.55)'
                    : '0 10px 26px rgba(60, 30, 30, 0.28)',
                  transform: thumbsRevealed ? 'scale(1)' : 'scale(0)',
                  transition: `top 0.9s var(--ease), left 0.9s var(--ease), width 0.9s var(--ease), height 0.9s var(--ease), box-shadow 0.5s var(--ease), transform 0.7s var(--out) ${
                    thumbsRevealed ? 0 : introDelay
                  }ms`,
                }}
              >
                <span className="block w-full h-full rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-[1.07]">
                  <img
                    src={thumb.image}
                    alt={thumb.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </span>
              </button>
            );
          })}

          {/* Horizontal Connector Line (hidden on <= 640px) */}
          {!isMobile && (
            <div
              aria-hidden="true"
              className="absolute h-[3px] rounded-full bg-white"
              style={{
                top: railLayout.connectorTop,
                left: railLayout.connectorLeft,
                width: railLayout.connectorWidth,
                transformOrigin: 'right center',
                transform: captionVisible ? 'scaleX(1)' : 'scaleX(0)',
                transition:
                  'transform 0.55s var(--out), top 0.9s var(--ease), left 0.9s var(--ease), width 0.9s var(--ease)',
              }}
            />
          )}

          {/* Caption Block (hidden on <= 640px) */}
          {!isMobile && (
            <div
              className="absolute flex items-start gap-4 text-right"
              style={{
                top: railLayout.activeCenterY - railLayout.barHeight / 2,
                right: viewport.w - railLayout.captionRight,
                transition: 'top 0.9s var(--ease), right 0.9s var(--ease)',
              }}
            >
              <div
                className="flex flex-col items-end"
                style={{
                  clipPath: captionVisible
                    ? 'inset(0 0% 0 0)'
                    : 'inset(0 100% 0 0)',
                  transition: 'clip-path 0.9s var(--out)',
                }}
              >
                <h2
                  className="font-ui font-light text-white m-0 leading-[1.08] whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(26px, 2.75vw, 40px)',
                    textShadow: '0 2px 14px rgba(55, 30, 35, 0.35)',
                  }}
                >
                  {currentSlide.captionTitle}
                </h2>
                <p
                  className="font-ui text-white/90 m-0 mt-2 max-w-[250px] leading-[1.45]"
                  style={{
                    fontSize: 'clamp(12px, 1vw, 14.5px)',
                    opacity: 0.88,
                    textShadow: '0 1px 10px rgba(55, 30, 35, 0.35)',
                  }}
                >
                  {currentSlide.captionBody}
                </p>
              </div>

              <div
                aria-hidden="true"
                className="w-[3px] rounded-full bg-white shrink-0"
                style={{
                  height: railLayout.barHeight,
                  transformOrigin: 'top center',
                  transform: captionVisible ? 'scaleY(1)' : 'scaleY(0)',
                  transition: 'transform 0.6s var(--out)',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search Bar sits at z-30 above visual stage (z-10) and StaysSection (z-20) */}
      <SearchBar
        destination={destination}
        onDestinationChange={onDestinationChange}
        checkIn={checkIn}
        checkOut={checkOut}
        onDatesChange={onDatesChange}
        adults={adults}
        childrenCount={childrenCount}
        onGuestsChange={onGuestsChange}
        onSearchSubmit={onSearchSubmit}
        introReady={searchRevealed}
      />
    </section>
  );
};
