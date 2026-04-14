import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { ShieldCheck, ShieldX, Clock } from 'lucide-react';

export const RegistrationTab: React.FC = () => {
  const { session } = useAnalysisStore();
  
  if (!session) return null;

  const registrations = session.dialogs.filter(d => 
    d.messages.some(m => m.method === 'REGISTER')
  );

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Registration Health</h2>
        <div className="px-4 py-2 glass rounded-xl text-sm font-medium">
          {registrations.length} Active Binding(s)
        </div>
      </div>

      <div className="grid gap-4">
        {registrations.length > 0 ? registrations.map(reg => {
          const lastMsg = reg.messages[reg.messages.length - 1];
          const isSuccess = lastMsg.code === 200;
          
          return (
            <div key={reg.callId} className="p-6 glass rounded-2xl flex items-center justify-between border border-white-10">
              <div className="flex items-center space-x-6">
                <div className={`p-3 rounded-full ${isSuccess ? 'bg-green-500-10 text-green-500' : 'bg-red-500-10 text-red-500'}`}>
                  {isSuccess ? <ShieldCheck size={24} /> : <ShieldX size={24} />}
                </div>
                <div>
                  <p className="text-lg font-bold m-0">{reg.callId.split('@')[0]}</p>
                  <p className="text-xs text-slate-500 m-0 font-mono">{reg.callId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-12">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest m-0">Status</p>
                  <p className={`text-sm font-bold m-0 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    {lastMsg.code || 'Pending'} {isSuccess ? 'Registered' : 'Failed'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest m-0">Last Active</p>
                  <p className="text-sm font-medium m-0 flex items-center justify-end space-x-1">
                    <Clock size={14} className="text-slate-500" />
                    <span>{new Date(reg.endTime).toLocaleTimeString()}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-20 glass rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <ShieldCheck size={64} className="text-slate-700" />
            <p className="text-slate-500">No REGISTER traffic found in this capture.</p>
          </div>
        )}
      </div>
    </div>
  );
};
