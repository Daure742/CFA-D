import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getAgenda } from '../../services/etudiantService';
import { useAuth } from '../../hooks/useAuth';

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getWeekBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const isWithinCurrentWeek = (value) => {
  const date = new Date(value);
  const { start, end } = getWeekBounds();
  return date >= start && date <= end;
};

const filterCards = [
  { key: 'published', label: 'Cours publies', tone: 'text-gray-950' },
  { key: 'week', label: 'Cette semaine', tone: 'text-indigo-700' },
  { key: 'online', label: 'Distanciel', tone: 'text-emerald-700' },
];

export default function EtudiantAgenda() {
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('published');
  

  const metrics = useMemo(() => {
    return {
      total: cours.length,
      thisWeek: cours.filter((item) => isWithinCurrentWeek(item.dateDebut)).length,
      online: cours.filter((item) => item.modalite === 'distanciel').length,
    };
  }, [cours]);

  const filteredCours = useMemo(() => {
    if (activeFilter === 'week') {
      return cours.filter((item) => isWithinCurrentWeek(item.dateDebut));
    }

    if (activeFilter === 'online') {
      return cours.filter((item) => item.modalite === 'distanciel');
    }

    return cours;
  }, [activeFilter, cours]);

  const timeSlots = useMemo(() => {
    const slots = new Set();
    filteredCours.forEach((c) => {
      const start = new Date(c.dateDebut);
      const end = new Date(c.dateFin);
      const pad = (n) => String(n).padStart(2, '0');
      const key = `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
      slots.add(key);
    });
    return Array.from(slots).sort();
  }, [filteredCours]);

  useEffect(() => {
    const loadAgenda = async () => {
      setLoading(true);
      try {
        const debut = new Date().toISOString();
        const fin = addDays(new Date(), 120).toISOString();
        const { data } = await getAgenda(debut, fin);
        setCours(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Agenda indisponible');
      } finally {
        setLoading(false);
      }
    };

    loadAgenda();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace etudiant</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Mon emploi du temps</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Les cours affiches ici correspondent uniquement a votre formation et a votre session. Le planning apparait
          apres publication par l administration.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Formation</p>
            <p className="mt-1 text-base font-bold text-gray-950">{user?.formationChoisie || 'Non definie'}</p>
          </div>
          {filterCards.map((card) => {
            const value = card.key === 'published' ? metrics.total : card.key === 'week' ? metrics.thisWeek : metrics.online;
            const active = activeFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setActiveFilter(card.key)}
                className={`rounded-lg border p-4 text-left transition ${
                  active ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'
                }`}
              >
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold ${card.tone}`}>{value}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-950">
            {activeFilter === 'published' && 'Planning publie'}
            {activeFilter === 'week' && 'Cours de cette semaine'}
            {activeFilter === 'online' && 'Cours en distanciel'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {loading ? 'Chargement en cours...' : `${filteredCours.length} cours affiche(s) dans ce filtre.`}
          </p>
        </div>

        {loading && <p className="p-5 text-sm text-gray-500">Chargement de votre emploi du temps...</p>}

        {!loading && cours.length === 0 && (
          <div className="p-5">
            <p className="font-semibold text-gray-950">Aucun planning publie pour le moment.</p>
            <p className="mt-1 text-sm text-gray-600">
              Votre agenda sera rempli automatiquement des que l administration publiera le planning de votre session.
            </p>
          </div>
        )}

        {!loading && cours.length > 0 && filteredCours.length === 0 && (
          <div className="p-5">
            <p className="font-semibold text-gray-950">Aucun cours pour ce filtre.</p>
            <p className="mt-1 text-sm text-gray-600">
              Changez de filtre pour consulter l ensemble du planning publie de votre session.
            </p>
          </div>
        )}

        {!loading && filteredCours.length > 0 && (
          <div className="p-5">
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border px-3 py-2 text-left">Heure</th>
                    <th className="border px-3 py-2">Lundi</th>
                    <th className="border px-3 py-2">Mardi</th>
                    <th className="border px-3 py-2">Mercredi</th>
                    <th className="border px-3 py-2">Jeudi</th>
                    <th className="border px-3 py-2">Vendredi</th>
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-3 py-2 font-semibold text-sm">{slot}</td>
                      {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'].map((day) => {
                        const match = filteredCours.find((c) => {
                          const d = new Date(c.dateDebut);
                          const pad = (n) => String(n).padStart(2, '0');
                          const key = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(new Date(c.dateFin).getHours())}:${pad(new Date(c.dateFin).getMinutes())}`;
                          return key === slot && d.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase().includes(day);
                        });

                        return (
                          <td key={day} className="border px-3 py-2 align-top">
                            {match ? (
                              <div>
                                <div className="font-semibold">{match.titre}</div>
                                <div className="text-sm text-gray-600">{match.formateur?.prenom} {match.formateur?.nom}</div>
                                <div className="mt-1 text-xs font-semibold uppercase text-gray-500">{match.modalite || 'distanciel'}</div>
                                {match.lienVisio && (
                                  <a href={match.lienVisio} target="_blank" rel="noreferrer" className="text-indigo-700 text-sm">
                                    Lien
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
