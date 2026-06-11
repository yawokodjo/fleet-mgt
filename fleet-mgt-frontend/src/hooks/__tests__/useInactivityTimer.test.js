import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInactivityTimer } from '../useInactivityTimer';

const WARN_MS   = 28 * 60 * 1000; // 28 min
const LOGOUT_MS = 30 * 60 * 1000; // 30 min

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useInactivityTimer', () => {
  it('appelle onWarn après 28 minutes d\'inactivité', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();

    renderHook(() => useInactivityTimer({ onWarn, onLogout, enabled: true }));

    act(() => vi.advanceTimersByTime(WARN_MS));

    expect(onWarn).toHaveBeenCalledOnce();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('appelle onLogout après 30 minutes d\'inactivité', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();

    renderHook(() => useInactivityTimer({ onWarn, onLogout, enabled: true }));

    act(() => vi.advanceTimersByTime(LOGOUT_MS));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('remet les timers à zéro lors d\'une activité utilisateur', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();

    renderHook(() => useInactivityTimer({ onWarn, onLogout, enabled: true }));

    // Avancer de 27 minutes
    act(() => vi.advanceTimersByTime(27 * 60 * 1000));

    // Simuler une activité (mousemove)
    act(() => { window.dispatchEvent(new MouseEvent('mousemove')); });

    // Avancer encore 27 minutes — pas encore au seuil d'avertissement
    act(() => vi.advanceTimersByTime(27 * 60 * 1000));

    expect(onWarn).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('ne démarre pas les timers quand enabled=false', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();

    renderHook(() => useInactivityTimer({ onWarn, onLogout, enabled: false }));

    act(() => vi.advanceTimersByTime(LOGOUT_MS));

    expect(onWarn).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('nettoie les timers au démontage', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();

    const { unmount } = renderHook(() =>
      useInactivityTimer({ onWarn, onLogout, enabled: true }),
    );

    unmount();

    act(() => vi.advanceTimersByTime(LOGOUT_MS));

    expect(onWarn).not.toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('remet les timers à zéro quand enabled passe de false à true', () => {
    const onWarn   = vi.fn();
    const onLogout = vi.fn();
    let enabled = false;

    const { rerender } = renderHook(() =>
      useInactivityTimer({ onWarn, onLogout, enabled }),
    );

    act(() => vi.advanceTimersByTime(LOGOUT_MS));
    expect(onLogout).not.toHaveBeenCalled();

    enabled = true;
    rerender();

    act(() => vi.advanceTimersByTime(LOGOUT_MS));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
