import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronRight, Zap, Target, ShieldCheck, Car, 
  ChevronDown, ChevronUp, ShoppingBag, SlidersHorizontal, 
  LayoutGrid, List 
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 6-Step Vehicle Selection State
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);
  const [engines, setEngines] = useState<any[]>([]);

  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);

  const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

  // Initial Data Fetch
  useEffect(() => {
    fetchMakes();
    fetchProducts();
  }, [selectedCategory]);

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
        let url = '/products';
        const params: any = {};
        if (selectedEngine) params.engineId = selectedEngine;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        
        const response = await apiClient.get(url, { params });
        setProducts(response.data);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([
            { id: 1, name: 'Brembo Racing Pads', price: 12500, garagePrice: 10500, category: 'Brakes', brand: 'Brembo' },
            { id: 2, name: 'Garrett G-Series Turbo', price: 145000, garagePrice: 132000, category: 'Engine', brand: 'Garrett' },
            { id: 3, name: 'HKS Hi-Power Exhaust', price: 65000, garagePrice: 58000, category: 'Exhaust', brand: 'HKS' }
        ]);
    } finally {
        setLoading(false);
    }
  };

  const handleFindParts = () => {
    fetchProducts();
    const element = document.getElementById('marketplace-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

   const filteredProducts = products.filter(p => {
    if (p.flagged) return false; // Safety Shield: Hide flagged listings
    const nameToSearch = (p.partName || p.name || '').toLowerCase();
    const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[750px] bg-app-bg-dark overflow-hidden flex items-center justify-center pt-20 pb-10">
        {/* Background Grain / Gradient */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(223,35,36,0.3)_0%,transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <img 
                src="/logo.png" 
                alt="MAD GARAGE" 
                className="h-24 aspect-square object-contain rounded-full overflow-hidden brightness-110 drop-shadow-[0_0_15px_rgba(223,35,36,0.3)]" 
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 uppercase">
            Built for <span className="text-primary italic">SPEED.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Premium performance parts for the serious enthusiast. Engineered for the track, optimized for your garage.
          </p>

          {/* Core Feature: 6-Step Vehicle Filter - Collapsible Bar */}
          <div className="max-w-6xl mx-auto space-y-4">
            <button 
                onClick={() => setShowVehicleFilters(!showVehicleFilters)}
                className={`w-full flex items-center justify-between p-6 md:p-8 rounded-[2.5rem] border transition-all ${selectedEngine ? 'bg-primary/5 border-primary/20 shadow-xl shadow-red-500/5' : 'bg-white border-gray-100 shadow-2xl hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${selectedEngine ? 'bg-primary text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 text-gray-400'}`}>
                        <Zap size={24} className={selectedEngine ? 'animate-pulse' : ''} />
                    </div>
                    <div className="text-left">
                        <h3 className={`text-sm md:text-base font-black uppercase tracking-widest ${selectedEngine ? 'text-primary italic' : 'text-app-bg-dark'}`}>
                            {selectedEngine ? `${selectedYear} ${selectedMake} ${selectedModel} • ${selectedTrim}` : 'Personalized Fitment'}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select your vehicle to find precision-matched parts</p>
                    </div>
                </div>
                {showVehicleFilters ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {showVehicleFilters && (
                <div className="bg-white p-8 md:p-12 rounded-[2.8rem] border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <SelectField label="Make" value={selectedMake} options={makes} onChange={handleMakeChange} />
                      <SelectField label="Model" value={selectedModel} options={models} onChange={handleModelChange} disabled={!selectedMake} />
                      <SelectField label="Year" value={selectedYear} options={years} onChange={handleYearChange} disabled={!selectedModel} />
                      <SelectField label="Fuel" value={selectedFuel} options={fuels} onChange={handleFuelChange} disabled={!selectedYear} />
                      <SelectField label="Trim" value={selectedTrim} options={trims} onChange={handleTrimChange} disabled={!selectedFuel} />
                      <SelectField label="Engine" value={selectedEngine} options={engines.map(e => ({ value: e.id, label: `${e.engineCode} - ${e.horsepower}HP` }))} onChange={(v) => setSelectedEngine(v)} disabled={!selectedTrim} isEngine />
                    </div>
                    
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50">
                        <button 
                            onClick={() => { setSelectedMake(''); setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine(''); }}
                            className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:underline group"
                        >
                            <Zap size={14} className="group-hover:scale-125 transition-transform" /> Reset Vehicle Profile
                        </button>
                        <button 
                            onClick={handleFindParts}
                            disabled={!selectedEngine}
                            className="w-full md:w-auto bg-primary text-white h-16 px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/30 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none active:scale-95"
                        >
                            Identify Parts <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex items-center gap-4 group">
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all">
                    <ShieldCheck size={28} className="text-primary group-hover:text-white transition-all" />
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-tight text-app-bg-dark">Certified Parts</h4>
                    <p className="text-sm text-gray-500 font-medium">100% Genuine Performance Spares</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 group">
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all">
                    <Target size={28} className="text-primary group-hover:text-white transition-all" />
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-tight text-app-bg-dark">Precision Fitment</h4>
                    <p className="text-sm text-gray-500 font-medium">AI-matched for your vehicle</p>
                </div>
            </div>

            <div className="flex items-center gap-4 group">
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all">
                    <Search size={28} className="text-primary group-hover:text-white transition-all" />
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-tight text-app-bg-dark">Hard-to-Find Spares</h4>
                    <p className="text-sm text-gray-500 font-medium">Global sourcing at your service</p>
                </div>
            </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-12 flex items-center gap-4">
                Marketplace <div className="h-1 flex-1 bg-primary/10"></div>
            </h2>

            {/* Catalog Toolbar */}
            <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 py-6 border-b border-gray-100 sticky top-16 z-30 bg-white/95 backdrop-blur-md">
                <div className="flex-1 w-full max-w-2xl bg-gray-50 rounded-2xl flex items-center px-6 py-1 border border-gray-100 focus-within:border-primary/30 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search parts catalog (e.g. Turbo, Pads)..."
                        className="bg-transparent border-none outline-none flex-1 p-3 text-sm font-bold text-app-bg-dark placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide">
                         {categories.map(cat => (
                             <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-app-bg-dark text-white shadow-lg' : 'text-gray-400 hover:text-app-bg-dark'}`}
                             >
                                 {cat}
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="py-40 flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">Syncing Inventory...</p>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer"
                            onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                        >
                            <div className="aspect-square bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
                                 <img 
                                    src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `http://127.0.0.1:8080${product.imageUrl}`) : 'https://via.placeholder.com/300'} 
                                    alt={product.partName || product.name}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop';
                                    }}
                                />
                                <div className="absolute top-4 left-4 z-10 flex gap-2">
                                    <span className="bg-primary/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">New</span>
                                    <span className="bg-app-bg-dark/80 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">{product.category}</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">In Stock</span>
                                </div>
                                <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-tight mb-6 group-hover:text-primary transition-colors line-clamp-2">
                                    {product.partName || product.name}
                                </h3>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Pricing</p>
                                        <p className="text-2xl font-black italic text-app-bg-dark tracking-tighter">₹{(product.garagePrice || product.price || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-app-bg-dark text-white rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all shadow-lg group-hover:shadow-red-500/30">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center space-y-8 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                    <ShoppingBag size={64} className="mx-auto text-gray-200" />
                    <div>
                        <h2 className="text-2xl font-black italic text-app-bg-dark uppercase">No matches found</h2>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2">Adjust your filters or try another build configuration</p>
                    </div>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};

// Helper Components
const SelectField: React.FC<{ 
  label: string; 
  value: string; 
  options: any[]; 
  onChange: (v: string) => void; 
  disabled?: boolean;
  isEngine?: boolean;
}> = ({ label, value, options, onChange, disabled, isEngine }) => (
  <div className={`flex flex-col ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">{label}</label>
    <div className="relative">
        <select 
          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-app-bg-dark outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronRight size={14} className="rotate-90" />
        </div>
    </div>
  </div>
);

export default HomePage;
