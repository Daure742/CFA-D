const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const formateurController = require('../controllers/formateurController');

router.use(authMiddleware, tenantMiddleware, roleMiddleware('formateur'));
router.get('/dashboard', formateurController.getDashboard);
router.get('/cohortes', formateurController.getMesCohortes);
router.get('/cours', formateurController.getMesCours);
router.patch('/profile', formateurController.updateProfile);

module.exports = router;
