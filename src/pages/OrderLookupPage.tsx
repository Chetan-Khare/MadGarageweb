import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRight } from 'lucide-react';

const OrderLookupPage: React.FC = () => {
    const [orderId, setOrderId] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanId = orderId.trim();
        if (cleanId && /^\d+$/.test(cleanId)) {
            navigate(`/order/${cleanId}`);
        } else if (cleanId) {
            alert("Reference ID must be a numeric value.");
        }
    };

    return (
        <div className="min-h-screen bg-app-bg-light font-inter flex flex-col items-center justify-center p-6">
            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner">
                    <Package size={32} className="text-primary" />
                </div>
                
                <h1 className="text-3xl font-black italic uppercase text-app-bg-dark tracking-tighter mb-2">Track Order</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Enter your Reference ID</p>

                <form onSubmit={handleSearch} className="space-y-6 relative z-10">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="e.g. 5"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 pl-14 text-lg font-bold text-app-bg-dark outline-none focus:border-primary/50 transition-all placeholder:text-gray-300"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-app-bg-dark text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-black/10 active:scale-95 group"
                    >
                        Track Progress <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
            <p className="mt-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] italic">Mad Garage Precision Tracking</p>
        </div>
    );
};

export default OrderLookupPage;
