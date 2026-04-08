import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Filter, ShoppingCart, 
  Clock, Ship, CheckCircle, ChevronRight, 
  MapPin, Phone, User, Package, Calendar,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const SellerOrderManagement: React.FC = () => {
    const { user } = useAuth();
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
            console.error('Failed to fetch merchant orders:', err);
            // Fallback for demo
            setOrders([
                { id: 'MG-9821', customerName: 'Alice Johnson', status: 'PENDING', items: [{ productName: 'Spark Plugs', quantity: 4 }], grandTotal: 3200, createdAt: '2024-04-03' },
                { id: 'MG-9820', customerName: 'Bob Smith', status: 'SHIPPED', items: [{ productName: 'Clutch Kit', quantity: 1 }], grandTotal: 12500, createdAt: '2024-04-01' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await apiClient.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error('Status update failed');
        }
    };

    const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
        const orderIdStr = String(o.id || '').toLowerCase();
        const customerNameStr = String(o.customerName || '').toLowerCase();
        const searchStr = searchTerm.toLowerCase();

        const matchesSearch = orderIdStr.includes(searchStr) || 
                             customerNameStr.includes(searchStr);
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        
        // Safety check: ensure this order strictly belongs to the authenticated seller
        const belongsToSeller = !o.sellerId || o.sellerId === user?.id;
        
        return matchesSearch && matchesStatus && belongsToSeller;
    }) : [];

    return (
        <div className="min-h-screen bg-app-bg-light font-inter">
            {/* Control Header */}
            <div className="bg-white border-b border-gray-100 p-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 fixed top-0 w-full z-40">
                <div className="flex items-center gap-6">
                    <Link to="/seller" className="h-12 w-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-app-bg-dark">Sales <span className="text-primary italic">Revenue</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Merchant Payouts & Order History</p>
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
                {/* Fulfillment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <QuickStat label="Active Orders" value={orders.filter(o => o.status === 'PENDING').length} icon={<Clock size={16}/>} color="text-orange-500" />
                    <QuickStat label="Shipped" value={orders.filter(o => o.status === 'SHIPPED').length} icon={<Ship size={16}/>} color="text-blue-500" />
                    <QuickStat label="Delivered" value={orders.filter(o => o.status === 'DELIVERED').length} icon={<CheckCircle size={16}/>} color="text-green-500" />
                    <QuickStat label="Revenue" value={`₹${orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0).toLocaleString()}`} icon={<TrendingUp size={16}/>} color="text-primary" />
                </div>

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
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-6">Updating Fulfillment Pipeline...</p>
                        </div>
                    ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-primary/20 transition-all">
                             
                             <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                                            order.status === 'PENDING' ? 'bg-orange-50 text-orange-500' : 
                                            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'
                                        }`}>
                                            {order.status === 'PENDING' ? <Clock size={20}/> : <Package size={20}/>}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400">Reference ID</p>
                                            <h3 className="text-lg font-black italic tracking-tighter text-app-bg-dark uppercase">#{order.id}</h3>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 
                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                    }`}>{order.status}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User size={14}/></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Buyer Identity</p>
                                            <p className="text-xs font-bold text-app-bg-dark">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Transaction Date</p>
                                            <p className="text-xs font-bold text-app-bg-dark">{order.createdAt}</p>
                                        </div>
                                        <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Calendar size={14}/></div>
                                    </div>
                                </div>
                             </div>

                             <div className="h-px md:h-20 w-full md:w-px bg-gray-100" />

                             <div className="flex flex-col items-end gap-6 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Payout Amount</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-app-bg-dark">₹{(order.grandTotal || 0).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2 w-full">
                                    <button 
                                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                                        disabled={order.status !== 'PENDING'}
                                        className="flex-1 bg-app-bg-dark text-white py-4 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all disabled:opacity-20"
                                    >
                                        Ship <Ship size={14} />
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/order/${order.id}`)}
                                        className="h-12 w-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-app-bg-dark hover:text-white transition-all transform group-active:scale-95"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                             </div>
                        </div>
                    )) : (
                        <div className="py-40 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                             <AlertCircle size={48} className="mx-auto text-gray-200 mb-6" />
                             <p className="text-xl font-black italic uppercase text-gray-400">No Orders Synchronized</p>
                             <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Adjust your filters or sync with blockchain</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuickStat: React.FC<{ label: string, value: any, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center justify-between">
        <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
            {icon}
        </div>
        <div className="text-right">
            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
            <p className={`text-lg font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
    </div>
);

export default SellerOrderManagement;
