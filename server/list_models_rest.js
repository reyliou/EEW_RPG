const axios = require('axios');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await axios.get(url);
        console.log('Available Models:');
        response.data.models.forEach(m => {
            if (m.name.includes('gemma') || m.name.includes('flash')) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

listModels();
