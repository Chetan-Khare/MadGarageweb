import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Zap, ChevronDown, ChevronUp, ShoppingBag,
  Plus, Heart, X, Navigation, MapPin, ShieldCheck
} from 'lucide-react';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

interface MarketplaceProps {
  isGarage?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ isGarage = false }) => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { city, detectLocation, nearbyGarages, setManualCity } = useLocation();

  const effectiveIsGarage = isGarage;

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
  const [searchTerm, setSearchTerm] = useState(q || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [manualCity, setManualCityInput] = useState('');
  const [showGaragesDropdown, setShowGaragesDropdown] = useState(false);

  const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

  useEffect(() => {
    fetchMakes();
    fetchProducts();
  }, [selectedCategory, selectedCondition, effectiveIsGarage]);

  useEffect(() => {
    if (q) setSearchTerm(q);
  }, [q]);

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
      if (selectedEngine) params.engineId = selectedEngine;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      
      const endpoint = effectiveIsGarage ? '/products/garage' : '/products';
      const response = await apiClient.get(endpoint, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Removed demo products fallback
    } finally {
      setLoading(false);
    }
  };

  const handleFindParts = () => {
    fetchProducts();
    document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProducts = products.filter((p: any) => {
    if (p.flagged) return false;
    const name = (p.partName || p.name || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesCondition = selectedCondition === 'ALL' || p.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  return (
    <div className="flex flex-col w-full">
      {/* Hero / Fitment Section */}
      <section className={`relative transition-all duration-700 ${effectiveIsGarage ? 'py-10' : 'min-h-[750px] flex items-center justify-center pt-20 pb-10'} bg-app-bg-dark overflow-hidden`}>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(223,35,36,0.3)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          {!effectiveIsGarage && (
            <>
              <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="MAD GARAGE" className="h-24 aspect-square object-contain rounded-full overflow-hidden brightness-110 drop-shadow-[0_0_15px_rgba(223,35,36,0.3)]" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 uppercase">
                Built for <span className="text-primary italic">SPEED.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                Premium performance parts for the serious enthusiast.
              </p>
            </>
          )}

          {effectiveIsGarage && (
            <div className="mb-10 text-left">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                Workshop <span className="text-primary">Catalog</span>
              </h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2 opacity-60">Elite Wholesale Access Enabled</p>
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-4">
            <button
              onClick={() => setShowVehicleFilters(!showVehicleFilters)}
              className={`w-full flex items-center justify-between p-6 md:p-8 rounded-[2.5rem] border transition-all ${selectedEngine ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-white border-gray-100 shadow-2xl hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${selectedEngine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Zap size={24} />
                </div>
                <div className="text-left">
                  <h3 className={`text-sm md:text-base font-black uppercase tracking-widest ${selectedEngine ? 'text-primary italic' : 'text-app-bg-dark'}`}>
                    {selectedEngine ? `${selectedYear} ${selectedMake} ${selectedModel} ${selectedTrim}` : 'Identify Your Build'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select vehicle for precision fitment matching</p>
                </div>
              </div>
              {showVehicleFilters ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            
            {showVehicleFilters && (
              <div className="bg-white p-8 md:p-12 rounded-[2.8rem] border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  <SelectField label="Make" value={selectedMake} options={makes} onChange={handleMakeChange} />
                  <SelectField label="Model" value={selectedModel} options={models} onChange={handleModelChange} disabled={!selectedMake} />
                  <SelectField label="Year" value={selectedYear} options={years} onChange={handleYearChange} disabled={!selectedModel} />
                  <SelectField label="Fuel" value={selectedFuel} options={fuels} onChange={handleFuelChange} disabled={!selectedYear} />
                  <SelectField label="Trim" value={selectedTrim} options={trims} onChange={handleTrimChange} disabled={!selectedFuel} />
                  <SelectField label="Engine" value={selectedEngine} options={engines.map((e: any) => ({ value: e.id, label: `${e.engineCode} - ${e.horsepower}HP` }))} onChange={(v) => setSelectedEngine(v)} disabled={!selectedTrim} />
                </div>
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50">
                  <button
                    onClick={() => { setSelectedMake(''); setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine(''); setSearchTerm(''); }}
                    className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:underline"
                  >
                    <X size={14} /> Clear Vehicle Profile
                  </button>
                  <button
                    onClick={handleFindParts}
                    disabled={!selectedEngine}
                    className="w-full md:w-auto bg-primary text-white h-16 px-12 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Sync Fitment <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nearby Garages Dropdown Section */}
      <section className="bg-white py-4 border-b border-gray-100 z-40 sticky top-[80px]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-red-500/10 shrink-0">
              <Navigation size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-app-bg-dark flex items-center gap-2">
                    Fitting Hub {city && <span className="text-primary italic">in {city}</span>}
                  </h3>
                  <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">
                    {nearbyGarages.length > 0 ? `${nearbyGarages.length} Partner Garages Available` : 'Detecting local tuning partners...'}
                  </p>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowGaragesDropdown(!showGaragesDropdown)}
                    disabled={nearbyGarages.length === 0}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${showGaragesDropdown ? 'bg-app-bg-dark text-white' : 'bg-primary text-white hover:bg-black disabled:opacity-50'}`}
                  >
                    {showGaragesDropdown ? 'Minimize Hub' : 'View Verified Garages'} 
                    {showGaragesDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showGaragesDropdown && nearbyGarages.length > 0 && (
                    <div className="absolute right-0 mt-4 w-[350px] md:w-[450px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-4 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 mb-4">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Partner Garage</span>
                        <X size={14} className="text-gray-400 cursor-pointer hover:text-primary" onClick={() => setShowGaragesDropdown(false)} />
                      </div>
                      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-4">
                          {nearbyGarages.map((garage) => (
                            <div key={garage.id} className="group bg-gray-50 border border-transparent hover:border-primary/20 p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-4">
                              <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden font-black shrink-0 border border-gray-100">
                                {garage.profileImageUrl ? (
                                  <img src={`${BASE_SERVER_URL}${garage.profileImageUrl}`} alt={garage.firstName} className="w-full h-full object-cover" />
                                ) : (
                                  garage.firstName?.[0]
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black italic uppercase tracking-tighter text-app-bg-dark truncate">{garage.firstName} {garage.lastName}</h4>
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-gray-400 mt-1">
                                  <MapPin size={8} className="text-primary" />
                                  {garage.distance?.toFixed(1)} km away • {garage.city}
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  {[1, 2, 3, 4, 5].map(s => <ShieldCheck key={s} size={8} className="text-primary" />)}
                                  <span className="ml-2 text-[7px] font-black uppercase text-primary">Certified Partner</span>
                                </div>
                              </div>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3">
                {city && (
                  <button 
                    onClick={() => setIsEditingCity(!isEditingCity)}
                    className="text-[9px] font-black uppercase text-gray-400 tracking-widest hover:text-primary flex items-center gap-1"
                  >
                    {isEditingCity ? 'Cancel' : 'Change City'}
                  </button>
                )}
                <button 
                  onClick={detectLocation}
                  className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1"
                >
                  <Navigation size={10} /> Auto-Detect
                </button>
              </div>
              {isEditingCity && (
                <div className="mt-2 flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 animate-in slide-in-from-right-2">
                  <input 
                    type="text" 
                    placeholder="Enter City"
                    className="bg-transparent border-none p-2 text-[10px] font-bold outline-none w-40 text-app-bg-dark"
                    value={manualCity}
                    onChange={e => setManualCityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && manualCity) {
                        setManualCity(manualCity);
                        setIsEditingCity(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (manualCity) {
                        setManualCity(manualCity);
                        setIsEditingCity(false);
                      }
                    }}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-app-bg-dark transition-colors"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coming Soon Message if no garages found in city */}
        {city && nearbyGarages.length === 0 && (
          <div className="container mx-auto px-4 mt-4 animate-in fade-in duration-700">
            <div className="bg-app-bg-dark rounded-[2rem] p-6 flex items-center gap-6 border border-primary/20 overflow-hidden group">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 animate-pulse">
                <Zap size={24} fill="currentColor" />
              </div>
              <div>
                <h4 className="text-sm font-black italic text-white uppercase tracking-tighter">
                  MAD GARAGE LIVE <span className="text-primary italic">COMING SOON</span> TO {city}
                </h4>
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">
                  We're expanding our verified network 24/7. Hold tight, precision tuning is arriving for your city.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Marketplace Grid Section */}
      <section id="marketplace-section" className={`py-20 ${effectiveIsGarage ? 'bg-app-bg-light' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className={`text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 ${effectiveIsGarage ? 'text-app-bg-dark' : 'text-app-bg-dark'}`}>
              Marketplace <div className="h-1 w-20 bg-primary/20"></div>
            </h2>
            {effectiveIsGarage && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Garage Exclusive Pricing</p>
                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Wholesale Tier 1 Active</p>
              </div>
            )}
          </div>

          <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 py-6 border-b border-gray-100 sticky top-16 z-30 bg-white/95 backdrop-blur-md px-4 rounded-2xl shadow-sm">
            <div className={`flex flex-col lg:flex-row items-center gap-6 w-full justify-between`}>
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto max-w-full">
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
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                {['ALL', 'NEW', 'REFURBISHED', 'USED'].map(cond => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${selectedCondition === cond ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-40 flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">Scanning Global Inventory...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
                    <img
                      src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`) : 'https://via.placeholder.com/300'}
                      alt={product.partName || product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      {product.condition && (
                        <span className="bg-primary/90 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                          {product.condition}
                        </span>
                      )}
                      <span className="bg-app-bg-dark/80 backdrop-blur-md text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">{product.category}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase text-primary tracking-widest">{product.brand || 'MAD GARAGE'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Available Now</span>
                    </div>
                    <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-tight mb-6 group-hover:text-primary transition-colors line-clamp-2">
                      {product.partName || product.name || product.deviceName}
                    </h3>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {effectiveIsGarage && product.wholesale && product.price && product.garagePrice && product.price > product.garagePrice && (
                          <p className="text-[10px] text-gray-400 line-through font-bold decoration-primary/40">₹{product.price.toLocaleString()}</p>
                        )}
                        <p className="text-2xl font-black italic text-app-bg-dark tracking-tighter">
                          Rs.{(effectiveIsGarage && product.wholesale && product.garagePrice ? product.garagePrice : (product.price || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e: React.MouseEvent) => { 
                            e.stopPropagation(); 
                            if (!user) {
                              navigate('/login');
                              return;
                            }
                            toggleWishlist(product); 
                          }}
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${isInWishlist(product.id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-app-bg-dark border-gray-100 hover:bg-primary/5 hover:text-primary'}`}
                        >
                          <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                        </button>
                        <div
                          className="h-12 w-12 bg-app-bg-dark text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-lg cursor-pointer"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); addToCart(product); }}
                        >
                          <Plus size={20} />
                        </div>
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
                <h2 className="text-2xl font-black italic text-app-bg-dark uppercase">No results in this build configuration</h2>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2">Try adjusting your filters or contact support for custom sourcing</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const SelectField: React.FC<{
  label: string;
  value: string;
  options: any[];
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, value, options, onChange, disabled }) => (
  <div className={`flex flex-col ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">{label}</label>
    <div className="relative">
      <select
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-app-bg-dark outline-none focus:border-primary transition-all appearance-none cursor-pointer"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
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

export default Marketplace;
