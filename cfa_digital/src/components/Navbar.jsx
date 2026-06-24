import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotifDropdown from './NotifDropdown';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const workspaceLinks = {
    superadmin: { to: '/superadmin', label: 'Superadmin' },
    admin: { to: '/admin', label: 'Administration' },
    formateur: { to: '/formateur', label: 'Espace formateur' },
    etudiant: { to: '/etudiant', label: 'Mon espace' },
    tuteur: { to: '/tuteur', label: 'Espace tuteur' },
    entreprise: { to: '/entreprise', label: 'Espace entreprise' },
  };
  const workspaceLink = user ? workspaceLinks[user.role] : null;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-indigo-700">CFA Digital</Link>
        {/* Liens publics */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/formations" className="text-gray-700 hover:text-indigo-600">Formations</Link>
          <Link to="/admissions" className="text-gray-700 hover:text-indigo-600">Admissions</Link>
          <Link to="/vie-etudiante" className="text-gray-700 hover:text-indigo-600">Vie Étudiante</Link>
          {!user ? (
            <Link to="/connexion" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Connexion</Link>
          ) : (
            <>
              {workspaceLink && <Link to={workspaceLink.to} className="text-gray-700 hover:text-indigo-600">{workspaceLink.label}</Link>}
              <Link to="/annuaire" className="text-gray-700 hover:text-indigo-600">Annuaire</Link>
              {(user && ['admin', 'superadmin', 'formateur'].includes(user.role)) && (
                <Link to="/admin/waitlists" className="text-amber-600 hover:text-amber-800">Listes d'attente</Link>
              )}
              <Link to="/profil" className="text-indigo-600 hover:text-indigo-800 font-medium">Mon Profil</Link>
              <NotifDropdown />
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">Déconnexion</button>
            </>
          )}
        </div>
        {/* Hamburger mobile */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2">
          <Link to="/formations" className="block" onClick={()=>setMenuOpen(false)}>Formations</Link>
          <Link to="/admissions" className="block" onClick={()=>setMenuOpen(false)}>Admissions</Link>
          {!user ? (
            <Link to="/connexion" className="block text-indigo-600" onClick={()=>setMenuOpen(false)}>Connexion</Link>
          ) : (
            <>
              {workspaceLink && <Link to={workspaceLink.to} className="block" onClick={()=>setMenuOpen(false)}>{workspaceLink.label}</Link>}
              <Link to="/annuaire" className="block text-gray-700" onClick={()=>setMenuOpen(false)}>Annuaire</Link>
              {(user && ['admin', 'superadmin', 'formateur'].includes(user.role)) && (
                <Link to="/admin/waitlists" className="block text-amber-600" onClick={()=>setMenuOpen(false)}>Listes d'attente</Link>
              )}
              <Link to="/profil" className="block text-indigo-600 font-medium" onClick={()=>setMenuOpen(false)}>Mon Profil</Link>
              <button onClick={()=>{handleLogout();setMenuOpen(false)}} className="text-red-500">Déconnexion</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
