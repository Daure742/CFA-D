const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const etudiantController = require('../controllers/etudiantController');

router.use(authMiddleware, tenantMiddleware, roleMiddleware('etudiant'));
router.get('/dashboard', etudiantController.getDashboard);
router.get('/agenda', etudiantController.getAgenda);
router.get('/emploi-du-temps', etudiantController.getEmploiDuTemps);

module.exports = router;
