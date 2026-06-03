import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Package, MapPin, 
  Truck, CheckCircle, Clock, 
  Share2, HelpCircle,
  Star, MessageSquare, Send,
  ShieldCheck, Info, XCircle
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const OrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { role } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tempPartRating, setTempPartRating] = useState(0);
    const [tempDeliveryRating, setTempDeliveryRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    // Return System State
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnReason, setReturnReason] = useState('WRONG_FITMENT');
    const [returnType, setReturnType] = useState('REPLACEMENT');
    const [returnDescription, setReturnDescription] = useState('');
    const [returnItems, setReturnItems] = useState<{orderItemId: number, quantity: number, maxQuantity: number, partName: string, price: number}[]>([]);
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [activeReturn, setActiveReturn] = useState<any>(null);

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/orders/${id}`);
            setOrder(response.data);
            if (response.data.partRating) {
                setTempPartRating(response.data.partRating);
                setTempDeliveryRating(response.data.deliveryRating);
                setRatingComment(response.data.ratingComment || '');
            }
            // MED-07 FIX: Map active return directly from the order details response to avoid redundant API request
            if (response.data.activeReturnId) {
                setActiveReturn({
                    id: response.data.activeReturnId,
                    status: response.data.returnStatus,
                    reason: response.data.returnReason,
                    description: response.data.returnDescription,
                    requestType: response.data.returnRequestType,
                    orderId: response.data.id,
                    requestedAt: response.data.orderDate, // Fallback placeholder
                    adminNote: response.data.adminNote
                });
            } else {
                setActiveReturn(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch order:', err);
            if (err.response?.status === 404) {
                setError('Order not found in our database');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to view this order');
            } else {
                setError('Failed to establish connection with the logistics terminal');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchReturnRequest = async () => {
        try {
            const response = await apiClient.get(`/returns/my`);
            const request = response.data.find((r: any) => Number(r.orderId) === Number(id));
            if (request) setActiveReturn(request);
        } catch (err) {
            console.error('Failed to fetch return status');
        }
    };

    useEffect(() => {
        if (order) {
            fetchReturnRequest();
        }
    }, [order]);

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
            alert('Feedback submitted successfully.');
        } catch (error: any) {
            console.error('Rating submission failed:', error);
            // HIGH-05 FIX: User-facing toast/alert
            alert(error.response?.data?.message || 'Failed to submit rating.');
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        try {
            await apiClient.put(`/orders/${id}/status?status=${status}`);
            await fetchOrder();
            alert(`Order status updated to ${status.replace(/_/g, ' ')} successfully.`);
        } catch (err: any) {
            console.error('Status update failed:', err);
            // HIGH-05 FIX: User-facing toast/alert
            alert(err.response?.data?.message || 'Status update failed.');
        }
    };

    const handleUpdateFittingStatus = async (status: string) => {
        try {
            await apiClient.patch(`/orders/${id}/fitting-status?status=${status}`);
            await fetchOrder();
            alert(`Fitting status updated to ${status.replace(/_/g, ' ')} successfully.`);
        } catch (err: any) {
            console.error('Fitting status update failed:', err);
            // HIGH-05 FIX: User-facing toast/alert
            alert(err.response?.data?.message || 'Fitting status update failed.');
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await apiClient.get(`/orders/${id}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Invoice download failed:', err);
            alert('Failed to retrieve professional invoice from terminal.');
        }
    };
    const openReturnModal = () => {
        if (order?.items) {
            const initialItems = order.items
                .filter((item: any) => item.isReturnable)
                .map((item: any) => ({
                    orderItemId: item.id,
                    quantity: 0, // Default to 0, require user to increment
                    maxQuantity: item.quantity,
                    partName: item.productName || (item.product?.partName) || 'Unknown Product',
                    price: item.priceAtPurchase || item.price || 0
                }));
            setReturnItems(initialItems);
        }
        setIsReturnModalOpen(true);
    };

    const handleSubmitReturn = async () => {
        if (submittingReturn) return;
        if (!returnDescription.trim()) return;
        
        const selectedItems = returnItems.filter(item => item.quantity > 0).map(item => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity
        }));

        if (selectedItems.length === 0) {
            alert('Please select at least one item and specify the quantity to return.');
            return;
        }

        setSubmittingReturn(true);
        try {
            await apiClient.post('/returns', {
                orderId: parseInt(id!),
                reason: returnReason,
                requestType: returnType,
                description: returnDescription,
                imageUrls: [], // Mock images for now
                items: selectedItems
            });
            setIsReturnModalOpen(false);
            await fetchOrder();
        } catch (error) {
            console.error('Return request failed');
            alert('Failed to transmit return protocol.');
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
        setLoading(true);
        try {
            await apiClient.post(`/orders/${id}/cancel`);
            alert('Order cancelled and refund processed successfully.');
            await fetchOrder();
        } catch (err: any) {
            console.error('Cancellation failed:', err);
            alert(err.response?.data?.message || 'Failed to cancel the order.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnAction = async (action: 'approve' | 'reject' | 'picked-up' | 'finalize' | 'retry-refund', adminNote?: string) => {
        if (!activeReturn) return;
        setLoading(true);
        try {
            if (action === 'approve') {
                await apiClient.put(`/returns/admin/${activeReturn.id}/approve`);
                alert('Return Protocol Approved successfully.');
            } else if (action === 'reject') {
                // HIGH-06 FIX: Fix query parameter name from adminNote to note
                await apiClient.put(`/returns/admin/${activeReturn.id}/reject?note=${encodeURIComponent(adminNote || 'Policy mismatch')}`);
                alert('Return Request Rejected.');
            } else if (action === 'picked-up') {
                await apiClient.put(`/returns/admin/${activeReturn.id}/picked-up`);
                alert('Return status marked as Picked Up.');
            } else if (action === 'finalize') {
                const res = await apiClient.put(`/returns/admin/${activeReturn.id}/finalize`);
                if (res.data && res.data.status === 'REFUND_FAILED') {
                    alert('Razorpay Refund Failed. Check admin notes and try again using Retry Refund.');
                } else {
                    alert('Refund Finalized successfully.');
                }
            } else if (action === 'retry-refund') {
                const res = await apiClient.put(`/returns/admin/${activeReturn.id}/retry-refund`);
                if (res.data && res.data.status === 'REFUND_FAILED') {
                    alert('Razorpay Refund Failed again. Please check gateway configuration.');
                } else {
                    alert('Refund Retry successful.');
                }
            }
            await fetchOrder();
        } catch (err: any) {
            console.error('Action failed:', err);
            // HIGH-05 FIX: Visual toast/alert
            alert(err.response?.data?.message || 'Failed to process return action.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-app-bg-light flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;

    if (error || !order) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 border border-gray-100 shadow-inner">
                <HelpCircle size={40} className="text-primary opacity-20" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-app-bg-dark mb-2">
                {error || "Order Not Detected"}
            </h2>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-10">
                Transmission Interrupted • Reference ID #{id}
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-8 py-4 bg-app-bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                    Return to Dashboard
                </button>
                <button 
                    onClick={() => fetchOrder()} 
                    className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
                >
                    Retry Link
                </button>
            </div>
        </div>
    );

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
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">{order.status?.replace(/_/g, ' ')}</span>
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
                            <TrackItem icon={<Truck size={20}/>} label={order.fittingGarageId ? "Garage Bound" : "Shipped"} sub="In Transit" active={['SHIPPED', 'ARRIVED_AT_GARAGE', 'DELIVERED'].includes(order.status)} />
                            <div className="hidden md:block h-px flex-1 bg-gray-100" />
                            <TrackItem icon={<ShieldCheck size={20}/>} label="Arrived" sub="At Terminal" active={['ARRIVED_AT_GARAGE', 'DELIVERED'].includes(order.status)} />
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
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Status: {order.fittingStatus?.replace(/_/g, ' ')}</span>
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
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Item Manifest</h3>
                            <div className="space-y-6">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between gap-6 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-100">
                                                <Package className="text-gray-300" size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-md font-black text-app-bg-dark italic uppercase">{item.productName}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity} • Unit: ₹{item.priceAtPurchase.toLocaleString()}</p>
                                                    {!item.isReturnable && (
                                                        <span className="text-[8px] font-black bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-red-500/20">Non-Returnable</span>
                                                    )}
                                                </div>
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
                                    {order.shippingFee > 0 && (
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Logistic & Shipping</span>
                                            <span>₹{order.shippingFee?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {order.platformFee > 0 && (
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Platform Fee</span>
                                            <span>₹{order.platformFee?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {(order.totalSavings > (order.discountAmount || 0)) && (
                                        <div className="flex justify-between text-xs font-bold text-green-400 uppercase tracking-widest">
                                            <span>Retail Discount</span>
                                            <span>- ₹{(order.totalSavings - (order.discountAmount || 0))?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {(order.discountAmount > 0 || order.appliedCouponCode) && (
                                        <div className="flex justify-between text-xs font-bold text-green-400 uppercase tracking-widest animate-pulse">
                                            <span>Protocol Discount {order.appliedCouponCode && `[${order.appliedCouponCode}]`}</span>
                                            <span>- ₹{order.discountAmount?.toLocaleString()}</span>
                                        </div>
                                    )}
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

                        {/* Active Return Status Display */}
                        {activeReturn && (
                            <div className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/20 animate-in zoom-in-95">
                                <div className="mb-8 p-6 bg-primary/10 border-l-4 border-primary rounded-r-2xl">
                                    <h5 className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 flex items-center gap-2">
                                        <Info size={14} /> Customer Notice
                                    </h5>
                                    <p className="text-sm font-bold text-app-bg-dark leading-relaxed">
                                        {activeReturn.requestType === 'REFUND' 
                                            ? "Refund will be processed automatically after the product is picked up and returned to the seller for verification."
                                            : "Replacement parts will be dispatched once the original items are collected by our fulfillment agent."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic text-app-bg-dark uppercase">Return Protocol <span className="text-primary">Active</span></h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Resolution: {activeReturn.requestType} • Status: {activeReturn.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {activeReturn.refundId && (
                                            <div className="bg-green-500/10 px-6 py-2 rounded-full border border-green-500/20">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Refund: {activeReturn.refundId}</span>
                                            </div>
                                        )}
                                        <div className="bg-app-bg-dark px-6 py-2 rounded-full border border-white/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">#{activeReturn.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[9px] font-black uppercase text-primary tracking-widest mb-4">Reason for Return</h4>
                                        <p className="text-[11px] font-bold text-app-bg-dark uppercase">{activeReturn.reason?.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-gray-500 mt-4 leading-relaxed font-medium italic">"{activeReturn.description}"</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <h4 className="text-[9px] font-black uppercase text-primary tracking-widest mb-4">Terminal Timeline</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black uppercase text-gray-400">Requested</span>
                                                <span className="text-[9px] font-black uppercase text-app-bg-dark">{new Date(activeReturn.requestedAt).toLocaleDateString()}</span>
                                            </div>
                                            {activeReturn.resolvedAt && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black uppercase text-gray-400">Resolved</span>
                                                    <span className="text-[9px] font-black uppercase text-app-bg-dark">{new Date(activeReturn.resolvedAt).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        {activeReturn.adminNote && (
                                            <div className="mt-6 pt-6 border-t border-gray-50">
                                                <p className="text-[9px] font-black uppercase text-primary mb-2">Admin Transmission</p>
                                                <p className="text-[10px] font-bold text-app-bg-dark italic">"{activeReturn.adminNote}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {activeReturn.items && activeReturn.items.length > 0 && (
                                    <div className="mt-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-end mb-6">
                                            <h4 className="text-[9px] font-black uppercase text-primary tracking-widest">Itemized Receipt</h4>
                                            {activeReturn.refundAmount != null && (
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black uppercase text-gray-400 block mb-1">Total Refund Value</span>
                                                    <span className="text-xl font-black italic text-app-bg-dark">₹{activeReturn.refundAmount.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {activeReturn.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div>
                                                        <p className="text-xs font-black text-app-bg-dark uppercase tracking-tight">{item.partName}</p>
                                                    </div>
                                                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Customer Delivery Confirmation */}
                        {(order.status === 'SHIPPED' || order.status === 'ARRIVED_AT_GARAGE') && order.isOwner && (
                            <div className="flex justify-center pt-8">
                                <button 
                                    onClick={() => handleUpdateStatus('DELIVERED')}
                                    className="px-10 py-5 bg-app-bg-dark text-white rounded-[2rem] font-black uppercase italic tracking-widest text-[10px] transition-all shadow-xl hover:bg-primary active:scale-95 shadow-red-500/10"
                                >
                                    Confirm Delivery Received
                                </button>
                            </div>
                        )}

                        {/* Customer Post-Delivery Actions */}
                        {(order.status === 'DELIVERED' || (order.status === 'RETURN_REQUESTED' && !activeReturn)) && order.isOwner && !activeReturn && (
                            <div className="flex justify-center pt-8">
                                <button 
                                    onClick={openReturnModal}
                                    disabled={!order.items?.some((i: any) => i.isReturnable)}
                                    className={`px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-[10px] transition-all shadow-xl active:scale-95 ${
                                        order.items?.some((i: any) => i.isReturnable)
                                            ? 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-red-500/5'
                                             : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed grayscale'
                                    }`}
                                >
                                    {order.items?.some((i: any) => i.isReturnable) ? 'Initiate Return / Replacement' : 'Returns Unavailable (Final Sale)'}
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-12 border-t border-gray-100">
                              {/* Merchant / Garage / Admin / Worker Action Terminal */}
                              {(role === 'ROLE_SELLER' || role === 'ROLE_ADMIN' || role === 'ROLE_GARAGE' || role === 'ROLE_WORKER') && (
                                 <div className="w-full flex flex-wrap gap-4 mb-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                                     <div className="w-full mb-4">
                                         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-app-bg-dark">Fulfillment Control Terminal</h3>
                                     </div>
                                     
                                     {(role === 'ROLE_ADMIN' || role === 'ROLE_WORKER') && order.status === 'RETURN_REQUESTED' && activeReturn && activeReturn.status === 'PENDING' && (
                                         <div className="w-full flex flex-wrap gap-4 border-b border-gray-100 pb-8 mb-4">
                                             <ActionBtn 
                                                 icon={<CheckCircle size={16}/>} 
                                                 label="APPROVE RETURN PROTOCOL" 
                                                 primary 
                                                 onClick={() => handleReturnAction('approve')} 
                                             />
                                             <ActionBtn 
                                                 icon={<XCircle size={16}/>} 
                                                 label="REJECT RETURN REQUEST" 
                                                 onClick={() => {
                                                     setRejectionNote("Request does not meet return policy criteria.");
                                                     setIsRejectModalOpen(true);
                                                 }} 
                                             />
                                         </div>
                                     )}

                                     {(role === 'ROLE_ADMIN' || role === 'ROLE_WORKER') && activeReturn && activeReturn.status === 'APPROVED' && (
                                         <div className="w-full flex flex-wrap gap-4 border-b border-gray-100 pb-8 mb-4">
                                             <ActionBtn 
                                                 icon={<Package size={16}/>} 
                                                 label="MARK AS PICKED UP" 
                                                 primary 
                                                 onClick={() => handleReturnAction('picked-up')} 
                                             />
                                         </div>
                                     )}

                                     {(role === 'ROLE_ADMIN' || role === 'ROLE_WORKER') && activeReturn && activeReturn.status === 'PICKED_UP' && activeReturn.requestType === 'REFUND' && (
                                         <div className="w-full flex flex-wrap gap-4 border-b border-gray-100 pb-8 mb-4">
                                             <ActionBtn 
                                                 icon={<ShieldCheck size={16}/>} 
                                                 label="FINALIZE REFUND" 
                                                 primary 
                                                 onClick={() => handleReturnAction('finalize')} 
                                             />
                                         </div>
                                     )}

                                     {(role === 'ROLE_ADMIN' || role === 'ROLE_WORKER') && activeReturn && activeReturn.status === 'REFUND_FAILED' && (
                                         <div className="w-full flex flex-wrap gap-4 border-b border-gray-100 pb-8 mb-4">
                                             <ActionBtn 
                                                 icon={<ShieldCheck size={16}/>} 
                                                 label="RETRY REFUND" 
                                                 primary 
                                                 onClick={() => handleReturnAction('retry-refund')} 
                                             />
                                         </div>
                                     )}

                                    {role === 'ROLE_SELLER' && order.status === 'PAID' && (
                                        <ActionBtn 
                                            icon={<MapPin size={16}/>} 
                                            label="MARK AS SHIPPED" 
                                            primary 
                                            onClick={() => handleUpdateStatus('SHIPPED')} 
                                        />
                                    )}

                                    {role === 'ROLE_GARAGE' && order.fittingGarageId && (
                                        <div className="flex flex-wrap gap-4">
                                            {order.status === 'SHIPPED' && (
                                                <ActionBtn 
                                                    icon={<CheckCircle size={16}/>} 
                                                    label="VERIFY ARRIVAL AT GARAGE" 
                                                    primary 
                                                    onClick={() => handleUpdateFittingStatus('ARRIVED_AT_GARAGE')} 
                                                />
                                            )}
                                            {order.status === 'ARRIVED_AT_GARAGE' && order.fittingStatus === 'PENDING_INSPECTION' && (
                                                <ActionBtn 
                                                    icon={<ShieldCheck size={16}/>} 
                                                    label="MARK AS INSPECTED" 
                                                    primary 
                                                    onClick={() => handleUpdateFittingStatus('INSPECTED')} 
                                                />
                                            )}
                                            {order.fittingStatus === 'INSPECTED' && (
                                                <ActionBtn 
                                                    icon={<CheckCircle size={16}/>} 
                                                    label="COMPLETE FITTING" 
                                                    primary 
                                                    onClick={() => handleUpdateFittingStatus('COMPLETED')} 
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                             )}

                            {order.isOwner && ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(order.status) && (
                                <ActionBtn icon={<XCircle size={16}/>} label="Cancel Order" onClick={handleCancelOrder} />
                            )}
                            <ActionBtn icon={<ShieldCheck size={16}/>} label="Download Invoice" primary onClick={handleDownloadInvoice} />
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

            {/* Return Request Modal */}
            {isReturnModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-app-bg-dark/80 backdrop-blur-md" onClick={() => setIsReturnModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-app-bg-dark p-10 md:p-14 text-white relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24" />
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Initiate <span className="text-primary">Return</span></h2>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Hardware Recall Protocol • Order #{order.id}</p>
                                {order.items?.some((i: any) => !i.isReturnable) && (
                                    <div className="mt-4 bg-red-500/20 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3">
                                        <Info size={14} className="text-red-400" />
                                        <p className="text-[8px] font-black uppercase text-red-400 tracking-widest">Protocol Warning: Some items in this order are non-returnable and will be excluded from resolution.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-10 md:p-14 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Select Reason</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['WRONG_FITMENT', 'DAMAGED', 'OTHER'].map(reason => (
                                            <button 
                                                key={reason}
                                                onClick={() => setReturnReason(reason)}
                                                className={`p-5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center ${returnReason === reason ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100'}`}
                                            >
                                                {reason.replace('_', ' ')}
                                                {returnReason === reason && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Select Resolution</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['REPLACEMENT', 'REFUND'].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => setReturnType(type)}
                                                className={`p-5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center ${returnType === type ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100'}`}
                                            >
                                                {type === 'REPLACEMENT' ? 'Send Replacement Part' : 'Issue Full Refund'}
                                                {returnType === type && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Select Items to Return</label>
                                <div className="flex flex-col gap-3">
                                    {returnItems.map((item, idx) => (
                                        <div key={item.orderItemId} className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${item.quantity > 0 ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-tight ${item.quantity > 0 ? 'text-primary' : 'text-gray-500'}`}>{item.partName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">Purchased: {item.maxQuantity} Unit(s) • ₹{(item.price || 0).toLocaleString()}/ea</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                                <button 
                                                    onClick={() => {
                                                        const newItems = [...returnItems];
                                                        if (newItems[idx].quantity > 0) newItems[idx].quantity -= 1;
                                                        setReturnItems(newItems);
                                                    }}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-app-bg-dark transition-all font-black text-lg"
                                                >-</button>
                                                <span className="text-sm font-black w-6 text-center text-app-bg-dark">{item.quantity}</span>
                                                <button 
                                                    onClick={() => {
                                                        const newItems = [...returnItems];
                                                        if (newItems[idx].quantity < newItems[idx].maxQuantity) newItems[idx].quantity += 1;
                                                        setReturnItems(newItems);
                                                    }}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-primary hover:text-white transition-all font-black text-lg"
                                                >+</button>
                                            </div>
                                        </div>
                                    ))}
                                    {returnItems.length === 0 && (
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No returnable items found in this order.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Technical Details</label>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-sm font-bold text-app-bg-dark outline-none focus:border-primary/30 transition-all min-h-[120px] placeholder:text-gray-400"
                                    placeholder="Please describe the fitment issue or damage details for our technical team..."
                                    value={returnDescription}
                                    onChange={(e) => setReturnDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    onClick={() => setIsReturnModalOpen(false)}
                                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSubmitReturn}
                                    disabled={!returnDescription.trim() || submittingReturn}
                                    className="flex-[2] py-5 bg-app-bg-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all shadow-xl shadow-black/10 disabled:opacity-30"
                                >
                                    {submittingReturn ? 'Transmitting...' : 'Transmit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Reject Return Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-350">
                    <div className="absolute inset-0 bg-app-bg-dark/80 backdrop-blur-md" onClick={() => setIsRejectModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-app-bg-dark p-10 md:p-14 text-white relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -mr-24 -mt-24" />
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Reject <span className="text-primary">Return</span></h2>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Protocol Cancellation • Order #{order.id}</p>
                            </div>
                        </div>

                        <div className="p-10 md:p-14 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 font-inter">Reason for Rejection</label>
                                <textarea
                                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-app-bg-dark placeholder-gray-400 focus:outline-none focus:border-primary transition-all resize-none font-inter"
                                    placeholder="Provide details why the return is being rejected..."
                                    rows={4}
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all font-inter border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (rejectionNote.trim()) {
                                            handleReturnAction('reject', rejectionNote);
                                            setIsRejectModalOpen(false);
                                        } else {
                                            alert('Please specify a rejection reason.');
                                        }
                                    }}
                                    className="flex-[2] py-5 bg-app-bg-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all shadow-xl shadow-black/10 font-inter"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
