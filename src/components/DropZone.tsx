import React, { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pcap') || file.name.endsWith('.pcapng') || file.name.endsWith('.cap')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-12">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <div className="flex flex-col items-center space-y-12 w-full max-w-4xl">
            {/* Branding Header */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center space-y-4"
            >
              <div className="relative inline-block">
                <img 
                  src="/logo.png" 
                  alt="PacketAssist Logo" 
                  className="w-32 h-32 rounded-3xl shadow-2xl ring-1 ring-white/10"
                />

                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">PacketAssist</h1>
                <p className="text-slate-400 text-lg">Next-Gen SIP Traffic Flow Analyzer</p>
              </div>
            </motion.div>

            {/* Drop Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative w-full aspect-video flex flex-col items-center justify-center
                border-2 border-dashed rounded-[2.5rem] transition-all duration-300
                ${isDragActive ? 'border-blue-500 bg-blue-500-10 shadow-lg shadow-blue-500/10' : 'border-white-10 bg-white-5 hover:border-white-20'}
                cursor-pointer group
              `}
            >
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileInput}
                accept=".pcap,.pcapng,.cap"
              />
              
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className={`p-6 rounded-3xl bg-white-5 transition-all duration-500 ${isDragActive ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`}>
                  <Upload className="w-12 h-12 text-blue-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Drag and drop or browse for packet capture</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Upload your capture files to begin deep packet inspection and SIP flow analysis.
                  </p>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                    Select File
                  </button>
                </div>
                <div className="flex items-center justify-center space-x-3 mt-4">
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mr-2">Formats:</p>
                   <span className="px-3 py-1 bg-white-5 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">.pcap</span>
                   <span className="px-3 py-1 bg-white-5 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">.pcapng</span>
                   <span className="px-3 py-1 bg-white-5 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">.cap</span>
                </div>

              </div>
            </motion.div>
          </div>

        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-6 glass rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500-20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate m-0">{selectedFile.name}</p>
                <p className="text-xs text-slate-400 m-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-full transition-all hover:bg-white-5"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
