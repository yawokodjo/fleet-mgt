import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrivateRoute from '../PrivateRoute';
import { renderWithAuth } from '../../test/helpers';

// Mock i18next pour éviter les erreurs de traduction dans les tests
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const adminUser    = { id: 1, name: 'Admin',    email: 'a@a.com', role: 'admin' };
const managerUser  = { id: 2, name: 'Manager',  email: 'm@m.com', role: 'manager' };
const driverUser   = { id: 3, name: 'Driver',   email: 'd@d.com', role: 'driver' };

describe('PrivateRoute', () => {
  it('redirige vers /login quand aucun utilisateur connecté', () => {
    renderWithAuth(
      <PrivateRoute><div>Contenu protégé</div></PrivateRoute>,
      { user: null },
    );

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('affiche le contenu quand utilisateur connecté sans restriction de rôle', () => {
    renderWithAuth(
      <PrivateRoute><div>Tableau de bord</div></PrivateRoute>,
      { user: driverUser },
    );

    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });

  it('affiche le contenu quand le rôle correspond à la restriction', () => {
    renderWithAuth(
      <PrivateRoute roles={['admin', 'manager']}><div>Gestion véhicules</div></PrivateRoute>,
      { user: adminUser },
    );

    expect(screen.getByText('Gestion véhicules')).toBeInTheDocument();
  });

  it('affiche AccessDenied quand le rôle ne correspond pas', () => {
    renderWithAuth(
      <PrivateRoute roles={['admin']}><div>Admin only</div></PrivateRoute>,
      { user: driverUser },
    );

    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
    expect(screen.getByText('access.denied_title')).toBeInTheDocument();
  });

  it('affiche le lien retour dashboard sur la page AccessDenied', () => {
    renderWithAuth(
      <PrivateRoute roles={['admin']}><div>Admin only</div></PrivateRoute>,
      { user: driverUser },
    );

    const link = screen.getByText('access.back_to_dashboard');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('manager peut accéder à une route réservée admin+manager', () => {
    renderWithAuth(
      <PrivateRoute roles={['admin', 'manager']}><div>Zone manager</div></PrivateRoute>,
      { user: managerUser },
    );

    expect(screen.getByText('Zone manager')).toBeInTheDocument();
  });

  it('driver ne peut pas accéder à une route réservée admin+manager', () => {
    renderWithAuth(
      <PrivateRoute roles={['admin', 'manager']}><div>Zone manager</div></PrivateRoute>,
      { user: driverUser },
    );

    expect(screen.queryByText('Zone manager')).not.toBeInTheDocument();
  });

  it('accepte tous les rôles quand roles n\'est pas fourni', () => {
    for (const user of [adminUser, managerUser, driverUser]) {
      const { unmount } = renderWithAuth(
        <PrivateRoute><div>Open</div></PrivateRoute>,
        { user },
      );
      expect(screen.getByText('Open')).toBeInTheDocument();
      unmount();
    }
  });
});
