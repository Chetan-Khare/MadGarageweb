import React, { useEffect, useState } from 'react';
import { 
  Package, TrendingUp, ShoppingCart, Plus, 
  Search, Filter, ChevronRight, ArrowUpRight,
  Clock, CheckCircle, Ship, LogOut, MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

interface SellerStats {
    activeListings: number;
    monthRevenue: number;
}

const SellerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [flaggedProducts, setFlaggedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
        fetchOrders();
        fetchFlaggedItems();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await apiClient.get('/seller/inventory/analytics');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch seller stats:', error);
            // Fallback for demo
            setStats({ activeListings: 12, monthRevenue: 48500 });
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders/seller-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch seller orders:', error);
            // Fallback for demo
            setOrders([
                { id: '1001', status: 'PENDING', items: [{ productName: 'Ceramic Brake Pads', quantity: 2 }], grandTotal: 4500, createdAt: '2024-04-03' },
                { id: '1002', status: 'SHIPPED', items: [{ productName: 'Air Filter K&N', quantity: 1 }], grandTotal: 2800, createdAt: '2024-04-02' }
            ]);
        }
    };

    const fetchFlaggedItems = async () => {
        try {
            const response = await apiClient.get('/seller/inventory');
            // Truthy check handles boolean, number (1), or string "true" from different backend versions
            const flagged = response.data.filter((p: any) => p.flagged && (!p.sellerId || p.sellerId === user?.id));
            setFlaggedProducts(flagged);
        } catch (error) {
            console.error('Failed to fetch flagged items:', error);
        }
    };

    if (loading) return <div className="min-h-screen bg-app-bg-light flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest animate-pulse">Syncing Terminal...</p>
        </div>
    </div>;

    return (
        <div className="min-h-screen bg-app-bg-light font-inter">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-100 p-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
                        <span className="text-xl font-black italic tracking-tighter text-primary">MAD GARAGE</span>
                    </Link>
                    <span className="h-6 w-px bg-gray-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Hub</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Authorized Seller</p>
                        <button onClick={() => navigate('/profile')} className="text-sm font-black text-app-bg-dark italic hover:text-primary transition-all">
                            {user?.name || 'My Profile'}
                        </button>
                    </div>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="h-12 w-12 bg-app-bg-dark text-primary rounded-2xl flex items-center justify-center font-black italic shadow-lg shadow-black/10 border border-primary/20 hover:scale-110 transition-all overflow-hidden"
                    >
                        {user?.profileImageUrl ? (
                            <img src={`${BASE_SERVER_URL}${user.profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            (user?.name?.[0] || 'S')
                        )}
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 bg-red-50 text-primary px-6 py-3 rounded-2xl border border-primary/10 hover:bg-primary hover:text-white transition-all group">
                        <LogOut size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </div>

            <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
                {/* Safety Shield Alert - If items are flagged */}
                {flaggedProducts.length > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-[2.5rem] p-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-orange-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-orange-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tighter">Safety <span className="text-orange-600 italic">Interruption</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-2">Admin Corrective Feedback Required</p>
                                <div className="space-y-1">
                                    {flaggedProducts.slice(0, 3).map((p, idx) => (
                                        <p key={idx} className="text-xs font-bold text-gray-700 italic border-l-2 border-orange-300 pl-3">
                                            "{p.partName || p.name}": {p.flagReason || p.reason || p.flaggedReason || "Review Pending: No details provided by admin."}
                                        </p>
                                    ))}
                                    {flaggedProducts.length > 2 && (
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">+ {flaggedProducts.length - 2} more flagged items</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/seller/flagged-items')}
                            className="w-full md:w-auto bg-app-bg-dark text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl"
                        >
                            Review All Flags <ArrowUpRight size={18} />
                        </button>
                    </div>
                )}

                {/* Metrics Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button 
                        onClick={() => navigate('/seller/inventory')}
                        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-primary/20 transition-all overflow-hidden relative text-left"
                    >
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                         <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Active Inventory</p>
                            <h2 className="text-4xl font-black italic text-app-bg-dark tracking-tighter">{stats?.activeListings} <span className="text-primary">Parts</span></h2>
                         </div>
                         <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center text-primary relative z-10">
                            <Package size={28} />
                         </div>
                    </button>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center justify-between group hover:border-primary/20 transition-all overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                         <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Revenue (30 Days)</p>
                            <h2 className="text-4xl font-black italic text-app-bg-dark tracking-tighter">₹{(stats?.monthRevenue || 0).toLocaleString()}</h2>
                         </div>
                         <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center text-green-500 relative z-10">
                            <TrendingUp size={28} />
                         </div>
                    </div>
                </div>

                {/* Main Action Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Orders List */}
                        <div className="flex items-center justify-between px-2">
                             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Sales Revenue</h3>
                             <Link to="/seller/orders" className="text-[10px] font-black uppercase text-primary hover:underline">View All Orders</Link>
                         </div>

                         <div className="space-y-4">
                             {orders.length > 0 ? (
                                 orders.map((order) => (
                                     <div key={order.id} className="bg-white p-6 md:px-10 rounded-[2rem] border border-gray-100 shadow-lg shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:translate-x-2 transition-all">
                                         <div className="flex items-center gap-6 w-full md:w-auto">
                                             <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${order.status === 'PENDING' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                                 {order.status === 'PENDING' ? <Clock size={24} /> : <Ship size={24} />}
                                             </div>
                                             <div>
                                                 <p className="text-[10px] font-black uppercase text-gray-400">Order ID: #{order.id}</p>
                                                 <h4 className="text-md font-black text-app-bg-dark italic uppercase">{order.items?.[0]?.productName}</h4>
                                                 <p className="text-[10px] font-medium text-gray-500 mt-1">{order.createdAt} • {order.items?.[0]?.quantity} Unit(s)</p>
                                             </div>
                                         </div>
                                         <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                             <div className="text-left md:text-right">
                                                 <p className="text-lg font-black text-app-bg-dark italic tracking-tighter">₹{(order.grandTotal || 0).toLocaleString()}</p>
                                                 <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${order.status === 'PENDING' ? 'text-orange-600 bg-orange-100' : 'text-green-600 bg-green-100'}`}>
                                                     {order.status}
                                                 </span>
                                             </div>
                                             <button onClick={() => navigate(`/order/${order.id}`)} className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                                 <ChevronRight size={18} />
                                             </button>
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
                                     <ShoppingCart size={40} className="mx-auto text-gray-200 mb-4" />
                                     <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active orders detected</p>
                                 </div>
                             )}
                         </div>
                    </div>

                    {/* Quick Inventory Actions */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Inventory Control</h3>
                        </div>

                        <div className="bg-app-bg-dark rounded-[2.5rem] p-10 flex flex-col gap-8 relative overflow-hidden shadow-2xl shadow-black/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                            
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Expansion <br/>Required?</h4>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed">Boost your sales by adding new items to our high-demand wholesale catalog.</p>
                            </div>

                            <button 
                                onClick={() => navigate('/seller/add-product')}
                                className="relative z-10 w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-red-500/30"
                            >
                                List New Part <Plus size={18} />
                            </button>

                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <ActionButton to="/seller/inventory" icon={<Package size={16}/>} label="Inventory" color="text-blue-400" />
                                <ActionButton to="/seller/orders" icon={<MoreVertical size={16}/>} label="History" color="text-purple-400" />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Marketplace Trends</h4>
                            <div className="space-y-4">
                                <TrendRow label="Brembo Pads" trend="+24%" color="text-green-500" />
                                <TrendRow label="Alloy Wheels" trend="+12%" color="text-green-500" />
                                <TrendRow label="Air Filters" trend="-3%" color="text-red-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Components
const ActionButton: React.FC<{ icon: React.ReactNode, label: string, color: string, to?: string, onClick?: () => void }> = ({ icon, label, color, to, onClick }) => {
    const content = (
        <>
            <div className={`${color} group-hover:scale-110 transition-transform`}>{icon}</div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        </>
    );

    const className = "flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group";

    if (to) {
        return (
            <Link to={to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {content}
        </button>
    );
};

const TrendRow: React.FC<{ label: string, trend: string, color: string }> = ({ label, trend, color }) => (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
        <span className="text-xs font-bold text-app-bg-dark">{label}</span>
        <span className={`text-[10px] font-black ${color}`}>{trend} <ArrowUpRight size={10} className="inline ml-1" /></span>
    </div>
);

export default SellerDashboard;
