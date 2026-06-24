// socket/socketHandler.js - Gestion des événements temps réel
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Cohorte = require('../models/Cohorte');

const getSocketCohorteIds = async (user) => {
  const ids = new Set();

  if (user.cohorte) {
    ids.add(String(user.cohorte));
  }

  if (user.role === 'formateur') {
    const cohortes = await Cohorte.find({ tenantId: user.tenantId, formateurs: user._id, isDeleted: { $ne: true } }).select('_id');
    cohortes.forEach((cohorte) => ids.add(String(cohorte._id)));
  }

  return Array.from(ids);
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket :', socket.id);

    // Authentification socket via token
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error();
        socket.user = user;
        socket.cohorteIds = await getSocketCohorteIds(user);
        socket.cohorteIds.forEach((cohorteId) => {
          socket.join(`cohorte_${cohorteId}`);
        });
        socket.emit('authenticated', { success: true });
      } catch (err) {
        socket.emit('authenticated', { success: false });
      }
    });

    // Message de classe
    socket.on('message-classe', async (data) => {
      const targetCohorteId = data?.cohorteId || socket.user?.cohorte;

      if (socket.user && targetCohorteId && socket.cohorteIds?.includes(String(targetCohorteId))) {
        try {
          const message = await Message.create({
            expediteur: socket.user._id,
            cohorte: targetCohorteId,
            tenantId: socket.user.tenantId,
            contenu: data.contenu,
            type: 'classe',
            readBy: [socket.user._id]
          });

          await message.populate('expediteur', 'nom prenom email role');
          await message.populate('cohorte', 'nom formation');

          io.to(`cohorte_${targetCohorteId}`).emit('nouveau-message-classe', {
            _id: message._id,
            expediteur: {
              _id: message.expediteur._id,
              nom: message.expediteur.nom,
              prenom: message.expediteur.prenom,
              role: message.expediteur.role
            },
            cohorte: message.cohorte,
            contenu: message.contenu,
            type: message.type,
            readBy: message.readBy,
            archivedFor: message.archivedFor,
            isRead: false,
            isArchived: false,
            createdAt: message.createdAt
          });
        } catch (err) {
          console.error('Erreur lors de l’enregistrement du message de classe', err);
        }
      }
    });

    // Message privé
    socket.on('message-prive', (data) => {
      // Envoyer au destinataire spécifique (géré via rooms privées)
    });

    // Connexion/déconnexion à un cours
    socket.on('connexion-cours', async (coursId) => {
      try {
        socket.join(`cours_${coursId}`);

        // Auto-emargement server-side: create or update Presence on join
        if (socket.user) {
          const Presence = require('../models/Presence');
          const Cours = require('../models/Cours');

          const cours = await Cours.findOne({ _id: coursId, tenantId: socket.user.tenantId });
          if (!cours) return;

          const now = new Date();
          const ip = socket.handshake.address;
          const userAgent = socket.handshake.headers['user-agent'];

          await Presence.findOneAndUpdate(
            { cours: coursId, etudiant: socket.user._id },
            {
              $setOnInsert: { tenantId: socket.user.tenantId, heureDebut: now },
              $set: {
                statut: 'présent',
                valideEtudiant: true,
                'meta.socketId': socket.id,
                'meta.ip': ip,
                'meta.userAgent': userAgent
              }
            },
            { upsert: true, new: true }
          );

          // Also add to cours.emargementEtudiant for quick list (non-duplicate)
          await Cours.updateOne({ _id: coursId, tenantId: socket.user.tenantId }, { $addToSet: { emargementEtudiant: socket.user._id } });
        }
      } catch (err) {
        console.error('Erreur auto-emargement socket:', err);
      }
    });
    socket.on('deconnexion-cours', (coursId) => {
      socket.leave(`cours_${coursId}`);
    });

    // Le formateur lance un cours (déclenche la session live)
    socket.on('formateur-lance-cours', (coursId) => {
      io.to(`cours_${coursId}`).emit('cours-live-start', { coursId });
    });
  });
};
