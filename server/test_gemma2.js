require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const prompt = `
你現在是一位神祕的分類帽。世界觀是：15世紀勃艮第奇幻。
為了鑑定前來的新靈魂，請你立刻生成一份專屬的「靈魂鑑定試卷」。

規則：
1. 必須有精確的 5 題「單選題」。
2. 必須有 1 題「申論題」。
3. 請嚴格遵守以下純文字格式輸出，絕對不要輸出 JSON：

[MCQ 1]
Q: 問題內容
A: 選項A
B: 選項B
C: 選項C

[MCQ 2]
Q: 問題內容
A: 選項A
B: 選項B
C: 選項C
(依此類推到 MCQ 5)

[ESSAY]
最後的申論題
`;

async function test() {
    try {
        console.log("Testing gemma-4-31b-it with Quiz prompt...");
        const response = await ai.models.generateContent({
            model: 'gemma-4-31b-it',
            contents: prompt
        });
        console.log("SUCCESS!");
        console.log(response.text);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

test();
