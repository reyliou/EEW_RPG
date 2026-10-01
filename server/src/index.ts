import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ICharacterState } from '../../shared/types/character.types';
import { LoreLoader } from './llm/LoreLoader';

// Handlers
import { registerChatHandlers } from './handlers/ChatHandler';
import { registerTRPGHandlers } from './handlers/TRPGHandler';
import { registerSortingHatHandlers } from './handlers/SortingHatHandler';
import { registerSystemHandlers } from './handlers/SystemHandler';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// 初始化世界觀資料庫
LoreLoader.loadAllLore();

const PORT = process.env.PORT || 4000;

io.on('connection', (socket) => {
    console.log(`[Matrix] User connected: ${socket.id}`);

    const mockPlayer: ICharacterState = {
        id: socket.id,
        name: "Traveler",
        job: "新手",
        strength: 10,
        dexterity: 10,
        intelligence: 14,
        constitution: 10,
        charisma: 10,
        wisdom: 12,
        maxHp: 100,
        currentHp: 100,
        luck: 10,
        level: 1,
        experience: 0,
        statusEffects: []
    };

    registerChatHandlers(socket, mockPlayer);
    registerTRPGHandlers(socket);
    registerSortingHatHandlers(socket);
    registerSystemHandlers(socket);
});

httpServer.listen(PORT, () => console.log(`[Matrix] Destiny Matrix is running on port ${PORT}`));
