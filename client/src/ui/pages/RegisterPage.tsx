import React, { useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { PageContainer } from '../common/PageContainer';
import { BackButton } from '../common/BackButton';

interface RegisterPageProps {
    onRegisterSuccess: () => void;
    onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !username || !confirmPassword) {
            setErrorMsg('請填寫所有欄位');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('兩次輸入的密碼不一致');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        // Supabase 會自動處理密碼雜湊，前端不需要也不應該手動 Hash
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username // 將玩家暱稱存入 metadata，稍後可以用 Trigger 寫入 profiles
                }
            }
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else if (data?.user?.identities?.length === 0) {
            // Supabase 防呆機制：如果 identities 是空的，代表信箱其實已經存在了！
            setErrorMsg('此信箱已經註冊過了！如果您曾用 Google 登入，請直接點擊 Google 登入。');
        } else if (!data.session) {
            // 代表 Supabase 啟用了「強制信箱驗證」
            setErrorMsg('註冊成功！但您必須先去信箱點擊驗證信，才能登入遊戲。');
        } else {
            // 註冊成功且擁有 Session
            onRegisterSuccess();
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        
        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        }
    };

    return (
        <PageContainer className="max-w-md mx-auto text-center">
            <BackButton onClick={onBackToLogin} label="返回登入" />
            
            <h1 className="text-3xl font-bold text-[var(--primary-color)] tracking-widest mb-2">
                <i className="bi bi-person-plus"></i> 註冊帳號
            </h1>
            <p className="text-[var(--secondary-text-color)] mb-8 text-sm">建立一個新帳號來儲存您的遊戲進度</p>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded text-sm text-left">
                    <i className="bi bi-exclamation-triangle mr-2"></i> {errorMsg}
                </div>
            )}

            <div className="space-y-6 text-left">
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-envelope"></i> 電子郵件</label>
                    <input 
                        type="email" 
                        className="rpg-input w-full" 
                        placeholder="輸入電子郵件..." 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-person"></i> 玩家暱稱</label>
                    <input 
                        type="text" 
                        className="rpg-input w-full" 
                        placeholder="輸入遊戲內的暱稱..." 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-key"></i> 密碼</label>
                    <input 
                        type="password" 
                        className="rpg-input w-full" 
                        placeholder="設定密碼 (至少 6 碼)..." 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-key-fill"></i> 確認密碼</label>
                    <input 
                        type="password" 
                        className="rpg-input w-full" 
                        placeholder="再次輸入密碼..." 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                </div>
            </div>

            <div className="mt-10">
                <button 
                    className={`rpg-btn rpg-btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : <><i className="bi bi-check-circle"></i> 確認註冊並登入</>}
                </button>
            </div>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--primary-color)] opacity-30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-[var(--secondary-text-color)]" style={{ backgroundColor: 'var(--background-color)' }}>或使用第三方註冊</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button 
                        className={`rpg-btn w-full flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{ borderColor: '#ea4335' }}
                    >
                        <i className="bi bi-google text-[#ea4335]"></i> Google 快速註冊
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
