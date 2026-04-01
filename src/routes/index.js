const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const botStatusController = require('../controllers/botStatusController');
const sendMessageController = require('../controllers/sendMessageController');
const userModerationController = require('../controllers/userModerationController');
const roleManagementController = require('../controllers/roleManagementController');

// Rota 1: Buscar status do bot (requer autenticação)
router.get('/bot-status', authMiddleware, botStatusController.getBotStatus);

// Rota 2: Enviar mensagem (requer autenticação)
router.post('/send-message', authMiddleware, sendMessageController.sendMessage);

// Rota 3: Moderar usuário (requer autenticação)
router.post('/moderate-user', authMiddleware, userModerationController.moderateUser);

// Rota 4: Gerenciar cargos e apelidos (requer autenticação)
router.post('/manage-role', authMiddleware, roleManagementController.assignRoleAndNickname);

module.exports = router;