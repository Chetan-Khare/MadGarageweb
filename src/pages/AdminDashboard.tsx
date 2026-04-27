import React, { useEffect, useState } from 'react';
import {
    Users, Package, TrendingUp, FileText,
    ShoppingCart, Car, Fingerprint,
    Activity, Settings,
    ChevronRight, PlusCircle, Bot, LogOut, Eye, EyeOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import ProductEditModal from '../components/ProductEditModal';

interface AdminStats {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalVehicles: number;
    totalRevenue: number;
    sixMonthRevenue: number[];
}

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    // New User Form State
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'ROLE_SELLER' as 'ROLE_SELLER' | 'ROLE_GARAGE' | 'ROLE_ADMIN'
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Provision Modal State
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [isSavingProvision, setIsSavingProvision] = useState(false);
    const [provisioningProduct, setProvisioningProduct] = useState<any>(null);

    useEffect(() => { fetchAnalytics(); }, []);

    const parseServerDate = (dateVal: any) => {
        if (!dateVal) return new Date();
        if (Array.isArray(dateVal)) {
            // Java LocalDateTime: [year, month, day, hour, min, sec]
            // Arrays are 1-indexed for months in Java (1=Jan), 0-indexed in JS (0=Jan)
            return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
        }
        // Handle ISO strings or numeric timestamps
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const fetchAnalytics = async () => {
        try {
            setFormError('');
            const statsRes = await apiClient.get('/admin/analytics');
            const baseStats = statsRes.data;
            setStats(baseStats);
            setLoading(false); 

            try {
                const ordersRes = await apiClient.get('/admin/orders');
                const allOrders = ordersRes.data || [];
                const trajectory = calculateTrajectory(allOrders);
                const hasCalculatedData = trajectory.some(v => v > 0);
                
                setStats(prev => {
                    if (!prev) return null;
                    const finalTrajectory = hasCalculatedData ? trajectory : prev.sixMonthRevenue;
                    return { ...prev, sixMonthRevenue: finalTrajectory };
                });
            } catch (orderErr) {
                // Secondary analytics fetch failed, dashboard still usable with summary data
            }

        } catch (error: any) {
            let errorMsg = error.response?.data || error.message || 'Unknown synchronisation failure';
            if (typeof errorMsg === 'object') {
                errorMsg = errorMsg.message || JSON.stringify(errorMsg);
            }
            console.error('CRITICAL: Dashboard Sync Failure:', errorMsg);
            setFormError(`Sync Error: ${errorMsg}`);
            setStats({
                totalUsers: 0,
                totalSellers: 0,
                totalProducts: 0,
                totalVehicles: 0,
                totalRevenue: 0,
                sixMonthRevenue: [0, 0, 0, 0, 0, 0]
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateTrajectory = (orders: any[]) => {
        const buckets = [0, 0, 0, 0, 0, 0];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        orders.forEach(order => {
            if (!order) return;
            // Robust amount checking (supports various DTO field names)
            const amount = order.grandTotal ?? order.totalAmount ?? order.subtotal ?? 0;
            const date = parseServerDate(order.orderDate);
            
            const orderMonth = date.getMonth();
            const orderYear = date.getFullYear();

            const monthDiff = (currentYear - orderYear) * 12 + (currentMonth - orderMonth);
            
            if (monthDiff >= 0 && monthDiff < 6) {
                buckets[5 - monthDiff] += Number(amount);
            }
        });
        return buckets;
    };

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `₹${(val / 1000000).toFixed(2)}M`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        if (val === 0) return '₹0';
        return `₹${val.toLocaleString()}`;
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(''); setFormSuccess('');
        
        if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
            setFormError('Identity fundamentals (Name, Email, and Password) are required.');
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            setFormError('Credential mismatch: Passwords do not align.');
            return;
        }

        setCreatingUser(true);
        try {
            const payload = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                password: newUser.password,
                phone: newUser.phone,
                role: newUser.role
            };
            await apiClient.post('/admin/users', payload);
            setFormSuccess(`${newUser.role} account provisioned!`);
            setNewUser({ ...newUser, firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' });
            fetchAnalytics();
        } catch (err: any) {
            setFormError(err.response?.data || 'Provisioning failed.');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleSaveProvision = async (payload: any) => {
        setIsSavingProvision(true);
        try {
            // Use existing seller-based create endpoint as per user requirement
            await apiClient.post('/seller/inventory/base64', payload);
            setShowProvisionModal(false);
            setFormSuccess('Part successfully provisioned!');
            fetchAnalytics();
        } catch (err) {
            alert('Provisioning failed.');
        } finally {
            setIsSavingProvision(false);
        }
    };

    const openProvisioning = () => {
        setProvisioningProduct({ 
            partName: '', 
            price: 0, 
            stockQuantity: 10, 
            category: 'Engine', 
            condition: 'NEW', 
            description: '',
            wholesale: true
        });
        setShowProvisionModal(true);
    };

    if (loading) return <div className="min-h-screen bg-app-bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Establishing Secure Link...</p>
        </div>
    </div>;

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Header Area */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="MAD GARAGE" className="h-12 aspect-square object-contain rounded-full overflow-hidden" />
                        <span className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                            Main Control <span className="text-primary border-b-4 border-primary/20">Frame</span>
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/profile')} 
                        className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary hover:bg-white/10 hover:border-primary/50 transition-all group shadow-lg shadow-primary/5 overflow-hidden"
                        title="Profile Access"
                    >
                        {(user?.profileImageUrl && user.profileImageUrl.startsWith('/uploads/')) ? (
                            <img src={`${BASE_SERVER_URL}${user.profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <Fingerprint size={22} className="group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Master Admin</p>
                        <button onClick={() => navigate('/profile')} className="text-sm font-black text-white italic hover:text-primary transition-all">
                            {user?.name || 'Administrator'}
                        </button>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 bg-red-500/10 text-primary px-6 py-3 rounded-2xl border border-primary/20 hover:bg-primary hover:text-white transition-all group">
                        <LogOut size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </div>

            <div className="p-8 md:px-12 pb-20 space-y-12 max-w-7xl mx-auto">
                {formError && (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                                <Activity size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60">System Synchronisation Failure</p>
                                <p className="text-sm font-black italic text-red-500">{formError}</p>
                            </div>
                        </div>
                        <button onClick={() => fetchAnalytics()} className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all">Retry Link</button>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard onClick={() => navigate('/admin/users')} icon={<Users />} value={stats?.totalUsers || 0} label="Total Users" />
                    <StatCard onClick={() => navigate('/admin/parts-db')} icon={<Package />} value={stats?.totalProducts || 0} label="Parts DB" />
                    <StatCard icon={<TrendingUp />} value={formatCurrency(stats?.totalRevenue || 0)} label="Gross Income" />
                    <StatCard onClick={() => navigate('/admin/requests')} icon={<FileText />} value="VIEW" label="Active Requests" />
                </div>

                {/* Operations Hub */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Core Operations</h2>
                        <span className="bg-primary/10 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase">Modules Active</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <OperationHubCard
                            icon={<ShoppingCart size={32} />}
                            title="Order Pipeline"
                            subtitle="Audit Billing"
                            color="text-red-500"
                            bg="from-red-950/40 to-black"
                            border="border-red-900/40"
                            onClick={() => navigate('/admin/orders')}
                        />
                        <OperationHubCard
                            icon={<Car size={32} />}
                            title="Garage Inventory"
                            subtitle="Control Catalog"
                            color="text-blue-500"
                            bg="from-blue-950/40 to-black"
                            border="border-blue-900/40"
                            onClick={() => navigate('/admin/inventory')}
                        />
                        <OperationHubCard
                            icon={<Activity size={32} />}
                            title="Vehicle Database"
                            subtitle={`${stats?.totalVehicles || 0} Records`}
                            color="text-green-500"
                            bg="from-green-950/40 to-black"
                            border="border-green-900/40"
                            onClick={() => navigate('/admin/vehicles')}
                        />
                        <OperationHubCard
                            icon={<PlusCircle size={32} />}
                            title="Provision Part"
                            subtitle="List New Inventory"
                            color="text-primary"
                            bg="from-red-950/20 to-black"
                            border="border-primary/20"
                            onClick={openProvisioning}
                        />
                        <OperationHubCard
                            icon={<Settings size={32} />}
                            title="System Properties"
                            subtitle="Live Global Config"
                            color="text-amber-500"
                            bg="from-amber-950/20 to-black"
                            border="border-amber-900/40"
                            onClick={() => navigate('/admin/settings')}
                        />
                        <OperationHubCard
                            icon={<Bot size={32} />}
                            title="MAD GARAGE AI"
                            subtitle="Neural Diagnostics"
                            color="text-purple-500"
                            bg="from-purple-950/20 to-black"
                            border="border-purple-900/40"
                            onClick={() => navigate('/chat')}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Revenue Chart Stand-in (Stylized) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Live Revenue Analytics</h2>
                            <span className="text-primary text-[10px] font-black">REAL-TIME DATA</span>
                        </div>
                        <div className="bg-[#121216] border border-white/5 rounded-[2.5rem] p-10 h-80 flex items-end gap-3 md:gap-5 overflow-hidden group/chart relative bg-grid-white">
                            {/* Scanning Laser Line */}
                            <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none animate-scan opacity-30"></div>
                            
                            {/* Grid Lines Overlay */}
                            <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none opacity-10">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white/20" />)}
                            </div>
                            
                            {stats?.sixMonthRevenue && stats.sixMonthRevenue.length > 0 ? (
                                stats.sixMonthRevenue.map((val, idx) => {
                                    const maxVal = Math.max(...stats.sixMonthRevenue, 1);
                                    const heightPercentage = (val / maxVal) * 100;
                                    const barHeight = val > 0 ? Math.max(heightPercentage, 15) : 8;
                                    
                                    return (
                                        <div key={idx} className="flex-1 h-full flex flex-col items-center justify-end gap-5 group/bar relative z-10">
                                            <div 
                                                className="w-full bg-gradient-to-t from-red-600 via-primary to-rose-400 border-x border-t border-white/20 rounded-t-xl relative shadow-[0_0_25px_-5px_rgba(239,68,68,0.3)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/bar:shadow-[0_0_35px_-5px_rgba(239,68,68,0.6)] group-hover/bar:scale-x-[1.05] group-hover/bar:brightness-125"
                                                style={{ 
                                                    height: `${barHeight}%`,
                                                    transitionDelay: `${idx * 80}ms`
                                                }}
                                            >
                                                {/* Tooltip on hover */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all transform scale-75 group-hover/bar:scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap z-30 border-b-4 border-primary">
                                                    {formatCurrency(val)}
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                                </div>

                                                {/* Internal Detail Line */}
                                                <div className="absolute inset-x-0 top-2 h-[2px] bg-white/20 blur-[1px]"></div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest group-hover/bar:text-primary group-hover/bar:italic transition-all">
                                                {idx === 5 ? 'NOW' : `M-${5 - idx}`}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                    Syncing Analytics...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Provisioning */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Account Provisioning</h2>
                            <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-3 py-1 rounded-full uppercase">Secure Terminal</span>
                        </div>

                        <form onSubmit={handleCreateUser} className="bg-[#121216] border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                            {formError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl">{formError}</div>}
                            {formSuccess && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase rounded-2xl">{formSuccess}</div>}

                            <div className="flex bg-black/40 p-1.5 rounded-2xl">
                                {['ROLE_SELLER', 'ROLE_GARAGE', 'ROLE_ADMIN'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, role: r as any })}
                                        className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${newUser.role === r ? (r === 'ROLE_ADMIN' ? 'bg-purple-600 shadow-lg shadow-purple-500/20' : 'bg-primary shadow-lg shadow-red-500/20') : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {r.replace('ROLE_', '')}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={newUser.firstName}
                                        onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={newUser.lastName}
                                        onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Operator Email"
                                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Secure Phone Terminal"
                                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                    value={newUser.phone}
                                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                />
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Secure Root Password"
                                            className="w-full bg-black/40 border border-white/5 p-4 pr-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm Root Password"
                                        className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={newUser.confirmPassword}
                                        onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creatingUser}
                                className="w-full bg-gradient-to-r from-red-600 to-red-800 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-600/20"
                            >
                                {creatingUser ? 'Provisioning...' : `PROVISION ${newUser.role.replace('ROLE_', '')}`} <Fingerprint size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Shared Provisioning Modal */}
            <ProductEditModal
                show={showProvisionModal}
                onClose={() => setShowProvisionModal(false)}
                product={provisioningProduct}
                onSave={handleSaveProvision}
                isSaving={isSavingProvision}
                title="listing Override"
                subtitle="Express Inventory Provisioning"
            />
        </div>
    );
};

// Internal Components
const StatCard: React.FC<{ icon: React.ReactNode, value: number | string, label: string, onClick?: () => void }> = ({ icon, value, label, onClick }) => (
    <div
        onClick={onClick}
        className="bg-gradient-to-br from-[#16161C] to-black p-8 rounded-[2rem] border border-white/5 flex flex-col items-center group hover:border-primary/30 transition-all duration-500 cursor-pointer"
    >
        <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-3xl font-black italic tracking-tighter mb-2">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</div>
    </div>
);

const OperationHubCard: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, color: string, bg: string, border: string, onClick?: () => void }> = ({ icon, title, subtitle, color, bg, border, onClick }) => (
    <div
        onClick={onClick}
        className={`flex-1 bg-gradient-to-br ${bg} ${border} border p-8 rounded-[2.5rem] group hover:scale-[1.05] transition-all duration-500 cursor-pointer`}
    >
        <div className={`${color} mb-6 group-hover:animate-pulse`}>{icon}</div>
        <h3 className="text-sm font-black italic tracking-tight mb-1 group-hover:text-white transition-colors uppercase">{title}</h3>
        <p className={`text-[10px] font-black uppercase tracking-widest opacity-80 ${color}`}>{subtitle}</p>
        <div className="mt-8 flex justify-end">
            <div className={`h-8 w-8 rounded-full bg-white/5 flex items-center justify-center ${color}`}>
                <ChevronRight size={16} />
            </div>
        </div>
    </div>
);

export default AdminDashboard;
