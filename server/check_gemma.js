const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('API Key missing');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // In some versions, listModels might not be directly on genAI or requires v1beta
        // Let's try to just fetch them via a raw fetch if needed, 
        // but first let's try the common names.
        console.log('Checking for Gemma models...');
        const models = ['gemma-2-9b-it', 'gemma-2-27b-it', 'gemma-7b-it'];
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                console.log(`Model ${modelName} is potentially available.`);
            } catch (e) {
                console.log(`Model ${modelName} check failed.`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

listModels();
