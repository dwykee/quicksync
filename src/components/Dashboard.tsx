import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DragEvent } from 'react';
import { NeoButton } from './NeoButton';
import { NeoCard } from './NeoCard';
import { TransferCard, type TransferItem } from './TransferCard';
import { useWebRTC } from '../hooks/useWebRTC';
import { useCloudVault } from '../hooks/useCloudVault';
import { Send, UploadCloud, Unplug, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showId, setShowId] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'error' }[]>([]);
  const navigate = useNavigate();

  const {
    connected,
    peerId,
    remotePeerId,
    setRemotePeerId,
    connectToPeer,
    sendMessage,
    sendFile,
    receivedItems
  } = useWebRTC(user?.uid);

  const {
    historyItems,
    storageUsed,
    storageLimit,
    saveTextToHistory,
    saveFileToVault,
    deleteFromHistory,
    isUploading,
  } = useCloudVault(user?.uid);

  // Auto-save received items to Cloud Vault
  const savedIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!user || receivedItems.length === 0) return;

    // Save all items that haven't been saved yet
    receivedItems.forEach(async (item) => {
      if (savedIdsRef.current.has(item.id)) return;
      savedIdsRef.current.add(item.id);

      try {
        if (item.type === 'text') {
          await saveTextToHistory(item.content, item.sender);
        } else if (item.type === 'file' && item.blob) {
          const success = await saveFileToVault(item.blob, item.content, item.sender);
          if (!success) throw new Error('Upload failed');
        }
      } catch (err) {
        const id = Math.random().toString();
        setToasts(prev => [...prev, { id, message: `Failed to sync ${item.content} to cloud`, type: 'error' }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
      }
    });
  }, [receivedItems, user, saveTextToHistory, saveFileToVault]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/');
      } else {
        // Load user data from DB
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.linkedDevices) setTrustedDevices(data.linkedDevices);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, setRemotePeerId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendText = () => {
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  // Wrap sendFile to also upload to Cloud Vault
  const handleSendFile = useCallback(async (file: File) => {
    sendFile(file);
  }, [sendFile]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        handleSendFile(file);
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        handleSendFile(file);
      });
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = (item: TransferItem) => {
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.content;
      a.click();
    }
  };

  // Separate files and text for display
  const myItems = receivedItems.filter(item => item.sender === 'me');
  const peerItems = receivedItems.filter(item => item.sender === 'peer');

  const textItems = receivedItems.filter(item => item.type === 'text');
  const myFileItems = myItems.filter(item => item.type === 'file');
  const receivedFileItems = peerItems.filter(item => item.type === 'file');

  const handleConnect = async () => {
    if (!remotePeerId) return;
    connectToPeer();
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const newDevices = Array.from(new Set([...trustedDevices, remotePeerId]));
      await setDoc(userRef, {
        lastPeerId: remotePeerId,
        linkedDevices: newDevices
      }, { merge: true });
      setTrustedDevices(newDevices);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] text-slate-800 font-sans p-4 md:p-8 lg:p-12 selection:bg-accent selection:text-white relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="fixed -top-24 -left-24 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed top-1/2 -right-24 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-24 left-1/3 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Browser Mockup Container */}
      <div className="relative z-10 max-w-7xl mx-auto md:bg-white/40 md:backdrop-blur-3xl md:rounded-[2.5rem] md:border md:border-white/50 md:shadow-2xl md:shadow-accent/5 overflow-hidden">

        {/* Browser Top Bar (Traffic Lights) */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/20">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm"></div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-slate-900/5 border border-slate-900/10 overflow-hidden hover:bg-slate-900/10 transition-all flex-shrink-0"
            title="Profile"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
            )}
          </button>
        </div>
        {/* Dashboard Content */}
        <div className="px-2 py-8 md:px-6 lg:px-10 md:pb-8">
          {/* Internal Header / Info Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workspace</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <div
                  onClick={() => setShowId(!showId)}
                  className="flex items-center gap-2 cursor-pointer px-3 py-1 transition-all"
                  title={showId ? "Hide ID" : "Show ID"}
                >
                  <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">
                    ID: {showId ? peerId : "Tap to reveal"}
                  </span>
                </div>
                <button
                  onClick={() => setShowQR(true)}
                  className="ml-1 p-1.5 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors text-accent flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-lg">qr_code_2</span>
                  <span className="text-[10px] font-bold uppercase">QR</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex flex-grow items-center gap-2 bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                <input
                  type="text"
                  placeholder="Remote ID"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                  className="bg-transparent border-none px-5 py-2 text-sm outline-none w-full md:w-40 font-medium text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={handleConnect}
                  className="text-slate-900 px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 shrink-0"
                >
                  Connect
                </button>
              </div>

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${connected ? 'bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100' : 'bg-white text-slate-300 border border-slate-100'}`}
                title={connected ? "Connected" : "Disconnected"}
              >
                <span className={`material-symbols-outlined text-xl ${connected ? 'animate-pulse' : ''}`}>
                  {connected ? 'sensors' : 'sensors_off'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Interaction Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {/* Clipboard Card - Inspired by Left Reference Image */}
            <div className="bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 p-8 flex flex-col h-[500px] shadow-sm hover:shadow-soft transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">content_paste</span>
              </div>

              <div className="flex-grow overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Clipboard Stream</h3>

                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    placeholder="Type or paste..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    className="flex-grow bg-white border border-slate-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm min-w-0"
                  />
                  <button 
                    onClick={handleSendText} 
                    className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center hover:shadow-lg transition-all shrink-0 aspect-square"
                  >
                    <Send size={20} className="mr-0.5 mt-0.5" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {textItems.length === 0 ? (
                    <div className="h-full flex flex-col justify-center space-y-2 opacity-20">
                      <div className="w-3/4 h-2 bg-slate-400 rounded-full"></div>
                      <div className="w-1/2 h-2 bg-slate-400 rounded-full"></div>
                      <div className="w-5/6 h-2 bg-slate-400 rounded-full"></div>
                    </div>
                  ) : (
                    textItems.map(item => (
                      <TransferCard key={item.id} item={item} onCopy={handleCopy} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Signal Card - Inspired by Right Reference Image */}
            <div className="bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-[500px] group shadow-sm hover:shadow-soft transition-all">
              {/* Pulsing Ripple Background */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <div className="w-64 h-64 bg-accent/5 rounded-full animate-[ping_3s_infinite] opacity-50"></div>
                <div className="w-96 h-96 bg-accent/5 rounded-full animate-[ping_4s_infinite] opacity-30"></div>
              </div>

              <div className="relative z-10 flex flex-col items-center cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 bg-white shadow-soft-lg rounded-[2rem] border border-slate-100 flex items-center justify-center text-accent mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-4xl">wifi_tethering</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Files</h3>
                <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
                  {isDragging ? 'Drop it now!' : 'No size limits. Peer-to-peer encrypted transfer.'}
                </p>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                />
              </div>

              {/* Minimalist File Preview */}
              <div className="absolute bottom-8 left-8 right-8 flex gap-2 overflow-x-auto no-scrollbar py-2">
                {myFileItems.slice(0, 3).map(item => (
                  <div key={item.id} className="bg-white/80 backdrop-blur-md border border-white p-3 rounded-2xl flex items-center gap-3 min-w-[180px] shadow-sm shrink-0 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <span className="material-symbols-outlined text-sm">description</span>
                    </div>
                    <span className="text-xs font-medium truncate text-slate-700">{item.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-sections: Received Files, History, etc. */}
      <div className="max-w-7xl mx-auto mt-12 space-y-12 pb-20">

        {/* Received Files Section - Always Visible */}
        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-sm">download_for_offline</span>
            Received Files
          </h2>

          {receivedFileItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedFileItems.map(item => (
                <TransferCard key={item.id} item={item} onDownload={handleDownload} />
              ))}
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center border-dashed group hover:border-white/80 transition-all shadow-2xl shadow-accent/5">
              <div className="w-20 h-20 bg-white/60 text-slate-300 rounded-[2rem] shadow-sm border border-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">inbox</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No files received yet</h3>
              <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">When someone sends you a file, it will appear here for instant download.</p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History */}
          {/* Transfer History (PERSISTENT from Cloud Vault) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 ">
              <span className="material-symbols-outlined text-slate-400 text-sm">history</span>
              Transfer History
              {isUploading && (
                <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Uploading File...</span>
                </div>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 ml-auto">☁️ Cloud Synced</span>
            </h3>
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl shadow-accent/5">
              {/* Storage Meter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Cloud Storage</span>
                  <span className="text-xs font-bold text-slate-400">
                    {(storageUsed / (1024 * 1024)).toFixed(1)} MB / {(storageLimit / (1024 * 1024)).toFixed(0)} MB
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${storageUsed / storageLimit > 0.9 ? 'bg-red-500' :
                      storageUsed / storageLimit > 0.7 ? 'bg-amber-500' : 'bg-accent'
                      }`}
                    style={{ width: `${Math.min((storageUsed / storageLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {historyItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">history_toggle_off</span>
                  <p className="text-slate-400 text-sm italic">No recent activity.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.slice(0, 10).map(item => (
                    <TransferCard
                      key={item.id}
                      item={item as TransferItem}
                      onCopy={handleCopy}
                      onDownload={handleDownload}
                      onDelete={(it) => deleteFromHistory(it as any)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Devices */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">devices</span>
              Linked Devices
            </h3>
            <div className="bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl shadow-accent/5">
              {trustedDevices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/60 rounded-xl shadow-sm border border-white flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <span className="material-symbols-outlined">devices</span>
                  </div>
                  <p className="text-slate-500 text-sm font-bold">No linked devices</p>
                  <p className="text-slate-400 text-[11px] mt-1 px-4 leading-relaxed text-center">Connected devices will appear here for quick access.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trustedDevices.map((id) => {
                    const isActive = connected && remotePeerId === id;
                    return (
                      <div
                        key={id}
                        className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all ${isActive ? 'bg-white/80 border-white shadow-sm' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isActive ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                          <span className="material-symbols-outlined text-xl">{id.length > 10 ? 'smartphone' : 'computer'}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Device ID</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{id}</p>
                          {isActive && <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Active Session</p>}
                        </div>
                        {!isActive && (
                          <button
                            onClick={() => connectToPeer(id)}
                            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <span className="material-symbols-outlined text-sm">link</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-1 bg-slate-100 rounded-full mb-2"></div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Scan to Connect</h3>
            <p className="text-slate-500 text-sm -mt-4 mb-2 text-center">Point your phone camera at the QR code</p>

            <div className="md:p-6 bg-white rounded-[2rem] shadow-soft-lg border border-slate-100">
              <QRCodeSVG value={peerId} size={320} level="H" includeMargin={true} />
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Device ID</span>
              <p className="text-lg font-mono text-accent bg-accent/5 px-6 py-3 rounded-2xl border border-accent/10 w-full text-center">
                {peerId}
              </p>
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-soft-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating Toasts */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 animate-in slide-in-from-right-full duration-300 ${toast.type === 'success'
              ? 'bg-emerald-500/90 border-emerald-400 text-white'
              : 'bg-red-500/90 border-red-400 text-white'
              }`}
          >
            {toast.type === 'success' ? (
              <span className="material-symbols-outlined text-sm">check_circle</span>
            ) : (
              <span className="material-symbols-outlined text-sm">error</span>
            )}
            <p className="text-sm font-bold">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
