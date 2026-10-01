import { DEFAULT_MODEL } from '../llm/AIClient';
import { WORLD_SETTINGS } from '../../../shared/constants/WorldLore';
import { AIManager } from '../llm/AIManager';

export interface QuizQuestion {
    question: string;
    options: string[]; // 必定 3 個選項 A, B, C
}

export interface QuizData {
    mcqs: QuizQuestion[];
    essayQuestion: string;
}

export interface SortingResult {
    job: string;
    commentary: string;
}

export class GeminiService {
    
    // 階段一：生成隨機的心理測驗
    static async generateQuiz(): Promise<QuizData> {

        const prompt = `
你現在是${WORLD_SETTINGS.SORTING_HAT_PERSONA}。世界觀是：${WORLD_SETTINGS.WORLD_THEME}。
為了鑑定前來的新靈魂，請你立刻生成一份專屬的「靈魂鑑定試卷」。

規則：
1. 必須有精確的 5 題「單選題」(每題必須剛好有 3 個選項，分別代表不同的靈魂特質，如勇氣、狡詐、智慧等)。問題情境請符合當前遊戲世界觀題材。
2. 必須有 1 題「申論題」，這是一個開放式的靈魂拷問(例如：如果世界末日...)。
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
        try {
            let text = await AIManager.generateContentSafe('gemma-4-31b-it', prompt);

            
            // 手動解析純文字格式
            const mcqs: QuizQuestion[] = [];
            for (let i = 1; i <= 5; i++) {
                const mcqRegex = new RegExp(`\\[MCQ ${i}\\]\\nQ:\\s*(.*?)\\nA:\\s*(.*?)\\nB:\\s*(.*?)\\nC:\\s*(.*)`, 'i');
                const match = text.match(mcqRegex);
                if (match) {
                    mcqs.push({
                        question: match[1].trim(),
                        options: [match[2].trim(), match[3].trim(), match[4].trim()]
                    });
                }
            }

            const essayMatch = text.match(/\[ESSAY\]\n([\s\S]*)/i);
            const essayQuestion = essayMatch ? essayMatch[1].trim() : "如果命運要求你做出犧牲，你會選擇放棄什麼？";

            const result: QuizData = { mcqs, essayQuestion };
            
            // 防呆確保有5題
            if (!result.mcqs || result.mcqs.length < 5) {
                throw new Error("AI 生成的題目格式不符");
            }
            return result;
        } catch (error) {
            console.error("生成題目失敗:", error);
            // Fallback 靜態題目
            return {
                mcqs: [
                    { question: "當你在黑暗的森林中遇到岔路，你會選擇？", options: ["點燃火把走寬廣的大路", "隱藏氣息走入未知的密林", "停在原地觀察星星的指引"] },
                    { question: "面對一個強大但蠻不講理的敵人，你會？", options: ["正面迎擊，絕不退縮", "尋找破綻，一擊必殺", "嘗試交涉或用魔法牽制"] },
                    { question: "你認為這個世界最需要什麼？", options: ["絕對的力量與秩序", "自由與不受拘束的靈魂", "真理與慈悲"] },
                    { question: "如果你獲得一件神器，你希望它是？", options: ["無堅不摧的武器", "能隱匿無形的披風", "記載全知全能的古書"] },
                    { question: "當同伴陷入危機，而你可能也會喪命時？", options: ["毫不猶豫地衝上去擋刀", "冷靜計算，放棄拯救機率過低的對象", "祈求神明，犧牲自己也要救他"] }
                ],
                essayQuestion: "如果明天世界末日，且你只能拯救一個人，你會拯救誰？為什麼？"
            };
        }
    }

    // 階段二：根據回答鑑定職業
    static async determineJob(quizData: QuizData, mcqAnswers: number[], essayAnswer: string): Promise<SortingResult> {

        // 將使用者的回答與題目配對
        let QA_Context = "";
        for (let i = 0; i < 5; i++) {
            const q = quizData.mcqs[i];
            const chosenOption = q.options[mcqAnswers[i]];
            QA_Context += `Q${i+1}: ${q.question}\n玩家選擇: ${chosenOption}\n\n`;
        }
        QA_Context += `申論題: ${quizData.essayQuestion}\n玩家回答: ${essayAnswer}\n`;

        const prompt = `
你現在是${WORLD_SETTINGS.SORTING_HAT_PERSONA}。世界觀是：${WORLD_SETTINGS.WORLD_THEME}。
請根據這位玩家剛剛完成的「靈魂鑑定試卷」的回答，分析他的靈魂特質。

【玩家的作答紀錄】
${QA_Context}

任務：
1. 分析這些選擇與申論題所展現的性格。
2. 從以下可選職業中，為他挑選「最完美契合」的一個：
[${WORLD_SETTINGS.AVAILABLE_JOBS.join(', ')}]
3. 用一句充滿神祕感與哲理的話給予評語（大約 30-50 字以內，語氣要符合當前世界觀，直接對玩家說話，並點出他申論題回答的精髓）。

請嚴格遵守以下純文字格式輸出，絕對不要輸出 JSON：

[JOB]
選出的職業名稱

[COMMENTARY]
你的神祕評語
`;

        try {
            let text = await AIManager.generateContentSafe(DEFAULT_MODEL, prompt);

            
            const jobMatch = text.match(/\[JOB\]\n(.*)/i);
            const commentMatch = text.match(/\[COMMENTARY\]\n([\s\S]*)/i);

            const result: SortingResult = {
                job: jobMatch ? jobMatch[1].trim() : "平民",
                commentary: commentMatch ? commentMatch[1].trim() : "（命運的迷霧太過濃烈，我無法看清你的未來...）"
            };
            
            const validJobs = WORLD_SETTINGS.AVAILABLE_JOBS;
            // 防呆：如果 AI 輸出的職業不在清單內，給予預設值
            if (!validJobs.some(j => result.job.includes(j))) {
                result.job = validJobs[0] || '無職'; 
            } else {
                // 確保精確匹配
                result.job = validJobs.find(j => result.job.includes(j)) || validJobs[0];
            }
            return result;
        } catch (error) {
            console.error("Gemini 呼叫失敗:", error);
            throw new Error("水晶分類帽目前陷入沉睡，請稍後再試。");
        }
    }
}
