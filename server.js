// server.js (Backend em Node.js)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
app.use(cors()); // Permite que seu site no GitHub Pages chame este servidor
app.use(express.json());

// Cache para evitar banimento de IP por muitas requisições à Farlight
// Guarda os dados por 3600 segundos (1 hora)
const cache = new NodeCache({ stdTTL: 3600 });

// ⚠️ SUBSTITUA ESTES VALORES PELOS QUE VOCÊ DESCOBRIU NO CHARLES PROXY
const COD_API_URL = 'https://api-lb.callofdragons.com/v1/lord/detail'; // URL Exemplo
const API_HEADERS = {
    'User-Agent': 'CallOfDragons/1.0 (Android)',
    'x-device-id': 'SEU_DEVICE_ID_AQUI',
    'Authorization': 'Bearer SEU_TOKEN_AQUI' // Se houver
};

app.get('/api/lord/:lordId', async (req, res) => {
    const { lordId } = req.params;

    // 1. Verifica se já temos os dados no cache
    const cachedData = cache.get(lordId);
    if (cachedData) {
        return res.json({ source: 'cache', data: cachedData });
    }

    try {
        // 2. Se não tiver no cache, busca na "API" do jogo
        // Nota: A estrutura exata do payload depende do que você interceptou
        const response = await axios.post(COD_API_URL, {
            uid: lordId
        }, {
            headers: API_HEADERS
        });

        // 3. Formata os dados para ficar bonito no seu site
        const lordData = {
            username: response.data.lord_name || 'Unknown',
            power: response.data.power || 0,
            kingdom: response.data.kingdom_id || 'Unknown',
            alliance: response.data.alliance_name || 'None',
            kills: response.data.kill_count || 0,
            avatar: response.data.avatar_id || 'default'
        };

        // 4. Salva no cache
        cache.set(lordId, lordData);

        res.json({ source: 'api', data: lordData });

    } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
        res.status(500).json({ error: 'Lord não encontrado ou erro na API do jogo.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});