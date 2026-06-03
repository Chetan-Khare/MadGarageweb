import React, { useEffect, useState } from 'react';
import {
    Users, Package, FileText,
    ShoppingCart, Car, Fingerprint,
    Activity, ChevronRight, LogOut, Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

interface WorkerStats {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalVehicles: number;
}

const WorkerDashboard: React.FC = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState<WorkerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncError, setSyncError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // WD-C-1: Route guard — redirect non-workers immediately
    useEffect(() => {
        if (role && role !== 'ROLE_WORKER' && role !== 'ROLE_ADMIN') {
            navigate('/', { replace: true });
        }
    }, [role, navigate]);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            setSyncError('');
            const statsRes = await apiClient.get('/admin/worker-stats');
            setStats(statsRes.data);
        } catch (error: any) {
            setSyncError('Link Failure: Connection to Central HQ lost');
            console.error('Worker Dashboard Sync Failure:', error);
        } finally {
            setLoading(false);
        }
    };

    if (syncError) {
        return (
            <div className="min-h-screen bg-[#08080C] flex flex-col items-center justify-center p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-md text-center space-y-4">
                    <Activity size={48} className="text-red-500 mx-auto" />
                    <h2 className="text-xl font-black italic uppercase text-red-500">Sync Failure</h2>
                    <p className="text-sm text-red-400/80">{syncError}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="mt-4 px-6 py-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen bg-[#08080C] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Initializing Secure Worker Terminal...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter pb-20">
            {/* Header Area */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#08080C]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="MAD GARAGE" className="h-10 aspect-square object-contain rounded-full overflow-hidden" />
                        <span className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                            Operations <span className="text-primary border-b-2 border-primary/20">Hub</span>
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 hidden md:block">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Global Entity Search..."
                            className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-primary hover:border-primary/50 transition-all group overflow-hidden"
                        >
                            {(user?.profileImageUrl && user.profileImageUrl.startsWith('/uploads/')) ? (
                                <img src={`${BASE_SERVER_URL}${user.profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <Fingerprint size={20} className="group-hover:scale-110 transition-transform" />
                            )}
                        </button>
                        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 bg-red-500/10 text-primary px-5 py-2.5 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 md:px-12 mt-12 space-y-12 max-w-7xl mx-auto">
                {/* Greeting */}
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.4em]">Active Duty Station</p>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Welcome, <br />
                        <span className="text-gray-400 inline-block ml-28 md:ml-28 mt-6">Operator</span>
                    </h1>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard onClick={() => navigate('/admin/users')} icon={<Users size={20} />} value={stats?.totalUsers || 0} label="Network Users" />
                    <StatCard onClick={() => navigate('/admin/parts-db')} icon={<Package size={20} />} value={stats?.totalProducts || 0} label="Active Inventory" />
                    <StatCard onClick={() => navigate('/admin/vehicles')} icon={<Car size={20} />} value={stats?.totalVehicles || 0} label="Vehicle Specs" />
                    <StatCard onClick={() => navigate('/admin/requests')} icon={<FileText size={20} />} value="GO" label="Open Requests" />
                </div>

                {/* Operations Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Core Mission Modules</h2>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <OperationCard
                            title="Partner Audits"
                            desc="Review & Contact Applicants"
                            icon={<Users size={32} />}
                            color="text-blue-500"
                            onClick={() => navigate('/admin/partners')}
                        />
                        <OperationCard
                            title="Order Pipeline"
                            desc="Monitor Shipping & Payouts"
                            icon={<ShoppingCart size={32} />}
                            color="text-red-500"
                            onClick={() => navigate('/admin/orders')}
                        />
                        <OperationCard
                            title="Inventory Control"
                            desc="Audit Parts & Flag Issues"
                            icon={<Package size={32} />}
                            color="text-amber-500"
                            onClick={() => navigate('/admin/inventory')}
                        />
                        <OperationCard
                            title="Part Requests"
                            desc="Source & Fulfill Demands"
                            icon={<FileText size={32} />}
                            color="text-emerald-500"
                            onClick={() => navigate('/admin/requests')}
                        />
                    </div>
                </div>

                {/* Quick Actions / Activity Feed Stand-in */}
                <div className="bg-[#121216] border border-white/5 rounded-[3rem] p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Operational <span className="text-primary">Summary</span></h3>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                Your terminal is linked to the global fulfillment engine. Monitor active shipments and verify new merchant applications to maintain network integrity.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => navigate('/admin/users')} className="px-8 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                                    Manage Profiles
                                </button>
                                <button onClick={() => navigate('/chat')} className="px-8 py-4 bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                    AI Diagnostics
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-black/40 border border-green-500/20 p-6 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-gray-400">System Status</p>
                                        <p className="text-xs font-bold text-white mt-1 uppercase">All Subsystems Nominal</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, value: number | string, label: string, onClick?: () => void }> = ({ icon, value, label, onClick }) => (
    <div
        onClick={onClick}
        className="bg-[#121216] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center group hover:border-primary/20 transition-all cursor-pointer"
    >
        <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-primary border border-white/5 mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-2xl font-black italic tracking-tighter mb-1">{value}</div>
        <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 text-center">{label}</div>
    </div>
);

const OperationCard: React.FC<{ title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
    <button
        onClick={onClick}
        className="text-left bg-[#121216] border border-white/5 p-10 rounded-[2.5rem] group hover:bg-white/[0.02] hover:border-white/10 transition-all relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
        <div className={`${color} mb-8 transition-transform group-hover:-translate-y-1`}>{icon}</div>
        <h4 className="text-lg font-black italic uppercase tracking-tighter text-white mb-2">{title}</h4>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{desc}</p>
        <div className="mt-8 flex justify-end">
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight size={16} />
            </div>
        </div>
    </button>
);

export default WorkerDashboard;
