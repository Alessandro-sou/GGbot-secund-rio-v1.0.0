const discordService = require('../services/discordService');

const moderateUser = async (req, res) => {
    try {
        const { userId, action } = req.body;
        
        // Validações
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId é obrigatório'
            });
        }
        
        if (!action || !['ativar', 'suspender'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'action é obrigatória e deve ser "ativar" ou "suspender"'
            });
        }
        
        const result = await discordService.moderateUser(userId, action);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao moderar usuário:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao moderar usuário'
        });
    }
};

module.exports = {
    moderateUser
};