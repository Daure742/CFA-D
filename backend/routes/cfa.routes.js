const router = require('express').Router();
const cfaController = require('../controllers/cfaController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/annuaire', authMiddleware, cfaController.getAnnuaire);
router.get('/', cfaController.searchCfas);
router.get('/:id', cfaController.getById);

module.exports = router;
