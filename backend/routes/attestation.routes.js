const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const attestationController = require('../controllers/attestationController');

// GET /api/attestations/:etudiantId?target=attestation|dts|licence|master
router.get('/:etudiantId', authMiddleware, attestationController.getAttestationStatus);

// POST admin decision
router.post('/:etudiantId/decision', authMiddleware, roleMiddleware('admin', 'superadmin'), attestationController.postAdminDecision);

module.exports = router;
