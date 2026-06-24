const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const cohorteController = require('../controllers/cohorteController');

router.use(authMiddleware, roleMiddleware('admin', 'formateur'));
router.get('/:cohorteId/waitlist', cohorteController.getWaitlist);
router.delete('/:cohorteId/waitlist/:entryId', cohorteController.removeFromWaitlist);
router.post('/:cohorteId/waitlist/:entryId/promote', cohorteController.promoteFromWaitlist);

module.exports = router;
