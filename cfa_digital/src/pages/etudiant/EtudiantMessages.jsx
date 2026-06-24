import { useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { NotifContext } from '../../context/notif-context';
import { getMessages } from '../../services/messageService';

const formatHour = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const getAssistantReply = (question) => {
  const text = question.toLowerCase();

  if (text.includes('devoir')) {
    return 'Pour ton devoir, commence par lire le sujet attentivement, identifie les attentes et structure ta réponse en parties claires. Bientôt, tu pourras demander un exemple de plan.';
  }
  if (text.includes('cours') || text.includes('replay') || text.includes('live')) {
    return 'Les cours live se rejoignent depuis la page Cours. Si le replay est disponible, un lien s’affiche dans la fiche de la séance.';
  }
  if (text.includes('exam') || text.includes('contrôle') || text.includes('test')) {
    return 'Prépare-toi en relisant tes notes, en faisant des exercices et en posant des questions au formateur sur les points difficiles.';
  }
  if (text.includes('formation') || text.includes('parcours')) {
    return 'Ta formation est construite autour de modules pratiques. Concentre-toi sur les compétences professionnelles et sur la mise en pratique en projet.';
  }

  // No generic assistant intro should be returned to students.
  return null;
};

export default function EtudiantMessages() {
  const { socket } = useContext(NotifContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [activeTab, setActiveTab] = useState('classe');
  const [assistantMessages, setAssistantMessages] = useState([]);

  const classeMessages = useMemo(
    () => messages.filter((message) => message.type === 'classe'),
    [messages]
  );

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data } = await getMessages();
        setMessages(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === message._id)) return prev;
        return [message, ...prev];
      });
    };

    socket.on('nouveau-message-classe', onNewMessage);
    return () => {
      socket.off('nouveau-message-classe', onNewMessage);
    };
  }, [socket]);

  const handleSendMessage = async () => {
    const contenu = draft.trim();
    if (!contenu) return;

    if (activeTab === 'classe') {
      if (!socket) {
        toast.error('Connexion au chat en attente. Réessaie dans un instant.');
        return;
      }

      socket.emit('message-classe', { contenu });
      setDraft('');
      return;
    }

    setAssistantMessages((prev) => [...prev, { role: 'user', content: contenu }] );
    setDraft('');
    try {
      // use centralized API client (sets Authorization header)
      const api = (await import('../../services/api')).default;
      const resp = await api.post('/assistant/query', { query: contenu });
      const answer = resp.data?.answer || null;
      const notEnough = resp.data?.notEnoughContext;
      const content = answer || (notEnough ? 'Je n\'ai pas suffisamment d\'informations pour répondre à cette question. Peux-tu préciser ?' : null);
      if (content) {
        const sources = resp.data?.sources || [];
        setAssistantMessages((prev) => [...prev, { role: 'assistant', content, sources }]);
      }
    } catch {
      // fallback: local simple reply if api fails
      const fallback = getAssistantReply(contenu) || 'Je n\'ai pas suffisamment d\'informations pour répondre à cette question.';
      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: fallback, sources: [] }]);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace étudiant</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Chat et accompagnement</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Discute avec ta classe en temps réel ou utilise l’assistant pédagogique pour des réponses rapides et professionnelles.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Messagerie</h2>
              <p className="mt-1 text-sm text-gray-600">Choisis « Classe » pour échanger avec ton groupe ou « Assistant » pour une aide pédagogique.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
              {['classe', 'assistant'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    activeTab === tab ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {tab === 'classe' ? 'Classe' : 'Assistant IA'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'classe' ? (
            <>
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">Chat de classe en temps réel. Les messages sont envoyés à tous les étudiants de ta cohorte.</p>
              </div>

              {loading && <p className="text-sm text-gray-500">Chargement du chat...</p>}
              {!loading && classeMessages.length === 0 && (
                <p className="text-sm text-gray-500">Aucun message de classe pour le moment. Envoie le premier message !</p>
              )}

              <div className="space-y-3">
                {classeMessages.map((message) => (
                  <div key={message._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-gray-900">
                        {message.expediteur?.prenom || 'Utilisateur'} {message.expediteur?.nom || ''}
                      </span>
                      <span className="text-xs text-gray-500">{formatHour(message.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{message.contenu}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">Pose une question pédagogique et reçois une réponse structurée immédiatement.</p>
              </div>
              <div className="space-y-3">
                {assistantMessages.map((item, index) => (
                  <div
                    key={`${item.role}-${index}`}
                    className={`rounded-2xl p-4 ${item.role === 'assistant' ? 'bg-indigo-50 text-gray-900' : 'bg-white text-gray-900'} border border-gray-200`}
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-500">{item.role === 'assistant' ? 'Assistant IA' : 'Toi'}</p>
                    <p className="mt-2 text-sm leading-6">{item.content}</p>
                    {item.role === 'assistant' && item.sources && item.sources.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-500 mb-2">Sources :</p>
                        <ul className="space-y-2">
                          {item.sources.map((s, si) => (
                            <li key={`src-${index}-${si}`} className="text-sm">
                              {s.snippet && (
                                <div className="text-sm text-gray-700 mb-1">"{s.snippet}"</div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{s.sourceType || ''}</span>
                                {s.url ? (
                                  <a className="text-xs text-indigo-600 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">Voir la source</a>
                                ) : (
                                  <span className="text-xs text-gray-400">Pas de lien</span>
                                )}
                                {s.score != null && (
                                  <span className="ml-auto text-xs text-gray-500">score: {typeof s.score === 'number' ? s.score.toFixed(2) : s.score}</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              rows="3"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder={activeTab === 'classe' ? 'Écris un message à ta classe...' : 'Pose ta question à l’assistant pédagogique...'}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSendMessage}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                disabled={!draft.trim()}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
