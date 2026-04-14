import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const IssueList: React.FC = () => {
  const { session, setSelectedDialog, setActiveTab } = useAnalysisStore() as any;
  
  if (!session) return null;

  const allIssues = session.dialogs.flatMap((d: any) => d.issues);

  if (allIssues.length === 0) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold">No Issues Detected</h3>
        <p className="text-slate-400">All analyzed dialogs appear healthy.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Diagnostic Findings</h2>
      <div className="grid gap-4">
        {allIssues.map((issue: any) => (
          <motion.div 
            key={issue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-2xl border flex items-start space-x-4 glass ${
              issue.severity === 'critical' ? 'border-red-500/30' : 
              issue.severity === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30'
            }`}
          >
            <div className={`mt-1 ${
              issue.severity === 'critical' ? 'text-red-500' : 
              issue.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
            }`}>
              {issue.severity === 'critical' ? <AlertCircle size={24} /> : 
               issue.severity === 'warning' ? <AlertTriangle size={24} /> : <Info size={24} />}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold m-0">{issue.title}</h4>
                <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  issue.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 
                  issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {issue.severity}
                </div>
              </div>
              <p className="text-sm text-slate-300">{issue.description}</p>
              
              <div className="pt-4 flex items-center justify-between border-t border-white-5">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-400">REC:</span>
                  <span>{issue.recommendation}</span>
                </div>
                <button 
                  onClick={() => {
                    const dialog = session.dialogs.find((d: any) => d.callId === issue.callId);
                    if (dialog) {
                      setSelectedDialog(dialog);
                      setActiveTab('ladder');
                    }
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>View Flow</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ShieldCheck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
