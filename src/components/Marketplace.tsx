import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Zap, ChevronDown, ChevronUp, ShoppingBag,
  Plus, Heart, X, Navigation, MapPin, ShieldCheck, ChevronLeft
} from 'lucide-react';
import { BASE_SERVER_URL } from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useVehicles } from '../hooks/useVehicles';
import { useProducts } from '../hooks/useProducts';
import ModernSelect from './ModernSelect';
import { useTranslation, Trans } from 'react-i18next';

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
  const { t } = useTranslation();

  // --- Filtering State ---
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [searchTerm, setSearchTerm] = useState(q || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [showVehicleFilters, setShowVehicleFilters] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [manualCity, setManualCityInput] = useState('');
  const [showGaragesDropdown, setShowGaragesDropdown] = useState(false);
  
  // --- Pagination State ---
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

  // --- Service Hooks ---
  const v = useVehicles();
  const { data: makes = [] } = v.useMakes();
  const { data: models = [] } = v.useModels(selectedMake);
  const { data: years = [] } = v.useYears(selectedMake, selectedModel);
  const { data: fuels = [] } = v.useFuels(selectedMake, selectedModel, selectedYear);
  const { data: trims = [] } = v.useTrims(selectedMake, selectedModel, selectedYear, selectedFuel);
  const { data: engines = [] } = v.useEngines(selectedMake, selectedModel, selectedYear, selectedFuel, selectedTrim);

  const { data: products = [], isLoading: loading, refetch } = useProducts(isGarage, selectedCategory, selectedEngine);

  useEffect(() => {
    if (q) setSearchTerm(q);
  }, [q]);

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine('');
  };

  const handleFuelChange = (fuel: string) => {
    setSelectedFuel(fuel);
    setSelectedTrim(''); setSelectedEngine('');
  };

  const handleTrimChange = (trim: string) => {
    setSelectedTrim(trim);
    setSelectedEngine('');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (p.flagged) return false;
      const nameMatch = (p.partName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const conditionMatch = selectedCondition === 'ALL' || p.condition === selectedCondition;
      return nameMatch && conditionMatch;
    });
  }, [products, searchTerm, selectedCondition]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedCondition, selectedEngine]);

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  return (
    <div className="flex flex-col w-full">
      {/* Hero / Fitment Section */}
      <section className={`relative transition-all duration-700 ${isGarage ? 'py-10' : 'min-h-[750px] flex items-center justify-center pt-20 pb-10'} bg-app-bg-dark overflow-hidden`}>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(223,35,36,0.3)_0%,transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          {!isGarage && (
            <>
              <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="MAD GARAGE" className="h-24 aspect-square object-contain rounded-full overflow-hidden brightness-110 drop-shadow-[0_0_15px_rgba(223,35,36,0.3)]" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-6 uppercase">
                <Trans 
                  i18nKey="home.hero_title"
                  components={[<span className="text-primary italic" />]}
                />
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                {t('home.hero_subtitle')}
              </p>
            </>
          )}

          {isGarage && (
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
                    {selectedEngine ? `${selectedYear} ${selectedMake} ${selectedModel} ${selectedTrim}` : t('home.hero_button')}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select vehicle for precision fitment matching</p>
                </div>
              </div>
              {showVehicleFilters ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            
            {showVehicleFilters && (
              <div className="bg-white p-8 md:p-12 rounded-[2.8rem] border border-gray-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                  <ModernSelect 
                    label="Make" 
                    value={selectedMake} 
                    options={makes.map((m: any) => ({ label: m.name, value: m.name, icon: m.logoUrl }))} 
                    onChange={handleMakeChange} 
                    placeholder="Select Manufacturer"
                  />
                  <ModernSelect label="Model" value={selectedModel} options={models} onChange={handleModelChange} disabled={!selectedMake} placeholder="Select Model" />
                  <ModernSelect label="Year" value={selectedYear} options={years} onChange={handleYearChange} disabled={!selectedModel} placeholder="Select Year" />
                  <ModernSelect label="Fuel" value={selectedFuel} options={fuels} onChange={handleFuelChange} disabled={!selectedYear} placeholder="Select Fuel" />
                  <ModernSelect label="Trim" value={selectedTrim} options={trims} onChange={handleTrimChange} disabled={!selectedFuel} placeholder="Select Trim" />
                  <ModernSelect label="Engine" value={selectedEngine} options={engines} onChange={(v) => setSelectedEngine(v)} disabled={!selectedTrim} placeholder="Select Engine" />
                </div>
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50">
                  <button
                    onClick={() => { setSelectedMake(''); setSelectedModel(''); setSelectedYear(''); setSelectedFuel(''); setSelectedTrim(''); setSelectedEngine(''); setSearchTerm(''); }}
                    className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 hover:underline"
                  >
                    <X size={14} /> Clear Vehicle Profile
                  </button>
                  <button
                    onClick={() => { refetch(); setShowVehicleFilters(false); document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' }); }}
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

      {/* Nearby Garages / Fitting Hub Section */}
      <section className="bg-white py-6 border-b border-gray-100 relative">
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
      <section id="marketplace-section" className={`py-12 ${isGarage ? 'bg-app-bg-light' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4 ${isGarage ? 'text-app-bg-dark' : 'text-app-bg-dark'}`}>
              Marketplace <div className="h-1 w-20 bg-primary/20"></div>
            </h2>
          </div>

          {/* COMPACT STICKY CATEGORY BAR */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-b border-gray-100 sticky top-20 z-30 bg-white/95 backdrop-blur-md px-4 rounded-2xl shadow-sm">
            <div className={`flex flex-col lg:flex-row items-center gap-4 w-full justify-between`}>
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto max-w-full scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-app-bg-dark text-white shadow-lg' : 'text-gray-400 hover:text-app-bg-dark'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shrink-0">
                {['ALL', 'NEW', 'REFURBISHED', 'USED'].map(cond => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${selectedCondition === cond ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                {pagedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
                      <img
                        src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`) : 'https://via.placeholder.com/300'}
                        alt={product.partName}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col md:flex-row gap-1 md:gap-2">
                        {product.condition && (
                          <span className="bg-primary/90 backdrop-blur-md text-white text-[6px] md:text-[8px] font-black uppercase px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg">
                            {product.condition}
                          </span>
                        )}
                        <span className="bg-app-bg-dark/80 backdrop-blur-md text-white text-[6px] md:text-[8px] font-black uppercase px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg">{product.category}</span>
                        {(() => {
                          const sellingPrice = isGarage && product.wholesale && product.garagePrice ? product.garagePrice : (product.price || 0);
                          const strikePrice = product.mrp || product.originalPrice;
                          if (strikePrice && strikePrice > sellingPrice) {
                            const pct = Math.round((1 - sellingPrice / strikePrice) * 100);
                            if (pct > 0) {
                              return (
                                <span className="bg-green-500 text-white text-[6px] md:text-[8px] font-black uppercase px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg animate-pulse">
                                  {pct}% OFF
                                </span>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="p-3 md:p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                        <span className="text-[7px] md:text-[9px] font-black uppercase text-primary tracking-widest">{product.brand || 'MAD GARAGE'}</span>
                      </div>
                      <h3 className="text-xs md:text-xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-tight mb-2 md:mb-6 group-hover:text-primary transition-colors line-clamp-2">
                        {product.partName}
                      </h3>
                      <div className="mt-auto pt-2 md:pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-2xl font-black italic text-app-bg-dark tracking-tighter">
                            ₹{(isGarage && product.wholesale && product.garagePrice ? product.garagePrice : (product.price || 0)).toLocaleString()}
                          </p>
                          {(product.mrp || product.originalPrice) && (product.mrp || product.originalPrice) > (isGarage && product.wholesale && product.garagePrice ? product.garagePrice : (product.price || 0)) && (
                            <p className="text-[8px] md:text-xs text-gray-400 line-through font-bold">
                              ₹{(product.mrp || product.originalPrice).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 md:gap-2">
                          {user?.role !== 'ROLE_SELLER' && user?.role !== 'ROLE_WORKER' && (
                            <button
                              onClick={(e: React.MouseEvent) => { 
                                e.stopPropagation(); 
                                if (!user) { navigate('/login'); return; }
                                toggleWishlist(product); 
                              }}
                              className={`h-7 w-7 md:h-12 md:w-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all shadow-md border ${isInWishlist(product.id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-app-bg-dark border-gray-100 hover:bg-primary/5 hover:text-primary'}`}
                            >
                              <Heart size={14} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} className="md:w-5 md:h-5" />
                            </button>
                          )}
                          {user?.role !== 'ROLE_SELLER' && user?.role !== 'ROLE_WORKER' && (
                            <div
                              className="h-7 w-7 md:h-12 md:w-12 bg-app-bg-dark text-white rounded-lg md:rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-md cursor-pointer"
                              onClick={(e: React.MouseEvent) => { e.stopPropagation(); addToCart(product); }}
                            >
                              <Plus size={14} className="md:w-5 md:h-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Technical Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => prev - 1);
                      document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/50 disabled:opacity-30 transition-all group shadow-sm"
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`h-12 w-12 flex items-center justify-center rounded-2xl font-black text-[10px] transition-all shadow-sm ${
                        currentPage === page 
                        ? 'bg-app-bg-dark text-white shadow-xl scale-110' 
                        : 'bg-gray-50 border border-gray-100 text-gray-400 hover:text-app-bg-dark hover:bg-white'
                      }`}
                    >
                      {page.toString().padStart(2, '0')}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => prev + 1);
                      document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/50 disabled:opacity-30 transition-all group shadow-sm"
                  >
                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </>
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

export default Marketplace;
