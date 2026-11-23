import React, { useCallback, useEffect, useState } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { DetailView } from './components/DetailView';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { StayCard } from './components/StayCard';
import { STAYS, StayProperty } from './data/bangkok';
import { DateValue } from './utils/calendar';
import { computeScrollChoreography } from './utils/heroMath';

export default function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [navSolid, setNavSolid] = useState(false);

  // Search state shared with DetailView booking card
  const [destination, setDestination] = useState('Bangkok');
  const [checkIn, setCheckIn] = useState<DateValue | null>(null);
  const [checkOut, setCheckOut] = useState<DateValue | null>(null);
  const [adults, setAdults] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);

  // Favorites & sorting filter state
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [sortByPrice, setSortByPrice] = useState(false);

  // Detail page shared-element transition state
  const [selectedStay, setSelectedStay] = useState<StayProperty | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [closingDetail, setClosingDetail] = useState(false);

  useEffect(() => {
    const updateNav = () => {
      const ch = computeScrollChoreography(window.scrollY, window.innerHeight);
      setNavSolid(ch.navSolid);
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    return () => {
      window.removeEventListener('scroll', updateNav);
      window.removeEventListener('resize', updateNav);
    };
  }, []);

  // Lock body scroll while detail overlay is open
  useEffect(() => {
    if (selectedStay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStay]);

  const handleToggleLike = useCallback((id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenDetail = useCallback((stay: StayProperty, rect: DOMRect) => {
    setClosingDetail(false);
    setOriginRect(rect);
    setSelectedStay(stay);
  }, []);

  const handleCloseDetail = useCallback(() => {
    if (!selectedStay) return;
    setClosingDetail(true);
    window.setTimeout(() => {
      setSelectedStay(null);
      setOriginRect(null);
      setClosingDetail(false);
    }, 550);
  }, [selectedStay]);

  const handleGoHome = useCallback(() => {
    if (selectedStay) {
      handleCloseDetail();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedStay, handleCloseDetail]);

  const scrollToStays = useCallback(() => {
    const doScroll = () => {
      const el = document.getElementById('stays-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    if (selectedStay) {
      handleCloseDetail();
      window.setTimeout(doScroll, 560);
    } else {
      doScroll();
    }
  }, [selectedStay, handleCloseDetail]);

  const handleGoWhereToGo = useCallback(() => {
    if (selectedStay) {
      handleCloseDetail();
    }
    setActiveSlide(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedStay, handleCloseDetail]);

  const handleGoContact = useCallback(() => {
    const doScroll = () => {
      const el = document.getElementById('contact-footer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    if (selectedStay) {
      handleCloseDetail();
      window.setTimeout(doScroll, 560);
    } else {
      doScroll();
    }
  }, [selectedStay, handleCloseDetail]);

  const displayedStays = sortByPrice
    ? [...STAYS].sort((a, b) => a.price - b.price)
    : STAYS;

  const totalGuests = adults + childrenCount > 0 ? adults + childrenCount : 2;

  return (
    <div className="relative min-h-screen w-full">
      <CustomCursor />

      <Navbar
        solid={navSolid || Boolean(selectedStay)}
        onGoHome={handleGoHome}
        onGoApartments={scrollToStays}
        onGoWhereToGo={handleGoWhereToGo}
        onGoContact={handleGoContact}
      />

      <main>
        {/* Hero Section (no z-index wrapper so visual stage z-10 sits under StaysSection z-20 while SearchBar z-30 sits above both) */}
        <Hero
            activeSlide={activeSlide}
            onSelectSlide={setActiveSlide}
            destination={destination}
            onDestinationChange={setDestination}
            checkIn={checkIn}
            checkOut={checkOut}
            onDatesChange={(ci, co) => {
              setCheckIn(ci);
              setCheckOut(co);
            }}
            adults={adults}
            childrenCount={childrenCount}
            onGuestsChange={(a, c) => {
              setAdults(a);
              setChildrenCount(c);
            }}
            onSearchSubmit={scrollToStays}
          />

        {/* Recomended Places to Stay Section */}
        <section
          id="stays-section"
          aria-labelledby="stays-heading"
          className="relative z-20 -mt-[8vh] min-[641px]:-mt-[17vh] pb-20"
          style={{
            paddingLeft: 'clamp(20px, 9.5vw, 170px)',
            paddingRight: 'clamp(20px, 9.5vw, 170px)',
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2
              id="stays-heading"
              className="font-display font-normal text-[#1d1a1c] m-0 leading-[1.15]"
              style={{ fontSize: 'clamp(26px, 2.45vw, 36px)' }}
            >
              Recomended Places to Stay
            </h2>

            <button
              type="button"
              onClick={() => setSortByPrice((s) => !s)}
              aria-pressed={sortByPrice}
              className="px-5 py-2 rounded-[20px] text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors duration-250"
              style={{
                border: '1.4px solid #1d1a1c',
                backgroundColor: sortByPrice ? '#1d1a1c' : 'transparent',
                color: sortByPrice ? '#ffffff' : '#1d1a1c',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d1a1c';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (!sortByPrice) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1d1a1c';
                }
              }}
            >
              {sortByPrice ? 'Curated Order' : 'See All'}
            </button>
          </div>

          <div
            className="grid grid-cols-2 min-[1001px]:grid-cols-4"
            style={{ gap: 'clamp(14px, 2.2vw, 30px)' }}
          >
            {displayedStays.map((stay, idx) => (
              <StayCard
                key={stay.id}
                stay={stay}
                columnIndex={idx}
                isLiked={Boolean(likedIds[stay.id])}
                onToggleLike={handleToggleLike}
                onSelectStay={handleOpenDetail}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer
        id="contact-footer"
        className="border-t border-[#1d1a1c]/8 py-10 text-[13px] text-[#5c5156] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          paddingLeft: 'clamp(20px, 9.5vw, 170px)',
          paddingRight: 'clamp(20px, 9.5vw, 170px)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-ui font-light text-[20px] text-[#1d1a1c]">
            Krung Travel
          </span>
          <span aria-hidden="true">·</span>
          <span>Bangkok, Thailand</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-[#5c5156]">
          <a
            href="mailto:concierge@krungtravel.com"
            className="hover:text-[#1d1a1c] transition-colors no-underline text-inherit"
          >
            concierge@krungtravel.com
          </a>
          <span aria-hidden="true">·</span>
          <span>Charoen Krung Pier, Bangkok 10500</span>
        </div>
      </footer>

      {/* Property Detail Overlay */}
      {selectedStay && (
        <DetailView
          stay={selectedStay}
          originRect={originRect}
          checkIn={checkIn}
          checkOut={checkOut}
          guestsCount={totalGuests}
          onGuestsChange={(newTotal) => {
            setAdults(newTotal);
            setChildrenCount(0);
          }}
          likedIds={likedIds}
          onToggleLike={handleToggleLike}
          onSelectSimilar={handleOpenDetail}
          onClose={handleCloseDetail}
          closing={closingDetail}
        />
      )}
    </div>
  );
}
