const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Criar cliente Supabase
const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);

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
        
        // Validar o token diretamente com o Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('Erro na validação do Supabase:', error?.message);
            return res.status(401).json({ 
                success: false,
                error: 'Token inválido ou usuário não autenticado' 
            });
        }
        
        // Armazenar informações do usuário na requisição
        req.user = user;
        req.token = token;
        
        next();
        
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(401).json({ 
            success: false,
            error: 'Erro ao validar token' 
        });
    }
};

module.exports = authMiddleware;