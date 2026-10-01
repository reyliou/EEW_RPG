require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const prompt = `
You are the Crystal Sorting Hat. The world setting is a 15th-century Burgundian fantasy.
Generate a "Soul Assessment Quiz" for a new soul.

Rules:
1. Exactly 5 multiple-choice questions with exactly 3 options each.
2. Exactly 1 essay question.
3. Strict plain text format, NO JSON:

[MCQ 1]
Q: Question text
A: Option A
B: Option B
C: Option C

... (up to MCQ 5)

[ESSAY]
The essay question
`;

async function test() {
    console.log("Testing gemma-4-31b-it with ENGLISH Quiz prompt...");
    try {
        const promises = [
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt }),
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt }),
            ai.models.generateContent({ model: 'gemma-4-31b-it', contents: prompt })
        ];
        
        const results = await Promise.all(promises);
        console.log("SUCCESS! All 3 English requests completed.");
    } catch (e) {
        console.error("ENGLISH CONCURRENT ERROR:", e);
    }
}

test();
