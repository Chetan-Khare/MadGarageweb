import React, { useState, useEffect } from 'react';
import {
  Car, ShoppingBag, MessageCircle, LogOut, LayoutDashboard, Zap, User,
  ChevronRight, Package, Clock, RefreshCw, Eye, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

import Marketplace from '../components/Marketplace';

const GarageDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dashboard Logic State
  const [activeTab, setActiveTab] = useState('garage');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [fittingOrders, setFittingOrders] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fittingLoading, setFittingLoading] = useState(false);

  // Initial Data Fetch
  const location = useLocation();
  useEffect(() => {
    fetchOrders();
    fetchFittingOrders();
  }, [location]);

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
  const savingsAmount = totalSpend > 0 ? Math.round(totalSpend * 0.03) : 0; // Dynamic Average Estimate
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
          <SidebarLink icon={<ShoppingBag size={18} />} label="Shop Wholesale" active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
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

      {/* Mobile Drawer (Visible under lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Drawer Content */}
          <div className="relative w-72 bg-app-bg-dark h-full shadow-2xl border-r border-white/5 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
                <span className="text-xl font-black italic tracking-tighter text-primary uppercase">MAD GARAGE</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              <SidebarLink 
                icon={<LayoutDashboard size={18} />} 
                label="Workshop Console" 
                active={activeTab === 'garage'} 
                onClick={() => { setActiveTab('garage'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarLink 
                icon={<ShoppingBag size={18} />} 
                label="Shop Wholesale" 
                active={activeTab === 'shop'} 
                onClick={() => { setActiveTab('shop'); setIsMobileMenuOpen(false); }} 
              />
              <SidebarLink icon={<Package size={18} />} label="Order History" onClick={() => { navigate('/orders'); setIsMobileMenuOpen(false); }} />
              <SidebarLink icon={<Zap size={18} />} label="Diagnostic AI" onClick={() => { navigate('/chat'); setIsMobileMenuOpen(false); }} />
              <div className="pt-8 mb-4 pb-2 border-b border-white/5 mx-2 text-[10px] font-black uppercase tracking-widest text-gray-600">Preferences</div>
              <SidebarLink icon={<User size={18} />} label="Profile & Settings" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} />
            </nav>

            <div className="p-6 border-t border-white/5">
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 p-4 sm:p-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl hover:text-primary transition-all shadow-sm"
            >
              <Menu size={20} className="text-app-bg-dark" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-app-bg-dark italic uppercase tracking-tight">
                Workshop <span className="text-primary italic">Command</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ready to scale your garage, {user?.name?.split(' ')[0]}?</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
                onClick={() => navigate('/')}
                className="hidden md:flex items-center gap-2 bg-gray-50 text-app-bg-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-primary hover:text-white transition-all shadow-sm group"
            >
                <ShoppingBag size={14} className="group-hover:text-white" />
                Return to Shop
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Wholesale Elite</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Multi-Tier Pricing Active</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="h-10 w-10 sm:h-12 sm:w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg border border-primary/20 hover:scale-105 transition-all overflow-hidden"
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
          {activeTab === 'shop' ? (
            <Marketplace isGarage={true} />
          ) : (
            <>
              {/* Workshop Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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

             <div className="flex overflow-x-auto gap-4 sm:gap-8 pb-12 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
               {fittingLoading ? (
                 Array(3).fill(0).map((_, i) => <div key={i} className="flex-shrink-0 w-full md:w-[400px] h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />)
               ) : fittingOrders.length > 0 ? (
                 fittingOrders.filter(o => 
                   ['SHIPPED', 'ARRIVED_AT_GARAGE'].includes(o.status) || o.fittingStatus !== 'COMPLETED'
                 ).map((order) => (
                   <div key={order.id} className="flex-shrink-0 w-full md:w-[400px] snap-center bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 space-y-4 sm:space-y-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                     <div className="flex items-center justify-between">
                       <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary italic">Reference #{order.id}</span>
                       <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                         order.status === 'ARRIVED_AT_GARAGE' ? 'bg-cyan-100 text-cyan-600' : 
                         order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' :
                         order.fittingStatus === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                       }`}>
                         {order.status === 'SHIPPED' ? 'IN TRANSIT' : (order.fittingStatus?.replace('_', ' ') || 'PENDING')}
                       </span>
                     </div>
                     
                     <div>
                       <h4 className="text-lg sm:text-xl font-black italic uppercase text-app-bg-dark tracking-tighter">{order.customerName}</h4>
                       <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{order.shippingAddress}</p>
                     </div>

                     <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl space-y-1 sm:space-y-2">
                         <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Part Allocated</p>
                         <p className="text-xs font-black text-app-bg-dark italic uppercase truncate">{order.items?.[0]?.productName || 'Custom Fabrication'}</p>
                     </div>

                     <div className="flex gap-3">
                       {order.status === 'SHIPPED' && (
                         <button 
                            onClick={() => updateFittingStatus(order.id, 'ARRIVED_AT_GARAGE')}
                            className="flex-1 bg-blue-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                         >
                           Verify Arrival
                         </button>
                       )}
                       {order.status === 'ARRIVED_AT_GARAGE' && order.fittingStatus === 'PENDING_INSPECTION' && (
                         <button 
                            onClick={() => updateFittingStatus(order.id, 'INSPECTED')}
                            className="flex-1 bg-orange-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
                         >
                           Mark Inspected
                         </button>
                       )}
                       {order.fittingStatus === 'INSPECTED' && (
                         <button 
                            onClick={() => updateFittingStatus(order.id, 'COMPLETED')}
                            className="flex-1 bg-green-500 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
                         >
                           Complete Fitting
                         </button>
                       )}
                       <button 
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="w-12 sm:w-14 bg-gray-50 text-gray-400 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-app-bg-dark hover:text-white transition-all shadow-sm shrink-0"
                       >
                         <Eye size={18} className="sm:size-5" />
                       </button>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 w-full">
                    <Car size={48} className="mx-auto text-gray-200 mb-6" />
                    <h3 className="text-lg font-black italic text-gray-500 uppercase tracking-tight">No Fitting Records</h3>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 px-6">External fitting installation requests will manifest here.</p>
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
                   <div key={order.id} className="bg-white p-4 sm:p-6 md:px-10 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 group hover:translate-x-2 transition-all">
                     <div className="flex items-center gap-6">
                       <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                         <Package size={20} className="sm:size-6" />
                       </div>
                       <div>
                         <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Inventory Order #{order.id}</p>
                         <h4 className="text-sm sm:text-md font-black text-app-bg-dark italic uppercase truncate">
                           {order.items && order.items.length > 0 
                             ? `${order.items[0].productName}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}` 
                             : 'Bulk Performance Parts'}
                         </h4>
                         <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 mt-1 flex items-center gap-2">
                           <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()} • ₹{order.grandTotal.toLocaleString()}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto pt-3 md:pt-0 border-t border-gray-50 md:border-t-0">
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
                 <div className="py-20 text-center bg-white rounded-[1.5rem] sm:rounded-[3rem] border border-dashed border-gray-200">
                   <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                   <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tight">No Active Workshop Orders</h3>
                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 px-10">Start sourcing premium parts for your garage at exclusive wholesale rates.</p>
                   <button onClick={() => navigate('/')} className="mt-8 bg-primary text-white h-14 px-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all">Browse Wholesale Catalog</button>
                 </div>
               )}
             </div>
           </section>

           {/* Workshop Banner */}
           <div className="bg-app-bg-dark rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-primary/40 transition-all duration-700" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="max-w-2xl text-center lg:text-left">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-4 md:mb-6">
                    Precision <span className="text-primary italic">Diagnostic AI.</span>
                  </h2>
                  <p className="text-gray-400 font-medium text-sm sm:text-lg leading-relaxed">
                    Instantly identify part failures and generate precision build quotes using our proprietary Workshop AI engine.
                  </p>
                </div>
                <button 
                    onClick={() => navigate('/chat')}
                    className="w-full lg:w-auto bg-primary text-white px-6 py-4 sm:px-12 sm:py-6 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-4 hover:bg-white hover:text-app-bg-dark transition-all shadow-2xl shrink-0"
                >
                  Launch AI Terminal <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
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
  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-3 sm:gap-6 group hover:border-primary/20 transition-all">
    <div className="h-10 w-10 sm:h-16 sm:w-16 bg-gray-50 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner shrink-0 [&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 truncate">{label}</p>
      <h3 className="text-sm sm:text-xl md:text-2xl font-black italic text-app-bg-dark uppercase tracking-tighter truncate">{value}</h3>
    </div>
  </div>
);

export default GarageDashboard;

