import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChevronRight, Package, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-app-bg-light pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/user-dashboard')}
                            className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter leading-none">
                                Order <span className="text-primary">History</span>
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{orders.length} Completed Transactions</p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-32 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retrieving Workshop Records...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <div 
                                key={order.id} 
                                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 group hover:border-primary/20 transition-all overflow-hidden relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Package size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order #{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 
                                                    order.status === 'ARRIVED_AT_GARAGE' ? 'bg-cyan-100 text-cyan-600' : 
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {order.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black italic text-app-bg-dark uppercase tracking-tight">
                                                {order.items && order.items.length > 0 
                                                    ? `${order.items[0].productName}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}` 
                                                    : 'Performance Spares Package'}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                    <Clock size={12} className="text-primary" /> {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                                <div className="h-1 w-1 bg-gray-300 rounded-full" />
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">₹{order.grandTotal.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-auto md:ml-0">
                                        <button 
                                            onClick={() => navigate(`/order/${order.id}`)}
                                            className="bg-app-bg-dark text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                                        >
                                            View Manifest
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/order/${order.id}`)}
                                            className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-gray-100"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
                            <h2 className="text-xl font-black italic text-app-bg-dark uppercase tracking-tight">No Transactions Recorded</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs mx-auto">Start building your project by exploring our precision components</p>
                            <Link to="/" className="mt-8 inline-block bg-primary text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all">
                                Open Catalog
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
