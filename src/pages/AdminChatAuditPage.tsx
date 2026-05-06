import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search, 
  ChevronRight, User, 
  Bot, ShieldCheck,
  LayoutDashboard, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface ChatUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  sender: 'USER' | 'AI';
  imageUrl?: string;
  createdAt: string;
}

const AdminChatAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [originalUsers, setOriginalUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'RECENT' | 'A-Z' | 'Z-A'>('RECENT');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!chatLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  const fetchChatUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/assistant/admin/users');
      setUsers(response.data);
      setOriginalUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch chatting users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (userId: number) => {
    setChatLoading(true);
    try {
      const response = await apiClient.get(`/assistant/admin/history/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch user history:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredUsers = (sortOrder === 'RECENT' ? originalUsers : users).filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  ).sort((a, b) => {
    if (sortOrder === 'A-Z') return (a.fullName || '').localeCompare(b.fullName || '');
    if (sortOrder === 'Z-A') return (b.fullName || '').localeCompare(a.fullName || '');
    return 0;
  });

  return (
    <div className="min-h-screen bg-app-bg-light flex">
      {/* Sidebar - User List */}
      <div className="w-80 md:w-96 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 text-app-bg-dark">
              <span className="text-primary">AI</span> Audit
            </h1>
            <button onClick={() => navigate('/admin')} className="h-8 w-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-all">
              <LayoutDashboard size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search customers..."
                className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-primary/30 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                setSortOrder(prev => prev === 'RECENT' ? 'A-Z' : prev === 'A-Z' ? 'Z-A' : 'RECENT');
              }}
              className="h-[34px] px-3 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
              title={`Sort by: ${sortOrder}`}
            >
              <span className="text-[10px] font-black">{sortOrder === 'RECENT' ? 'TIME' : sortOrder}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synching Neural Logs...</span>
             </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No chat logs found</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <button 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${
                  selectedUser?.id === user.id ? 'bg-primary text-white shadow-xl shadow-red-500/20' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-all ${
                    selectedUser?.id === user.id ? 'bg-white/20 border-white/20' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tighter leading-none mb-1">{user.fullName}</h4>
                    <p className={`text-[9px] font-bold uppercase tracking-widest leading-none ${selectedUser?.id === user.id ? 'text-white/70' : 'text-gray-400'}`}>
                      {user.role.replace('ROLE_', '')}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className={selectedUser?.id === user.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-all'} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Chat View */}
      <div className="flex-1 flex flex-col h-screen bg-white">
        {selectedUser ? (
          <>
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">
                    Inspection: <span className="text-primary">{selectedUser.fullName}</span>
                  </h2>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Data Source: Neural Diagnostic Logs</p>
                </div>
              </div>
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{selectedUser.email}</span>
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{selectedUser.phone}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 scrollbar-hide bg-gray-50/30">
              {chatLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Decompiling Conversation...</span>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border ${
                        msg.sender === 'USER' ? 'bg-primary border-primary/20 text-white' : 'bg-app-bg-dark border-white/10 text-primary'
                      }`}>
                        {msg.sender === 'USER' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className="space-y-2">
                        <div className={`p-5 rounded-2xl text-xs font-bold leading-relaxed shadow-sm border ${
                          msg.sender === 'USER' 
                            ? 'bg-white border-gray-100 text-gray-800 rounded-tr-none' 
                            : 'bg-app-bg-dark border-white/5 rounded-tl-none text-gray-200'
                        }`}>
                          {msg.imageUrl && (
                             <img src={msg.imageUrl} alt="upload" className="w-full max-w-sm rounded-xl mb-4 border border-white/10" />
                          )}
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <p className={`text-[8px] font-black uppercase tracking-widest text-gray-400 ${msg.sender === 'USER' ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
             <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8">
               <ShieldCheck size={48} />
             </div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-300">Select Session</h3>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-4 max-w-xs">
               Select a customer from the lateral terminal to begin neural auditing.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatAuditPage;
