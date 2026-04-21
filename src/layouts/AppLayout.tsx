import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Phone, Download, Instagram, Facebook, Twitter, LayoutDashboard, User, ShieldCheck, Zap, Heart, LogOut, X, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BASE_SERVER_URL } from '../services/apiClient';
import { useLocation } from '../context/LocationContext';

const AppLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { city, detectLocation, isLoading: locationLoading } = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  return (
    <div className="min-h-screen flex flex-col font-inter bg-app-bg-light">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-app-bg-dark text-white border-b border-primary/20 backdrop-blur-md bg-opacity-95">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
              <span className="text-2xl font-black italic tracking-tighter text-primary hidden lg:block">MAD GARAGE</span>
            </Link>

            {/* Location Selector (Blinkit Style) */}
            <div 
              onClick={detectLocation}
              className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <MapPin size={20} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Delivering to</span>
                  <Navigation size={10} className={`${locationLoading ? 'animate-spin' : ''} text-primary`} />
                </div>
                <div className="flex items-center gap-1 max-w-[150px]">
                  <span className="text-sm font-black italic uppercase tracking-tighter truncate">
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
          <nav className="flex items-center gap-6">
            <Link to="/request-part" className="hidden lg:block text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors">Request Part</Link>
            <Link to="/chat" className="hidden lg:block text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2 hover:bg-primary/5 px-3 py-1 rounded-lg transition-all animate-pulse duration-2000">MAD GARAGE AI</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profile" 
                  className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-primary transition-all shadow-lg overflow-hidden"
                  title="My Profile"
                >
                  {(user?.profileImageUrl && user.profileImageUrl.startsWith('/uploads/')) ? (
                    <img 
                      src={`${BASE_SERVER_URL}${user.profileImageUrl}`} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = ''; 
                        (e.target as HTMLImageElement).parentElement?.classList.add('flex-col');
                      }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                </Link>
                <Link to="/user-dashboard" className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all group">
                  <LayoutDashboard size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Dash</span>
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-primary transition-all shadow-lg"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                Sign In
              </Link>
            )}

            <div className="flex items-center gap-4">
              <Link to="/wishlist" className="relative cursor-pointer group p-2">
                <Heart size={22} className="group-hover:text-primary transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-app-bg-dark">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link to="/addresses" className="relative cursor-pointer group p-2">
                <MapPin size={22} className="group-hover:text-primary transition-colors" />
              </Link>
              
              <Link to="/cart" className="relative cursor-pointer group p-2">
                <ShoppingCart size={22} className="group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-app-bg-dark">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            
            <Menu size={24} className="md:hidden" />
          </nav>
        </div>
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
              <Link to="/user-dashboard" className="text-sm hover:text-white transition-colors">My Dashboard</Link>
              <Link to="/request-part" className="text-sm hover:text-white transition-colors">Request Part</Link>
              <a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
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
