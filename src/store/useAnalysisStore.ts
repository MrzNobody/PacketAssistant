import { create } from 'zustand';
import type { CaptureSession, SipDialog, SipMessage } from '../types';


interface AnalysisStore {
  session: CaptureSession | null;
  sessions: CaptureSession[];
  activeSessionId: string | null;

  selectedDialog: SipDialog | null;
  selectedMessage: SipMessage | null;
  filters: {
    methods: string[];
    ipVersion: 4 | 6 | 'both';
    searchTerm: string;
  };
  activeTab: 'dashboard' | 'ladder' | 'diagnostics' | 'registrations' | 'security';

  
  setSessions: (sessions: CaptureSession[]) => void;
  setActiveSession: (id: string) => void;
  addSession: (session: CaptureSession) => void;
  removeSession: (id: string) => void;
  setSession: (session: CaptureSession | null) => void;
  setSelectedDialog: (dialog: SipDialog | null) => void;
  setSelectedMessage: (message: SipMessage | null) => void;
  setFilters: (filters: Partial<AnalysisStore['filters']>) => void;
  setActiveTab: (tab: AnalysisStore['activeTab']) => void;
}



export const useAnalysisStore = create<AnalysisStore>((set) => ({
  session: null,
  selectedDialog: null,
  selectedMessage: null,
  filters: {
    methods: [],
    searchTerm: '',
  },
  activeTab: 'dashboard',
  sessions: [],
  activeSessionId: null,

  setSessions: (sessions) => set({ sessions }),
  setActiveSession: (id) => set({ activeSessionId: id, selectedDialog: null, selectedMessage: null }),
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session],
    activeSessionId: session.id,
    activeTab: 'dashboard'
  })),
  removeSession: (id) => set((state) => {
    const sessions = state.sessions.filter(s => s.id !== id);
    const activeSessionId = state.activeSessionId === id ? (sessions[0]?.id || null) : state.activeSessionId;
    return { sessions, activeSessionId };
  }),
  setSession: (session) => {
    if (session) {
      set((state) => ({ 
        sessions: [...state.sessions, session], 
        activeSessionId: session.id,
        selectedDialog: null, 
        selectedMessage: null, 
        activeTab: 'dashboard' 
      }));
    } else {
      set({ sessions: [], activeSessionId: null });
    }
  },
  setSelectedDialog: (dialog) => set({ selectedDialog: dialog, selectedMessage: null }),
  setSelectedMessage: (message) => set({ selectedMessage: message }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setActiveTab: (activeTab) => set({ activeTab }),
}));


