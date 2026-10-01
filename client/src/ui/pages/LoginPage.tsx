import React, { useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { PageContainer } from '../common/PageContainer';

interface LoginPageProps {
    onLogin: () => void;
    onGoToRegister: () => void;
    onGoToForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToRegister, onGoToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorMsg('請輸入電子郵件與密碼');
            return;
        }
        
        setLoading(true);
        setErrorMsg('');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            // 登入成功
            onLogin();
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // 如果需要自動重新導向可以設定 redirectTo
            }
        });
        
        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        }
    };

    return (
        <PageContainer className="max-w-md mx-auto text-center pt-8">
            <h1 className="text-3xl font-bold text-[var(--primary-color)] tracking-widest mb-2">
                <i className="bi bi-box-arrow-in-right"></i> 會員登入
            </h1>
            <p className="text-[var(--secondary-text-color)] mb-8 text-sm">請輸入您的帳號密碼以進入遊戲</p>

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
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-[var(--secondary-text-color)] text-sm ml-2"><i className="bi bi-key"></i> 密碼</label>
                        <button 
                            className="text-xs text-[var(--primary-color)] hover:underline mr-2"
                            onClick={onGoToForgotPassword}
                        >
                            忘記密碼？
                        </button>
                    </div>
                    <input 
                        type="password" 
                        className="rpg-input w-full" 
                        placeholder="輸入密碼..." 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                </div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
                <button 
                    className={`rpg-btn rpg-btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : <><i className="bi bi-check2-circle"></i> 登入</>}
                </button>
                <button className="rpg-btn w-full" onClick={onGoToRegister} disabled={loading}>
                    <i className="bi bi-person-plus"></i> 註冊新帳號
                </button>
            </div>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--primary-color)] opacity-30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-[var(--secondary-text-color)]" style={{ backgroundColor: 'var(--background-color)' }}>或使用第三方登入</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button 
                        className={`rpg-btn w-full flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{ borderColor: '#ea4335' }}
                    >
                        <i className="bi bi-google text-[#ea4335]"></i> Google 快速登入
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
