import { useEffect, useState, useMemo } from 'react';
import { getAnnuaire } from '../services/cfaService';
import toast from 'react-hot-toast';

export default function AnnuairePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    const fetchAnnuaire = async () => {
      try {
        const res = await getAnnuaire();
        setUsers(res.data);
      } catch {
        toast.error("Impossible de charger l'annuaire");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnuaire();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      const term = search.toLowerCase();
      const matchName = user.nom?.toLowerCase().includes(term) || user.prenom?.toLowerCase().includes(term);
      const matchMatiere = user.matieres?.some(m => m.toLowerCase().includes(term));
      const matchFormation = user.formationChoisie?.toLowerCase().includes(term);
      return matchName || matchMatiere || matchFormation;
    });
  }, [users, search, filterRole]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-950">Annuaire de la plateforme</h1>
        <p className="mt-2 text-sm text-gray-600">Retrouvez les profils des étudiants et formateurs de votre établissement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input 
          type="search" 
          placeholder="Rechercher par nom, prénom, formation, matière..." 
          className="rounded-md border border-gray-300 px-3 py-2 w-full focus:ring-indigo-500 focus:border-indigo-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="rounded-md border border-gray-300 px-3 py-2 w-full focus:ring-indigo-500 focus:border-indigo-500"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Tous les profils</option>
          <option value="etudiant">Étudiants</option>
          <option value="formateur">Formateurs</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Chargement de l'annuaire...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.map(user => (
            <div key={user._id || user.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition duration-200 p-6 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold mb-4">
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.prenom} {user.nom}</h3>
              <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'formateur' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {user.role === 'formateur' ? 'Formateur' : 'Étudiant'}
              </span>
              
              <div className="mt-4 w-full flex flex-col gap-2 text-sm text-gray-600">
                {user.role === 'formateur' && user.matieres && user.matieres.length > 0 && (
                  <div>
                    <span className="block font-semibold text-gray-700 text-xs uppercase mb-1">Matières enseignées</span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {user.matieres.map((m, i) => (
                        <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.role === 'etudiant' && user.formationChoisie && (
                  <div>
                    <span className="block font-semibold text-gray-700 text-xs uppercase mb-1">Formation</span>
                    <span>{user.formationChoisie}</span>
                  </div>
                )}
                
                <a href={`mailto:${user.email}`} className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                  Contacter par email
                </a>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border">Aucun profil ne correspond à votre recherche.</div>
          )}
        </div>
      )}
    </div>
  );
}
