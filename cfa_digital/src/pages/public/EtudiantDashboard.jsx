import { useState, useEffect } from 'react';
import { getDashboard } from '../../services/etudiantService';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

export default function EtudiantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => alert('Erreur chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mon tableau de bord</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Card title="Taux de présence" value={`${data.tauxPresence.toFixed(1)} %`} />
        <Card title="Prochains cours" list={data.prochainsCours.map(c => c.titre)} />
        <Card title="Devoirs à rendre" list={data.devoirs.map(d => d.titre)} />
      </div>
    </div>
  );
}