const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register); // admin seulement en pratique
router.get('/sessions-ouvertes', authController.getSessionsOuvertes);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePasswordAuthenticated);
router.post('/notification-preferences', authMiddleware, authController.updateNotificationPreferences);

module.exports = router;
