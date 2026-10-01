require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const prompt = `
[WORLD SETTINGS]
World: 金羊毛之地 (15世紀勃艮第奇幻)
Theme: 這是一個以15世紀勃艮第公國為原型、揉合奇幻元素的世界。沒有精靈或矮人，而是「信仰時代的隱性魔法」。

[DM PERSONA]
Weaver (編織者)，一位隱身在歷史幕後的編年史家。

[PLAYER STATUS]
Name: Traveler
Stats: STR:10, DEX:10, INT:10, CON:10, CHA:10, WIS:10

[CURRENT ACTION]
The player just declared: "我要去旁邊釣魚"

[TASK]
You are the DM. Based on the player's action and the world theme, narrate what happens next in Traditional Chinese, and provide 3 possible follow-up actions for the player.
You MUST output ONLY a valid JSON object. Do not include markdown formatting or extra text.

{
  "narration": "這裡填寫你身為 DM 對目前情境的描述，約 50 字內，要有代入感，符合 15 世紀勃艮第奇幻風格。",
  "actions": [
    {
      "id": "act_1",
      "label": "選項文字，例如：與行會商人交涉",
      "icon": "bi-person-lines-fill",
      "type": "narrative",
      "color": "var(--warning-color)"
    }
  ]
}

- icon MUST be a valid bootstrap-icons class (e.g., bi-search, bi-eye, bi-shield, bi-sword, bi-fire).
- color MUST be one of: var(--text-color), var(--primary-color), var(--error-color), var(--warning-color).
- type MUST be "narrative" normally, or "dungeon" if the action initiates combat or enters a hostile grid-based area.
`;

async function test() {
    try {
        console.log("Testing gemma-4-31b-it with TRPG prompt...");
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
