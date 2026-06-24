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
    <nav style={{ background: 'linear-gradient(90deg,#2563EB,#D9AB47)' }} className="shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">CFA Digital</Link>
        {/* Liens publics */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/formations" className="text-white hover:underline">Formations</Link>
          <Link to="/admissions" className="text-white hover:underline">Admissions</Link>
          <Link to="/vie-etudiante" className="text-white hover:underline">Vie Étudiante</Link>
          {!user ? (
            <Link to="/connexion" className="bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/30 transition">Connexion</Link>
          ) : (
            <>
              {workspaceLink && <Link to={workspaceLink.to} className="text-white/95 hover:text-white/100">{workspaceLink.label}</Link>}
              <Link to="/annuaire" className="text-white/95 hover:text-white/100">Annuaire</Link>
              {(user && ['admin', 'superadmin', 'formateur'].includes(user.role)) && (
                <Link to="/admin/waitlists" className="text-yellow-200 hover:text-white">Listes d'attente</Link>
              )}
              <Link to="/profil" className="text-white font-medium shadow-sm px-3 py-1 rounded-md bg-white/12 hover:bg-white/20">Mon Profil</Link>
              <div className="ml-2"><NotifDropdown /></div>
              <button onClick={handleLogout} className="text-white/95 hover:text-white/100 ml-2">Déconnexion</button>
            </>
          )}
        </div>
        {/* Hamburger mobile */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden p-4 space-y-2 backdrop-blur-sm" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.95), rgba(217,171,71,0.95))' }}>
          <Link to="/formations" className="block text-white" onClick={()=>setMenuOpen(false)}>Formations</Link>
          <Link to="/admissions" className="block text-white" onClick={()=>setMenuOpen(false)}>Admissions</Link>
          {!user ? (
            <Link to="/connexion" className="block text-white font-medium" onClick={()=>setMenuOpen(false)}>Connexion</Link>
          ) : (
            <>
              {workspaceLink && <Link to={workspaceLink.to} className="block text-white" onClick={()=>setMenuOpen(false)}>{workspaceLink.label}</Link>}
              <Link to="/annuaire" className="block text-white" onClick={()=>setMenuOpen(false)}>Annuaire</Link>
              {(user && ['admin', 'superadmin', 'formateur'].includes(user.role)) && (
                <Link to="/admin/waitlists" className="block text-yellow-200" onClick={()=>setMenuOpen(false)}>Listes d'attente</Link>
              )}
              <Link to="/profil" className="block text-white font-medium" onClick={()=>setMenuOpen(false)}>Mon Profil</Link>
              <button onClick={()=>{handleLogout();setMenuOpen(false)}} className="text-white mt-2">Déconnexion</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
