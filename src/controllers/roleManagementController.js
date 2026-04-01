const discordService = require('../services/discordService');

const assignRoleAndNickname = async (req, res) => {
    try {
        const { userId, roleType, action } = req.body;
        
        // Validações
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId é obrigatório'
            });
        }
        
        if (!roleType || !['suporte', 'diretor'].includes(roleType)) {
            return res.status(400).json({
                success: false,
                error: 'roleType é obrigatório e deve ser "suporte" ou "diretor"'
            });
        }
        
        if (!action || !['assign', 'remove'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: 'action é obrigatória e deve ser "assign" ou "remove"'
            });
        }
        
        const result = await discordService.assignRoleAndNickname(userId, roleType, action);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Erro no gerenciamento de cargo:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao gerenciar cargo do usuário'
        });
    }
};

module.exports = {
    assignRoleAndNickname
};