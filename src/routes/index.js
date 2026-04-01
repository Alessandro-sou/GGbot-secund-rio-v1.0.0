const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getBotStatus } = require('../controllers/botStatusController');
const { sendMessage } = require('../controllers/sendMessageController');
const { moderateUser } = require('../controllers/moderateUserController');
const { manageRole } = require('../controllers/manageRoleController');

// Rotas
router.get('/bot-status', authMiddleware, getBotStatus);
router.post('/send-message', authMiddleware, sendMessage);
router.post('/moderate-user', authMiddleware, moderateUser);
router.post('/manage-role', authMiddleware, manageRole);

module.exports = router;