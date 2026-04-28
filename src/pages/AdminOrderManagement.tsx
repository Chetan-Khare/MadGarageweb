import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, ShoppingBag, 
  Clock, Eye
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const AdminOrderManagement: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const location = useLocation();
    useEffect(() => { fetchOrders(); }, [location]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch global orders:', err);
            // Fallback for demo
            setOrders([
                { id: 1001, customerName: 'Chetan Khare', grandTotal: 12500, status: 'PAID', orderDate: new Date().toISOString() },
                { id: 1002, customerName: 'Aditya Raj', grandTotal: 4500, status: 'SHIPPED', orderDate: new Date().toISOString() },
                { id: 1003, customerName: 'Rahul Singh', grandTotal: 8900, status: 'DELIVERED', orderDate: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await apiClient.put(`/admin/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter pb-20">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(role === 'ROLE_WORKER' ? '/worker' : '/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Order <span className="text-primary italic">Pipeline</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Full Network Fulfillment Oversight</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search order ID or customer..." 
                                className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-app-bg-dark border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none md:w-40 text-center"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            {['PAID', 'SHIPPED', 'ARRIVED_AT_GARAGE', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
                {/* Orders List */}
                <div className="space-y-4">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#121216] rounded-3xl animate-pulse border border-white/5" />)
                    ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <div key={order.id} className="bg-[#121216] border border-white/5 p-6 rounded-[2rem] hover:border-primary/20 transition-all group">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                                        order.status === 'ARRIVED_AT_GARAGE' ? 'bg-cyan-500/10 text-cyan-500' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Order #{order.id}</p>
                                        <h4 className="text-md font-black text-white italic uppercase tracking-tight">{order.customerName}</h4>
                                        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">
                                            {new Date(order.orderDate).toLocaleDateString()} • ₹{(order.grandTotal || 0).toLocaleString()} • {order.status?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
                                        {['SHIPPED', 'ARRIVED_AT_GARAGE', 'DELIVERED'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateStatus(order.id, s)}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                                                    order.status === s ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'
                                                }`}
                                            >
                                                {s === 'ARRIVED_AT_GARAGE' ? 'ARRIVED' : s}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/order/${order.id}`)}
                                        className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform group-hover:scale-105"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-32 text-center bg-[#121216] rounded-[3rem] border border-dashed border-white/5">
                            <Clock size={48} className="mx-auto text-gray-800 mb-6" />
                            <p className="text-xl font-black italic uppercase text-gray-600">No Orders in Sync</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-700 mt-2">Adjust filters or search criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderManagement;
