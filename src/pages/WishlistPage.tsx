import React from 'react';
import { ShoppingBag, Heart, Trash2, ShoppingCart, ArrowLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage: React.FC = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleMoveToCart = (item: any) => {
        addToCart(item);
        // Optionally remove from wishlist
        // removeFromWishlist(item.id);
    };

    return (
        <div className="min-h-screen bg-app-bg-light pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/user-dashboard')}
                            className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-none">
                                Performance <span className="text-primary">Wishlist</span>
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{wishlist.length} Items Saved for Assembly</p>
                        </div>
                    </div>
                    
                    {wishlist.length > 0 && (
                        <button 
                            onClick={() => navigate('/catalog')}
                            className="bg-app-bg-dark text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg flex items-center gap-2"
                        >
                            Continue Sourcing <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {/* Wishlist Grid */}
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlist.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden group hover:border-primary/20 transition-all flex flex-col">
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                                    <img 
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80'} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <button 
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-app-bg-dark text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest">
                                            {item.condition}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{item.brand || 'High Performance'}</span>
                                        <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-tight mt-1 line-clamp-2">
                                            {item.name}
                                        </h3>
                                    </div>

                                    <div className="mt-auto space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Pricing</p>
                                                <p className="text-2xl font-black italic text-app-bg-dark tracking-tighter">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-5 gap-3">
                                            <button 
                                                onClick={() => handleMoveToCart(item)}
                                                className="col-span-4 bg-app-bg-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-lg active:scale-95"
                                            >
                                                Move to Cart <ShoppingCart size={14} />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/product/${item.id}`)}
                                                className="col-span-1 bg-gray-50 text-app-bg-dark rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100"
                                            >
                                                <Zap size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-xl shadow-black/5">
                        <Heart size={64} className="mx-auto text-gray-200 mb-8" />
                        <h2 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter">Your Wishlist is Empty</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 max-w-xs mx-auto leading-relaxed">
                            No parts saved yet. Explore the marketplace and build your dream machine.
                        </p>
                        <button 
                            onClick={() => navigate('/catalog')}
                            className="mt-10 bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95"
                        >
                            Start Browsing
                        </button>
                    </div>
                )}

                {/* AI Suggestion Banner */}
                {wishlist.length > 0 && (
                    <div className="mt-20 bg-app-bg-dark rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32 group-hover:bg-primary/40 transition-all duration-1000" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div>
                                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">
                                    Need a <span className="text-primary">Fitment Check?</span>
                                </h1>
                                <p className="text-gray-400 font-medium max-w-md">Our Garage AI can analyze your wishlist items and verify compatibility with your registered vehicles.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/chat')}
                                className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white hover:text-app-bg-dark transition-all transform"
                            >
                                Consult AI Builder <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
