import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ChevronRight, Zap, 
  ShoppingBag, SlidersHorizontal, LayoutGrid, List
} from 'lucide-react';
import apiClient, { BASE_URL } from '../services/apiClient';

const CatalogPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const engineId = searchParams.get('engineId');
    const categoryQuery = searchParams.get('category');
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categoryQuery || 'All');

    useEffect(() => {
        fetchProducts();
    }, [engineId, categoryQuery]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let url = '/products';
            if (engineId) url += `?engineId=${engineId}`;
            else if (categoryQuery) url += `?category=${categoryQuery}`;
            
            const response = await apiClient.get(url);
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            // Fallback mock data
            setProducts([
                { id: 1, name: 'Brembo Racing Pads', price: 12500, garagePrice: 10500, category: 'Brakes', brand: 'Brembo' },
                { id: 2, name: 'Garrett G-Series Turbo', price: 145000, garagePrice: 132000, category: 'Engine', brand: 'Garrett' },
                { id: 3, name: 'HKS Hi-Power Exhaust', price: 65000, garagePrice: 58000, category: 'Exhaust', brand: 'HKS' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

    const filteredProducts = products.filter(p => {
        if (p.flagged) return false; // Safety Shield: Hide flagged listings
        const nameToSearch = (p.partName || p.name || '').toLowerCase();
        const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Catalog Header */}
            <header className="bg-app-bg-dark pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0%,rgba(223,35,36,0.3)_0%,transparent_70%)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">
                            Performance <span className="text-primary">Catalog</span>
                        </h1>
                        <p className="text-gray-400 font-medium text-lg md:text-xl max-w-2xl leading-relaxed">
                            {engineId ? 'Precision-matched components for your specified build configuration.' : 'Browse our global inventory of verified performance components.'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
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
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
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
                        <button className="h-12 w-12 bg-app-bg-dark text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all shadow-xl shadow-black/10">
                             <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-16 scroll-mt-32">
                {loading ? (
                    <div className="py-40 text-center">
                        <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">Deciphering Catalog Data...</p>
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
                                     <div className="absolute top-6 left-6">
                                         <span className="text-[8px] font-black uppercase px-3 py-1.5 bg-white border border-gray-100 rounded-full text-app-bg-dark tracking-widest shadow-sm">{product.brand || 'MAD GARAGE'}</span>
                                     </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">{product.condition || 'NEW'}</span>
                                        <div className="h-3 w-px bg-gray-100 mx-1" />
                                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">{product.category}</span>
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
                        <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Clear all filters</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CatalogPage;
