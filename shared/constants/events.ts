export const SOCKET_EVENTS = {
    // 系統
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    
    // 房間/單局
    JOIN_RUN: 'join_run',
    RUN_UPDATE: 'run_update',
    
    // TRPG 核心
    TRIGGER_ENCOUNTER: 'encounter:trigger',
    ROLL_DICE: 'encounter:roll',
    RESOLVE_ENCOUNTER: 'encounter:resolve',
    
    // 分類帽系統
    SORTING_HAT_GET_QUIZ: 'sorting:get_quiz',
    SORTING_HAT_QUIZ_READY: 'sorting:quiz_ready',
    SORTING_HAT_REQUEST: 'sorting:request',
    SORTING_HAT_RESPONSE: 'sorting:response',
    
    // LLM
    LLM_CHAT_REQUEST: 'llm_chat_request',
    LLM_CHAT_RESPONSE: 'llm_chat_response',

    // TRPG AI
    TRPG_ACTION_REQUEST: 'trpg_action_request',
    TRPG_ACTION_RESPONSE: 'trpg_action_response'
} as const;
