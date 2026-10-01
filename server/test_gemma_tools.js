const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const tools = [
    {
        functionDeclarations: [
            {
                name: "request_dice_check",
                description: "Test tool",
                parameters: { type: "object", properties: { reason: { type: "string" } } }
            }
        ]
    }
];

async function testGemmaWithTools() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemma-4-31b-it",
        tools: tools
    });
    try {
        const result = await model.generateContent("I want to roll a dice to open the door.");
        console.log('Gemma Tools Response:', JSON.stringify(result.response.functionCalls(), null, 2));
    } catch (e) {
        console.error('Gemma Tools failed:', e.message);
    }
}

testGemmaWithTools();
