import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const result = await genAI.listModels();
        console.log('Available Models:');
        result.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
