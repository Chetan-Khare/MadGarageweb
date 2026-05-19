import React, { useEffect, useState } from 'react';
import { 
    Plus, Search, Filter, 
    Edit3, CheckCircle, XCircle,
    ChevronLeft, Calendar, Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface Coupon {
    id: number;
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountAmount: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    usageLimit: number;
    usedCount: number;
    startDate: any;
    endDate: any; 
    active: boolean; 
}

const AdminCouponManagement: React.FC = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'EXPIRED' | 'INACTIVE' | 'ALL'>('ACTIVE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountAmount: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 1,
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await apiClient.get('/coupons/admin/all');
            setCoupons(response.data);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (coupon: Coupon) => {
        try {
            // MED-06 FIX: Send minimal DTO-aligned payload in the PUT update rather than database raw variables
            const payload = {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountAmount: coupon.discountAmount,
                minOrderAmount: coupon.minOrderAmount || 0,
                maxDiscountAmount: coupon.maxDiscountAmount || 0,
                usageLimit: coupon.usageLimit || 1,
                startDate: parseDate(coupon.startDate) ? `${parseDate(coupon.startDate)}T00:00:00` : null,
                endDate: parseDate(coupon.endDate) ? `${parseDate(coupon.endDate)}T23:59:59` : null,
                isActive: !coupon.active
            };
            await apiClient.put(`/coupons/admin/${coupon.id}`, payload);
            fetchCoupons();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Format dates for LocalDateTime
            const payload = {
                ...formData,
                startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
                endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null
            };

            if (editingCoupon) {
                await apiClient.put(`/coupons/admin/${editingCoupon.id}`, payload);
            } else {
                await apiClient.post('/coupons/admin', payload);
            }
            setIsModalOpen(false);
            setEditingCoupon(null);
            resetForm();
            fetchCoupons();
        } catch (err) {
            console.error('Form submission failed:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountAmount: 0,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            usageLimit: 1,
            startDate: '',
            endDate: '',
            isActive: true
        });
    };

    const parseDate = (dateVal: any) => {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            // Java LocalDateTime: [year, month, day, hour, min]
            const y = dateVal[0];
            const m = String(dateVal[1]).padStart(2, '0');
            const d = String(dateVal[2]).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return dateVal.split('T')[0];
    };

    const openEditModal = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            minOrderAmount: coupon.minOrderAmount || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            usageLimit: coupon.usageLimit || 1,
            startDate: parseDate(coupon.startDate),
            endDate: parseDate(coupon.endDate),
            isActive: coupon.active
        });
        setIsModalOpen(true);
    };

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        const now = new Date();
        const expiry = c.endDate ? new Date(parseDate(c.endDate)) : null;
        const isExpired = expiry ? expiry < now : false;

        if (statusFilter === 'ACTIVE') return c.active && !isExpired;
        if (statusFilter === 'EXPIRED') return isExpired;
        if (statusFilter === 'INACTIVE') return !c.active;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/admin')}
                            className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white hover:border-primary transition-all group"
                        >
                            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mb-1">Administrative Terminal</p>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Coupon <span className="text-primary italic">Engine</span></h1>
                        </div>
                    </div>

                    <button 
                        onClick={() => { resetForm(); setEditingCoupon(null); setIsModalOpen(true); }}
                        className="bg-primary hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        <Plus size={18} /> Provision New Coupon
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by code or description..."
                            className="w-full bg-[#121216] border border-white/5 p-5 pl-16 rounded-[2rem] text-sm font-bold outline-none focus:border-primary transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="bg-[#121216] border border-white/5 rounded-[2rem] px-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Filter size={18} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status Filter</span>
                        </div>
                        <select 
                            className="bg-[#121216] text-[10px] font-black uppercase text-white outline-none"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                        >
                            <option value="ACTIVE" className="bg-[#121216]">All Active</option>
                            <option value="EXPIRED" className="bg-[#121216]">Expired</option>
                            <option value="INACTIVE" className="bg-[#121216]">Inactive</option>
                            <option value="ALL" className="bg-[#121216]">All Coupons</option>
                        </select>
                    </div>
                </div>

                {/* Coupons List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-[#121216] border border-white/5 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : filteredCoupons.map(coupon => (
                        <div key={coupon.id} className={`bg-gradient-to-br from-[#121216] to-black border p-8 rounded-[2.5rem] transition-all group relative overflow-hidden ${coupon.active ? 'border-white/5 hover:border-primary/30' : 'border-red-900/20 grayscale'}`}>
                            {/* Status Tag */}
                            <div className="absolute top-0 right-0 p-6">
                                {coupon.active ? 
                                    <CheckCircle size={16} className="text-green-500" /> : 
                                    <XCircle size={16} className="text-red-500" />
                                }
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{coupon.code}</h3>
                                        <p className="text-[9px] font-black uppercase text-primary tracking-widest">{coupon.discountAmount}{coupon.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF</p>
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium text-gray-400 leading-relaxed italic h-8 line-clamp-2">"{coupon.description}"</p>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white/5 p-3 rounded-2xl">
                                        <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Usage</p>
                                        <p className="text-[11px] font-black text-white">{coupon.usedCount} / {coupon.usageLimit}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl">
                                        <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Max Disc</p>
                                        <p className="text-[11px] font-black text-white">{coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : 'No Limit'}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl">
                                        <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Expiry</p>
                                        <p className="text-[11px] font-black text-white">{parseDate(coupon.endDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button 
                                        onClick={() => openEditModal(coupon)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 p-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
                                    >
                                        <Edit3 size={14} className="text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(coupon)}
                                        className={`flex-1 p-3 rounded-xl flex items-center justify-center gap-2 transition-all border ${coupon.active ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'}`}
                                    >
                                        {coupon.active ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${coupon.active ? 'text-red-500' : 'text-green-500'}`}>
                                            {coupon.active ? 'Deactivate' : 'Activate'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-[#0F0F13] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                    <Plus size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                        {editingCoupon ? 'Modify' : 'Provision'} <span className="text-primary">Coupon</span>
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Configure Promotion Parameters</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Coupon Code</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                            placeholder="e.g. SUMMER50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Discount Type</label>
                                        <select 
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all appearance-none"
                                            value={formData.discountType}
                                            onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Flat Amount (₹)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Description</label>
                                    <textarea 
                                        required
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all h-24 resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="Enter public promotion description..."
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Value</label>
                                        <input 
                                            type="number" required
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.discountAmount}
                                            onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Min. Order</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.minOrderAmount}
                                            onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Max. Disc</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.maxDiscountAmount}
                                            onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Usage Limit</label>
                                        <input 
                                            type="number" required
                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.usageLimit}
                                            onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Start Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input 
                                                type="date" required
                                                className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                                value={formData.startDate}
                                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Expiry Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input 
                                                type="date" required
                                                className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                                value={formData.endDate}
                                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white/5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-[2] bg-primary py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
                                    >
                                        {editingCoupon ? 'Finalise Modifications' : 'Launch Promotion'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCouponManagement;
