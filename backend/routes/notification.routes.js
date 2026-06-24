const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const Notification = require('../models/Notification');

router.use(authMiddleware, tenantMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ destinataire: req.user._id }).sort('-createdAt').limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, destinataire: req.user._id },
      { lu: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
