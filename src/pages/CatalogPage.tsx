import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ChevronRight, Zap, 
  ShoppingBag, SlidersHorizontal, Plus, Heart,
  Cpu, Activity, Database, Boxes, ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductEditModal from '../components/ProductEditModal';

const CatalogPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const engineId = searchParams.get('engineId');
    const categoryQuery = searchParams.get('category');
    const q = searchParams.get('q');
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(q || '');
    const [selectedCategory, setSelectedCategory] = useState(categoryQuery || 'All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [engineId, categoryQuery]);

    useEffect(() => {
        if (q) setSearchTerm(q);
    }, [q]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = '/products';
            const params: any = {};
            if (engineId) params.engineId = engineId;
            if (categoryQuery && categoryQuery !== 'All') params.category = categoryQuery;
            
            const response = await apiClient.get(url, { params });
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            // Fallback mock data with technical metadata
            setProducts([
                { id: 1, name: 'Brembo Racing Pads', price: 12500, originalPrice: 14000, category: 'Brakes', brand: 'Brembo', sku: 'BR-992-X', stock: 12, fitmentScore: 98 },
                { id: 2, name: 'Garrett G-Series Turbo', price: 145000, originalPrice: 158000, category: 'Engine', brand: 'Garrett', sku: 'GT-G30-770', stock: 3, fitmentScore: 100 },
                { id: 3, name: 'HKS Hi-Power Exhaust', price: 65000, originalPrice: 72000, category: 'Exhaust', brand: 'HKS', sku: 'HKS-HI-P', stock: 5, fitmentScore: 94 },
                { id: 4, name: 'Ohlins Road & Track', price: 210000, originalPrice: 235000, category: 'Suspension', brand: 'Ohlins', sku: 'OH-RT-X7', stock: 2, fitmentScore: 99 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (payload: any) => {
        setIsSaving(true);
        try {
            if (editingProduct?.id) {
                // Use existing seller-based update endpoint as per user requirement
                await apiClient.put(`/seller/inventory/${editingProduct.id}/base64`, payload);
            } else {
                // Use existing seller-based create endpoint as per user requirement
                await apiClient.post('/seller/inventory/base64', payload);
            }
            setShowEditModal(false);
            fetchProducts();
        } catch (err) {
            alert(editingProduct?.id ? 'Update failed.' : 'Creation failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (prod: any) => {
        setEditingProduct({ ...prod });
        setShowEditModal(true);
    };

    const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

    const filteredProducts = products.filter(p => {
        if (p.flagged) return false;
        const nameToSearch = (p.partName || p.name || '').toLowerCase();
        const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-inter text-white">
            {/* Tech Terminal Header */}
            <header className="pt-24 pb-12 border-b border-white/5 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(223,35,36,0.8)]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Parts DB Console</p>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                            Admin <span className="text-white">Parts DB</span>
                        </h1>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5 self-start">
                            <span className="flex items-center gap-2"><Database size={12} /> {filteredProducts.length} Node Entries</span>
                            <span className="flex items-center gap-2"><Activity size={12} /> System Status: Optimal</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Unified Command Bar */}
            <div className="sticky top-16 z-40 bg-app-bg-dark/80 backdrop-blur-xl border-b border-white/5 py-4">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-1 w-full flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary/40 transition-all group overflow-hidden">
                        <div className="h-12 w-12 flex items-center justify-center border-r border-white/5 bg-white/5">
                            <Search size={16} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="QUERY DATABASE BY SKU OR PART NAME..."
                            className="bg-transparent border-none outline-none flex-1 px-4 text-xs font-black uppercase tracking-widest text-white placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                            <span>SCAN MODE ACTIVE</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
                             {categories.map(cat => (
                                 <button 
                                    key={cat} 
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2.5 text-[9px] font-black uppercase rounded-xl transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                 >
                                     {cat}
                                 </button>
                             ))}
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setViewMode('grid')} className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-500 bg-white/5 hover:bg-white/10'}`}>
                                 <Boxes size={18} />
                             </button>
                             <button onClick={() => setViewMode('list')} className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-gray-500 bg-white/5 hover:bg-white/10'}`}>
                                 <SlidersHorizontal size={18} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="py-40 text-center space-y-6">
                        <div className="h-16 w-16 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(223,35,36,0.3)]"></div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.5em] animate-pulse">Syncing Database Node</p>
                        </div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                        {filteredProducts.map((product) => (
                            <div 
                                key={product.id} 
                                className={`group bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden hover:border-primary/40 transition-all duration-300 relative flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-4 gap-8'}`}
                            >
                                {/* Technical Header / SKU */}
                                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                        <p className="text-[8px] font-mono font-black text-primary tracking-widest">{product.sku || `MG-${product.id * 777}`}</p>
                                    </div>
                                </div>

                                {/* Visual Container */}
                                <div className={`${viewMode === 'grid' ? 'h-56' : 'h-32 w-32'} bg-[#111] flex items-center justify-center p-8 relative group-hover:bg-primary/[0.03] transition-all`}>
                                     <img 
                                        src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `http://127.0.0.1:8080${product.imageUrl}`) : 'https://via.placeholder.com/300'} 
                                        alt={product.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop';
                                        }}
                                     />
                                </div>

                                {/* Data Section */}
                                <div className={`p-6 flex flex-col flex-1 ${viewMode === 'list' && 'py-0'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{product.category}</span>
                                        <div className="h-1 w-1 bg-white/20 rounded-full" />
                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{product.brand || 'MAD GARAGE'}</span>
                                        {(product.stockQuantity || product.stock) && <span className={`ml-auto text-[8px] font-black uppercase tracking-widest ${(product.stockQuantity || product.stock) < 5 ? 'text-primary' : 'text-green-500'}`}>{(product.stockQuantity || product.stock) < 5 ? `LOW STOCK: ${product.stockQuantity || product.stock}` : `IN STOCK: ${product.stockQuantity || product.stock}`}</span>}
                                    </div>
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors">
                                        {product.partName || product.name}
                                    </h3>

                                    {/* Tech Specs */}
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Part Quality</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-mono font-black text-primary truncate">{product.rating || '4.5'}/5.0 RATING</p>
                                                {product.isManualRating && (
                                                    <ShieldCheck size={10} className="text-primary shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                            <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Protocol</p>
                                            <p className="text-xs font-mono font-black text-white">{product.condition || 'NEW'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">MSRP Pricing</p>
                                            <p className="text-2xl font-black italic text-white tracking-tighter">₹{(product.price || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openEdit(product)}
                                                className="h-11 px-8 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg shadow-red-500/20"
                                            >
                                                Audit Node
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center space-y-8 bg-white/2 rounded-[3.5rem] border border-dashed border-white/10">
                        <Cpu size={64} className="mx-auto text-white/10" />
                        <div>
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Query Returned 0 Results</h2>
                        </div>
                        <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Reset Console Filters</button>
                    </div>
                )}
            </main>

            {/* Admin Edit Modal */}
            <ProductEditModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                product={editingProduct}
                onSave={handleSave}
                isSaving={isSaving}
                title={editingProduct?.id ? "Administrative Override" : "listing Override"}
                subtitle="Parts Database Synchronization"
            />
        </div>
    );
};

export default CatalogPage;

