import React, { useEffect, useState } from 'react';
import { X, Tag, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Coupon {
    id: number;
    code: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountAmount: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
}

interface CouponDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (coupon: any) => void;
    orderAmount: number;
}

const CouponDrawer: React.FC<CouponDrawerProps> = ({ isOpen, onClose, onApply, orderAmount }) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [manualCode, setManualCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAvailableCoupons();
        }
    }, [isOpen]);

    const fetchAvailableCoupons = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/coupons/available');
            setCoupons(response.data);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualApply = async () => {
        if (!manualCode.trim()) return;
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.post(`/coupons/validate?code=${manualCode}&amount=${orderAmount}`);
            onApply(response.data);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid coupon code');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCoupon = async (code: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.post(`/coupons/validate?code=${code}&amount=${orderAmount}`);
            onApply(response.data);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#08080C] h-full shadow-2xl border-l border-white/5 animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Apply <span className="text-primary italic">Coupon</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Select from available offers</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
                    {/* Manual Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Enter Coupon Code</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="SAVE500"
                                className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all uppercase"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                            <button
                                onClick={handleManualApply}
                                disabled={loading || !manualCode.trim()}
                                className="px-6 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase ml-2">
                                <AlertCircle size={12} /> {error}
                            </div>
                        )}
                    </div>

                    {/* Available Coupons */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Available Coupons</h3>
                        
                        {loading && coupons.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : coupons.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {coupons.map((coupon) => (
                                    <div 
                                        key={coupon.id}
                                        className="group bg-[#121216] border border-white/5 p-6 rounded-[2rem] hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                                        onClick={() => handleSelectCoupon(coupon.code)}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] -mr-12 -mt-12" />
                                        
                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                        <Tag size={12} />
                                                    </div>
                                                    <span className="text-sm font-black italic text-white uppercase tracking-tighter">{coupon.code}</span>
                                                </div>
                                                <p className="text-[11px] font-medium text-gray-400">{coupon.description}</p>
                                                <p className="text-[9px] font-black uppercase text-primary tracking-widest">
                                                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                                                    {coupon.minOrderAmount > 0 && ` • Min Order ₹${coupon.minOrderAmount}`}
                                                </p>
                                            </div>
                                            <button className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-all">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center space-y-4 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                                <Tag size={32} className="mx-auto text-gray-600" />
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">No active coupons for this order</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-white/5 flex items-center gap-4">
                    <CheckCircle size={18} className="text-green-500" />
                    <p className="text-[9px] text-gray-400 font-medium italic">"Maximize your performance with MAD-CREDIT discount protocols."</p>
                </div>
            </div>
        </div>
    );
};

export default CouponDrawer;
