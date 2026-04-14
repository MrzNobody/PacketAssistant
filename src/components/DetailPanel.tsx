import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { Terminal, Info, Globe, Cpu, X, Copy, MessageSquarePlus, Trash2 } from 'lucide-react';


export const DetailPanel: React.FC = () => {
  const { selectedMessage, setSelectedMessage, session, setSession } = useAnalysisStore();
  const [noteText, setNoteText] = React.useState('');


  if (!selectedMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
        <Info size={48} className="text-slate-700" />
        <p className="text-sm text-slate-500 italic">Select a message in the ladder diagram to view its full details.</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.raw);
    }
  };

  const addAnnotation = () => {
    if (!noteText.trim() || !selectedMessage || !session) return;
    
    const newAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      text: noteText,
      author: 'Engineer',
      severity: 'note' as const,
      timestamp: Date.now(),
    };

    const updatedSession = { ...session };
    // Find message in depth
    updatedSession.dialogs.forEach(d => {
      d.messages.forEach(m => {
        if (m.id === selectedMessage.id) {
          m.annotations = [...(m.annotations || []), newAnnotation];
        }
      });
    });

    setSession(updatedSession);
    setNoteText('');
  };

  const deleteAnnotation = (id: string) => {
     if (!selectedMessage || !session) return;
     const updatedSession = { ...session };
     updatedSession.dialogs.forEach(d => {
       d.messages.forEach(m => {
         if (m.id === selectedMessage.id) {
           m.annotations = m.annotations.filter(a => a.id !== id);
         }
       });
     });
     setSession(updatedSession);
  };


  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-white-10 flex items-center justify-between glass">
        <div className="flex items-center space-x-2">
          <Terminal size={18} className="text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 m-0">Packet Inspector</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={copyToClipboard} className="p-1.5 hover:bg-white-5 rounded transition-all text-slate-400 hover:text-white" title="Copy Raw Text">
            <Copy size={16} />
          </button>
          <button onClick={() => setSelectedMessage(null)} className="p-1.5 hover:bg-white-5 rounded transition-all text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetaItem icon={<Globe size={14} />} label="Source" value={`${selectedMessage.srcIp}:${selectedMessage.srcPort}`} />
          <MetaItem icon={<Globe size={14} />} label="Destination" value={`${selectedMessage.dstIp}:${selectedMessage.dstPort}`} />
          <MetaItem icon={<Cpu size={14} />} label="Transport" value={selectedMessage.transport} />
          <MetaItem icon={<Terminal size={14} />} label="IP Ver" value={`IPv${selectedMessage.ipVersion}`} />
        </div>

        {/* SIP Headers */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Attributes</p>
          <div className="p-3 bg-black/30 rounded-xl border border-white-5 space-y-2 font-mono text-[11px]">
             <div className="flex justify-between">
               <span className="text-slate-500">Method:</span>
               <span className="text-blue-400">{selectedMessage.method}</span>
             </div>
             {selectedMessage.code && (
               <div className="flex justify-between">
                 <span className="text-slate-500">Status Code:</span>
                 <span className={selectedMessage.code >= 300 ? 'text-red-400' : 'text-green-400'}>{selectedMessage.code}</span>
               </div>
             )}
             <div className="flex justify-between">
               <span className="text-slate-500">Call-ID:</span>
               <span className="text-slate-300 truncate ml-4" title={selectedMessage.callId}>{selectedMessage.callId}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-500">CSeq:</span>
               <span className="text-slate-300">{selectedMessage.cseq}</span>
             </div>
          </div>
        </div>

        {/* SDP Panel */}
        {selectedMessage.sdp && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session Description (SDP)</p>
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-3">
               <div>
                  <p className="text-[10px] text-slate-500 mb-1">Connection Address</p>
                  <p className="text-xs font-bold text-blue-300">{selectedMessage.sdp.connectionAddress}</p>
               </div>
               <div className="space-y-2">
                 {selectedMessage.sdp.media.map((m, i) => (
                   <div key={i} className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 capitalize">{m.type} ({m.port})</span>
                     <div className="flex space-x-1">
                        {m.codecs.slice(0, 3).map((c, j) => (
                          <span key={j} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold">{c}</span>
                        ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Annotations Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annotations</p>
          
          <div className="space-y-2">
            {selectedMessage.annotations?.map(ann => (
              <div key={ann.id} className="p-3 bg-white-5 rounded-xl border border-white-5 relative group/ann">
                <button 
                  onClick={() => deleteAnnotation(ann.id)}
                  className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover/ann:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[9px] font-bold text-blue-400">{ann.author}</span>
                  <span className="text-[9px] text-slate-600">{new Date(ann.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-300 m-0">{ann.text}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Add a note..." 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
              className="flex-1 bg-black/30 border border-white-10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-blue-500/50 outline-none"
            />
            <button 
              onClick={addAnnotation}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
            >
              <MessageSquarePlus size={16} />
            </button>
          </div>
        </div>

        {/* Raw View */}

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Raw SIP Message</p>
          <pre className="p-4 bg-black/50 rounded-xl overflow-auto text-[10px] leading-relaxed font-mono text-slate-400 border border-white-5">
            {selectedMessage.raw}
          </pre>
        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-2.5 bg-white-5 rounded-lg border border-white-5">
    <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-xs font-bold text-slate-300 m-0 truncate">{value}</p>
  </div>
);
