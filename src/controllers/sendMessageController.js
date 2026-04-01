const discordService = require('../services/discordService');

const sendMessage = async (req, res) => {
    try {
        const { channelId, message, type, embedData } = req.body;
        
        if (!channelId) {
            return res.status(400).json({
                success: false,
                error: 'channelId é obrigatório'
            });
        }
        
        if (!message && type !== 'embed') {
            return res.status(400).json({
                success: false,
                error: 'message é obrigatório para mensagens normais'
            });
        }
        
        if (type === 'embed' && !embedData) {
            return res.status(400).json({
                success: false,
                error: 'embedData é obrigatório para mensagens do tipo embed'
            });
        }
        
        const result = await discordService.sendMessage(
            channelId, 
            message, 
            type || 'normal', 
            embedData
        );
        
        res.json({
            success: true,
            data: {
                messageId: result.id,
                channelId: result.channelId,
                timestamp: result.createdTimestamp
            }
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao enviar mensagem'
        });
    }
};

module.exports = { sendMessage };