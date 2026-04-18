import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Package, MapPin, 
  Truck, CheckCircle, Clock, 
  Printer, Share2, HelpCircle,
  Star, MessageSquare, Send,
  ShieldCheck
} from 'lucide-react';
import apiClient from '../services/apiClient';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tempPartRating, setTempPartRating] = useState(0);
    const [tempDeliveryRating, setTempDeliveryRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await apiClient.get(`/orders/${id}`);
            setOrder(response.data);
            if (response.data.partRating) {
                setTempPartRating(response.data.partRating);
                setTempDeliveryRating(response.data.deliveryRating);
                setRatingComment(response.data.ratingComment || '');
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!tempPartRating || !tempDeliveryRating) return;
        setSubmittingRating(true);
        try {
            await apiClient.post(`/orders/${id}/rating`, {
                partRating: tempPartRating,
                deliveryRating: tempDeliveryRating,
                comment: ratingComment
            });
            await fetchOrder();
        } catch (error) {
            console.error('Rating submission failed:', error);
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-app-bg-light flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;

    if (!order) return <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black uppercase italic">Order not detected</h2>
        <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline uppercase tracking-widest text-xs">Return to Dashboard</button>
    </div>;

    return (
        <div className="min-h-screen bg-app-bg-light font-inter py-12 px-4 md:py-20 lg:px-0">
            <div className="container mx-auto max-w-4xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all mb-12 md:mb-16">
                    <ChevronLeft size={16} /> Back to Dashboard
                </button>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                    {/* Header: Receipt Banner */}
                    <div className="bg-app-bg-dark p-10 md:p-14 text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div>
                                <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-4">Official Receipt</p>
                                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">Order <span className="text-primary">#{order.id}</span></h1>
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Verified on {new Date(order.orderDate).toDateString()}</p>
                            </div>
                            <div className="flex flex-col items-center md:items-end">
                                <div className="bg-white/10 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 md:p-14 space-y-16">
                        {/* Status Track */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-b border-gray-50">
                            <TrackItem icon={<Package size={20}/>} label="Ordered" sub="Confirmed" active />
                            <div className="hidden md:block h-px flex-1 bg-gray-100" />
                            <TrackItem icon={<Clock size={20}/>} label="Processing" sub="Allocated" active={order.status !== 'PENDING'} />
                            <div className="hidden md:block h-px flex-1 bg-gray-100" />
                            <TrackItem icon={<Truck size={20}/>} label={order.fittingGarageId ? "At Garage" : "Shipped"} sub={order.fittingGarageId ? "Terminal" : "In Transit"} active={order.status === 'SHIPPED' || order.status === 'DELIVERED'} />
                            <div className="hidden md:block h-px flex-1 bg-gray-100" />
                            <TrackItem icon={<CheckCircle size={20}/>} label={order.fittingGarageId ? "Fitted" : "Delivered"} sub="Completion" active={order.status === 'DELIVERED'} />
                        </div>

                        {/* Fitting Coordination Terminal */}
                        {order.fittingGarageId && (
                            <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 overflow-hidden">
                                <div className="bg-primary p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white text-primary rounded-xl flex items-center justify-center">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">Fitting Coordination Terminal</h3>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Status: {order.fittingStatus?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Selected Partner Garage</p>
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
                                            <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center font-black text-primary text-xl">
                                                {order.fittingGarageName?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black italic uppercase tracking-tighter text-app-bg-dark">{order.fittingGarageName}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mt-1">
                                                    <MapPin size={10} className="text-primary" /> {order.fittingGarageAddress}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 border-l border-gray-100 pl-10">
                                        <div className="bg-white/50 p-6 rounded-2xl border border-gray-50 flex-1">
                                            <h5 className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Technician Protocol</h5>
                                            <p className="text-[10px] font-bold text-app-bg-dark leading-relaxed">
                                                Labor settlement strictly post-inspection. Provide order ID <span className="text-primary">#{order.id}</span> at the terminal.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Order Manifest</h3>
                            <div className="space-y-6">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                                                <Package className="text-gray-300" size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-md font-black text-app-bg-dark italic uppercase">{item.productName}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity} • Unit: ₹{item.priceAtPurchase.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-app-bg-dark italic underline decoration-primary decoration-2 underline-offset-4">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    <MapPin size={14} className="text-primary" /> Delivery Terminal
                                </h3>
                                <div className="text-sm font-bold text-app-bg-dark leading-loose bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                    <p className="font-black italic uppercase text-lg mb-2">{order.customerName}</p>
                                    <p>{order.shippingAddress}</p>
                                    <p>{order.city}, {order.state} - {order.pincode}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    <Clock size={14} className="text-primary" /> Financial Summary
                                </h3>
                                <div className="bg-app-bg-dark text-white p-8 rounded-3xl space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>₹{order.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <span>Tax & Logistic</span>
                                        <span>₹{(order.taxAmount + order.shippingFee).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grand Total</span>
                                        <span className="text-2xl font-black italic text-white">₹{order.grandTotal?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Order Rating Section - ONLY visible to the customer who placed the order */}
                        {order.status === 'DELIVERED' && order.isOwner && (
                            <div className="bg-gray-50 rounded-[2.5rem] p-10 md:p-14 border border-gray-100 space-y-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-xl font-black italic text-app-bg-dark uppercase">{order.partRating ? 'Your Workshop Feedback' : 'Rate Your Build'}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Quality & delivery verified by AI Precision</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <RatingStars label="Part Quality" rating={tempPartRating} onRate={setTempPartRating} disabled={!!order.partRating || submittingRating} />
                                        <RatingStars label="Delivery" rating={tempDeliveryRating} onRate={setTempDeliveryRating} disabled={!!order.partRating || submittingRating} />
                                    </div>
                                </div>

                                {!order.partRating ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="relative">
                                            <MessageSquare size={16} className="absolute top-4 left-4 text-gray-400" />
                                            <textarea 
                                                className="w-full bg-white border border-gray-100 rounded-3xl p-4 pl-12 text-sm font-bold text-app-bg-dark outline-none focus:border-primary/30 transition-all min-h-[100px] placeholder:text-gray-400 resize-none"
                                                placeholder="Technical notes regarding fitment, performance, or packaging..."
                                                value={ratingComment}
                                                onChange={(e) => setRatingComment(e.target.value)}
                                                disabled={submittingRating}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleSubmitRating}
                                            disabled={!tempPartRating || !tempDeliveryRating || submittingRating}
                                            className="w-full bg-app-bg-dark text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-black/10 disabled:opacity-30 active:scale-95"
                                        >
                                            {submittingRating ? 'Transmitting Data...' : 'Submit Tech Feedback'} <Send size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white/50 p-8 rounded-3xl border border-gray-100 border-dashed">
                                        <p className="text-xs font-bold text-gray-500 italic leading-loose">"{order.ratingComment || 'Part performance meets engineering standards.'}"</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-12 border-t border-gray-100">
                            <ActionBtn icon={<Printer size={16}/>} label="Print Manifest" onClick={() => window.print()} />
                            <ActionBtn icon={<Share2 size={16}/>} label="Share Receipt" onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Mad Garage Order #${order.id}`,
                                        text: `Check out my order receipt from Mad Garage.`,
                                        url: window.location.href
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Order link copied to clipboard!');
                                }
                            }} />
                            <ActionBtn icon={<HelpCircle size={16}/>} label="Tech Support" primary onClick={() => navigate('/chat')} />
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] mt-12">
                     Precision Parts Terminal • Secure Transmission
                </p>
            </div>
        </div>
    );
};

const TrackItem: React.FC<{ icon: React.ReactNode, label: string, sub: string, active?: boolean }> = ({ icon, label, sub, active }) => (
    <div className={`flex flex-col items-center text-center gap-2 ${active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${active ? 'bg-primary text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 text-gray-400'}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase text-app-bg-dark italic tracking-tighter">{label}</p>
            <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{sub}</p>
        </div>
    </div>
);

const ActionBtn: React.FC<{ icon: React.ReactNode, label: string, primary?: boolean, onClick?: () => void }> = ({ icon, label, primary, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${primary ? 'bg-primary text-white hover:bg-red-700 shadow-lg shadow-red-500/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
        {icon} {label}
    </button>
);

const RatingStars: React.FC<{ label: string, rating: number, onRate: (r: number) => void, disabled?: boolean }> = ({ label, rating, onRate, disabled }) => (
    <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => !disabled && onRate(star)}
                    disabled={disabled}
                    className={`transition-all ${disabled ? 'cursor-default' : 'hover:scale-125'}`}
                >
                    <Star 
                        size={18} 
                        className={star <= rating ? 'text-primary fill-primary' : 'text-gray-200'}
                    />
                </button>
            ))}
        </div>
    </div>
);

export default OrderDetailsPage;
