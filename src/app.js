require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const config = require('./config');

const app = express();

// 🔓 DESABILITAR CORS COMPLETAMENTE - Permite qualquer site
app.use(cors({
    origin: '*', // Permite todas as origens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Importante: false quando origin é '*'
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Desabilitar Helmet que também bloqueia CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Desabilita CSP
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

// Middleware adicional para garantir CORS em todas as respostas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error('Erro:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(config.port, () => {
    console.log(`🚀 Servidor rodando na porta ${config.port}`);
    console.log(`📡 Health check: http://localhost:${config.port}/health`);
    console.log(`🔒 API: http://localhost:${config.port}/api`);
    console.log(`🔓 CORS: Desabilitado - qualquer site pode acessar`);
});

module.exports = app;