import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, ArrowLeft,
    Package, CheckCircle, RefreshCcw,
    X, Image as ImageIcon, Sparkles, Filter, AlertTriangle
} from 'lucide-react';
import ModernSelect from '../components/ModernSelect';
import { Make } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const SellerInventory: React.FC = () => {
    useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [_loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [makes, setMakes] = useState<Make[]>([]);

    useEffect(() => { fetchInventory(); }, []);
    useEffect(() => {
        apiClient.get('/vehicles/makes').then(res => setMakes(res.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (location.state?.autoEdit) {
            openEdit(location.state.autoEdit);
        }
    }, [location.state, products]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/seller/inventory');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setBase64Image(base64String);
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const requestBody: any = {
            sku: editingProduct.sku || `SKU-${Date.now()}`,
            brand: editingProduct.brand || 'MAD GARAGE',
            partName: editingProduct.partName || editingProduct.name,
            category: editingProduct.category,
            price: editingProduct.price,
            description: editingProduct.description || 'Performance component.',
            stockQuantity: editingProduct.stockQuantity || editingProduct.stock,
            condition: editingProduct.condition,
            fitmentCategory: editingProduct.fitmentCategory || 'UNIVERSAL',
            vehicleIds: editingProduct.fittedVehicles ? editingProduct.fittedVehicles.map((v: any) => v.id) : [],
            base64Images: base64Image ? [base64Image] : [],
            isManualRating: editingProduct.isManualRating,
            rating: editingProduct.rating,
            sellerResponse: editingProduct.sellerResponse,
            flagged: editingProduct.flagged,
            flagReason: editingProduct.flagReason,
            wholesale: editingProduct.wholesale !== false
        };

        try {
            if (editingProduct.id) {
                await apiClient.put(`/seller/inventory/${editingProduct.id}/base64`, requestBody);
            } else {
                await apiClient.post('/seller/inventory/base64', requestBody);
            }
            setShowModal(false);
            fetchInventory();
        } catch (err) {
            alert('Operation failed. Ensure all fields are valid.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to remove this product from your inventory?')) return;
        try {
            await apiClient.delete(`/seller/inventory/${id}`);
            fetchInventory();
        } catch (err) {
            alert('Failed to delete product.');
        }
    };

    const openEdit = (prod: any = { partName: '', name: '', price: 0, category: 'Engine', condition: 'NEW', stockQuantity: 1, stock: 1, description: '' }) => {
        setEditingProduct(prod);
        setBase64Image(null);
        setImagePreview(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-app-bg-light font-inter">
            <div className="bg-white border-b border-gray-100 p-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 fixed top-0 w-full z-40">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/seller')} className="h-12 w-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-app-bg-dark">Merchant <span className="text-primary italic">Inventory</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Manage Your High-Performance Catalog</p>
                    </div>
                </div>

                <button
                    onClick={() => openEdit()}
                    className="bg-primary text-white h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="p-8 md:p-12 pt-44 md:pt-48 max-w-7xl mx-auto space-y-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InventoryStat label="Total Listings" val={products.length} icon={<Package size={18} />} color="text-primary" />
                    <InventoryStat label="Low Stock Alert" val={products.filter(p => (!p.condition || p.condition === 'NEW') && (p.stockQuantity || p.stock || 0) < 5).length} icon={<RefreshCcw size={18} />} color="text-orange-500" />
                    <InventoryStat label="Approved Listings" val={products.filter(p => !p.flagged).length} icon={<CheckCircle size={18} />} color="text-green-500" />
                </div>

                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Part Identification</th>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Retail Pricing</th>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Stock Status</th>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors overflow-hidden">
                                                {p.imageUrl ? (
                                                    <img
                                                        src={p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE_SERVER_URL}${p.imageUrl}`}
                                                        alt={p.partName || p.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=200&auto=format&fit=crop'; }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-app-bg-dark italic uppercase">{p.partName || p.name}</p>
                                                    {p.flagged && (
                                                        <span className="bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">Flagged</span>
                                                    )}
                                                    {p.wholesale !== false && (
                                                        <span className="bg-green-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/20">Wholesale</span>
                                                    )}
                                                </div>
                                                {p.flagged && p.flagReason && (
                                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1 flex items-center gap-1 italic">
                                                        <AlertTriangle size={10} /> {p.flagReason}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{p.category}</span>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.condition === 'NEW' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>{p.condition}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xl font-black text-app-bg-dark italic tracking-tighter">₹{(p.price || 0).toLocaleString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${(!p.condition || p.condition === 'NEW') && (p.stockQuantity || p.stock || 0) <= 10 ? 'bg-orange-500' : 'bg-green-500'}`} />
                                            <span className="text-sm font-bold text-gray-600">{p.stockQuantity || p.stock || 0} Units</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(p)} className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <form onSubmit={handleSave} className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-app-bg-dark">{editingProduct.id ? 'Refine' : 'Add'} <span className="text-primary italic">Part</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-bold">Catalog Integration Layer</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center hover:text-primary transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
                                {imagePreview ? (
                                    <div className="relative w-full h-40">
                                        <img src={imagePreview} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                            <p className="text-[8px] font-black uppercase text-white tracking-widest">Change Part Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-4">
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors shadow-sm">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest group-hover:text-primary transition-colors">Surface Part Image (PNG/JPG)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Product Name</label>
                                <input required type="text" className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all" value={editingProduct.partName || editingProduct.name || ''} onChange={e => setEditingProduct({ ...editingProduct, partName: e.target.value })} placeholder="e.g. Brembo Front Brake Pads" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Wholesale Price (₹)</label>
                                    <input required type="number" className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all" value={editingProduct.price || 0} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Current Stock</label>
                                    <input required type="number" className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all disabled:opacity-50" value={editingProduct.stockQuantity || editingProduct.stock || 0} onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })} disabled={['USED', 'REFURBISHED'].includes(editingProduct.condition)} />
                                    {['USED', 'REFURBISHED'].includes(editingProduct.condition) && <p className="text-[8px] font-black uppercase text-orange-500 mt-2 ml-2 tracking-widest leading-tight">Locked to 1 unit</p>}
                                </div>
                            </div>

                            {/* Wholesale Eligibility Toggle */}
                            <div className="flex flex-col p-6 bg-gray-50 border border-gray-100 rounded-2xl gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-app-bg-dark tracking-widest">Wholesale / Garage Discount Eligible</label>
                                        <p className="text-[9px] text-gray-400 mt-1">
                                            {editingProduct.wholesale !== false 
                                                ? 'Garages will receive tiered pricing on this product' 
                                                : 'Full retail price for all buyers — no discounts applied'}
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setEditingProduct({ ...editingProduct, wholesale: editingProduct.wholesale === false ? true : false })}
                                        className={`h-6 w-12 rounded-full transition-all relative ${editingProduct.wholesale !== false ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${editingProduct.wholesale !== false ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Description</label>
                                <textarea className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium text-app-bg-dark outline-none focus:border-primary transition-all h-24 resize-none" value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Describe the performance benefits..." />
                            </div>

                            {(editingProduct.flagged || editingProduct.sellerResponse) && (
                                <div className="flex flex-col bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                                    <label className="text-[10px] font-black uppercase text-orange-600 mb-3 ml-2 flex items-center gap-2">
                                        <AlertTriangle size={12} /> Merchant Justification / Response
                                    </label>

                                    {editingProduct.flagReason && (
                                        <div className="mb-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                            <p className="text-[9px] font-black uppercase text-orange-400 mb-1 tracking-widest">Administrative Flag Reason:</p>
                                            <p className="text-xs font-bold text-orange-800 italic">"{editingProduct.flagReason}"</p>
                                        </div>
                                    )}

                                    <textarea
                                        className="bg-white border border-orange-100 p-4 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-orange-500 transition-all h-24 resize-none"
                                        value={editingProduct.sellerResponse || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, sellerResponse: e.target.value })}
                                        placeholder="Provide reasoning to resolve the administrative flag..."
                                    />
                                    <p className="text-[8px] font-black uppercase text-orange-400 mt-3 ml-2 tracking-widest leading-relaxed">
                                        Your response will be audited by Mad Garage administrators to verify compliance.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col">
                                <ModernSelect 
                                    label="Manufacturer / Brand"
                                    value={editingProduct.brand || ''}
                                    options={makes.map(m => ({
                                        label: m.name,
                                        value: m.name,
                                        icon: m.logoUrl
                                    }))}
                                    onChange={v => setEditingProduct({ ...editingProduct, brand: v })}
                                    placeholder="Select Brand"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <ModernSelect 
                                    label="Condition"
                                    value={editingProduct.condition || 'NEW'}
                                    options={[
                                        { label: 'New', value: 'NEW' },
                                        { label: 'Refurbished', value: 'REFURBISHED' },
                                        { label: 'Used', value: 'USED' }
                                    ]}
                                    onChange={v => {
                                        const isUnique = ['USED', 'REFURBISHED'].includes(v);
                                        setEditingProduct({
                                            ...editingProduct,
                                            condition: v,
                                            stockQuantity: isUnique ? 1 : editingProduct.stockQuantity
                                        });
                                    }}
                                />
                                <ModernSelect 
                                    label="Category"
                                    value={editingProduct.category || 'Engine'}
                                    options={['Brakes', 'Engine', 'Suspension', 'Exhaust', 'Electrical', 'Exterior', 'Interior']}
                                    onChange={v => setEditingProduct({ ...editingProduct, category: v })}
                                />
                            </div>

                            {editingProduct.id && editingProduct.fitmentCategory !== 'UNIVERSAL' && (
                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                                            <Filter size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Active Fitments</p>
                                            <p className="text-xs font-bold text-orange-800 mt-0.5">
                                                Mapped to {editingProduct.fittedVehicles?.length || 0} Vehicle(s)
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/seller/add-product', { state: { autoEdit: editingProduct } })}
                                        className="mt-4 text-[9px] font-black uppercase text-orange-500 hover:text-orange-700 underline tracking-widest"
                                    >
                                        Manage Advanced Compatibility →
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-gray-50 flex gap-4">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-200 text-gray-400 hover:bg-white transition-all">Cancel</button>
                            <button type="submit" disabled={isSaving} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                                {isSaving ? 'Processing...' : 'Sync to Catalog'} <Sparkles size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const InventoryStat: React.FC<{ label: string, val: number, icon: React.ReactNode, color: string }> = ({ label, val, icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 flex items-center justify-between">
        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
            {icon}
        </div>
        <div className="text-right">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
            <p className={`text-3xl font-black italic tracking-tighter ${color}`}>{val}</p>
        </div>
    </div>
);

export default SellerInventory;
