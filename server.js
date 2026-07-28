// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
app.use(cors()); // Permite que seu site no GitHub Pages chame este servidor
app.use(express.json());

// Cache para evitar banimento de IP (guarda por 1 hora)
const cache = new NodeCache({ stdTTL: 3600 });

// =================================================================
// ⚠️ CONFIGURAÇÃO DA API REAL DO JOGO (Preencher depois)
// =================================================================
const COD_API_URL = 'https://api-lb.callofdragons.com/v1/lord/detail'; // URL Exemplo
const API_HEADERS = {
    'User-Agent': 'CallOfDragons/1.0 (Android)',
    'x-device-id': 'SEU_DEVICE_ID_AQUI',
    // 'Authorization': 'Bearer SEU_TOKEN_AQUI' 
};

app.get('/api/lord/:lordId', async (req, res) => {
    const { lordId } = req.params;

    // 1. Verifica se já temos os dados no cache
    const cachedData = cache.get(lordId);
    if (cachedData) {
        return res.json({ source: 'cache', data: cachedData });
    }

    try {
        // =========================================================
        // MODO DE TESTE (MOCK) - Remova este bloco quando tiver a API real
        // =========================================================
        if (lordId === '12345678' || true) { // '|| true' força o modo de teste sempre
            const mockData = {
                username: "TestLord_" + lordId,
                power: 150000000 + Math.floor(Math.random() * 50000000),
                kingdom: "Kingdom 2045",
                alliance: "LCKY - Zero Skill All Luck",
                kills: 85000000,
                avatar: "T"
            };
            
            // Simula um delay de rede de 1 segundo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            cache.set(lordId, mockData);
            return res.json({ source: 'mock_test', data: mockData });
        }
        // =========================================================

        /* 
        // CÓDIGO REAL (Descomente isso quando tiver os dados do Charles Proxy)
        const response = await axios.post(COD_API_URL, {
            uid: lordId
        }, {
            headers: API_HEADERS
        });

        const lordData = {
            username: response.data.lord_name || 'Unknown',
            power: response.data.power || 0,
            kingdom: response.data.kingdom_id || 'Unknown',
            alliance: response.data.alliance_name || 'None',
            kills: response.data.kill_count || 0,
            avatar: response.data.avatar_id || '?'
        };

        cache.set(lordId, lordData);
        res.json({ source: 'live_api', data: lordData });
        */

    } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
        res.status(500).json({ error: 'Lord não encontrado ou erro na API do jogo.' });
    }
});

// O Render exige que escutemos a porta que ele nos dá via process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor LCKY Tracker rodando na porta ${PORT}`);
});
