import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Camera, User, 
  Bot, Trash2, ShoppingCart, Loader2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

import { useCart } from '../context/CartContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  imagePreview?: string;
  products?: any[];
}

const AIChatPage: React.FC = () => {

  const { addToCart } = useCart();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'ai',
      text: "Hey there! 👋 I'm your Virtual Mechanic at **MAD GARAGE**!\n\nI can help you find the right parts for your vehicle. Just tell me what you're looking for, or upload a photo of the part or damage! 🔧"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isGreeting = (msg: string) => {
    const lower = msg.toLowerCase().replace(/[^a-z ]/g, '').trim();
    const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'help'];
    return greetings.includes(lower) || (lower.length <= 4 && !/\d/.test(lower));
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isThinking) return;

    const userText = inputText.trim() || (selectedImage ? 'Attached image for analysis.' : '');
    
    // Greeting check
    if (!selectedImage && isGreeting(userText)) {
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: userText };
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "Hey! 👋 I'm your Virtual Mechanic!\n\nTell me your vehicle's Year, Make & Model and what part you need, and I'll find the perfect match for you. 🔧"
      };
      setMessages(prev => [...prev, userMsg, aiMsg]);
      setInputText('');
      return;
    }

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: userText,
      imagePreview: imagePreview || undefined
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    setIsThinking(true);

    try {
      const formData = new FormData();
      if (userText) formData.append('message', userText);
      if (imageToSend) formData.append('image', imageToSend);

      const response = await apiClient.post('/assistant/chat', formData);
      const result = response.data;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: result.message || "I found some options for you!",
        products: result.products || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "I'm having trouble connecting to the garage network. Please try again in a moment! ⚠️"
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-white flex flex-col font-inter">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <span className="text-primary">MAD GARAGE</span> AI
            </h1>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Neural Diagnostic Terminal</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border ${msg.role === 'user' ? 'bg-primary border-primary/20' : 'bg-white/5 border-white/10'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} className="text-primary" />}
              </div>
              <div className="space-y-4">
                <div className={`p-5 rounded-3xl text-sm font-semibold leading-relaxed shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-red-600 to-red-800 rounded-tr-none' 
                    : 'bg-[#121216] border border-white/5 rounded-tl-none text-gray-200'
                }`}>
                  {msg.imagePreview && (
                    <img src={msg.imagePreview} alt="upload" className="w-full max-w-sm rounded-2xl mb-4 border border-white/10 shadow-lg" />
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Product Cards Grid */}
                {msg.products && msg.products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {msg.products.map((p, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                        className="bg-[#1a1a20] border border-white/5 rounded-3xl overflow-hidden group hover:border-primary/40 transition-all duration-500 shadow-2xl cursor-pointer"
                      >
                        <div className="relative h-40">
                          <img 
                            src={p.imageUrl?.startsWith('/') ? `${BASE_SERVER_URL}${p.imageUrl}` : (p.imageUrl || 'https://via.placeholder.com/150')} 
                            alt={p.partName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <p className="text-[9px] font-black uppercase text-primary tracking-widest">{p.manufacturer || 'OEM Quality'}</p>
                            <p className="text-sm font-black italic tracking-tighter line-clamp-1 truncate uppercase">{p.partName || p.name}</p>
                          </div>
                        </div>
                        <div className="p-5 flex items-center justify-between gap-4">
                          <div>
                            {p.originalPrice && <p className="text-gray-400 text-[10px] line-through font-bold">₹{(p.originalPrice || 0).toLocaleString()}</p>}
                            <p className="text-lg font-black text-white italic tracking-tighter">₹{(p.garagePrice || p.price || 0).toLocaleString()}</p>
                          </div>
                           {role !== 'ROLE_SELLER' && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                               className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-red-600/20"
                             >
                              <ShoppingCart size={18} />
                            </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <Bot size={20} className="text-primary animate-pulse" />
              </div>
              <div className="px-6 py-4 bg-[#121216] border border-white/5 rounded-3xl rounded-tl-none flex items-center gap-3">
                <Loader2 size={16} className="text-primary animate-spin" />
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] italic">Analyzing Mechanical Soul...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-6 md:p-8 bg-black/40 backdrop-blur-xl border-t border-white/5 z-30">
        <div className="max-w-4xl mx-auto space-y-4">
          {imagePreview && (
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl animate-in slide-in-from-bottom-4">
              <img src={imagePreview} className="h-16 w-16 object-cover rounded-lg border border-white/10" alt="Preview" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Capture Ready</p>
                <p className="text-xs text-gray-400">Image will be sent for diagnostic analysis</p>
              </div>
              <button 
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-4 items-center bg-[#121216] border border-white/10 p-2 rounded-[2rem] shadow-2xl overflow-hidden focus-within:border-primary/40 transition-all">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageSelect}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all ${imagePreview ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:text-primary hover:bg-white/10'}`}
            >
              <Camera size={20} />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Search by part name or upload a photo..."
              className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-semibold placeholder:text-gray-600"
            />
            <button 
              type="submit"
              disabled={isThinking || (!inputText.trim() && !selectedImage)}
              className="h-12 w-12 shrink-0 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-red-600/30"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[9px] font-black text-center uppercase text-gray-600 tracking-[0.5em]">Mad Garage AI Version 4.0 // Secure Neural Link</p>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
