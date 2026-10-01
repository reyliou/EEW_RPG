import fs from 'fs';
import path from 'path';

export interface LoreDocument {
    title: string;
    content: string;
    keywords: string[];
}

export class LoreLoader {
    private static loreCache: LoreDocument[] = [];
    private static isLoaded = false;

    /**
     * 在後端啟動時載入所有的 Markdown 世界觀文檔
     */
    static loadAllLore() {
        if (this.isLoaded) return;
        
        try {
            const loreDir = path.join(__dirname, '../lore');
            if (!fs.existsSync(loreDir)) {
                fs.mkdirSync(loreDir, { recursive: true });
                return;
            }

            const files = fs.readdirSync(loreDir).filter(f => f.endsWith('.md'));
            
            for (const file of files) {
                const content = fs.readFileSync(path.join(loreDir, file), 'utf-8');
                
                // 簡易的關鍵字萃取 (這裡可以根據檔案名稱或內容定義)
                const keywords = this.extractKeywords(file, content);
                
                this.loreCache.push({
                    title: file.replace('.md', ''),
                    content: content.trim(),
                    keywords: keywords
                });
            }
            console.log(`[Matrix] Loaded ${this.loreCache.length} lore documents.`);
            this.isLoaded = true;
        } catch (error) {
            console.error('[Matrix] Failed to load lore documents:', error);
        }
    }

    /**
     * 簡單的關鍵字萃取器 (可針對您的題材自訂)
     */
    private static extractKeywords(filename: string, content: string): string[] {
        const keywords: string[] = [];
        const text = (filename + " " + content).toLowerCase();
        
        if (text.includes('魔法') || text.includes('magic') || text.includes('法術') || text.includes('水晶') || text.includes('源石')) {
            keywords.push('magic');
        }
        if (text.includes('議會') || text.includes('勢力') || text.includes('陣營') || text.includes('兄弟會')) {
            keywords.push('faction');
        }
        if (text.includes('歷史') || text.includes('起源') || text.includes('history')) {
            keywords.push('history');
        }
        if (text.includes('怪物') || text.includes('晶厄')) {
            keywords.push('monster');
        }
        
        return keywords;
    }

    /**
     * 輕量級的 RAG (檢索增強生成)：
     * 根據玩家目前的輸入，找出最相關的一篇或兩篇文檔，防止 Token 爆炸。
     */
    static getRelevantLore(playerAction: string): string {
        if (!this.isLoaded) this.loadAllLore();
        if (this.loreCache.length === 0) return '';

        const actionText = playerAction.toLowerCase();
        const relevantDocs: LoreDocument[] = [];

        // 簡單的關鍵字匹配
        for (const doc of this.loreCache) {
            if (
                (doc.keywords.includes('magic') && (actionText.includes('施法') || actionText.includes('魔法') || actionText.includes('水晶'))) ||
                (doc.keywords.includes('faction') && (actionText.includes('議會') || actionText.includes('組織') || actionText.includes('灰燼'))) ||
                (doc.keywords.includes('monster') && (actionText.includes('晶厄') || actionText.includes('怪物')))
            ) {
                relevantDocs.push(doc);
            }
        }

        // 如果沒有匹配到特定的，就預設回傳「歷史起源」或不回傳
        if (relevantDocs.length === 0) {
            const historyDoc = this.loreCache.find(d => d.keywords.includes('history'));
            if (historyDoc) relevantDocs.push(historyDoc);
        }

        // 最多只取前 2 篇，防止 Prompt 過長
        const selectedDocs = relevantDocs.slice(0, 2);
        
        if (selectedDocs.length === 0) return '';

        let result = `\n[RELEVANT LORE DATABASE]\n`;
        for (const doc of selectedDocs) {
            result += `--- ${doc.title} ---\n${doc.content}\n\n`;
        }
        return result;
    }
}
