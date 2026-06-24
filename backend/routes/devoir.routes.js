const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const devoirController = require('../controllers/devoirController');

router.use(authMiddleware, tenantMiddleware);
router.get('/mes-devoirs', roleMiddleware('etudiant'), devoirController.getMesDevoirs);
router.post('/', roleMiddleware('formateur'), devoirController.createDevoir);
router.get('/formateur', roleMiddleware('formateur', 'admin'), devoirController.getDevoirsForFormateur);
router.post('/rendre/:devoirId', roleMiddleware('etudiant'), devoirController.rendreDevoir);
router.put('/corriger/:renduId', roleMiddleware('formateur'), devoirController.corrigerDevoir);

module.exports = router;
