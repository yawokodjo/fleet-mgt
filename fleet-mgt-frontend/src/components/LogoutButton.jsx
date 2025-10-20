import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Vide le localStorage + contexte
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="text-red-600 hover:underline">
      Déconnexion
    </button>
  );
}
