const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const scheduleController = require('../controllers/scheduleController');

router.use(authMiddleware, tenantMiddleware);

// Admins create/publish schedules
router.post('/', roleMiddleware('admin'), scheduleController.createSchedule);

// Get latest schedule for a cohorte (students & formateurs)
router.get('/latest/:cohorteId', scheduleController.getLatest);
router.get('/week/:cohorteId', scheduleController.getByWeek);

module.exports = router;
