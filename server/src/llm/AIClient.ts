import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ 警告: 尚未設定 GEMINI_API_KEY。AI 功能將無法運作！");
}

export const aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemma-4-31b-it';
