import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Search, ArrowLeft,
    Package, ShoppingBag, CheckCircle, RefreshCw,
    X, Image as ImageIcon, Sparkles, Filter,
    ShieldCheck, AlertTriangle, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import ProductEditModal from '../components/ProductEditModal';

const AdminInventoryManagement: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'FLAGGED' | 'APPROVED'>('ALL');

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { fetchGlobalInventory(); }, []);

    const fetchGlobalInventory = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/inventory');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            setProducts([]); // Removed fake fallback data
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY remove this product from the global catalog?')) return;
        try {
            await apiClient.delete(`/admin/inventory/${id}`);
            fetchGlobalInventory();
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    const handleToggleFlag = async (id: number, currentlyFlagged: boolean) => {
        let reason = '';
        if (!currentlyFlagged) {
            reason = window.prompt('Enter flagging reason (e.g. Invalid Certification, Incorrect Pricing):') || 'Administrative Review Required';
        }
        
        try {
            await apiClient.put(`/admin/inventory/${id}/toggle-flag`, { reason });
            fetchGlobalInventory();
        } catch (err) {
            alert('Failed to toggle flag.');
        }
    };

    const handleSave = async (payload: any) => {
        setIsSaving(true);
        try {
            if (editingProduct.id) {
                // Use existing seller-based update endpoint as per user requirement
                await apiClient.put(`/seller/inventory/${editingProduct.id}/base64`, payload);
            } else {
                // Use existing seller-based create endpoint as per user requirement
                await apiClient.post('/seller/inventory/base64', payload);
            }
            setShowModal(false);
            fetchGlobalInventory();
        } catch (err) {
            alert(editingProduct.id ? 'Update failed.' : 'Creation failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (prod: any) => {
        setEditingProduct({ ...prod });
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => {
        const nameToSearch = (p.partName || p.name || '').toLowerCase();
        const sellerToSearch = (p.sellerName || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = nameToSearch.includes(searchLower) || sellerToSearch.includes(searchLower);
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

        let matchesStatus = true;
        if (filterStatus === 'FLAGGED') matchesStatus = p.flagged;
        else if (filterStatus === 'APPROVED') matchesStatus = !p.flagged;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Control Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Global <span className="text-primary italic">Inventory</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Merchant Catalog Oversight</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => openEdit({ partName: '', price: 0, stockQuantity: 0, category: 'Engine', condition: 'NEW', description: '' })}
                            className="bg-primary text-white h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                        >
                            <Plus size={18} /> listing Override
                        </button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products or sellers..."
                                className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-app-bg-dark border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none md:w-40 text-center"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            {['Brakes', 'Engine', 'Suspension', 'Exhaust', 'Exterior', 'Interior'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-48 md:pt-56 max-w-7xl mx-auto space-y-10 pb-20">
                {/* Global Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <InvStat
                        label="Total SKUs"
                        val={products.length}
                        icon={<Package size={14} />}
                        color="text-primary"
                        onClick={() => setFilterStatus('ALL')}
                        active={filterStatus === 'ALL'}
                    />
                    <InvStat label="Network Stock" val={products.reduce((acc, p) => acc + (p.stockQuantity || p.stock || 0), 0)} icon={<RefreshCw size={14} />} color="text-blue-500" />
                    <InvStat
                        label="Flagged Items"
                        val={products.filter(p => p.flagged).length}
                        icon={<AlertTriangle size={14} />}
                        color="text-orange-500"
                        onClick={() => setFilterStatus(filterStatus === 'FLAGGED' ? 'ALL' : 'FLAGGED')}
                        active={filterStatus === 'FLAGGED'}
                    />
                    <InvStat
                        label="Approved Listings"
                        val={products.filter(p => !p.flagged).length}
                        icon={<ShieldCheck size={14} />}
                        color="text-green-500"
                        onClick={() => setFilterStatus(filterStatus === 'APPROVED' ? 'ALL' : 'APPROVED')}
                        active={filterStatus === 'APPROVED'}
                    />
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading && products.length === 0 ? (
                        Array(8).fill(0).map((_, i) => <div key={i} className="h-64 bg-[#121216] rounded-[2rem] animate-pulse border border-white/5" />)
                    ) : filteredProducts.map(p => (
                        <div key={p.id} className={`bg-[#121216] border rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all flex flex-col ${p.flagged ? 'border-orange-500/30' : 'border-white/5'}`}>
                            <div 
                                className="h-40 bg-black/40 flex items-center justify-center relative overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                            >
                                {p.imageUrl ? (
                                    <img
                                        src={p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE_SERVER_URL}${p.imageUrl}`}
                                        alt={p.partName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&auto=format&fit=crop';
                                        }}
                                    />
                                ) : (
                                    <ImageIcon size={40} className="text-gray-800 group-hover:text-primary transition-colors" />
                                )}
                                <div className="absolute top-4 left-4 bg-primary/10 text-primary text-[8px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">{p.condition}</div>
                                {p.flagged && <div className="absolute top-4 right-4 bg-orange-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">Flagged</div>}
                                {p.sellerResponse && <div className="absolute top-12 right-4 bg-green-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center gap-2 animate-pulse">
                                    <CheckCircle size={8} /> Reply
                                </div>}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye size={32} className="text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div 
                                    className="cursor-pointer group/title"
                                    onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                                >
                                    <h3 className="text-sm font-black italic uppercase tracking-tighter text-white leading-tight group-hover:text-primary transition-colors">{p.partName || p.name}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={10} className="text-blue-500" /> {p.sellerName || 'Direct Vendor'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black italic text-primary uppercase tracking-tighter">{p.rating || '4.5'}/5.0</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <p className="text-lg font-black italic tracking-tighter text-white uppercase">₹{(p.price || 0).toLocaleString()}</p>
                                    <span className="text-[10px] font-bold text-gray-500">{p.stockQuantity || p.stock || 0} Unit(s)</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleFlag(p.id, p.flagged)}
                                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${p.flagged ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-500 hover:text-orange-500'}`}
                                    >
                                        <AlertTriangle size={14} />
                                    </button>
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="flex-1 bg-white/5 py-3 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            <ProductEditModal
                show={showModal}
                onClose={() => setShowModal(false)}
                product={editingProduct}
                onSave={handleSave}
                isSaving={isSaving}
                title={editingProduct?.id ? "Administrative Edit" : "listing Override"}
            />
        </div>
    );
};

const InvStat: React.FC<{ label: string, val: number, icon: React.ReactNode, color: string, onClick?: () => void, active?: boolean }> = ({ label, val, icon, color, onClick, active }) => (
    <div
        onClick={onClick}
        className={`bg-[#121216] border p-6 rounded-[2rem] flex items-center justify-between group transition-all duration-500 cursor-pointer shadow-2xl relative overflow-hidden ${onClick ? 'hover:scale-[1.02] active:scale-95' : ''} ${active ? 'border-current shadow-current/10' : 'border-white/5 hover:border-white/10'}`}
        style={{ color: active ? '' : '' }} // placeholder for potential dynamic current color
    >
        {active && <div className="absolute inset-0 bg-current opacity-5 animate-pulse pointer-events-none" />}
        <div className="relative z-10">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">{label}</p>
            <p className={`text-xl font-black italic tracking-tighter ${color}`}>{val}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 relative z-10 ${active ? 'bg-current text-black rotate-12 scale-110 shadow-lg' : 'bg-white/5 ' + color + ' group-hover:scale-110'}`}>
            <span className={active ? 'text-black' : color}>{icon}</span>
        </div>
    </div>
);

export default AdminInventoryManagement;
