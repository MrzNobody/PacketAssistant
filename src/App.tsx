import React, { useState } from 'react';
import { 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Database, 
  LayoutDashboard, 
  ShieldAlert, 
  FileSearch,
  Zap,
  BarChart3,
  Clock,
  Globe,
  Download,
  Shield,
  Lock,
  AlertCircle,
  Volume2,
  MessageSquarePlus,
  X
} from 'lucide-react';

import { DropZone } from './components/DropZone';
import { IssueList } from './components/IssueList';
import { RegistrationTab } from './components/RegistrationTab';
import { MediaTab } from './components/MediaTab';
import { DetailPanel } from './components/DetailPanel';
import { LadderDiagram } from './components/LadderDiagram';

import { useAnalysisStore } from './store/useAnalysisStore';
import { BinaryParser } from './utils/BinaryParser';
import { SipParser } from './utils/parser';
import { SecurityDetector } from './utils/SecurityDetector';
import type { CaptureSession, SipDialog } from './types';

import './index.css';

// --- UI Components ---

const NavItem = ({ icon, label, active = false, count, onClick }: { icon: React.ReactNode, label: string, active?: boolean, count?: number, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer
      ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-white-5 hover:text-white'}
    `}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-blue-500' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
        {count}
      </span>
    )}
  </div>
);

const StatCard = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="flex-1 p-6 glass rounded-2xl space-y-2 border border-white-10 hover:border-blue-500/30 transition-all group">
    <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest m-0">{label}</p>
      <p className="text-2xl font-bold m-0 text-white">{value}</p>
    </div>
  </div>
);

const DialogRow = ({ dialog, onClick }: { dialog: SipDialog, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="p-4 glass rounded-2xl flex items-center justify-between border border-white-10 hover:border-blue-500/30 transition-all cursor-pointer group"
  >
    <div className="flex items-center space-x-6">
      <div className={`p-2 rounded-xl bg-opacity-10 ${dialog.status === 'completed' ? 'bg-green-500 text-green-500' : 'bg-blue-500 text-blue-500'}`}>
        <Activity size={18} />
      </div>
      <div>
        <p className="text-sm font-bold m-0 group-hover:text-blue-400 transition-colors">{(dialog.callId || 'Unknown').split('@')[0]}</p>
        <p className="text-xs text-slate-500 m-0 font-mono">{dialog.callId}</p>
      </div>
    </div>
    <div className="flex items-center space-x-8">
      <div className="text-right">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest m-0">Messages</p>
        <p className="text-sm font-medium m-0">{dialog.messages?.length || 0}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest m-0">Duration</p>
        <p className="text-sm font-medium m-0">{((dialog.endTime || 0) - (dialog.startTime || 0)).toFixed(1)}ms</p>
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-white-10 flex items-center justify-center text-[10px] font-bold">
        {dialog.healthScore || 100}
      </div>
    </div>
  </div>
);

// --- Main Application ---

function App() {
  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    addSession, 
    removeSession, 
    setSession, 
    selectedDialog, 
    setSelectedDialog, 
    activeTab, 
    setActiveTab 
  } = useAnalysisStore();

  const session = sessions.find(s => s.id === activeSessionId) || null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const messages = await BinaryParser.parsePcap(file);
      const dialogs = SipParser.correlate(messages);
      
      const endpoints = new Set<string>();
      messages.forEach(m => {
        endpoints.add(m.srcIp);
        endpoints.add(m.dstIp);
      });

      const newSession: CaptureSession = {
        id: Math.random().toString(36).substr(2, 9),
        filename: file.name,
        filesize: file.size,
        packetCount: messages.length, 
        sipMessageCount: messages.length,
        dialogs: dialogs,
        duration: dialogs.length > 0 ? (dialogs[0].endTime - dialogs[0].startTime) : 0,
        startTime: messages.length > 0 ? messages[0].timestamp : Date.now(),
        endTime: messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now(),
        endpoints: Array.from(endpoints),
        securityFindings: []
      };

      const securityFindings = SecurityDetector.analyze(newSession, messages);
      addSession({ ...newSession, securityFindings });

    } catch (e) {
      console.error('Processing error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportSession = () => {
    if (!session) return;
    const data = JSON.stringify(session, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.filename}_analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      {!sidebarCollapsed && (
        <aside className="sidebar">
          <div className="p-6 flex items-center space-x-4 border-b border-white-10">
            <div className="p-2 bg-blue-500-20 rounded-xl">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold m-0" style={{ fontFamily: 'var(--font-heading)' }}>PacketAssist</h1>
              <p className="text-xs text-slate-500 m-0 uppercase tracking-wider font-bold">SIP Analyzer</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-4">
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Navigation</p>
              <NavItem 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              />
              <NavItem 
                icon={<FileSearch size={20} />} 
                label="Ladder View" 
                active={activeTab === 'ladder'} 
                onClick={() => setActiveTab('ladder')}
              />
              <NavItem 
                icon={<ShieldAlert size={20} />} 
                label="Diagnostics" 
                active={activeTab === 'diagnostics'} 
                onClick={() => setActiveTab('diagnostics')}
                count={(session?.dialogs || []).reduce((acc, d) => acc + (d.issues?.length || 0), 0)} 
              />
              <NavItem icon={<Database size={20} />} label="Registrations" active={activeTab === 'registrations'} onClick={() => setActiveTab('registrations')} />
              <NavItem icon={<Volume2 size={20} />} label="Media" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
              <NavItem icon={<Shield size={20} />} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} count={session?.securityFindings?.length || 0} />
            </div>
          </nav>
          
          <div className="p-4 mx-4 mb-4 glass rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center">
              <Zap size={10} className="mr-1" /> Guide
            </p>
            <p className="text-xs text-slate-300 leading-relaxed m-0">
              Drag and drop <b>.pcap</b> or <b>.cap</b> files anywhere to begin analysis.
            </p>
          </div>

          <div className="p-4 border-t border-white-10">

            <NavItem icon={<Settings size={20} />} label="Settings" />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="main-content flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white-10 glass">
          <div className="flex items-center space-x-4 flex-1">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-white-5 rounded-lg transition-all">
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div className="h-4 w-px bg-white-10 mx-2" />
            <div className="flex items-center space-x-2 overflow-x-auto max-w-2xl px-2">
              {sessions.map(s => (
                <div key={s.id} onClick={() => setActiveSession(s.id)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${s.id === activeSessionId ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-white-5 border-white-10 text-slate-500 hover:text-slate-300'}`}>
                  <span className="text-xs font-medium">{s.filename}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeSession(s.id); }} className="hover:text-red-400 p-0.5"><X size={10} /></button>
                </div>
              ))}
              {sessions.length > 0 && (
                 <button onClick={() => setActiveSession('')} className="p-1.5 bg-white-5 border border-white-10 rounded-lg text-slate-500 hover:text-white"><MessageSquarePlus size={14} /></button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session && (
              <button onClick={exportSession} className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500-10 text-blue-400 rounded-lg border border-blue-500-10"><Download size={14} /><span className="text-xs font-bold">Export JSON</span></button>
            )}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500-10 rounded-full border border-green-500-20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-500">Engine Ready</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!session ? (
            <DropZone onFileSelect={handleFileSelect} />
          ) : activeTab === 'dashboard' ? (
            <div className="flex-1 overflow-auto p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Overview</h2>
                </div>
                <div className="flex gap-6">
                   <StatCard label="Packets" value={session.packetCount.toLocaleString()} icon={<Activity size={20} />} />
                   <StatCard label="SIP Msg" value={session.sipMessageCount.toLocaleString()} icon={<Zap size={20} />} />
                   <StatCard label="Dialogs" value={session.dialogs.length.toLocaleString()} icon={<LayoutDashboard size={20} />} />
                </div>
                <div className="space-y-4">
                  {session.dialogs.map(dialog => (
                    <DialogRow key={dialog.callId} dialog={dialog} onClick={() => { setSelectedDialog(dialog); setActiveTab('ladder'); }} />
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'ladder' ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedDialog ? <LadderDiagram dialog={selectedDialog} /> : <div className="p-20 text-center">Select a dialog</div>}
            </div>
          ) : activeTab === 'diagnostics' ? (
             <IssueList />
          ) : activeTab === 'registrations' ? (
             <RegistrationTab />
          ) : activeTab === 'media' ? (
             <MediaTab />
          ) : (
             <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">Security Findings</h2>
                {session.securityFindings.map(f => (
                  <div key={f.id} className="p-4 glass rounded-xl border border-red-500/20">
                    <h4 className="font-bold text-red-400">{f.type}</h4>
                    <p className="text-sm text-slate-400">{f.description}</p>
                  </div>
                ))}
             </div>
          )}
        </div>
      </main>

      {!rightPanelCollapsed && session && (
        <aside className="detail-panel">
          <DetailPanel />
        </aside>
      )}
    </div>
  );
}

export default App;
