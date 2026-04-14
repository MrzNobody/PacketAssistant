import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { Music, Play, Pause, Download, Volume2 } from 'lucide-react';

export const MediaTab: React.FC = () => {
  const { session } = useAnalysisStore();
  
  if (!session) return null;

  // Derive RTP streams from SDP connection addresses and ports
  const streams = session.dialogs.flatMap(d => {
    const invite = d.messages.find(m => m.method === 'INVITE');
    if (!invite?.sdp) return [];

    return invite.sdp.media.map(m => ({
      callId: d.callId,
      type: m.type,
      codec: m.codecs[0],
      address: invite.sdp?.connectionAddress,
      port: m.port,
      status: 'Ready'
    }));
  });

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Media Streams</h2>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500-10 text-blue-400 rounded-full border border-blue-500-20">
          <Volume2 size={14} />
          <span className="text-xs font-bold">{streams.length} Stream(s) Detected</span>
        </div>
      </div>

      <div className="grid gap-4">
        {streams.length > 0 ? streams.map((stream, i) => (
          <div key={i} className="p-6 glass rounded-2xl border border-white-10 flex items-center justify-between group">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-blue-500-10 text-blue-400 rounded-xl">
                <Music size={24} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-white-5 rounded text-[10px] font-bold uppercase text-slate-400">{stream.type}</span>
                  <p className="text-lg font-bold m-0">{stream.codec}</p>
                </div>
                <p className="text-xs text-slate-500 m-0 font-mono">{stream.address}:{stream.port}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                <Play size={16} fill="currentColor" />
                <span>Play Stream</span>
              </button>
              <button className="p-2 bg-white-5 text-slate-400 rounded-xl hover:text-white transition-all border border-transparent hover:border-white-10">
                <Download size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="p-20 glass rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-slate-800/30 rounded-full text-slate-700">
               <Volume2 size={48} />
            </div>
            <div>
               <h3 className="text-xl font-bold">No Media Negotiated</h3>
               <p className="text-slate-500 max-w-sm">No SDP media descriptions were found in the current sessions. Audio playback is unavailable.</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio Engine Overlay (Mock for Phase 5.1) */}
      {streams.length > 0 && (
        <div className="mt-12 p-8 border-2 border-dashed border-white-10 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">RTP Audio Engine (Alpha)</p>
          <div className="w-full h-24 bg-black/40 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white-5">
             {/* Waveform Visualization Mock */}
             <div className="flex items-end space-x-1 h-12">
                {[...Array(40)].map((_, i) => (
                  <div key={i} className="w-1 bg-blue-500/30 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <p className="text-sm font-bold text-blue-400">Audio Payload Decoding requires G.711 / PCAP enrichment</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
