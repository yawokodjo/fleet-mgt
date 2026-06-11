import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export function renderWithAuth(ui, { user = null, login = vi.fn(), logout = vi.fn(), ...options } = {}) {
  const contextValue = { user, login, logout, setUser: vi.fn() };

  return render(
    <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>
      <AuthContext.Provider value={contextValue}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
    options,
  );
}
