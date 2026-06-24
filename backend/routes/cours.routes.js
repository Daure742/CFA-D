const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const coursController = require('../controllers/coursController');

router.use(authMiddleware, tenantMiddleware);
router.post('/', roleMiddleware('formateur', 'admin'), coursController.createCours);
router.get('/cohorte/:cohorteId', coursController.getCoursByCohorte);
router.post('/lancer/:coursId', roleMiddleware('formateur', 'admin'), coursController.lancerCours);
router.post('/terminer/:coursId', roleMiddleware('formateur', 'admin'), coursController.terminerCours);
router.post('/emarger/:coursId', roleMiddleware('etudiant'), coursController.emarger);
router.post('/valider-emargement/:coursId', roleMiddleware('formateur', 'admin'), coursController.validerEmargement);
router.patch('/publish-replay/:coursId', roleMiddleware('formateur', 'admin'), coursController.publishReplay);

module.exports = router;
