import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { 
  Search, SlidersHorizontal,
  Cpu, Activity, Database, Boxes,
  ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import ProductEditModal from '../components/ProductEditModal';

const CatalogPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const engineId = searchParams.get('engineId');
    const categoryQuery = searchParams.get('category');
    const q = searchParams.get('q');
    
    const [searchTerm, setSearchTerm] = useState(q || '');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [selectedCategory, setSelectedCategory] = useState(categoryQuery || 'All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination State
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    const { data: products = [], isLoading: loading, refetch } = useQuery<Product[]>({
        queryKey: ['products', engineId, categoryQuery],
        queryFn: async () => {
            let url = '/products';
            const params: any = {};
            if (engineId) params.engineId = engineId;
            if (categoryQuery && categoryQuery !== 'All') params.category = categoryQuery;
            const response = await apiClient.get(url, { params });
            return response.data;
        }
    });


    const handleSave = async (payload: Product) => {
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
            refetch();
        } catch (err) {
            alert(editingProduct?.id ? 'Update failed.' : 'Creation failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (prod: Product) => {
        setEditingProduct({ ...prod });
        setShowEditModal(true);
    };

    const categories = ['All', 'Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior'];

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (p.flagged) return false;
            const nameToSearch = (p.partName || p.name || '').toLowerCase();
            const matchesSearch = nameToSearch.includes(deferredSearchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, deferredSearchTerm, selectedCategory]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [deferredSearchTerm, selectedCategory]);

    const pagedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

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
                        {pagedProducts.map((product) => (
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
                                        src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${BASE_SERVER_URL}${product.imageUrl}`) : 'https://via.placeholder.com/300'} 
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
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
                                        {(product.stockQuantity !== undefined || product.stock !== undefined) && (
                                            <span className={`ml-auto text-[8px] font-black uppercase tracking-widest ${(product.stockQuantity ?? product.stock ?? 0) < 5 ? 'text-primary' : 'text-green-500'}`}>
                                                {(product.stockQuantity ?? product.stock ?? 0) < 5 ? `LOW STOCK: ${product.stockQuantity ?? product.stock}` : `IN STOCK: ${product.stockQuantity ?? product.stock}`}
                                            </span>
                                        )}
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

                {/* Technical Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage(prev => prev - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-primary/50 disabled:opacity-30 transition-all group"
                        >
                            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`h-10 w-10 flex items-center justify-center rounded-lg font-black text-[10px] transition-all ${
                                    currentPage === page 
                                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(223,35,36,0.4)]' 
                                    : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {page.toString().padStart(2, '0')}
                            </button>
                        ))}

                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => {
                                setCurrentPage(prev => prev + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-primary/50 disabled:opacity-30 transition-all group"
                        >
                            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
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

