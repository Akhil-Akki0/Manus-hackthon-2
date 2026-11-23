import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const PinIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
  </svg>
);

export const PeopleIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 21v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 19.2V21" />
    <circle cx="9.5" cy="7.5" r="3.2" />
    <path d="M21 21v-1.8a3.6 3.6 0 0 0-2.7-3.48M16 4.4a3.2 3.2 0 0 1 0 6.2" />
  </svg>
);

export const PaperPlaneIcon: React.FC<IconProps> = ({ className = '', size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21.5 2.5 10.5 13.5" />
    <path d="m21.5 2.5-7 19-4-8-8-4 19-7Z" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = '', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9.2" />
    <path d="M2.8 12h18.4" />
    <path d="M12 2.8a14 14 0 0 1 3.6 9.2 14 14 0 0 1-3.6 9.2 14 14 0 0 1-3.6-9.2A14 14 0 0 1 12 2.8Z" />
  </svg>
);

export const HamburgerIcon: React.FC<IconProps> = ({ className = '', size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const UserSilhouetteIcon: React.FC<IconProps> = ({ className = '', size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="8.2" r="4" />
    <path d="M4.5 20.5c0-3.7 3.35-6.2 7.5-6.2s7.5 2.5 7.5 6.2" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ className = '', size = 11 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2.4l2.88 5.84 6.44.94-4.66 4.54 1.1 6.42L12 17.1l-5.76 3.04 1.1-6.42L2.68 9.18l6.44-.94L12 2.4z" />
  </svg>
);

export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({
  className = '',
  size = 15,
  filled = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.5 12.6 12 20l-7.5-7.4A4.9 4.9 0 0 1 12 5.9a4.9 4.9 0 0 1 7.5 6.7Z" />
  </svg>
);

export const AmenityIcon: React.FC<{ id: string; size?: number }> = ({ id, size = 18 }) => {
  switch (id) {
    case 'wifi':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <circle cx="12" cy="19.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'bar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 22h8M12 11v11M5 3h14l-7 8-7-8Z" />
        </svg>
      );
    case 'pier':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 17c2.2 0 2.2-1.5 4.4-1.5s2.2 1.5 4.4 1.5 2.2-1.5 4.4-1.5 2.2 1.5 4.8 1.5" />
          <path d="M4 13h16l-1.5-5h-13L4 13ZM12 8V4M8 8l1.5-4" />
        </svg>
      );
    case 'superhost':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="9" r="5.5" />
          <path d="m9 14-1.5 7 4.5-2.3 4.5 2.3-1.5-7" />
        </svg>
      );
    case 'cinema':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
        </svg>
      );
    case 'room-service':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 11V8M10 8h4" />
        </svg>
      );
  }
};
