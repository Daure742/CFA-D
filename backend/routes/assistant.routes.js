const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { postQuery } = require('../controllers/assistantController');

// POST /api/assistant/query
router.post('/query', authMiddleware, postQuery);

module.exports = router;
