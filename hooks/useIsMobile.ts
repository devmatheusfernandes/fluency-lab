'use client';

import * as React from 'react';

/**
 * Hook to detect if the user is on a mobile device.
 * Checks both window width and user agent string for accurate detection.
 * 
 * @returns boolean - true if on mobile device, false otherwise
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      // Check window width (common approach)
      const widthCheck = window.innerWidth < 768;
      
      // Additional check for touch devices
      const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const userAgentCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Combine checks for more accurate detection
      setIsMobile(widthCheck || touchCheck || userAgentCheck);
    };

    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};