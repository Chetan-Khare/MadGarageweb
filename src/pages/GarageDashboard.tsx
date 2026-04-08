import React, { useState, useEffect } from 'react';
import {
  Car, History, MessageSquare, User, Settings,
  Plus, Search, ChevronDown, ChevronUp, LogOut, LayoutDashboard,
  Disc, Gauge, Wrench, Flame, Zap, Sparkles, RefreshCw, XCircle,
  MessageCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const CATEGORIES = [
  { id: 'All', label: 'All Parts', icon: <LayoutDashboard size={14} /> },
  { id: 'Brakes', label: 'Brakes', icon: <Disc size={14} /> },
  { id: 'Engine', label: 'Engine', icon: <Gauge size={14} /> },
  { id: 'Suspension', label: 'Suspension', icon: <Wrench size={14} /> },
  { id: 'Exhaust', label: 'Exhaust', icon: <Flame size={14} /> },
  { id: 'Electrical', label: 'Electrical', icon: <Zap size={14} /> },
];

const GarageDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Dashboard Logic State
  const [activeTab, setActiveTab] = useState('garage');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCondition, setActiveCondition] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [identifiedVehicles, setIdentifiedVehicles] = useState<Set<string>>(new Set());
  const [totalSpend, setTotalSpend] = useState(0);

  // 6-Step Vehicle Selection State
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);

  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchMakes();
    fetchProducts();
    fetchOrders();
  }, [activeCategory, activeCondition]);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders/my-orders');
      setOrders(res.data);
      const spend = res.data.reduce((acc: number, o: any) => acc + o.grandTotal, 0);
      setTotalSpend(spend);
    } catch (err) { console.error('Error fetching orders'); }
  };

  const fetchMakes = async () => {
    try {
      const res = await apiClient.get('/vehicles/makes');
      setMakes(res.data);
    } catch (err) { console.error('Error fetching makes'); }
  };

  const handleMakeChange = async (make: string) => {
    setSelectedMake(make);
    setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
    setModels([]); setYears([]); setFuels([]); setTrims([]); setEngines([]);
    if (make) {
      try {
        const res = await apiClient.get(`/vehicles/models?make=${make}`);
        setModels(res.data);
      } catch (e) { console.error(e); }
    }
  };

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
    if (model) {
      try {
        const res = await apiClient.get(`/vehicles/years?make=${selectedMake}&model=${model}`);
        setYears(res.data.map((y: any) => y.toString()));
      } catch (e) { console.error(e); }
    }
  };

  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
    if (year) {
      try {
        const res = await apiClient.get(`/vehicles/fuels?make=${selectedMake}&model=${selectedModel}&year=${year}`);
        setFuels(res.data);
      } catch (e) { console.error(e); }
    }
  };

  const handleFuelChange = async (fuel: string) => {
    setSelectedFuel(fuel);
    setSelectedTrim(''); setSelectedEngine('');
    if (fuel) {
      try {
        const res = await apiClient.get(`/vehicles/trims?make=${selectedMake}&model=${selectedModel}&year=${selectedYear}&fuel=${fuel}`);
        setTrims(res.data);
      } catch (e) { console.error(e); }
    }
  };

  const handleTrimChange = async (trim: string) => {
    setSelectedTrim(trim);
    setSelectedEngine('');
    if (trim) {
      try {
        const res = await apiClient.get(`/vehicles/engines?make=${selectedMake}&model=${selectedModel}&year=${selectedYear}&fuel=${selectedFuel}&trim=${trim}`);
        setEngines(res.data);
      } catch (e) { console.error(e); }
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (activeCondition !== 'ALL') params.condition = activeCondition;
      if (selectedEngine) {
        params.engineId = selectedEngine;
        setIdentifiedVehicles(prev => new Set(prev).add(selectedEngine));
      }

      const res = await apiClient.get('/products/garage', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching inventory');
      // Fallback for demo if backend is empty
      if (products.length === 0) {
        setProducts([
          { id: 1, name: 'Brembo Ceramic Pads', price: 4500, originalPrice: 5200, condition: 'NEW', category: 'Brakes' },
          { id: 2, name: 'K&N High Flow Filter', price: 2800, originalPrice: 3500, condition: 'REFURBISHED', category: 'Engine' },
          { id: 3, name: 'Bilstein B6 Struts', price: 12000, originalPrice: 15000, condition: 'NEW', category: 'Suspension' },
        ]);
      }
    } finally { setLoading(false); }
  };

  // Derived Stats Logic
  const activeBuildsCount = orders.filter(o => o.status !== 'DELIVERED').length;
  const savingsAmount = Math.round(totalSpend * 0.05); // 5% Garage Discount
  const fleetCount = identifiedVehicles.size || (orders.length > 0 ? orders.length + 2 : 0);

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
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Workshop Feed" active={activeTab === 'garage'} onClick={() => setActiveTab('garage')} />
          <SidebarLink icon={<ShoppingBag size={18} />} label="Order History" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarLink icon={<Zap size={18} />} label="Diagnostic AI" onClick={() => navigate('/chat')} />
          <div className="pt-10 mb-4 pb-2 border-b border-white/5 mx-2 text-[10px] font-black uppercase tracking-widest text-gray-600">Preferences</div>
          <SidebarLink icon={<User size={18} />} label="Garage Profile" onClick={() => navigate('/profile')} />
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
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Wholesale Elite</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">5% Tier Discount Active</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="h-12 w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg border border-primary/20 hover:scale-105 transition-all"
            >
              {user?.name?.[0] || 'G'}
            </button>
          </div>
        </header>

        <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto w-full">
          {/* Workshop Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatusCard icon={<ShoppingBag className="text-blue-500" />} label="Active Builds" value={`${activeBuildsCount} Orders`} />
            <StatusCard icon={<Zap className="text-green-500" />} label="Total Savings" value={`₹${savingsAmount.toLocaleString()}`} />
            <StatusCard icon={<Car className="text-primary" />} label="Fleet Log" value={`${fleetCount} Vehicles`} />
          </div>

          {/* Vehicle Selection Logic - Diagnostic Terminal Style */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Diagnostic Identification</h2>
              <p className="text-[9px] font-black uppercase text-primary">Precise Fitment Protocol</p>
            </div>
            <button
              onClick={() => setShowVehicleFilters(!showVehicleFilters)}
              className={`w-full flex items-center justify-between p-8 rounded-[2.5rem] border transition-all ${selectedEngine ? 'bg-primary/5 border-primary/20 shadow-xl shadow-red-500/5' : 'bg-white border-gray-100 hover:border-primary/20 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedEngine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Car size={20} />
                </div>
                <div className="text-left">
                  <h3 className={`text-sm font-black uppercase tracking-tighter ${selectedEngine ? 'text-primary italic' : 'text-app-bg-dark'}`}>
                    {selectedEngine ? `${selectedYear} ${selectedMake} ${selectedModel} • ${selectedTrim}` : 'Select Workshop Vehicle'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Identify precision matched wholesale parts</p>
                </div>
              </div>
              {showVehicleFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showVehicleFilters && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-4">
                  <Select label="Make" value={selectedMake} options={makes} onChange={handleMakeChange} />
                  <Select label="Model" value={selectedModel} options={models} onChange={handleModelChange} disabled={!selectedMake} />
                </div>
                <div className="space-y-4">
                  <Select label="Year" value={selectedYear} options={years} onChange={handleYearChange} disabled={!selectedModel} />
                  <Select label="Fuel" value={selectedFuel} options={fuels} onChange={handleFuelChange} disabled={!selectedYear} />
                </div>
                <div className="space-y-4">
                  <Select label="Trim" value={selectedTrim} options={trims} onChange={handleTrimChange} disabled={!selectedFuel} />
                  <Select label="Engine" value={selectedEngine} options={engines} onChange={(v) => { setSelectedEngine(v); setShowVehicleFilters(false); fetchProducts(); }} disabled={!selectedTrim} />
                </div>
                <button
                  onClick={() => { setSelectedMake(''); setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine(''); }}
                  className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:underline p-2 ml-auto md:col-span-3"
                >
                  <XCircle size={14} /> Reset Filters
                </button>
              </div>
            )}
          </section>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4 border-b border-gray-100">
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${activeCategory === cat.id ? 'bg-primary text-white shadow-red-500/30' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm self-start md:self-auto">
              {['ALL', 'NEW', 'REFURBISHED', 'USED'].map(cond => (
                <button
                  key={cond}
                  onClick={() => setActiveCondition(cond)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCondition === cond ? 'bg-app-bg-dark text-white' : 'text-gray-400 hover:text-app-bg-dark'}`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Marketplace Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Live Workshop Catalog</h2>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Everything 5% OFF</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 italic font-bold text-gray-400 uppercase tracking-widest">
                  Establishing Wholesale Link...
                </div>
              ) : products.length > 0 ? (
                products.filter(p => !p.flagged && (p.name || p.deviceName || '').toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col group hover:translate-y-[-8px] transition-all cursor-pointer overflow-hidden relative"
                    onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                  >
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 scale-75 origin-top-right">
                      <span className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">-5%</span>
                      {product.condition && (
                        <span className="bg-app-bg-dark text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg opacity-80">{product.condition}</span>
                      )}
                    </div>

                    <div className="h-40 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-all overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                        <Car size={64} className="opacity-10 group-hover:opacity-20 transition-all rotate-12 group-hover:rotate-0" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{product.category}</p>
                      <h4 className="text-md font-black text-app-bg-dark italic uppercase line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name || product.deviceName}</h4>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-end justify-between">
                      <div>
                        {product.originalPrice && <p className="text-[10px] text-gray-400 line-through font-bold decoration-primary/40">₹{product.originalPrice.toLocaleString()}</p>}
                        <p className="text-2xl font-black text-app-bg-dark italic tracking-tighter">₹{(product.garagePrice || product.price || 0).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="h-10 w-10 bg-app-bg-dark text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform active:scale-95 shadow-lg shadow-black/5"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <LayoutDashboard size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching parts in workshop catalog.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Floating AI Chat Assistant FAB */}
      <button className="fixed bottom-10 right-10 z-50 h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-110 active:scale-95 transition-all group overflow-hidden border-2 border-white/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:from-white/40 transition-all" />
        <MessageCircle size={28} className="text-white relative z-10" />
      </button>
    </div>
  );
};

// Internal Components
const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </button>
);

const StatusCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center gap-6 group hover:border-primary/20 transition-all">
    <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black italic text-app-bg-dark uppercase tracking-tighter">{value}</h3>
    </div>
  </div>
);

const Select: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void, disabled?: boolean }> = ({ label, value, options, onChange, disabled }) => (
  <div className={`flex flex-col ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 transition-colors">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-black/5 border border-white/5 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-app-bg-dark outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
    >
      <option value="">{`Select ${label}`}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default GarageDashboard;
