import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '@shared/constants/events';
import { PageContainer } from '../common/PageContainer';
import { supabase } from '../../core/services/supabase';

interface QuizQuestion {
    question: string;
    options: string[];
}

interface QuizData {
    mcqs: QuizQuestion[];
    essayQuestion: string;
}

interface CharacterCreationPageProps {
    onCharacterCreated: () => void;
    onCancel: () => void;
}

export const CharacterCreationPage: React.FC<CharacterCreationPageProps> = ({ onCharacterCreated, onCancel }) => {
    const { socket } = useSocket();
    
    const [step, setStep] = useState<'intro' | 'loading_quiz' | 'quiz' | 'loading_result' | 'result'>('intro');
    
    // 表單與測驗資料
    const [name, setName] = useState('');
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState<number[]>([-1, -1, -1, -1, -1]);
    const [essayAnswer, setEssayAnswer] = useState('');
    
    // 結果資料
    const [sortingResult, setSortingResult] = useState<{job: string, commentary: string} | null>(null);
    
    // 狀態管理
    const [errorMsg, setErrorMsg] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!socket) return;

        const handleQuizReady = (response: any) => {
            if (response.success && response.quizData) {
                setQuizData(response.quizData);
                setStep('quiz');
                setErrorMsg('');
            } else {
                setStep('intro');
                setErrorMsg(response.error || '無法生成試卷，請稍後再試。');
            }
        };

        const handleSortingResponse = (response: any) => {
            if (response.success) {
                setSortingResult({
                    job: response.job,
                    commentary: response.commentary
                });
                setStep('result');
                setErrorMsg('');
            } else {
                setStep('quiz');
                setErrorMsg(response.error || '分類帽無法讀取你的靈魂...');
            }
        };

        socket.on(SOCKET_EVENTS.SORTING_HAT_QUIZ_READY, handleQuizReady);
        socket.on(SOCKET_EVENTS.SORTING_HAT_RESPONSE, handleSortingResponse);
        
        return () => {
            socket.off(SOCKET_EVENTS.SORTING_HAT_QUIZ_READY, handleQuizReady);
            socket.off(SOCKET_EVENTS.SORTING_HAT_RESPONSE, handleSortingResponse);
        };
    }, [socket]);

    const handleStartQuiz = () => {
        if (!name.trim()) {
            setErrorMsg('請先告訴我你在此世的名字。');
            return;
        }
        setErrorMsg('');
        setStep('loading_quiz');
        socket?.emit(SOCKET_EVENTS.SORTING_HAT_GET_QUIZ);
    };

    const handleSelectOption = (qIndex: number, optIndex: number) => {
        const newAnswers = [...mcqAnswers];
        newAnswers[qIndex] = optIndex;
        setMcqAnswers(newAnswers);
    };

    const handleSubmitQuiz = () => {
        if (mcqAnswers.includes(-1)) {
            setErrorMsg('請回答所有的選擇題。');
            return;
        }
        if (!essayAnswer.trim() || essayAnswer.length < 5) {
            setErrorMsg('請用心回答最後的申論題 (至少 5 個字)。');
            return;
        }

        setErrorMsg('');
        setStep('loading_result');
        socket?.emit(SOCKET_EVENTS.SORTING_HAT_REQUEST, {
            playerName: name,
            quizData,
            mcqAnswers,
            essayAnswer
        });
    };

    const handleConfirmAndSave = async () => {
        if (!sortingResult) return;
        setIsSaving(true);
        setErrorMsg('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('未登入');

            const { error } = await supabase.from('characters').insert([
                {
                    player_id: user.id,
                    name: name,
                    job: sortingResult.job,
                    strength: 10, dexterity: 10, intelligence: 10,
                    constitution: 10, charisma: 10, wisdom: 10,
                    max_hp: 100, current_hp: 100, level: 1, experience: 0
                }
            ]);

            if (error) throw error;
            onCharacterCreated();
        } catch (err: any) {
            console.error("保存角色失敗:", err);
            setErrorMsg(err.message || '創建角色失敗');
            setIsSaving(false);
        }
    };

    return (
        <PageContainer className="max-w-3xl mx-auto py-10">
            {errorMsg && (
                <div className="mb-6 p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded text-sm text-center animate-fade-in">
                    <i className="bi bi-exclamation-triangle mr-2"></i> {errorMsg}
                </div>
            )}

            {/* 階段 1: 輸入名字 */}
            {step === 'intro' && (
                <div className="bg-base-200/50 p-10 rounded-xl border border-[var(--primary-color)]/30 backdrop-blur-md shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.1)] text-center animate-fade-in">
                    <i className="bi bi-stars text-6xl text-[var(--primary-color)] mb-6 inline-block drop-shadow-[0_0_15px_var(--primary-color)] animate-pulse"></i>
                    <h1 className="text-4xl font-bold tracking-widest text-white mb-4">靈魂鑑定</h1>
                    <p className="text-[var(--secondary-text-color)] mb-8">古老的水晶分類帽將為你生成專屬的命運試卷。</p>
                    
                    <div className="max-w-xs mx-auto">
                        <label className="block text-[var(--secondary-text-color)] text-sm mb-2 text-left ml-1">你在此世的名字是？</label>
                        <input 
                            type="text" 
                            className="rpg-input w-full text-center text-xl py-3 mb-8" 
                            placeholder="輸入角色名稱..." 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                        <button className="rpg-btn bg-base-300 w-32" onClick={onCancel}>返回</button>
                        <button className="rpg-btn rpg-btn-primary w-48" onClick={handleStartQuiz}>
                            <i className="bi bi-magic mr-2"></i> 開始鑑定
                        </button>
                    </div>
                </div>
            )}

            {/* 階段 2: 讀取試卷中 */}
            {step === 'loading_quiz' && (
                <div className="text-center py-20 animate-fade-in">
                    <div className="inline-block relative">
                        <i className="bi bi-crystal text-6xl text-[var(--primary-color)] animate-pulse"></i>
                        <div className="absolute inset-0 bg-[var(--primary-color)] blur-2xl opacity-30 animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl text-white mt-8 mb-2 tracking-widest">水晶正在共鳴...</h2>
                    <p className="text-[var(--primary-color)] animate-pulse">為你編織專屬的命運試卷中</p>
                </div>
            )}

            {/* 階段 3: 作答試卷 (一題一題顯示) */}
            {step === 'quiz' && quizData && (
                <div className="space-y-8 animate-fade-in relative">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white tracking-widest mb-2"><i className="bi bi-journal-text text-[var(--primary-color)]"></i> 靈魂試卷</h2>
                        <p className="text-[var(--secondary-text-color)]">
                            {currentQuestionIndex < 5 ? `第 ${currentQuestionIndex + 1} 道靈魂拷問` : "最後的抉擇"}
                        </p>
                    </div>

                    <div className="bg-base-200/50 p-8 rounded-xl border border-[var(--primary-color)]/30 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.1)] min-h-[300px] flex flex-col justify-center">
                        {currentQuestionIndex < 5 ? (
                            // 單選題
                            <div className="animate-fade-in">
                                <h3 className="text-xl text-white mb-8 leading-relaxed">
                                    {quizData.mcqs[currentQuestionIndex].question}
                                </h3>
                                <div className="space-y-4">
                                    {quizData.mcqs[currentQuestionIndex].options.map((opt, optIndex) => (
                                        <button 
                                            key={optIndex}
                                            onClick={() => handleSelectOption(currentQuestionIndex, optIndex)}
                                            className={`w-full text-left p-5 rounded-lg border transition-all ${
                                                mcqAnswers[currentQuestionIndex] === optIndex 
                                                ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)] text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.3)] transform scale-[1.02]' 
                                                : 'bg-base-300/50 border-white/5 text-[var(--secondary-text-color)] hover:border-white/20 hover:text-white hover:bg-base-300'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // 申論題
                            <div className="animate-fade-in">
                                <h3 className="text-xl text-[var(--primary-color)] font-bold mb-6">
                                    <i className="bi bi-pen mr-2"></i> {quizData.essayQuestion}
                                </h3>
                                <textarea 
                                    className="rpg-input w-full h-40 resize-none text-lg leading-relaxed p-4" 
                                    placeholder="誠實地寫下你的答案，分類帽正在聆聽你的心聲..." 
                                    value={essayAnswer}
                                    onChange={(e) => setEssayAnswer(e.target.value)}
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-6">
                        {currentQuestionIndex > 0 ? (
                            <button 
                                className="rpg-btn bg-base-300 px-8" 
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                <i className="bi bi-arrow-left"></i> 上一題
                            </button>
                        ) : (
                            <button className="rpg-btn bg-base-300 px-8" onClick={() => setStep('intro')}>
                                放棄作答
                            </button>
                        )}

                        {currentQuestionIndex < 5 ? (
                            <button 
                                className={`rpg-btn rpg-btn-primary px-10 ${mcqAnswers[currentQuestionIndex] === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => {
                                    if (mcqAnswers[currentQuestionIndex] !== -1) {
                                        setCurrentQuestionIndex(prev => prev + 1);
                                    }
                                }}
                                disabled={mcqAnswers[currentQuestionIndex] === -1}
                            >
                                銘刻選擇 <i className="bi bi-arrow-right"></i>
                            </button>
                        ) : (
                            <button 
                                className={`rpg-btn rpg-btn-primary px-12 ${essayAnswer.trim().length < 5 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                onClick={handleSubmitQuiz}
                                disabled={essayAnswer.trim().length < 5}
                            >
                                <i className="bi bi-send-check"></i> 提交試卷
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 階段 4: 解讀結果中 */}
            {step === 'loading_result' && (
                <div className="text-center py-20 animate-fade-in">
                    <div className="inline-block relative">
                        <i className="bi bi-eye text-6xl text-[var(--primary-color)] animate-pulse"></i>
                        <div className="absolute inset-0 bg-[var(--primary-color)] blur-2xl opacity-30 animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl text-white mt-8 mb-2 tracking-widest">水晶正在解讀你的靈魂...</h2>
                    <p className="text-[var(--primary-color)] animate-pulse">正在為你尋找最契合的命運之路</p>
                </div>
            )}

            {/* 階段 5: 顯示結果 */}
            {step === 'result' && sortingResult && (
                <div className="bg-base-200/50 p-10 rounded-xl border border-[var(--primary-color)] shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.2)] text-center animate-fade-in mt-10">
                    <h2 className="text-xl text-[var(--secondary-text-color)] mb-2">水晶的共鳴顯示...</h2>
                    
                    <div className="my-8 py-8 border-y border-white/10 relative">
                        <div className="absolute inset-0 bg-[var(--primary-color)]/5 blur-xl"></div>
                        <h1 className="text-6xl font-black text-white tracking-widest drop-shadow-[0_0_20px_var(--primary-color)]">
                            {sortingResult.job}
                        </h1>
                    </div>

                    <div className="mb-10 text-xl italic text-[var(--secondary-text-color)] leading-loose px-6">
                        「{sortingResult.commentary}」
                    </div>

                    <button 
                        className={`rpg-btn rpg-btn-primary w-full text-xl py-4 shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)] ${isSaving ? 'opacity-50' : ''}`}
                        onClick={handleConfirmAndSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <span className="loading loading-spinner"></span> : <><i className="bi bi-check2-circle"></i> 踏上旅程</>}
                    </button>
                </div>
            )}
        </PageContainer>
    );
};
