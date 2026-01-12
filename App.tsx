
import React, { useState, useEffect, useRef } from 'react';
import { generateAIImage } from './services/geminiService';
import { GeneratedImage, AspectRatio } from './types';
import { Sparkles, Download, Image as ImageIcon, History, Loader2, Send, Share, Zap, Brain, Crown, Edit3, RotateCw, X, Check, Sliders, Trash2, Mic, Palette, Globe, Layers, Cpu } from 'lucide-react';

type GenerationMode = 'fast' | 'thinking' | 'pro';

// Fixed window declarations to avoid conflicts with pre-defined types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const compressImage = (base64Str: string, maxWidth = 600, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>(AspectRatio.SQUARE);
  const [mode, setMode] = useState<GenerationMode>('fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const progressInterval = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('warrick_ai_glass_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        if (parsed.length > 0) setCurrentImage(parsed[0]);
      } catch (e) {
        console.error("History parse failed", e);
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        setPrompt(prev => prev + ' ' + event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('warrick_ai_glass_history', JSON.stringify(history.slice(0, 15)));
    } catch (e) {
      setHistory(prev => prev.slice(0, 5));
    }
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const aistudio = (window as any).aistudio;
    if (mode === 'pro' && aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    
    progressInterval.current = window.setInterval(() => {
      setProgress(p => Math.min(95, p + (100 / (mode === 'fast' ? 20 : mode === 'thinking' ? 60 : 120))));
    }, 100);

    try {
      const model = mode === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      const rawUrl = await generateAIImage(prompt, aspectRatio, model);
      const compressed = await compressImage(rawUrl);
      
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url: compressed,
        prompt: prompt,
        timestamp: Date.now(),
        aspectRatio
      };
      
      setHistory(prev => [newImg, ...prev]);
      setCurrentImage(newImg);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Generation error');
      if (err.message?.includes("Requested entity was not found") && aistudio) {
         await aistudio.openSelectKey();
      }
    } finally {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setTimeout(() => setIsGenerating(false), 600);
    }
  };

  return (
    <div className="p-4 md:p-12 lg:p-16 flex flex-col items-center">
      {/* Floating Header - Compact Version */}
      <nav className="ios-glass w-full max-w-4xl px-8 py-3.5 rounded-full flex justify-between items-center mb-12 animate-in slide-in-from-top duration-700">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
            <div className="relative w-11 h-11 flex items-center justify-center">
              <img 
                src="https://img.icons8.com/ios-filled/100/1e1b4b/artificial-intelligence.png" 
                className="w-full h-full object-contain mix-blend-multiply opacity-90" 
                alt="Warrick AI Logo" 
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-[0.1em] text-gray-900 leading-none">WARRICK</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-[1px] w-3 bg-indigo-500/40"></span>
              <p className="text-[8px] font-bold text-indigo-600/80 uppercase tracking-[0.2em] whitespace-nowrap">Powered by Arvin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white/40 hover:bg-white/70 rounded-full transition-all text-gray-800 border border-white/50 shadow-sm">
            <History size={16} />
          </button>
        </div>
      </nav>

      {/* Main Glass Stack */}
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-10 items-stretch">
        {/* Input Panel */}
        <div className="xl:w-1/3 w-full animate-in slide-in-from-left duration-700">
          <div className="ios-glass glass-panel p-10 h-full flex flex-col border-white/60 min-h-[600px]">
            <div className="space-y-4 flex-1 flex flex-col">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Prompt Interface</label>
              <div className="relative group flex-1 flex">
                <textarea
                  className="w-full bg-white/30 backdrop-blur-xl rounded-[32px] p-7 text-lg font-medium outline-none border border-white/50 focus:bg-white/50 focus:border-white transition-all placeholder:text-gray-400 shadow-inner resize-none h-full"
                  placeholder="Initiate vision sequence..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <button 
                  onClick={() => setIsListening(!isListening)}
                  className={`absolute bottom-5 right-5 p-4 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-white/90 text-gray-500 hover:text-indigo-600 hover:scale-105'}`}
                >
                  <Mic size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Processing Engine</label>
              <div className="grid grid-cols-3 gap-3 bg-black/5 p-2 rounded-[28px] border border-white/20">
                {['fast', 'thinking', 'pro'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m as any)}
                    className={`py-3 rounded-[22px] text-[9px] font-black uppercase tracking-[0.15em] transition-all ${
                      mode === m ? 'bg-white text-gray-900 shadow-xl scale-100 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Aspect Format</label>
              <div className="flex flex-wrap gap-2.5">
                {Object.values(AspectRatio).map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      aspectRatio === r ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white/30 text-gray-600 hover:bg-white/50 border border-white/30'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-6 mt-8 bg-gray-900 text-white rounded-[32px] text-sm font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all disabled:opacity-50 shadow-2xl active:scale-95 group"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
              {isGenerating ? `Synthesizing ${Math.round(progress)}%` : 'Execute'}
            </button>
            {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center px-4 py-2 mt-4 bg-red-50/50 rounded-xl">{error}</p>}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="xl:w-2/3 w-full animate-in slide-in-from-right duration-700">
          <div className="ios-glass glass-panel p-10 h-full flex flex-col items-center justify-center relative overflow-hidden border-white/60 min-h-[600px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-10 w-full max-w-md">
                <div className="w-full aspect-square ios-glass-dark rounded-[56px] overflow-hidden flex items-center justify-center border-2 border-white/30 relative">
                  <div className="shimmer absolute inset-0 opacity-40" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <Loader2 size={56} className="animate-spin text-white/50" />
                    <span className="text-white/40 font-black text-4xl tabular-nums">{Math.round(progress)}%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-md animate-pulse">Neural Rendering in progress</p>
              </div>
            ) : currentImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-10">
                <div className="relative group rounded-[48px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.3)] border-[12px] border-white/20">
                  <img src={currentImage.url} className="max-h-[500px] w-auto rounded-[36px] object-contain" alt="Current" />
                  <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex justify-center gap-5 translate-y-4 group-hover:translate-y-0">
                    <button className="p-5 bg-white text-gray-900 rounded-[24px] hover:scale-110 transition-all shadow-2xl"><Download size={24} /></button>
                    <button className="p-5 bg-white text-gray-900 rounded-[24px] hover:scale-110 transition-all shadow-2xl"><Share size={24} /></button>
                  </div>
                </div>
                <div className="ios-glass-dark px-10 py-5 rounded-[28px] max-w-2xl border border-white/10">
                  <p className="text-white/90 font-medium text-center text-sm leading-relaxed tracking-wide italic">"{currentImage.prompt}"</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8 py-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
                  <div className="relative w-36 h-36 bg-white/10 rounded-[50px] flex items-center justify-center mx-auto border-2 border-white/30 backdrop-blur-2xl shadow-2xl">
                    <ImageIcon size={56} className="text-white/30" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl font-black text-white drop-shadow-2xl tracking-tight">System Ready</h3>
                  <p className="text-white/50 font-bold uppercase tracking-[0.3em] text-[10px]">Awaiting Manifestation Request</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="w-full max-w-7xl mt-24 space-y-12 animate-in slide-in-from-bottom duration-700">
        <div className="flex justify-between items-end px-6">
          <div className="flex flex-col">
            <h2 className="text-5xl font-black text-white drop-shadow-xl tracking-tighter">ARCHIVE</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-[2px] w-8 bg-white/40"></span>
              <p className="text-white/50 font-black uppercase tracking-[0.4em] text-[10px]">Neural Artifacts</p>
            </div>
          </div>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="px-8 py-3.5 bg-red-500/10 text-white border border-red-500/20 rounded-full font-black uppercase text-[9px] tracking-[0.3em] hover:bg-red-500 hover:border-red-500 transition-all shadow-lg active:scale-95">Flush Memory</button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="ios-glass glass-panel p-24 flex flex-col items-center gap-6 opacity-40 border-dashed">
            <Layers size={48} className="text-white" />
            <p className="text-white font-black uppercase text-[10px] tracking-[0.5em]">No Data Cached</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {history.map(img => (
              <div 
                key={img.id}
                onClick={() => setCurrentImage(img)}
                className={`ios-glass glass-panel aspect-square overflow-hidden cursor-pointer group active:scale-90 transition-all border-white/40 ${currentImage?.id === img.id ? 'ring-4 ring-indigo-400 shadow-[0_0_40px_rgba(129,140,248,0.5)] z-10 scale-105' : 'hover:z-10 hover:scale-105 hover:rotate-1'}`}
              >
                <img src={img.url} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt="History Item" />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-40 py-16 opacity-30 text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <span className="h-[1px] w-12 bg-white"></span>
          <p className="text-white font-black text-xs tracking-[0.6em] uppercase">WARRICK STUDIO</p>
          <span className="h-[1px] w-12 bg-white"></span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-white font-bold text-[9px] tracking-[0.4em] uppercase">Powered by Arvin</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
