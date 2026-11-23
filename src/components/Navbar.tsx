import React, { useState } from 'react';
import {
  ChevronDownIcon,
  GlobeIcon,
  HamburgerIcon,
  UserSilhouetteIcon,
} from './Icons';

interface NavbarProps {
  solid: boolean;
  onGoHome: () => void;
  onGoApartments: () => void;
  onGoWhereToGo: () => void;
  onGoContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  solid,
  onGoHome,
  onGoApartments,
  onGoWhereToGo,
  onGoContact,
}) => {
  const [audienceMenu, setAudienceMenu] = useState(false);
  const [audienceLabel, setAudienceLabel] = useState<'Visitors' | 'Travelers' | 'Families'>('Visitors');
  const [currencyLabel, setCurrencyLabel] = useState<'USD' | 'THB'>('USD');
  const [accountMenu, setAccountMenu] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[74px] flex items-center justify-between transition-[background-color,color,border-color,backdrop-filter] duration-500"
      style={{
        paddingLeft: 'clamp(20px, 9.5vw, 170px)',
        paddingRight: 'clamp(20px, 9.5vw, 170px)',
        backgroundColor: solid ? 'rgba(247, 217, 198, 0.86)' : 'transparent',
        backdropFilter: solid ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(14px)' : 'none',
        color: solid ? '#1d1a1c' : 'rgba(255, 255, 255, 0.92)',
        borderBottom: solid
          ? '1px solid rgba(29, 26, 28, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.28)',
      }}
    >
      {/* Left Side */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onGoHome}
          className="font-ui font-light text-[26px] leading-none tracking-[-0.01em] whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-inherit focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Krung Travel
        </button>

        <span
          aria-hidden="true"
          className="hidden sm:inline-block w-[1px] h-[42px] mx-[28px] transition-colors duration-500"
          style={{
            backgroundColor: solid
              ? 'rgba(29, 26, 28, 0.45)'
              : 'rgba(255, 255, 255, 0.45)',
          }}
        />

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setAudienceMenu((v) => !v)}
            aria-expanded={audienceMenu}
            className="flex items-center gap-[6px] text-[12.5px] font-medium whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-inherit opacity-95 hover:opacity-100"
          >
            <span>{audienceLabel}</span>
            <ChevronDownIcon size={11} />
          </button>

          {audienceMenu && (
            <div
              className="popover-drop absolute left-0 top-full mt-3 w-36 rounded-xl bg-white text-[#1d1a1c] py-1.5 shadow-[0_14px_34px_rgba(80,45,35,0.18)] z-50"
              role="menu"
            >
              {(['Visitors', 'Travelers', 'Families'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAudienceLabel(item);
                    setAudienceMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-[#fbe7da] transition-colors flex items-center justify-between"
                >
                  <span>{item}</span>
                  {audienceLabel === item && <span className="text-[11px] text-[#f39419]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Centre Links (hidden <= 1000px) */}
      <nav
        aria-label="Primary navigation"
        className="hidden min-[1001px]:flex items-center gap-[44px] text-[14.5px] font-normal"
      >
        <button
          type="button"
          onClick={onGoApartments}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0"
        >
          Apartments
        </button>
        <button
          type="button"
          onClick={onGoWhereToGo}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0"
        >
          Where to go
        </button>
        <button
          type="button"
          onClick={onGoContact}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0"
        >
          Contact Us
        </button>
      </nav>

      {/* Right Side */}
      <div className="relative flex items-center gap-5 shrink-0">
        <button
          type="button"
          onClick={onGoApartments}
          className="hidden min-[1001px]:inline-block text-[14px] font-normal bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          Become a host
        </button>

        <button
          type="button"
          onClick={() => setCurrencyLabel((c) => (c === 'USD' ? 'THB' : 'USD'))}
          aria-label={`Switch region or currency (${currencyLabel})`}
          title={`Currency: ${currencyLabel}`}
          className="flex items-center gap-1 bg-transparent border-0 p-1 text-inherit hover:opacity-80 transition-opacity"
        >
          <GlobeIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => setAccountMenu((v) => !v)}
          aria-label="Open navigation menu"
          aria-expanded={accountMenu}
          className="flex items-center gap-[9px] px-[10px] py-[5px] rounded-[9px] bg-transparent text-inherit transition-colors duration-300"
          style={{
            border: solid
              ? '1.5px solid rgba(29, 26, 28, 0.72)'
              : '1.5px solid rgba(255, 255, 255, 0.86)',
          }}
        >
          <HamburgerIcon size={14} />
          <span
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors duration-300"
            style={{
              backgroundColor: solid
                ? 'rgba(29, 26, 28, 0.9)'
                : 'rgba(255, 255, 255, 0.92)',
              color: solid ? '#f7d9c6' : '#54404a',
            }}
          >
            <UserSilhouetteIcon size={13} />
          </span>
        </button>

        {accountMenu && (
          <div
            className="popover-drop absolute right-0 top-full mt-3 w-48 rounded-2xl bg-white text-[#1d1a1c] py-2 shadow-[0_18px_42px_rgba(80,45,35,0.2)] z-50"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAccountMenu(false);
                onGoApartments();
              }}
              className="w-full text-left px-4 py-2.5 text-[13.5px] font-medium hover:bg-[#fbe7da] transition-colors"
            >
              Apartments &amp; Villas
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAccountMenu(false);
                onGoWhereToGo();
              }}
              className="w-full text-left px-4 py-2.5 text-[13.5px] font-medium hover:bg-[#fbe7da] transition-colors"
            >
              Where to go
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAccountMenu(false);
                onGoContact();
              }}
              className="w-full text-left px-4 py-2.5 text-[13.5px] font-medium hover:bg-[#fbe7da] transition-colors"
            >
              Contact Us
            </button>
            <div className="my-1 border-t border-[#1d1a1c]/10" />
            <div className="px-4 py-1.5 text-[12px] text-[#8a7f83]">
              Bangkok, Thailand · {currencyLabel}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
