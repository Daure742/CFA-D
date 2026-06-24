const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const noteController = require('../controllers/noteController');

router.use(authMiddleware, tenantMiddleware);
router.post('/', roleMiddleware('formateur', 'admin'), noteController.upsertNote);
router.get('/mes-notes', roleMiddleware('etudiant'), noteController.getNotesEtudiant);
router.get('/mes-bulletins', roleMiddleware('etudiant'), noteController.getBulletinsEtudiant);
router.post('/bulletin', roleMiddleware('formateur', 'admin'), noteController.generateBulletin);

module.exports = router;
