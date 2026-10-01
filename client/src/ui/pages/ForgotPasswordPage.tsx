import React, { useState } from 'react';
import { supabase } from '../../core/services/supabase';
import { PageContainer } from '../common/PageContainer';
import { BackButton } from '../common/BackButton';

interface ForgotPasswordPageProps {
    onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleResetPassword = async () => {
        if (!email) {
            setErrorMsg('請輸入電子郵件');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            setMessage('密碼重置信已寄出！請前往您的信箱收信，並點擊信中的連結來重設密碼。');
        }
    };

    return (
        <PageContainer className="max-w-md mx-auto text-center">
            <BackButton onClick={onBackToLogin} label="返回登入" />
            
            <h1 className="text-3xl font-bold text-[var(--primary-color)] tracking-widest mb-2">
                <i className="bi bi-unlock"></i> 忘記密碼
            </h1>
            <p className="text-[var(--secondary-text-color)] mb-8 text-sm">輸入您的註冊信箱，我們將寄送重置密碼的連結給您。</p>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-900/50 text-red-200 border border-red-500/50 rounded text-sm text-left">
                    <i className="bi bi-exclamation-triangle mr-2"></i> {errorMsg}
                </div>
            )}

            {message && (
                <div className="mb-4 p-3 bg-green-900/50 text-green-200 border border-green-500/50 rounded text-sm text-left">
                    <i className="bi bi-envelope-check mr-2"></i> {message}
                </div>
            )}

            <div className="space-y-6 text-left">
                <div>
                    <label className="block text-[var(--secondary-text-color)] text-sm mb-1 ml-2"><i className="bi bi-envelope"></i> 電子郵件</label>
                    <input 
                        type="email" 
                        className="rpg-input w-full" 
                        placeholder="輸入註冊時的電子郵件..." 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    />
                </div>
            </div>

            <div className="mt-10">
                <button 
                    className={`rpg-btn rpg-btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleResetPassword}
                    disabled={loading || !!message}
                >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : <><i className="bi bi-send"></i> 發送重置信</>}
                </button>
            </div>
        </PageContainer>
    );
};
