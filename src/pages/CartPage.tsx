import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag, 
  ShieldCheck, Truck, Zap, ShoppingCart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
    const { cart, updateQuantity, removeFromCart, subtotal, savings, totalItems } = useCart();
    const { user, role } = useAuth();
    const navigate = useNavigate();

    const isMechanic = role === 'ROLE_GARAGE';

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-white text-center">
                <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 animate-bounce">
                    <ShoppingBag size={48} className="text-gray-200" />
                </div>
                <h1 className="text-4xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-4">Your Cage is empty.</h1>
                <p className="text-gray-500 font-medium mb-10 max-w-sm">Looks like you haven't identified any performance parts for your build yet.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-2xl shadow-red-500/20"
                >
                    Start Sourcing
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Track
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-none">Workshop <span className="text-primary italic">Cart</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{totalItems} Performance Items</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Item List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Order Contents</h2>
                                <p className="text-[10px] text-primary font-black uppercase">Fitment Guarantee Active</p>
                            </div>
                            
                            <div className="divide-y divide-gray-50">
                                {cart.map((item) => (
                                    <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-8 group">
                                        {/* Product Image */}
                                        <div className="h-40 w-40 bg-gray-50 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden shrink-0 group-hover:bg-primary/5 transition-all">
                                            {item.imageUrl ? (
                                                <img 
                                                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://127.0.0.1:8080${item.imageUrl}`} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Zap size={48} className="text-gray-100 rotate-12" />
                                            )}
                                            {item.condition && (
                                                <span className="absolute top-2 left-2 bg-app-bg-dark text-white text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-lg">
                                                    {item.condition}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category} • {item.brand}</p>
                                                        <h3 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-tight mt-1 hover:text-primary cursor-pointer transition-colors">
                                                            {item.name}
                                                        </h3>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="p-3 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-end justify-between gap-6">
                                                {/* Quantity Control */}
                                                <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-app-bg-dark"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-10 text-center text-xs font-black italic text-app-bg-dark">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-app-bg-dark"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    {item.originalPrice && (
                                                        <p className="text-[10px] text-gray-400 line-through font-bold">₹{item.originalPrice.toLocaleString()}</p>
                                                    )}
                                                    <p className="text-2xl font-black italic text-app-bg-dark tracking-tighter">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                                <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Track Delivery</p>
                                    <p className="text-xs font-bold text-app-bg-dark mt-1">Free Expedited Shipping</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Global Sourcing</p>
                                    <p className="text-xs font-bold text-app-bg-dark mt-1">100% Genuine Performance Parts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-app-bg-dark p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-10 relative z-10">Checkout Protocol</h2>
                            
                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-lg font-black italic">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Shipping</span>
                                    <span className="text-xs font-black uppercase text-green-500 italic tracking-[0.1em]">Free Expedited</span>
                                </div>

                                <div className="flex justify-between items-end pt-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Grand Total</p>
                                        <span className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none mt-2 block">₹{Math.round(subtotal).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-white hover:text-app-bg-dark transition-all shadow-xl shadow-red-500/20 active:scale-95"
                            >
                                Proceed to Checkout <Zap size={18} />
                            </button>
                            
                            <p className="text-center text-[9px] font-black uppercase text-gray-600 tracking-widest mt-8">
                                Secure Payment Handshake Guaranteed
                            </p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                             <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                 <ShoppingBag size={18} className="text-gray-400" />
                             </div>
                             <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
                                "Items in your cart are only reserved for a limited time during high-performance demand cycles."
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
