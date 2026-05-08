import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, ShoppingBag, 
  Clock, Eye
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const AdminOrderManagement: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'ORDERS' | 'RETURNS'>('ORDERS');
    const [returns, setReturns] = useState<any[]>([]);
    const [returnsLoading, setReturnsLoading] = useState(false);

    const location = useLocation();
    useEffect(() => { 
        fetchOrders();
        // Check for ?tab=returns
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'returns') {
            setActiveTab('RETURNS');
        } else {
            setActiveTab('ORDERS');
        }
    }, [location]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch global orders:', err);
            // Fallback for demo
            setOrders([
                { id: 1001, customerName: 'Chetan Khare', grandTotal: 12500, status: 'PAID', orderDate: new Date().toISOString() },
                { id: 1002, customerName: 'Aditya Raj', grandTotal: 4500, status: 'SHIPPED', orderDate: new Date().toISOString() },
                { id: 1003, customerName: 'Rahul Singh', grandTotal: 8900, status: 'DELIVERED', orderDate: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchReturns = async () => {
        setReturnsLoading(true);
        try {
            const res = await apiClient.get('/returns/admin');
            setReturns(res.data);
        } catch (err) {
            console.error('Failed to fetch global returns:', err);
        } finally {
            setReturnsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'RETURNS') fetchReturns();
    }, [activeTab]);

    const handleUpdateReturn = async (id: number, action: string, note?: string) => {
        try {
            const endpoint = `/returns/admin/${id}/${action}`;
            const query = note ? `?note=${note}` : '';
            await apiClient.put(endpoint + query);
            fetchReturns();
            if (action === 'approve') fetchOrders(); // Because order status changes
        } catch (err) {
            console.error('Return update failed');
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await apiClient.put(`/admin/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter pb-20">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(role === 'ROLE_WORKER' ? '/worker' : '/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Order <span className="text-primary italic">Pipeline</span></h1>
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mt-4">
                                <button 
                                    onClick={() => setActiveTab('ORDERS')}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                                        activeTab === 'ORDERS' 
                                        ? 'bg-primary text-white shadow-lg shadow-red-500/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <ShoppingBag size={14} /> Fulfillment Oversight
                                </button>
                                <button 
                                    onClick={() => setActiveTab('RETURNS')}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                                        activeTab === 'RETURNS' 
                                        ? 'bg-primary text-white shadow-lg shadow-red-500/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Clock size={14} /> Return Terminals
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search order ID or customer..." 
                                className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-app-bg-dark border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none md:w-40 text-center"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <optgroup label="── Fulfillment ──">
                                {['PAID', 'PROCESSING', 'SHIPPED', 'ARRIVED_AT_GARAGE', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </optgroup>
                            <optgroup label="── Returns ──">
                                {['RETURN_REQUESTED', 'REFUND_IN_PROGRESS', 'REFUNDED', 'REPLACEMENT_SHIPPING', 'RETURNED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                            </optgroup>

                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8">
                {/* Orders List */}
                {activeTab === 'ORDERS' && (
                    <div className="space-y-4">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-[#121216] rounded-3xl animate-pulse border border-white/5" />)
                        ) : filteredOrders.length > 0 ? filteredOrders.map(order => (
                            <div key={order.id} className="bg-[#121216] border border-white/5 p-6 rounded-[2rem] hover:border-primary/20 transition-all group">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                                            order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                                            order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' :
                                            order.status === 'ARRIVED_AT_GARAGE' ? 'bg-cyan-500/10 text-cyan-500' :
                                            order.status === 'REFUNDED' ? 'bg-purple-500/10 text-purple-400' :
                                            order.status === 'RETURN_REQUESTED' ? 'bg-pink-500/10 text-pink-400' :
                                            order.status === 'REPLACEMENT_SHIPPING' ? 'bg-orange-500/10 text-orange-400' :
                                            order.status === 'RETURNED' ? 'bg-gray-500/10 text-gray-400' :
                                            'bg-primary/10 text-primary'
                                        }`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Order #{order.id}</p>
                                            <h4 className="text-md font-black text-white italic uppercase tracking-tight">{order.customerName}</h4>
                                            <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">
                                                {new Date(order.orderDate).toLocaleDateString()} • ₹{(order.grandTotal || 0).toLocaleString()} • {order.status?.replace('_', ' ')}
                                            </p>
                                            {order.status === 'RETURN_REQUESTED' && (order.returnReason || order.returnDescription) && (
                                                <div className="mt-4 p-4 bg-pink-500/5 border-l-2 border-pink-500 rounded-r-xl space-y-3">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase text-pink-500 tracking-widest">Return Protocol: {order.returnReason?.replace('_', ' ')}</p>
                                                        {order.returnDescription && <p className="text-[10px] text-gray-400 italic">"{order.returnDescription}"</p>}
                                                    </div>
                                                    
                                                    {order.activeReturnId && (
                                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                                            {order.returnStatus === 'PENDING' && (
                                                                <>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateReturn(order.activeReturnId!, 'approve'); }}
                                                                        className="px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateReturn(order.activeReturnId!, 'reject'); }}
                                                                        className="px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {order.returnStatus === 'APPROVED' && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateReturn(order.activeReturnId!, 'picked-up'); }}
                                                                    className="px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                                                >
                                                                    Mark Picked Up
                                                                </button>
                                                            )}
                                                            {order.returnStatus === 'PICKED_UP' && order.returnRequestType === 'REFUND' && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleUpdateReturn(order.activeReturnId!, 'finalize'); }}
                                                                    className="px-3 py-1.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                                                                >
                                                                    Finalize Refund
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-wrap gap-2 p-2 bg-black/40 rounded-2xl">
                                            {/* Fulfillment action buttons */}
                                            {['RETURN_REQUESTED', 'REFUND_IN_PROGRESS', 'REFUNDED', 'REPLACEMENT_SHIPPING', 'RETURNED'].includes(order.status) ? (
                                                // Read-only return status pill — managed via Returns tab
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                    order.status === 'REFUNDED' ? 'bg-purple-500/20 text-purple-400' :
                                                    order.status === 'RETURN_REQUESTED' ? 'bg-pink-500/20 text-pink-400' :
                                                    order.status === 'REPLACEMENT_SHIPPING' ? 'bg-orange-500/20 text-orange-400' :
                                                    order.status === 'RETURNED' ? 'bg-gray-500/20 text-gray-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {order.status.replace(/_/g, ' ')} • Manage in Returns Tab
                                                </span>
                                            ) : (
                                                ['PROCESSING', 'SHIPPED', 'ARRIVED_AT_GARAGE', 'DELIVERED', 'CANCELLED'].map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => updateStatus(order.id, s)}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                            order.status === s ? 'bg-primary text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                        }`}
                                                    >
                                                        {s === 'ARRIVED_AT_GARAGE' ? 'ARRIVED' : s === 'PROCESSING' ? 'PROCESS' : s}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/order/${order.id}`)}
                                            className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform group-hover:scale-105"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-32 text-center bg-[#121216] rounded-[3rem] border border-dashed border-white/5">
                                <Clock size={48} className="mx-auto text-gray-800 mb-6" />
                                <p className="text-xl font-black italic uppercase text-gray-600">No Orders in Sync</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-700 mt-2">Adjust filters or search criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Returns Management View */}
                {activeTab === 'RETURNS' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {returnsLoading ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-[#121216] rounded-3xl animate-pulse border border-white/5" />)
                        ) : returns.length > 0 ? returns.map(ret => (
                            <div key={ret.id} className="bg-[#121216] border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/20 transition-all">
                                <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
                                    <div className="flex gap-6 flex-1">
                                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                            <ShoppingBag size={28} />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-4">
                                                <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{ret.customerName}</h4>
                                                <div className="px-4 py-1 bg-white/5 rounded-full border border-white/10">
                                                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">{ret.status}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Protocol Type</p>
                                                    <p className="text-xs font-bold text-white uppercase">{ret.requestType} • {ret.reason?.replace('_', ' ')}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Reference ID</p>
                                                    <p className="text-xs font-bold text-white uppercase">Order #{ret.orderId}</p>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-bold text-gray-400 italic">"{ret.description}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 shrink-0">
                                        {ret.status === 'PENDING' && (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateReturn(ret.id, 'approve')}
                                                    className="px-6 py-3 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                                >
                                                    Approve Protocol
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const note = prompt('Enter rejection reason:');
                                                        if (note) handleUpdateReturn(ret.id, 'reject', note);
                                                    }}
                                                    className="px-6 py-3 bg-white/5 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {ret.status === 'APPROVED' && (
                                            <button 
                                                onClick={() => handleUpdateReturn(ret.id, 'picked-up')}
                                                className="px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                            >
                                                Mark Picked Up
                                            </button>
                                        )}
                                        {ret.status === 'PICKED_UP' && ret.requestType === 'REFUND' && (
                                            <button 
                                                onClick={() => handleUpdateReturn(ret.id, 'finalize')}
                                                className="px-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                            >
                                                Finalize Refund
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => navigate(`/order/${ret.orderId}`)}
                                            className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center bg-[#121216] rounded-[3rem] border border-dashed border-white/5">
                                <ShoppingBag size={40} className="mx-auto text-gray-800 mb-6" />
                                <p className="text-xl font-black italic uppercase text-gray-600">No Pending Recall Protocols</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrderManagement;
