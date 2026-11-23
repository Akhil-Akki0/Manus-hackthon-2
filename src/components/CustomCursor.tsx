import React, { useEffect, useRef, useState } from 'react';

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], input, select, [data-clickable="true"]';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isRec, setIsRec] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsRec(window.location.search.includes('rec'));

    let rafId = 0;

    const updateTransform = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
      rafId = 0;
    };

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        setVisible(false);
        return;
      }
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      if (!rafId) {
        rafId = requestAnimationFrame(updateTransform);
      }
      const target = e.target as HTMLElement | null;
      const hovering = Boolean(target && target.closest(CLICKABLE_SELECTOR));
      setIsHover(hovering);
    };

    const handleDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      setIsDown(true);
    };

    const handleUp = () => {
      setIsDown(false);
    };

    const handleLeave = () => {
      setVisible(false);
      setIsDown(false);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [visible]);

  const classes = [
    'krung-cursor',
    isRec ? 'is-rec' : '',
    isHover ? 'is-hover' : '',
    isDown ? 'is-down' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={classes}
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
      }}
    />
  );
};
