import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../axios';

vi.mock('../../axios');

// Composant de test qui expose les valeurs du contexte
function TestConsumer() {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={() => login({ id: 1, email: 'a@a.com', role: 'admin' }, 'tok123')}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderProvider(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe('AuthContext', () => {
  it('commence sans utilisateur si /me échoue', async () => {
    api.get.mockRejectedValue(new Error('401'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
  });

  it('restaure l\'utilisateur depuis /me au démarrage', async () => {
    api.get.mockResolvedValue({
      data: { user: { id: 1, email: 'a@a.com', role: 'admin' } },
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@a.com');
    });
  });

  it('login stocke le token dans sessionStorage', async () => {
    api.get.mockRejectedValue(new Error('401'));

    renderProvider();

    await waitFor(() => screen.getByText('Login'));

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(sessionStorage.getItem('token')).toBe('tok123');
    expect(screen.getByTestId('user').textContent).toBe('a@a.com');
  });

  it('login stocke l\'utilisateur dans localStorage', async () => {
    api.get.mockRejectedValue(new Error('401'));

    renderProvider();

    await waitFor(() => screen.getByText('Login'));

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    const stored = JSON.parse(localStorage.getItem('user'));
    expect(stored.email).toBe('a@a.com');
  });

  it('logout efface l\'utilisateur et le token', async () => {
    api.get.mockResolvedValue({
      data: { user: { id: 1, email: 'a@a.com', role: 'admin' } },
    });
    api.post.mockResolvedValue({});

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('a@a.com'),
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('logout fonctionne même si /api/logout échoue', async () => {
    api.get.mockResolvedValue({
      data: { user: { id: 1, email: 'a@a.com', role: 'admin' } },
    });
    api.post.mockRejectedValue(new Error('réseau'));

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('a@a.com'),
    );

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    // Même en cas d'erreur réseau, l'utilisateur doit être déconnecté côté frontend
    expect(screen.getByTestId('user').textContent).toBe('none');
  });
});
