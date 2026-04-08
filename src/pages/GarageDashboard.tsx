import React, { useState, useEffect } from 'react';
import { 
  Car, History, MessageSquare, User, Settings, 
  Plus, Search, ChevronDown, ChevronUp, LogOut, LayoutDashboard,
  Disc, Gauge, Wrench, Flame, Zap, Sparkles, RefreshCw, XCircle,
  MessageCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const navigate = useNavigate();
  
  // Dashboard Logic State
  const [activeTab, setActiveTab] = useState('garage');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCondition, setActiveCondition] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

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
  }, [activeCategory, activeCondition]);

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
      if (selectedEngine) params.engineId = selectedEngine; // Filter by identified vehicle
      
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

  return (
    <div className="min-h-screen bg-app-bg-light flex font-inter">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-app-bg-dark flex-col border-r border-white/5 h-screen sticky top-0">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
            <span className="text-xl font-black italic tracking-tighter text-primary">MAD GARAGE</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">Wholesale Portal</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<Car size={18}/>} label="Marketplace" active={activeTab === 'garage'} onClick={() => setActiveTab('garage')} />
          <SidebarLink icon={<History size={18}/>} label="Order History" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <SidebarLink icon={<MessageSquare size={18}/>} label="Part Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
          <div className="pt-10 mb-4 pb-2 border-b border-white/5 mx-2 text-[10px] font-black uppercase tracking-widest text-gray-600">Account</div>
          <SidebarLink icon={<User size={18}/>} label="Profile" onClick={() => navigate('/profile')} />
          <SidebarLink icon={<Settings size={18}/>} label="Settings" />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all">
            <LogOut size={18} /> <span className="uppercase text-[10px] tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
          {/* Dashboard Header */}
          <header className="bg-white border-b border-gray-100 p-6 md:px-12 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-30 shadow-sm">
            <div className="flex-1 max-w-2xl relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search wholesale inventory..."
                    className="w-full bg-gray-50 border border-transparent p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Business Account'}</p>
                    <p className="text-sm font-black text-app-bg-dark italic">{user?.name}</p>
                </div>
                <div className="h-12 w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg border border-primary/20">
                    {user?.name?.[0] || 'M'}
                </div>
            </div>
          </header>

          <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto w-full">
            {/* Vehicle Selection Logic - Collapsible Bar */}
            <section className="space-y-4">
                <button 
                  onClick={() => setShowVehicleFilters(!showVehicleFilters)}
                  className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all ${selectedEngine ? 'bg-primary/5 border-primary/20 shadow-md shadow-red-500/5' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
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
                            <Select label="Engine" value={selectedEngine} options={engines} onChange={(v) => {setSelectedEngine(v); setShowVehicleFilters(false); fetchProducts();}} disabled={!selectedTrim} />
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

            {/* Filter Pills Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4 border-b border-gray-100">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${activeCategory === cat.id ? 'bg-primary text-white shadow-red-500/30' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    {['ALL', 'NEW', 'REFURBISHED', 'USED'].map(cond => (
                        <button 
                            key={cond}
                            onClick={() => setActiveCondition(cond)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCondition === cond ? 'bg-app-bg-dark text-white' : 'text-gray-400 hover:text-app-bg-dark'}`}
                        >
                            {cond === 'REFURBISHED' && <Sparkles size={10} className="inline mr-1" />}
                            {cond}
                        </button>
                    ))}
                </div>
            </div>

            {/* Marketplace Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.filter(p => !p.flagged && (p.name || p.deviceName || '').toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? 
                 products.filter(p => !p.flagged && (p.name || p.deviceName || '').toLowerCase().includes(searchQuery.toLowerCase())).map(product => (
                    <div 
                        key={product.id} 
                        className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group shadow-lg shadow-black/5 cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                    >
                        <div className="h-48 bg-gray-100 relative group-hover:bg-primary/5 transition-colors">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className="bg-primary/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">Wholesale</span>
                                <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg ${product.condition === 'REFURBISHED' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                                    {product.condition}
                                </span>
                            </div>
                            <div className="w-full h-full flex items-center justify-center">
                                <Car size={64} className="text-gray-200 group-hover:text-primary/20 transition-all duration-500" />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{product.category}</p>
                            <h4 className="text-lg font-black text-app-bg-dark uppercase italic leading-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h4>
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    {product.originalPrice && <p className="text-gray-400 text-[10px] line-through font-bold">₹{(product.originalPrice || 0).toLocaleString()}</p>}
                                    <p className="text-2xl font-black text-app-bg-dark italic tracking-tighter">₹{(product.garagePrice || product.price || 0).toLocaleString()}</p>
                                </div>
                                <button className="h-12 w-12 bg-app-bg-dark rounded-2xl flex items-center justify-center text-white hover:bg-primary hover:shadow-xl hover:shadow-red-500/30 transition-all transform active:scale-90">
                                    <ShoppingBag size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 text-center">
                        <ActivityIndicator />
                    </div>
                )}
            </section>

            {/* Floating Part Request Banner */}
            <div className="bg-app-bg-dark rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/40 transition-all duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                            Hard to find <br/>a <span className="text-primary italic border-b-4 border-primary">Specific Part?</span>
                        </h2>
                        <p className="text-gray-400 font-medium max-w-md">Our global sourcing experts can track down rare spares from scrap yards and manufacturers worldwide.</p>
                    </div>
                    <Link 
                        to="/request-part"
                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white hover:text-app-bg-dark transition-all shadow-2xl shadow-red-500/20"
                    >
                        Request Area <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
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

const Select: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void, disabled?: boolean }> = ({ label, value, options, onChange, disabled }) => (
    <div className={`flex flex-col ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 transition-colors">{label}</label>
        <select 
            value={value} 
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-app-bg-dark outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
        >
            <option value="">{`Select ${label}`}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const ActivityIndicator: React.FC = () => (
    <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">Syncing Inventory...</p>
    </div>
);

export default GarageDashboard;
