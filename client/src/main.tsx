import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SOCKET_EVENTS } from '@shared/constants/events';

import { getSocket } from './hooks/useSocket';

// 初始化 Socket
const socket = getSocket();

socket.on('connect', () => {
    console.log('[Weaver] Connected to Destiny Matrix');
    socket.emit(SOCKET_EVENTS.JOIN_RUN, { runId: 'test-run-001' });
});

/**
 * 初始化 React UI 層
 */
const initUI = () => {
    const uiRoot = document.getElementById('ui-root');
    if (uiRoot) {
        const root = ReactDOM.createRoot(uiRoot);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
};

// 直接啟動 UI
window.addEventListener('load', () => {
    initUI();
});
