import React, { useState, useEffect } from 'react';
import {
  Car, ShoppingBag, MessageCircle, LogOut, LayoutDashboard, Zap, User,
  ChevronRight, Package, Clock, RefreshCw, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

const GarageDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dashboard Logic State
  const [activeTab, setActiveTab] = useState('garage');
  const [orders, setOrders] = useState<any[]>([]);
  const [fittingOrders, setFittingOrders] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fittingLoading, setFittingLoading] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchOrders();
    fetchFittingOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders/my-orders');
      setOrders(res.data);
      const spend = res.data.reduce((acc: number, o: any) => acc + o.grandTotal, 0);
      setTotalSpend(spend);
    } catch (err) { 
      console.error('Error fetching orders'); 
    } finally {
      setLoading(false);
    }
  };

  const fetchFittingOrders = async () => {
    setFittingLoading(true);
    try {
      const res = await apiClient.get('/orders/garage-fittings');
      setFittingOrders(res.data);
    } catch (err) {
      console.error('Error fetching fitting orders');
    } finally {
      setFittingLoading(false);
    }
  };

  const updateFittingStatus = async (orderId: number, status: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/fitting-status?status=${status}`);
      fetchFittingOrders();
    } catch (err) {
      alert('Failed to update fitting status');
    }
  };

  // Derived Stats Logic
  const activeBuildsCount = orders.filter(o => o.status !== 'DELIVERED').length;
  const savingsAmount = Math.round(totalSpend * 0.05); // 5% Garage Discount
  const fleetCount = orders.length > 0 ? Array.from(new Set(orders.map(o => o.vehicleId))).length : 0;

  return (
    <div className="min-h-screen bg-app-bg-light flex font-inter">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 bg-app-bg-dark flex-col border-r border-white/5 h-screen sticky top-0">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
            <span className="text-xl font-black italic tracking-tighter text-primary uppercase">MAD GARAGE</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Wholesale Portal</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Workshop Console" active={activeTab === 'garage'} onClick={() => setActiveTab('garage')} />
          <SidebarLink icon={<ShoppingBag size={18} />} label="Shop Wholesale" onClick={() => navigate('/')} />
          <SidebarLink icon={<Package size={18} />} label="Order History" onClick={() => navigate('/orders')} />
          <SidebarLink icon={<Zap size={18} />} label="Diagnostic AI" onClick={() => navigate('/chat')} />
          <div className="pt-10 mb-4 pb-2 border-b border-white/5 mx-2 text-[10px] font-black uppercase tracking-widest text-gray-600">Preferences</div>
          <SidebarLink icon={<User size={18} />} label="Profile & Settings" onClick={() => navigate('/profile')} />
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
              Workshop <span className="text-primary italic">Command</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ready to scale your garage, {user?.name?.split(' ')[0]}?</p>
          </div>

          <div className="flex items-center gap-6">
            <button 
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 bg-gray-50 text-app-bg-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-primary hover:text-white transition-all shadow-sm group"
            >
                <ShoppingBag size={14} className="group-hover:text-white" />
                Return to Shop
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Wholesale Elite</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">5% Tier Discount Active</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="h-12 w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg border border-primary/20 hover:scale-105 transition-all overflow-hidden"
            >
              {(user?.profileImageUrl && user.profileImageUrl.startsWith('/uploads/')) ? (
                <img src={`${BASE_SERVER_URL}${user.profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                (user?.name?.[0] || 'G')
              )}
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto w-full">
           {/* Workshop Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <StatusCard icon={<ShoppingBag className="text-blue-500" />} label="Active Builds" value={`${activeBuildsCount} Orders`} />
             <StatusCard icon={<Car className="text-primary" />} label="Fitting Requests" value={`${fittingOrders.length} Expected`} />
             <StatusCard icon={<Zap className="text-green-500" />} label="Total Savings" value={`₹${savingsAmount.toLocaleString()}`} />
             <StatusCard icon={<Package className="text-orange-500" />} label="Fleet Log" value={`${fleetCount} Vehicles`} />
           </div>

           {/* Incoming Installation Network */}
           <section className="space-y-8">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                 <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-red-500/10">
                   <Car size={20} />
                 </div>
                 <div>
                   <h2 className="text-xs font-black uppercase tracking-[0.3em] text-app-bg-dark">FITTING NETWORK TERMINAL</h2>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Incoming installations from local marketplace</p>
                 </div>
               </div>
               <button 
                 onClick={fetchFittingOrders}
                 className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-sm"
               >
                 <RefreshCw className={fittingLoading ? 'animate-spin' : ''} size={16} />
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {fittingLoading ? (
                 Array(3).fill(0).map((_, i) => <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)
               ) : fittingOrders.length > 0 ? (
                 fittingOrders.map((order) => (
                   <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 space-y-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Reference #{order.id}</span>
                       <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${order.fittingStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                         {order.fittingStatus?.replace('_', ' ')}
                       </span>
                     </div>
                     
                     <div>
                       <h4 className="text-xl font-black italic uppercase text-app-bg-dark tracking-tighter">{order.customerName}</h4>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{order.shippingAddress}</p>
                     </div>

                     <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Part Allocated</p>
                        <p className="text-xs font-black text-app-bg-dark italic uppercase">{order.items?.[0]?.productName || 'Custom Fabrication'}</p>
                     </div>

                     <div className="flex gap-3">
                       {order.fittingStatus === 'PENDING' && (
                         <button 
                            onClick={() => updateFittingStatus(order.id, 'INSPECTED')}
                            className="flex-1 bg-orange-500 text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
                         >
                           Mark Inspected
                         </button>
                       )}
                       {order.fittingStatus === 'INSPECTED' && (
                         <button 
                            onClick={() => updateFittingStatus(order.id, 'COMPLETED')}
                            className="flex-1 bg-green-500 text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
                         >
                           Complete Fitting
                         </button>
                       )}
                       <button 
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="w-14 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-app-bg-dark hover:text-white transition-all shadow-sm"
                       >
                         <Eye size={20} />
                       </button>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                    <Car size={48} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-lg font-black italic text-gray-500 uppercase tracking-tight">No Fitting Records</h3>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2">External fitting installation requests will manifest here.</p>
                 </div>
               )}
             </div>
           </section>

           {/* Recent Activity */}
           <section className="space-y-6">
             <div className="flex items-center justify-between px-2">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Live Workshop Activity</h2>
               <button onClick={() => navigate('/orders')} className="text-[10px] font-black uppercase text-primary hover:underline">Manage All Orders</button>
             </div>

             <div className="space-y-4">
               {loading ? (
                 <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                   Link Established. Syncing Data...
                 </div>
               ) : orders.length > 0 ? (
                 orders.slice(0, 5).map((order) => (
                   <div key={order.id} className="bg-white p-6 md:px-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:translate-x-2 transition-all">
                     <div className="flex items-center gap-6">
                       <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                         <Package size={24} />
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase text-gray-400">Inventory Order #{order.id}</p>
                         <h4 className="text-md font-black text-app-bg-dark italic uppercase">
                           {order.items && order.items.length > 0 
                             ? `${order.items[0].productName}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}` 
                             : 'Bulk Performance Parts'}
                         </h4>
                         <p className="text-[10px] font-medium text-gray-500 mt-1 flex items-center gap-2">
                           <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()} • ₹{order.grandTotal.toLocaleString()}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-6">
                       <span className={`text-[8px] font-black uppercase px-4 py-2 rounded-full shadow-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                         {order.status}
                       </span>
                       <button onClick={() => navigate(`/order/${order.id}`)} className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                         <ChevronRight size={18} />
                       </button>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                   <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                   <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tight">No Active Workshop Orders</h3>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 px-10">Start sourcing premium parts for your garage at exclusive wholesale rates.</p>
                   <button onClick={() => navigate('/')} className="mt-8 bg-primary text-white h-14 px-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all">Browse Wholesale Catalog</button>
                 </div>
               )}
             </div>
           </section>

           {/* Workshop Banner */}
           <div className="bg-app-bg-dark rounded-[3rem] p-10 md:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-primary/40 transition-all duration-700" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl text-center lg:text-left">
                  <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">
                    Precision <span className="text-primary italic">Diagnostic AI.</span>
                  </h2>
                  <p className="text-gray-400 font-medium text-lg leading-relaxed">
                    Instantly identify part failures and generate precision build quotes using our proprietary Workshop AI engine.
                  </p>
                </div>
                <button 
                    onClick={() => navigate('/chat')}
                    className="w-full lg:w-auto bg-primary text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-white hover:text-app-bg-dark transition-all shadow-2xl"
                >
                  Launch AI Terminal <ChevronRight size={18} />
                </button>
              </div>
           </div>
        </div>
      </main>

      {/* Floating AI Chat Assistant FAB */}
      <button 
        onClick={() => navigate('/chat')}
        className="fixed bottom-10 right-10 z-50 h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-110 active:scale-95 transition-all group overflow-hidden border-2 border-white/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:from-white/40 transition-all" />
        <MessageCircle size={28} className="text-white relative z-10" />
      </button>
    </div>
  );
};

// Internal Components
const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatusCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-6 group hover:border-primary/20 transition-all">
    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black italic text-app-bg-dark uppercase tracking-tighter">{value}</h3>
    </div>
  </div>
);

export default GarageDashboard;

