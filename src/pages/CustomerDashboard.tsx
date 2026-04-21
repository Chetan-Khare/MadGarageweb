import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, Heart,
  LogOut, ChevronRight, Zap, 
  Package, User, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

const CustomerDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-app-bg-light flex font-inter">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-72 bg-app-bg-dark flex-col border-r border-white/5 h-screen sticky top-0">
                <div className="p-8 border-b border-white/5">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
                        <span className="text-xl font-black italic tracking-tighter text-primary uppercase">MAD GARAGE</span>
                    </Link>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Member Hub</p>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <SidebarLink icon={<ShoppingBag size={18}/>} label="Shop Parts" onClick={() => navigate('/')} />
                    <SidebarLink icon={<Package size={18}/>} label="My Orders" onClick={() => navigate('/orders')} />
                    <SidebarLink icon={<Heart size={18}/>} label="Wishlist" onClick={() => navigate('/wishlist')} />
                    <SidebarLink icon={<Zap size={18}/>} label="Garage AI" onClick={() => navigate('/chat')} />
                    <div className="pt-10 mb-4 pb-2 border-b border-white/5 mx-2 text-[10px] font-black uppercase tracking-widest text-gray-600">Preferences</div>
                    <SidebarLink icon={<User size={18}/>} label="Profile & Settings" onClick={() => navigate('/profile')} />
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-100 p-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div>
                        <h1 className="text-xl font-black text-app-bg-dark italic uppercase tracking-tight">
                            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ready for your next build?</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-gray-50 text-app-bg-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-primary hover:text-white transition-all shadow-sm group"
                        >
                            <ShoppingCart size={14} className="group-hover:text-white" />
                            Return to Shop
                        </button>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="h-12 w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg border border-primary/20 hover:scale-105 transition-all outline-none overflow-hidden"
                        >
                            {(user?.profileImageUrl && user.profileImageUrl.startsWith('/uploads/')) ? (
                                <img src={`${BASE_SERVER_URL}${user.profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                (user?.name?.[0] || 'C')
                            )}
                        </button>
                    </div>
                </header>

                <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto w-full">
                    {/* Recent Orders */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Recent Activity</h2>
                            <button 
                                onClick={() => navigate('/orders')}
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                                View All Orders
                            </button>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest">
                                    Establishing Secure Connection...
                                </div>
                            ) : orders.length > 0 ? (
                                orders.slice(0, 3).map((order) => (
                                    <div key={order.id} className="bg-white p-6 md:px-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:translate-x-2 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400">Order #{order.id}</p>
                                                <h4 className="text-md font-black text-app-bg-dark italic uppercase">
                                                    {order.items && order.items.length > 0 
                                                        ? `${order.items[0].productName}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}` 
                                                        : 'Performance Part Order'}
                                                </h4>
                                                <p className="text-[10px] font-medium text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.grandTotal.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                                {order.status}
                                            </span>
                                            <button onClick={() => navigate(`/order/${order.id}`)} className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                    <ShoppingBag size={40} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your garage is empty. Let's build something.</p>
                                    <button onClick={() => navigate('/')} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Browse Catalog</button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Promo Banner */}
                    <div className="bg-app-bg-dark rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/40 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div>
                                <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">
                                    Tuned by <span className="text-primary italic">AI.</span>
                                </h2>
                                <p className="text-gray-400 font-medium max-w-md">Elevate your build with our precision AI optimization engine. Get tailored performance insights for your specific machine.</p>
                            </div>
                            <button onClick={() => navigate('/chat')} className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white hover:text-app-bg-dark transition-all">
                                Consult AI Builder <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        {icon} <span>{label}</span>
    </button>
);



export default CustomerDashboard;
