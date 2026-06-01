import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_MS  = 30 * 60 * 1000; // 30 minutes
const WARNING_MS     =  2 * 60 * 1000; // avertir 2 min avant
const WARNING_AT_MS  = INACTIVITY_MS - WARNING_MS;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

export function useInactivityTimer({ onWarn, onLogout, enabled = true }) {
  const warnTimer   = useRef(null);
  const logoutTimer = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warnTimer.current   = setTimeout(onWarn,   WARNING_AT_MS);
    logoutTimer.current = setTimeout(onLogout, INACTIVITY_MS);
  }, [clearTimers, onWarn, onLogout]);

  useEffect(() => {
    if (!enabled) return;

    resetTimers();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
    };
  }, [enabled, resetTimers, clearTimers]);

  return { resetTimers };
}

export { WARNING_MS };
