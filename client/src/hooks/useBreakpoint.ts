import { useState, useEffect } from 'react';

const TABLET = 744;
const DESKTOP = 1440;

export function useBreakpoint() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < TABLET,
    isTablet: width >= TABLET && width < DESKTOP,
    isDesktop: width >= DESKTOP,
  };
}