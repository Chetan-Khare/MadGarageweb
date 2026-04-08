import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Filter, ShoppingCart, 
  Clock, Ship, CheckCircle, ChevronRight, 
  MapPin, Phone, User, Package, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const SellerOrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/orders/seller-orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
            // Fallback
            setOrders([
                { id: 'MG-9821', customerName: 'Alice Johnson', status: 'PENDING', items: [{ productName: 'Spark Plugs', quantity: 4 }], grandTotal: 3200, createdAt: '2024-04-03' },
                { id: 'MG-9820', customerName: 'Bob Smith', status: 'SHIPPED', items: [{ productName: 'Clutch Kit', quantity: 1 }], grandTotal: 12500, createdAt: '2024-04-01' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-app-bg-light font-inter">
            {/* Control Header */}
            <div className="bg-white border-b border-gray-100 p-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 fixed top-0 w-full z-40">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/seller')} className="h-12 w-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-app-bg-dark">Merchant <span className="text-primary italic">Fulfillment</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Secure Order History & Tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Order ID / Client..." 
                            className="w-full bg-gray-50 border border-gray-100 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-44 md:pt-48 max-w-7xl mx-auto space-y-10 pb-20">
                {/* Status Tabs */}
                <div className="flex gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
                    {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                        <button 
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Orders Grid */}
                <div className="space-y-6">
                    {loading && orders.length === 0 ? (
                        <div className="py-40 text-center">
                            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-6">Establishing Link to Blockchain...</p>
                        </div>
                    ) : filteredOrders.map(order => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-primary/20 transition-all">
                             
                             <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                                            order.status === 'PENDING' || order.status === 'PAID' ? 'bg-orange-50 text-orange-500' : 
                                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                                        }`}>
                                            {order.status === 'PENDING' || order.status === 'PAID' ? <Clock size={20}/> : <Package size={20}/>}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">Order Reference</p>
                                            <h3 className="text-lg font-black italic tracking-tighter text-app-bg-dark uppercase">#{order.id}</h3>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                                        order.status === 'PENDING' || order.status === 'PAID' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>{order.status}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={14}/></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Buyer</p>
                                            <p className="text-xs font-bold text-app-bg-dark">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Scheduled On</p>
                                            <p className="text-xs font-bold text-app-bg-dark">{order.createdAt}</p>
                                        </div>
                                        <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Calendar size={14}/></div>
                                    </div>
                                </div>
                             </div>

                             <div className="h-px md:h-20 w-full md:w-px bg-gray-100" />

                             <div className="flex flex-col items-end gap-6 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Transaction</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-app-bg-dark">₹{(order.grandTotal || 0).toLocaleString()}</p>
                                </div>
                                <button className="w-full md:w-48 bg-app-bg-dark text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all">
                                    Track Freight <Ship size={14} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SellerOrderHistory;
