import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SessionWarningModal from '../SessionWarningModal';

// Figer le temps pour contrôler le compte à rebours
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('SessionWarningModal', () => {
  it('ne s\'affiche pas quand visible=false', () => {
    render(<SessionWarningModal visible={false} onStay={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.queryByText('Session sur le point d\'expirer')).not.toBeInTheDocument();
  });

  it('s\'affiche quand visible=true', () => {
    render(<SessionWarningModal visible={true} onStay={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Session sur le point d\'expirer')).toBeInTheDocument();
  });

  it('affiche les deux boutons d\'action', () => {
    render(<SessionWarningModal visible={true} onStay={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText(/Rester connecté/i)).toBeInTheDocument();
    expect(screen.getByText(/Se déconnecter/i)).toBeInTheDocument();
  });

  it('appelle onStay quand "Rester connecté" est cliqué', () => {
    const onStay = vi.fn();
    render(<SessionWarningModal visible={true} onStay={onStay} onLogout={vi.fn()} />);

    fireEvent.click(screen.getByText(/Rester connecté/i));
    expect(onStay).toHaveBeenCalledOnce();
  });

  it('appelle onLogout quand "Se déconnecter" est cliqué', () => {
    const onLogout = vi.fn();
    render(<SessionWarningModal visible={true} onStay={vi.fn()} onLogout={onLogout} />);

    fireEvent.click(screen.getByText(/Se déconnecter/i));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('affiche le compte à rebours décroissant', () => {
    render(<SessionWarningModal visible={true} onStay={vi.fn()} onLogout={vi.fn()} />);

    // Vérifier que le compte à rebours est présent (format mm:ss ou Xs)
    const countdown = screen.getByText(/^\d+[:s]/);
    expect(countdown).toBeInTheDocument();
  });

  it('réinitialise le compte à rebours quand visible repasse à false puis true', () => {
    const { rerender } = render(
      <SessionWarningModal visible={true} onStay={vi.fn()} onLogout={vi.fn()} />,
    );

    // Avancer 10 secondes
    vi.advanceTimersByTime(10_000);

    // Fermer la modale
    rerender(<SessionWarningModal visible={false} onStay={vi.fn()} onLogout={vi.fn()} />);

    // Réouvrir
    rerender(<SessionWarningModal visible={true} onStay={vi.fn()} onLogout={vi.fn()} />);

    // Le compte à rebours doit être réinitialisé (2:00 = 120s)
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });
});
