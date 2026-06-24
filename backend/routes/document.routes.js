const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');

// Multer configuration pour upload de fichiers (PDF, DOC, DOCX)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Seuls PDF, DOC et DOCX sont acceptés.'));
    }
  }
});

router.use(authMiddleware, tenantMiddleware);

// ──────────────────────────────────────────────
// GET /mes-documents — Étudiant : récupérer ses documents
// ──────────────────────────────────────────────
router.get('/mes-documents', roleMiddleware('etudiant'), async (req, res, next) => {
  try {
    const documents = await Document.find({
      tenantId: req.tenantId,
      archive: { $ne: true },
      $or: [
        { destinataire: 'tous' },
        { destinataire: 'etudiant' },
        { destinataire: 'cohorte', cohorte: req.user.cohorte },
        { userId: req.user._id }
      ]
    }).sort({ type: 1, createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// GET /cours-documents/:cohorteId — Étudiant : documents de cours partagés par les formateurs
// ──────────────────────────────────────────────
router.get('/cours-documents/:cohorteId', async (req, res, next) => {
  try {
    const { cohorteId } = req.params;
    const documents = await Document.find({
      tenantId: req.tenantId,
      type: 'cours',
      archive: { $ne: true },
      $or: [
        { cohorte: cohorteId },
        { destinataire: 'tous' }
      ]
    })
      .populate('uploadedBy', 'nom prenom')
      .populate('cours', 'titre matiere')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// POST / — Formateur : partager un document (PDF/DOC) vers les étudiants d'une cohorte
// ──────────────────────────────────────────────
router.post('/', roleMiddleware('formateur', 'admin'), upload.single('fichier'), async (req, res, next) => {
  try {
    const { nom, cohorteId, coursId } = req.body;

    if (!nom) {
      return res.status(400).json({ message: 'Le nom du document est requis' });
    }

    let fileUrl = '';

    // Tentative Cloudinary si disponible
    if (req.file) {
      try {
        const cloudinary = require('../config/cloudinary');
        if (cloudinary && cloudinary.uploader) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: 'raw',
                folder: 'cfa_documents',
                public_id: `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
          fileUrl = result.secure_url;
        }
      } catch (cloudErr) {
        console.warn('⚠️ Cloudinary non disponible, stockage en base64:', cloudErr.message);
      }

      // Fallback: stockage en data URL si Cloudinary indisponible
      if (!fileUrl) {
        const base64 = req.file.buffer.toString('base64');
        fileUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    } else if (req.body.url) {
      // Si un lien direct est fourni au lieu d'un fichier
      fileUrl = req.body.url;
    } else {
      return res.status(400).json({ message: 'Un fichier ou un lien URL est requis' });
    }

    const document = await Document.create({
      nom,
      type: 'cours',
      tenantId: req.tenantId,
      url: fileUrl,
      destinataire: 'cohorte',
      cohorte: cohorteId || req.user.cohorte,
      uploadedBy: req.user._id,
      cours: coursId || undefined
    });

    await document.populate('uploadedBy', 'nom prenom');

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// GET / — Tous les documents (admin / liste générale)
// ──────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const documents = await Document.find({ tenantId: req.tenantId }).sort('-createdAt');
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
