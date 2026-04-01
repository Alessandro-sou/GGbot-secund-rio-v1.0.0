require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const config = require('./config');

const app = express();

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
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
});

module.exports = app;