import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Package, 
  Search, RefreshCcw, ShieldAlert,
  Info, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const SellerFlaggedProducts: React.FC = () => {
    const { user } = useAuth();
    const [flaggedItems, setFlaggedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [submittingResponse, setSubmittingResponse] = useState<number | null>(null);

    useEffect(() => {
        fetchFlaggedItems();
    }, []);

    const fetchFlaggedItems = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/seller/inventory');
            const flagged = response.data.filter((p: any) => p.flagged);
            setFlaggedItems(flagged);
            
            // Initialize existing responses
            const initialResponses: Record<number, string> = {};
            flagged.forEach((p: any) => {
                if (p.sellerResponse) initialResponses[p.id] = p.sellerResponse;
            });
            setResponses(initialResponses);
        } catch (error) {
            console.error('Failed to fetch flagged items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseSubmit = async (productId: number) => {
        const responseText = responses[productId];
        if (!responseText || !responseText.trim()) return;

        setSubmittingResponse(productId);
        try {
            await apiClient.put(`/seller/inventory/${productId}/respond`, { response: responseText });
            alert('Response sent to administrators successfully.');
            fetchFlaggedItems();
        } catch (error) {
            console.error('Failed to send response:', error);
            alert('Failed to send response. Please try again.');
        } finally {
            setSubmittingResponse(null);
        }
    };

    const filteredItems = flaggedItems.filter(p => {
        const fullName = (p.partName || p.name || '').toLowerCase();
        const sku = (p.sku || p.id?.toString() || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        const matchesSearch = fullName.includes(term) || sku.includes(term) || category.includes(term);
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* AUDIT HEADER */}
            <div className="bg-[#121216] border-b border-white/5 p-8 md:px-12 fixed top-0 w-full z-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Link to="/seller" className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Compliance <span className="text-orange-500 italic text-2xl">Audit Hub</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 mt-1">High-Priority Corrective Actions Required</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-80 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Filter flagged SKUs..." 
                            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-48 md:pt-56 max-w-7xl mx-auto space-y-12 pb-24">
                {/* STATUS BAR */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-orange-500/5">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-orange-500 text-black rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Inventory <span className="text-orange-500 italic">Interruption</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{flaggedItems.length} Products currently suppressed from customer catalog</p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchFlaggedItems}
                        className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-white/10"
                    >
                        Refresh Audit <RefreshCcw size={14} />
                    </button>
                </div>

                {/* AUDIT WORKLIST */}
                <div className="grid grid-cols-1 gap-8">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-[#121216] rounded-[3rem] animate-pulse" />)
                    ) : filteredItems.length > 0 ? (
                        filteredItems.map((p) => (
                            <div key={p.id} className="bg-[#121216] border border-orange-500/20 rounded-[3rem] p-10 flex flex-col lg:flex-row items-center gap-12 group hover:border-orange-500/40 transition-all relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                                
                                <div className="h-32 w-32 bg-black/40 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/5 overflow-hidden relative">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE_SERVER_URL}${p.imageUrl}`} className="h-full w-full object-cover" alt={p.partName} />
                                    ) : (
                                        <Package size={40} className="text-gray-800" />
                                    )}
                                    <div className="absolute inset-0 bg-orange-500/10" />
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-widest leading-none">Flagged Product</span>
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.category} | SKU: {p.sku || p.id}</span>
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{p.partName || p.name}</h3>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Impact Price</p>
                                            <p className="text-2xl font-black italic tracking-tighter text-orange-500">₹{(p.price || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* ADMIN COMMENT BOX */}
                                    <div className="bg-black/40 border-l-4 border-orange-500 p-8 rounded-2xl relative">
                                        <div className="absolute top-4 right-6 text-orange-500/20">
                                            <Info size={40} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-3">Administrator Feedback</p>
                                        <p className="text-sm font-bold text-gray-300 italic leading-relaxed">
                                            "{p.flagReason || p.reason || p.flaggedReason || "Review Pending: No specific details provided by admin yet."}"
                                        </p>
                                    </div>

                                    {/* SELLER RESPONSE SECTION */}
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Merchant Justification / Fix Report</p>
                                            {p.sellerResponse && (
                                                <span className="bg-green-500/20 text-green-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Response Logged</span>
                                            )}
                                        </div>
                                        <textarea 
                                            placeholder="Explain your corrective actions or request a re-review..." 
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-sm font-medium text-gray-300 outline-none focus:border-orange-500/50 transition-all h-28 resize-none placeholder:text-gray-700"
                                            value={responses[p.id] || ''}
                                            onChange={(e) => setResponses({ ...responses, [p.id]: e.target.value })}
                                        />
                                        <div className="flex justify-end">
                                            <button 
                                                disabled={submittingResponse === p.id || !responses[p.id]?.trim()}
                                                onClick={() => handleResponseSubmit(p.id)}
                                                className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
                                            >
                                                {submittingResponse === p.id ? 'Sending...' : 'Update Response'} <ArrowLeft className="rotate-180" size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-40 text-center bg-[#121216] rounded-[3rem] border border-dashed border-white/10 shadow-2xl">
                            <CheckCircle size={80} className="mx-auto text-green-500/20 mb-8" />
                            <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Catalog <span className="text-green-500 italic">Clearance</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-4 leading-relaxed">No active compliance alerts detected.<br/>Your inventory matches all quality thresholds.</p>
                            <Link 
                                to="/seller/inventory" 
                                className="inline-flex items-center gap-4 bg-white/5 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-white/10 mt-12 hover:bg-white hover:text-black transition-all"
                            >
                                Back to Inventory <ArrowLeft size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerFlaggedProducts;
