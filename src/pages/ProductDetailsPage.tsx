import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ShoppingBag, Star, ShieldCheck, 
  Zap, Minus, Plus, Info, Heart, Truck
} from 'lucide-react';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const cleanDescriptionForPolicy = (desc: string, isReturnable: boolean) => {
    if (!desc) return desc;
    if (isReturnable !== false) return desc;
    
    // Split text into sentences using simple regex (keeping the delimiters/whitespaces)
    const sentences = desc.split(/([.!?]\s+)/);
    let cleanedParts: string[] = [];
    
    for (let i = 0; i < sentences.length; i++) {
        const chunk = sentences[i];
        if (!chunk) continue;
        
        // If it's punctuation with whitespace, append it if the last sentence was kept
        const isSeparator = /^[.!?]\s+$/.test(chunk);
        if (isSeparator) {
            if (cleanedParts.length > 0 && !cleanedParts[cleanedParts.length - 1].endsWith('.') && !cleanedParts[cleanedParts.length - 1].endsWith('!') && !cleanedParts[cleanedParts.length - 1].endsWith('?')) {
                cleanedParts.push(chunk);
            }
            continue;
        }
        
        const lower = chunk.toLowerCase();
        const hasReturnMentions = lower.includes('return') || 
                                  lower.includes('replace') || 
                                  lower.includes('refund') || 
                                  lower.includes('exchange');
                                  
        if (!hasReturnMentions) {
            cleanedParts.push(chunk);
        }
    }
    
    // Rejoin and trim
    let result = cleanedParts.join('').trim();
    if (!result) {
        result = "No description provided. Please contact Mad Garage support for technical specifications.";
    }
    return result;
};

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, role } = useAuth();
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const passedProduct = location.state?.product;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (passedProduct) {
            setProduct(passedProduct);
            setLoading(false);
        } else {
            fetchProduct();
        }
    }, [id, passedProduct]);

    const fetchProduct = async () => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const [config, setConfig] = useState({ freeThreshold: 400 });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await apiClient.get('/config/public');
                setConfig({
                    freeThreshold: parseFloat(response.data.FREE_SHIPPING_THRESHOLD || '400')
                });
            } catch (error) {
                console.error('Failed to fetch public config:', error);
            }
        };
        fetchConfig();
    }, []);

    if (loading) return <div className="min-h-screen bg-app-bg-dark flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;

    if (!product) return <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black uppercase italic">Part not found</h2>
        <button onClick={() => navigate('/')} className="text-primary font-bold hover:underline uppercase tracking-widest text-xs">Return to Garage</button>
    </div>;

    const isGarage = role === 'ROLE_GARAGE';
    const activePrice = isGarage && product.wholesale && product.garagePrice ? product.garagePrice : (product.price || 0);
    const rawMrpPrice = product.mrp || product.originalPrice;
    const mrpPrice = (rawMrpPrice && rawMrpPrice > activePrice) ? rawMrpPrice : (activePrice / 0.9);
    const hasDiscount = mrpPrice > activePrice;

    return (
        <div className="min-h-screen bg-white font-inter">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all mb-12 group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Image Area */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 flex items-center justify-center p-12 group relative">
                            <img 
                                src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`) : 'https://via.placeholder.com/600'} 
                                alt={product.partName}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop';
                                }}
                            />
                            <div className="absolute top-8 left-8">
                                <span className="bg-app-bg-dark text-white text-[8px] font-black uppercase px-4 py-2 rounded-full tracking-[0.2em] shadow-2xl">Ref: {product.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Info Area */}
                    <div className="flex flex-col">
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3">
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] font-black">{product.brand || 'MAD GARAGE'}</span>
                                <div className="h-4 w-px bg-gray-200" />
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star size={12} fill="currentColor" /> <span className="text-[10px] font-black">{product.rating || '4.5'}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-none text-wrap break-words">
                                {product.partName}
                            </h1>
                            <div className="pt-2 border-b border-gray-100 hidden md:block w-32" />
                        </div>

                        <div className="bg-[#121216] p-10 rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden shadow-2xl shadow-black/20">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">
                                        {isGarage ? 'Wholesale Member Price' : 'Member Price'}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {hasDiscount && (
                                            <span className="text-gray-500 line-through font-bold text-sm italic mb-[-8px]">₹{Math.round(mrpPrice).toLocaleString()}</span>
                                        )}
                                        <div className="flex items-baseline gap-4">
                                            <h2 className="text-5xl font-black italic text-white tracking-tighter">₹{Math.round(activePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
                                        </div>
                                    </div>
                                </div>
                                {activePrice >= config.freeThreshold && (
                                    <div className="bg-primary/20 border border-primary/30 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse">
                                        <Truck size={16} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Free Expedited Shipping</span>
                                    </div>
                                )}
                            </div>
                            
                             {hasDiscount && (
                                <p className="relative z-10 text-[10px] font-black text-primary uppercase tracking-widest">
                                    {isGarage && product.wholesale && product.garagePrice && product.price > product.garagePrice 
                                        ? 'SPECIAL GARAGE PRICING APPLIED' 
                                        : `SAVE ${Math.round((1 - activePrice / mrpPrice) * 100)}% TODAY`}
                                </p>
                            )}

                             <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                                {role === 'ROLE_SELLER' ? (
                                     <div className="flex-1 bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center">
                                         <p className="text-primary font-black uppercase tracking-widest text-[10px]">Restricted Account</p>
                                         <p className="text-gray-400 text-xs font-bold mt-1">Seller accounts are not permitted to purchase parts.</p>
                                     </div>
                                 ) : (
                                     <>
                                         <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl items-center gap-4">
                                             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><Minus size={16}/></button>
                                             <span className="text-lg font-black text-white italic min-w-8 text-center">{quantity}</span>
                                             <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><Plus size={16}/></button>
                                         </div>
                                         <div className="flex flex-1 flex-col xl:flex-row gap-3 w-full">
                                             <button 
                                                 onClick={() => {
                                                     addToCart(product, quantity);
                                                     navigate('/cart');
                                                 }}
                                                 className="flex-1 bg-white/5 text-white border border-white/10 h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all px-2 whitespace-nowrap"
                                             >
                                                 Add to Cart <ShoppingBag size={16} />
                                             </button>
                                             <button 
                                                 onClick={() => {
                                                     if (!isAuthenticated) {
                                                         navigate('/login', { state: { from: location } });
                                                         return;
                                                     }
                                                     addToCart(product, quantity);
                                                     navigate('/checkout');
                                                 }}
                                                 className="flex-1 bg-primary text-white h-14 md:h-16 rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-red-500/30 px-2 whitespace-nowrap"
                                             >
                                                 Buy Now <Zap size={16} />
                                             </button>
                                         </div>
                                     </>
                                 )}
                                <button 
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            navigate('/login', { state: { from: location } });
                                            return;
                                        }
                                        toggleWishlist(product);
                                    }}
                                    className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all border shadow-lg ${
                                        isInWishlist(product.id)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-primary hover:border-primary'
                                    }`}
                                >
                                    <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-12 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Specifications</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-gray-100 pt-8">
                                <SpecRow label="Condition" value={product.condition || 'NEW'} highlighted />
                                <SpecRow label="Category" value={product.category || 'Standard'} />
                                <SpecRow label="Fitment" value={product.fitmentCategory === 'UNIVERSAL' ? 'Universal Fit' : 'Vehicle Specific'} highlighted />
                                <SpecRow label="Return Policy" value={product.isReturnable ? 'Returnable' : 'Final Sale'} highlighted={!product.isReturnable} />
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-gray-100 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black italic text-app-bg-dark uppercase italic flex items-center gap-3">
                                        <Info size={20} className="text-primary" /> Technical Description
                                    </h3>
                                    <div className="prose prose-sm text-gray-500 font-medium leading-loose space-y-4 max-w-none break-words overflow-hidden text-wrap">
                                        {cleanDescriptionForPolicy(product.description, product.isReturnable) || 'No description provided. Please contact Mad Garage support for technical specifications and fitment advice.'}
                                        {product.isReturnable ? (
                                            <p className="mt-4 text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldCheck size={14} /> 10-Day Easy Return Policy Included
                                            </p>
                                        ) : (
                                            <p className="mt-4 text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> Non-Returnable Item (Final Sale)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-black italic text-app-bg-dark uppercase italic flex items-center gap-3">
                                        <Zap size={20} className="text-primary" /> Engineering & Performance
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 text-sm text-gray-500">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span>Stress-tested for extreme operating conditions.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-gray-500">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span>Precision tolerance for bolt-on compatibility.</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-gray-500">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            <span>Enhanced thermal management and durability.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                             <div className="h-10 w-10 bg-green-500 text-white rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase text-green-700 tracking-widest">Fitment Guaranteed</p>
                                <p className="text-[11px] text-green-600 font-bold">Compatible with your 6-step vehicle profile.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpecRow: React.FC<{ label: string, value: string, highlighted?: boolean }> = ({ label, value, highlighted }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</span>
        <span className={`text-sm font-black italic uppercase ${highlighted ? 'text-primary' : 'text-app-bg-dark'}`}>{value}</span>
    </div>
);

export default ProductDetailsPage;
