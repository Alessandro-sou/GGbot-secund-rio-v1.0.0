const discordService = require('../services/discordService');

const getBotStatus = async (req, res) => {
    try {
        const status = await discordService.getBotStatus();
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Erro ao buscar status do bot:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar status do bot'
        });
    }
};

module.exports = {
    getBotStatus
};