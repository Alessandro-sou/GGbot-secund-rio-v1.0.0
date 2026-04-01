const API_URL = 'http://localhost:3000';
// Para testar no Railway, use:
// const API_URL = 'https://ggbot-secund-rio-v100-production.up.railway.app';

// COLE SEU TOKEN AQUI
const TOKEN = 'SEU_TOKEN_DO_SUPABASE';

async function testAPI() {
    console.log('🚀 Testando API do Discord Bot\n');
    console.log('=' .repeat(60));

    // Teste 1: Health Check
    console.log('\n📡 TESTE 1: Health Check');
    try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        console.log('✅ Status:', res.status);
        console.log('📦 Resposta:', data);
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }

    if (!TOKEN || TOKEN === 'SEU_TOKEN_DO_SUPABASE') {
        console.log('\n⚠️  Configure o TOKEN no arquivo test-api.js');
        return;
    }

    // Teste 2: Status do Bot
    console.log('\n🤖 TESTE 2: Status do Bot');
    try {
        const res = await fetch(`${API_URL}/api/bot-status`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await res.json();
        console.log('✅ Status:', res.status);
        console.log('📦 Resposta:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }

    console.log('\n✅ Testes concluídos!');
}

testAPI();