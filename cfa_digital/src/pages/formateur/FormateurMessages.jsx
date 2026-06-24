import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { NotifContext } from '../../context/notif-context';
import { archiveMessage, getMessages, markMessageRead, sendMessage } from '../../services/messageService';
import { getCohortes } from '../../services/formateurService';
import { useAuth } from '../../hooks/useAuth';

const formatDateTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const filters = [
  { key: 'unread', label: 'Non lus' },
  { key: 'classes', label: 'Classes' },
  { key: 'archives', label: 'Archives' }
];

export default function FormateurMessages() {
  const { socket } = useContext(NotifContext);
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('classes');
  const [cohortes, setCohortes] = useState([]);
  const [selectedCohorteId, setSelectedCohorteId] = useState('');
  const [messages, setMessages] = useState([]);
  const [archivedMessages, setArchivedMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const [cohorteRes, messageRes, archiveRes] = await Promise.all([
        getCohortes(),
        getMessages({ type: 'classe' }),
        getMessages({ type: 'classe', archived: 'true' })
      ]);

      const nextCohortes = cohorteRes.data || [];
      setCohortes(nextCohortes);
      setMessages(messageRes.data || []);
      setArchivedMessages(archiveRes.data || []);
      setSelectedCohorteId((current) => (
        nextCohortes.some((cohorte) => cohorte._id === current) ? current : nextCohortes[0]?._id || ''
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger la messagerie');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkspace]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewMessage = (message) => {
      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) return current;
        const isMine = String(message.expediteur?._id || message.expediteur) === String(user?.id);
        return [{ ...message, isRead: isMine }, ...current];
      });
    };

    socket.on('nouveau-message-classe', onNewMessage);
    return () => {
      socket.off('nouveau-message-classe', onNewMessage);
    };
  }, [socket, user?.id]);

  const visibleMessages = useMemo(() => {
    const source = activeFilter === 'archives' ? archivedMessages : messages;

    return source.filter((message) => {
      const messageCohorteId = message.cohorte?._id || message.cohorte;
      const matchesCohorte = selectedCohorteId ? String(messageCohorteId) === String(selectedCohorteId) : true;
      if (!matchesCohorte) return false;
      if (activeFilter === 'unread') return !message.isRead && String(message.expediteur?._id || message.expediteur) !== String(user?.id);
      return true;
    });
  }, [activeFilter, archivedMessages, messages, selectedCohorteId, user?.id]);

  const unreadCount = useMemo(
    () => messages.filter((message) => !message.isRead && String(message.expediteur?._id || message.expediteur) !== String(user?.id)).length,
    [messages, user?.id]
  );

  const metrics = {
    unread: unreadCount,
    classes: messages.length,
    archives: archivedMessages.length
  };

  const handleSend = async () => {
    const contenu = draft.trim();
    if (!contenu) return;
    if (!selectedCohorteId) {
      toast.error('Selectionnez une classe avant d envoyer un message');
      return;
    }

    setSending(true);
    try {
      if (socket) {
        socket.emit('message-classe', { contenu, cohorteId: selectedCohorteId });
      } else {
        const { data } = await sendMessage({ contenu, type: 'classe', cohorteId: selectedCohorteId });
        setMessages((current) => [data, ...current]);
      }

      setDraft('');
      toast.success('Message envoye a la classe');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible d envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (messageId) => {
    try {
      await markMessageRead(messageId);
      setMessages((current) => current.map((message) => (
        message._id === messageId ? { ...message, isRead: true } : message
      )));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de marquer ce message comme lu');
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await archiveMessage(messageId);
      const archived = messages.find((message) => message._id === messageId);
      setMessages((current) => current.filter((message) => message._id !== messageId));
      if (archived) {
        setArchivedMessages((current) => [{ ...archived, isArchived: true, isRead: true }, ...current]);
      }
      toast.success('Message archive');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible d archiver ce message');
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Espace formateur</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">Messages formateur</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Communiquez avec les apprenants et l equipe administrative.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`rounded-lg border p-5 text-left transition ${
              activeFilter === filter.key ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200'
            }`}
          >
            <p className="text-sm font-medium text-gray-500">{filter.label}</p>
            <p className="mt-3 text-3xl font-bold text-gray-950">{loading ? '...' : metrics[filter.key]}</p>
            <p className="mt-2 text-sm text-gray-500">Cliquer pour filtrer les messages.</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Classes</h2>
          <div className="mt-3 space-y-2">
            {cohortes.length === 0 && (
              <p className="text-sm text-gray-500">Aucune classe rattachee a votre compte formateur.</p>
            )}
            {cohortes.map((cohorte) => (
              <button
                key={cohorte._id}
                type="button"
                onClick={() => setSelectedCohorteId(cohorte._id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  selectedCohorteId === cohorte._id ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="block font-semibold">{cohorte.nom}</span>
                <span className="text-xs text-gray-500">{cohorte.formation} - {cohorte.etudiants?.length || 0} apprenant(s)</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-950">
              {activeFilter === 'unread' && 'Messages non lus'}
              {activeFilter === 'classes' && 'Messages de classe'}
              {activeFilter === 'archives' && 'Messages archives'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Les messages sont limites a la classe selectionnee pour garder les echanges propres par session.
            </p>
          </div>

          <div className="p-5">
            {activeFilter !== 'archives' && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label htmlFor="message-classe" className="block text-sm font-medium text-gray-700">
                  Nouveau message a la classe
                </label>
                <textarea
                  id="message-classe"
                  rows="3"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Information de cours, rappel de devoir, consigne pedagogique..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim() || sending || !selectedCohorteId}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {sending ? 'Envoi...' : 'Envoyer a la classe'}
                  </button>
                </div>
              </div>
            )}

            {loading && <p className="text-sm text-gray-500">Chargement des messages...</p>}
            {!loading && visibleMessages.length === 0 && (
              <p className="text-sm text-gray-500">Aucun message dans ce filtre.</p>
            )}

            <div className="space-y-3">
              {visibleMessages.map((message) => {
                const senderId = message.expediteur?._id || message.expediteur;
                const isMine = String(senderId) === String(user?.id);
                return (
                  <article key={message._id} className={`rounded-lg border p-4 ${message.isRead || isMine ? 'border-gray-200 bg-white' : 'border-indigo-200 bg-indigo-50'}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-gray-950">
                          {message.expediteur?.prenom || 'Utilisateur'} {message.expediteur?.nom || ''}
                          {isMine ? ' (vous)' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {message.cohorte?.nom || 'Classe'} - {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                      {activeFilter !== 'archives' && (
                        <div className="flex gap-2">
                          {!message.isRead && !isMine && (
                            <button type="button" onClick={() => handleMarkRead(message._id)} className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                              Lu
                            </button>
                          )}
                          <button type="button" onClick={() => handleArchive(message._id)} className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                            Archiver
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-700">{message.contenu}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
