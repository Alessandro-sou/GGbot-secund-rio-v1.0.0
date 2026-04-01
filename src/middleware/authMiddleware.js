const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabase.url, config.supabase.key);

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                error: 'Token não fornecido ou formato inválido' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ 
                success: false,
                error: 'Token inválido ou usuário não autenticado' 
            });
        }
        
        req.user = user;
        req.token = token;
        next();
        
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(401).json({ 
            success: false,
            error: 'Token inválido ou expirado' 
        });
    }
};

module.exports = authMiddleware;