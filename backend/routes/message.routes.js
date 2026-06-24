const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const Message = require('../models/Message');
const Cohorte = require('../models/Cohorte');

router.use(authMiddleware, tenantMiddleware);

const getUserCohorteIds = async (user, tenantId) => {
  const ids = new Set();

  if (user.cohorte) {
    ids.add(String(user.cohorte));
  }

  if (user.role === 'formateur') {
    const cohortes = await Cohorte.find({ tenantId, formateurs: user._id, isDeleted: { $ne: true } }).select('_id');
    cohortes.forEach((cohorte) => ids.add(String(cohorte._id)));
  }

  return Array.from(ids);
};

router.get('/', async (req, res, next) => {
  try {
    const { archived, unread, type, cohorteId } = req.query;
    const cohorteIds = await getUserCohorteIds(req.user, req.tenantId);
    const userId = req.user._id;
    const archiveFilter = archived === 'true'
      ? { archivedFor: userId }
      : { archivedFor: { $ne: userId } };

    const accessFilter = [
      { expediteur: userId },
      { destinataire: userId }
    ];

    if (cohorteIds.length > 0) {
      accessFilter.push({ cohorte: { $in: cohorteIds } });
    }

    const query = {
      tenantId: req.tenantId,
      ...archiveFilter,
      $or: accessFilter
    };

    if (type) {
      query.type = type;
    }

    if (cohorteId) {
      if (!cohorteIds.includes(String(cohorteId))) {
        return res.status(403).json({ message: 'Acces non autorise a cette classe' });
      }
      query.cohorte = cohorteId;
    }

    if (unread === 'true') {
      query.expediteur = { $ne: userId };
      query.readBy = { $ne: userId };
    }

    const messages = await Message.find({
      ...query
    })
      .populate('expediteur destinataire', 'nom prenom email role')
      .populate('cohorte', 'nom formation')
      .sort('-createdAt');

    res.json(messages.map((message) => ({
      ...message.toObject(),
      isRead: message.readBy?.some((readerId) => String(readerId) === String(userId)) || String(message.expediteur?._id || message.expediteur) === String(userId),
      isArchived: message.archivedFor?.some((readerId) => String(readerId) === String(userId))
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { contenu, type, destinataireId, cohorteId } = req.body;

    if (!contenu || !type) {
      return res.status(400).json({ message: 'Contenu et type de message sont obligatoires' });
    }

    const cohorteIds = await getUserCohorteIds(req.user, req.tenantId);
    const targetCohorteId = cohorteId || req.user.cohorte;

    if (type === 'classe') {
      if (!targetCohorteId) {
        return res.status(400).json({ message: 'Impossible d envoyer un message de classe: cohorte manquante' });
      }

      if (!cohorteIds.includes(String(targetCohorteId))) {
        return res.status(403).json({ message: 'Acces non autorise a cette classe' });
      }
    }

    if (type === 'prive' && !destinataireId) {
      return res.status(400).json({ message: 'Destinataire manquant pour un message privé' });
    }

    const message = await Message.create({
      expediteur: req.user._id,
      destinataire: destinataireId || undefined,
      cohorte: type === 'classe' ? targetCohorteId : undefined,
      tenantId: req.tenantId,
      contenu,
      type,
      readBy: [req.user._id]
    });

    await message.populate('expediteur destinataire', 'nom prenom email role');
    await message.populate('cohorte', 'nom formation');

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

router.patch('/:messageId/read', async (req, res, next) => {
  try {
    const cohorteIds = await getUserCohorteIds(req.user, req.tenantId);
    const accessFilter = [
      { expediteur: req.user._id },
      { destinataire: req.user._id }
    ];

    if (cohorteIds.length > 0) {
      accessFilter.push({ cohorte: { $in: cohorteIds } });
    }

    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, tenantId: req.tenantId, $or: accessFilter },
      { $addToSet: { readBy: req.user._id }, $set: { lu: true } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message introuvable' });
    }

    res.json({ message: 'Message marque comme lu', messageId: message._id });
  } catch (error) {
    next(error);
  }
});

router.patch('/:messageId/archive', async (req, res, next) => {
  try {
    const cohorteIds = await getUserCohorteIds(req.user, req.tenantId);
    const accessFilter = [
      { expediteur: req.user._id },
      { destinataire: req.user._id }
    ];

    if (cohorteIds.length > 0) {
      accessFilter.push({ cohorte: { $in: cohorteIds } });
    }

    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, tenantId: req.tenantId, $or: accessFilter },
      { $addToSet: { archivedFor: req.user._id, readBy: req.user._id }, $set: { lu: true } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message introuvable' });
    }

    res.json({ message: 'Message archive', messageId: message._id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
