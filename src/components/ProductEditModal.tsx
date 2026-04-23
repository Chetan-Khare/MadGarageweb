import React, { useState, useEffect } from 'react';
import { X, ImageIcon, Sparkles } from 'lucide-react';

interface ProductEditModalProps {
    show: boolean;
    onClose: () => void;
    product: any;
    onSave: (payload: any) => Promise<void>;
    isSaving: boolean;
    title?: string;
    subtitle?: string;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ 
    show, 
    onClose, 
    product, 
    onSave, 
    isSaving,
    title = "Administrative Edit",
    subtitle = "Global Catalog Override"
}) => {
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setEditingProduct({ ...product });
            setImagePreview(product.imageUrl || null);
            setBase64Image(null);
        }
    }, [product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBase64Image((reader.result as string).split(',')[1]);
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...editingProduct,
            base64Images: base64Image ? [base64Image] : (editingProduct.imageUrl ? [editingProduct.imageUrl] : [])
        };
        await onSave(payload);
    };

    if (!show || !editingProduct) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#08080C]/90 backdrop-blur-md" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative bg-[#121216] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{title.split(' ')[0]} <span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">{subtitle}</p>
                    </div>
                    <button type="button" onClick={onClose} className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:text-primary transition-colors"><X size={20} /></button>
                </div>

                <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
                        {imagePreview ? (
                            <div className="relative w-full h-40">
                                <img src={imagePreview} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-white tracking-widest">Change Catalog Image</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                                    <ImageIcon size={24} />
                                </div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest group-hover:text-primary transition-colors text-center">Drag or Select Product Media <br /><span className="text-[8px] text-gray-600">(PNG / JPG / WEBP)</span></p>
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
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Product Name</label>
                        <input required type="text" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" value={editingProduct.partName || editingProduct.name || ''} onChange={e => setEditingProduct({ ...editingProduct, partName: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Retail Price (₹)</label>
                            <input required type="number" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" value={editingProduct.price || 0} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Total Stock</label>
                            <input required type="number" className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all" value={editingProduct.stockQuantity || editingProduct.stock || 0} onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Technical Description</label>
                        <textarea className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-medium text-white outline-none focus:border-primary transition-all h-32 resize-none" value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                    </div>

                    {editingProduct.sellerResponse && (
                        <div className="flex flex-col p-8 bg-green-500/5 border border-green-500/20 rounded-[2.5rem] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-green-500 tracking-[0.2em]">Merchant Justification</label>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-sm font-medium text-gray-300 leading-relaxed italic italic">
                                "{editingProduct.sellerResponse}"
                            </p>
                        </div>
                    )}

                    {editingProduct.flagReason && (
                        <div className="flex flex-col p-8 bg-orange-500/5 border border-orange-500/20 rounded-[2.5rem] space-y-4">
                            <label className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em]">Administrative Flag Reason</label>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed">
                                {editingProduct.flagReason}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Category</label>
                            <select className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary appearance-none cursor-pointer" value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                                {['Brakes', 'Engine', 'Suspension', 'Exhaust', 'Exterior', 'Interior'].map(c => <option key={c} value={c} className="bg-[#121216]">{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Condition</label>
                            <select className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary appearance-none cursor-pointer" value={editingProduct.condition || ''} onChange={e => setEditingProduct({ ...editingProduct, condition: e.target.value })}>
                                <option value="NEW" className="bg-[#121216]">New</option>
                                <option value="REFURBISHED" className="bg-[#121216]">Refurbished</option>
                                <option value="USED" className="bg-[#121216]">Used</option>
                            </select>
                        </div>
                    </div>

                    {/* Wholesale Eligibility Toggle */}
                    <div className="flex flex-col p-6 bg-primary/5 border border-primary/10 rounded-2xl gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Wholesale / Garage Discount Eligible</label>
                                <p className="text-[9px] text-gray-500 mt-1">
                                    {editingProduct.wholesale !== false 
                                        ? 'Garages will receive tiered pricing on this product' 
                                        : 'Full retail price for all buyers — no discounts applied'}
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, wholesale: editingProduct.wholesale === false ? true : false })}
                                className={`h-6 w-12 rounded-full transition-all relative ${editingProduct.wholesale !== false ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${editingProduct.wholesale !== false ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col p-6 bg-primary/5 border border-primary/10 rounded-2xl gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase text-primary tracking-widest">Administrative Quality Override</label>
                            <button 
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, isManualRating: !editingProduct.isManualRating })}
                                className={`h-6 w-12 rounded-full transition-all relative ${editingProduct.isManualRating ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${editingProduct.isManualRating ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Manual Quality Rating (0 - 5.0)</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                min="0" 
                                max="5" 
                                disabled={!editingProduct.isManualRating}
                                className={`bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all ${editingProduct.isManualRating ? 'text-primary' : 'text-gray-600 opacity-50'}`} 
                                value={editingProduct.rating || 0} 
                                onChange={e => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })} 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-white/5 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 text-gray-500 hover:bg-white/10 transition-all">Discard Changes</button>
                    <button type="submit" disabled={isSaving} className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                        {isSaving ? 'Synchronizing...' : 'Save Catalog Changes'} <Sparkles size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEditModal;
