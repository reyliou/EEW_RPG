require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const prompt = `你好，請回覆我一個數字`;

async function test() {
    console.log("Testing concurrent requests to gemma-4-31b-it...");
    try {
        const promises = [
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt }),
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt }),
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt })
        ];
        
        const results = await Promise.all(promises);
        console.log("SUCCESS! All 3 completed.");
        results.forEach((r, i) => console.log(`Response ${i}:`, r.text));
    } catch (e) {
        console.error("CONCURRENT ERROR:", e);
    }
}

test();
