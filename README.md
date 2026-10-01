# EEW_RPG

EEW_RPG 是一款結合 LLM 與 TRPG/Dungeon 冒險機制的遊戲專案。

## 專案結構 (Project Structure)

- `client/`: 客戶端前端介面（React / TypeScript / Tailwind CSS / Socket.io 客戶端）
- `server/`: 伺服器端（Node.js / Express / TypeScript / Socket.io / Gemini API / Supabase）
- `shared/`: 前後端共享型別定義與常數（Types, Constants, WorldLore）

## 快速開始 (Getting Started)

### 伺服器端 (Server)
```bash
cd server
npm install
cp .env.example .env # 設定 GEMINI_API_KEY 與 Supabase 連線資訊
npm run dev
```

### 客戶端 (Client)
```bash
cd client
npm install
npm run dev
```
