import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Phone, Download, Instagram, Facebook, Twitter, LayoutDashboard, User, ShieldCheck, Zap, Heart, LogOut, X, MapPin, Navigation, Sparkles, PackagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BASE_SERVER_URL } from '../services/apiClient';
import { useLocation } from '../context/LocationContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AppLayout: React.FC = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { city, detectLocation, isLoading: locationLoading } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const getDashboardPath = () => {
      if (!role) return '/';
      switch (role) {
          case 'ROLE_ADMIN': return '/admin';
          case 'ROLE_WORKER': return '/worker';
          case 'ROLE_SELLER': return '/seller';
          case 'ROLE_GARAGE': return '/dashboard';
          case 'ROLE_CUSTOMER': return '/customer-dashboard';
          default: return '/';
      }
  };

  return (
    <div className="min-h-screen flex flex-col font-inter bg-app-bg-light">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-app-bg-dark text-white border-b border-primary/20 backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
              <span className="text-lg sm:text-2xl font-black italic tracking-tighter text-primary block">MAD GARAGE</span>
            </Link>

            {/* Location Selector (Blinkit Style) - Simplified for mobile */}
            <div 
              onClick={detectLocation}
              className="hidden sm:flex items-center gap-2 cursor-pointer group hover:bg-white/5 p-1.5 rounded-xl transition-all border border-transparent hover:border-white/10 shrink-0"
            >
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <MapPin size={14} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[7px] font-black uppercase tracking-widest text-primary italic leading-none">Delivering to</span>
                  <Navigation size={7} className={`${locationLoading ? 'animate-spin' : ''} text-primary`} />
                </div>
                <div className="flex items-center gap-1 max-w-[80px]">
                  <span className="text-[10px] font-black italic uppercase tracking-tighter truncate leading-none">
                    {city || 'Select Location'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop-friendly */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl bg-white/10 rounded-full items-center pl-4 pr-1 py-1 border border-white/10 focus-within:border-primary/50 transition-all group"
          >
            <Search size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for car parts (e.g. Brake Pads, Turbos)..." 
              className="bg-transparent border-none outline-none flex-1 px-3 text-sm font-medium placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); navigate('/'); }}
                className="p-2 text-gray-500 hover:text-primary transition-colors"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button 
                type="submit"
                className="bg-primary text-white h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-primary transition-all shadow-lg shadow-red-500/10 active:scale-95"
            >
                Search
            </button>
          </form>

          {/* Right Actions */}
          <nav className="flex items-center gap-2 md:gap-4 lg:gap-6">
            {/* Mobile Search Trigger */}
            <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden h-10 w-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-primary transition-all"
            >
                <Search size={18} />
            </button>
            
            <LanguageSwitcher />

            <Link 
              to="/request-part" 
              className="hidden xl:flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all active:scale-95 whitespace-nowrap"
            >
              <PackagePlus size={14} />
              Request Part
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link 
                  to="/profile" 
                  className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-primary transition-all shadow-lg overflow-hidden"
                  title="My Profile"
                >
                  {(user?.profileImageUrl) ? (
                    <img 
                       src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${BASE_SERVER_URL}${user.profileImageUrl}`} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = ''; 
                      }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                </Link>
                <Link to={getDashboardPath()} className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all group">
                  <LayoutDashboard size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.dashboard')}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-4 md:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                {t('nav.login')}
              </Link>
            )}

            <div className="flex items-center gap-1 md:gap-4">
              {user?.role !== 'ROLE_WORKER' && user?.role !== 'ROLE_SELLER' && (
                <Link to="/wishlist" className="relative cursor-pointer group p-2">
                  <Heart size={20} className="group-hover:text-primary transition-colors" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-app-bg-dark">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              
              <Link to="/cart" className="relative cursor-pointer group p-2">
                <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-app-bg-dark">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden h-10 w-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 hover:text-primary transition-colors"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
            <div className="md:hidden bg-app-bg-dark border-t border-white/5 p-4 animate-in slide-in-from-top duration-300">
                <form onSubmit={handleSearch} className="flex bg-white/5 rounded-xl items-center pl-4 pr-1 py-1 border border-primary/30">
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search parts..." 
                        className="bg-transparent border-none outline-none flex-1 py-2 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="bg-primary text-white p-2 rounded-lg">
                        <Search size={16} />
                    </button>
                </form>
            </div>
        )}

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-app-bg-dark border-t border-white/5 p-6 space-y-6 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-2 gap-4">
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/catalog" className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <PackagePlus size={20} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Catalog</span>
                    </Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/chat" className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-primary/20">
                        <Sparkles size={20} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">AI Assistant</span>
                    </Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/request-part" className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <Zap size={20} className="text-gray-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Request</span>
                    </Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} to={getDashboardPath()} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <LayoutDashboard size={20} className="text-gray-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dashboard</span>
                    </Link>
                </div>
                
                {isAuthenticated && (
                    <button 
                        onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                        className="w-full py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 text-red-500"
                    >
                        <LogOut size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{t('nav.logout')}</span>
                    </button>
                )}
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-app-bg-dark text-gray-400 pt-16 pb-8 border-t border-white/5">
        <div className="container mx-auto px-4 mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-2xl">
                <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h4 className="text-white text-sm font-black italic uppercase tracking-tighter">Certified <span className="text-primary italic">Parts</span></h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">100% Genuine Performance Spares</p>
                </div>
            </div>
            <div className="flex items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-2xl">
                <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <Zap size={28} />
                </div>
                <div>
                    <h4 className="text-white text-sm font-black italic uppercase tracking-tighter">Precision <span className="text-primary italic">Fitment</span></h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">AI-matched for your vehicle</p>
                </div>
            </div>
            <div className="flex items-center gap-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] group hover:border-primary/30 transition-all shadow-2xl">
                <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                    <Search size={28} />
                </div>
                <div>
                    <h4 className="text-white text-sm font-black italic uppercase tracking-tighter">Hard-to-Find <span className="text-primary italic">Spares</span></h4>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Global sourcing at your service</p>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/5 pb-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MAD GARAGE" className="h-8 aspect-square object-contain rounded-full overflow-hidden grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              <h2 className="text-white text-xl font-black italic">MAD GARAGE</h2>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Precision engineered auto parts for performance enthusiasts. AI-driven fitment, expert craftsmanship, and the largest selection of custom components.
            </p>
            <div className="flex gap-4">
              <Instagram size={20} className="hover:text-primary cursor-pointer" />
              <Facebook size={20} className="hover:text-primary cursor-pointer" />
              <Twitter size={20} className="hover:text-primary cursor-pointer" />
            </div>
          </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-3">Quick Links</h3>
              <Link to="/" className="text-sm hover:text-white transition-colors">Home</Link>
              <Link to="/catalog" className="text-sm hover:text-white transition-colors">Catalog</Link>
              <Link to="/join" className="text-sm text-primary font-black uppercase italic hover:text-white transition-all">Partner with Us</Link>
              <Link to="/user-dashboard" className="text-sm hover:text-white transition-all">My Dashboard</Link>
              <Link to="/request-part" className="text-sm hover:text-white transition-all">Request Part</Link>
              <Link to="/privacy" className="text-sm hover:text-white transition-all">Privacy Policy</Link>
              <Link to="/return-policy" className="text-sm hover:text-white transition-all">Return Policy</Link>
            </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-3">Contact Us</h3>
            <p className="text-sm flex items-center gap-2">
              <Phone size={14} className="text-primary" /> +91 98765 43210
            </p>
            <p className="text-sm">Sector 45, Gurgaon, Haryana, India</p>
            <p className="text-sm">support@madgarage.com</p>
          </div>

          {/* Apps */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-3">Download Our App</h3>
            <p className="text-xs mb-4">Get the best experience on mobile.</p>
            <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all">
                <Download size={20} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-tighter line-clamp-1">App Store</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all">
                <Download size={20} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-tighter line-clamp-1">Google Play</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[10px] font-medium tracking-widest uppercase py-8 opacity-50">
          © 2026 Mad Garage Performance Inc. Powered by AI Precision.
        </p>
      </footer>
    </div>
  );
};

export default AppLayout;
