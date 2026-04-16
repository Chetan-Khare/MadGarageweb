import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Mail, Phone, 
  ArrowLeft, Shield, RefreshCw,
  UserPlus, RotateCcw, Fingerprint, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const AdminUserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
    
    // Edit Modal State
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: '' });
    
    // Provision Modal State
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'ROLE_SELLER' });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (id: number) => {
        if (!window.confirm('PERMANENTLY DELETE ACCOUNT: This will scramble core identity records and disable all platform access. Are you sure?')) return;
        setActionLoading(true);
        try {
            await apiClient.delete(`/admin/users/${id}`);
            fetchUsers();
            alert('Account successfully purged from active network. Identity scrambled for security.');
        } catch (err: any) {
            alert(err.response?.data || 'Deactivation failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRestore = async (id: number) => {
        setActionLoading(true);
        try {
            await apiClient.post(`/admin/users/${id}/restore`);
            fetchUsers();
            alert('RECOVERY SUCCESSFUL: Identity records unscrambled and operator access restored.');
        } catch (err: any) {
            alert(err.response?.data || 'Restoration failed. Ensure email/phone is not claimed by another active user.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!provisionForm.firstName || !provisionForm.lastName || !provisionForm.email || !provisionForm.password) {
            setFormError('Identity fundamentals (Name/Email/Pass) are required.');
            return;
        }

        setActionLoading(true);
        try {
            // Remove insecure fallback password123. Use empty string or fail.
            // Backend now has @NotBlank validation.
            const payload = {
                ...provisionForm,
                password: provisionForm.password
            };
            await apiClient.post('/admin/users', payload);
            setShowProvisionModal(false);
            setProvisionForm({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'ROLE_SELLER' });
            fetchUsers();
        } catch (err: any) {
            setFormError(err.response?.data?.message || err.response?.data || 'Provisioning failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setEditForm({ 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, 
            phone: user.phone || '', 
            role: user.role 
        });
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        // Security Guard: Role escalation confirmation
        if (editForm.role === 'ROLE_ADMIN' && editingUser.role !== 'ROLE_ADMIN') {
            if (!window.confirm('SECURITY WARNING: You are elevating this user to ADMINISTRATOR status. This provides unrestricted access to the entire platform. Proceed?')) {
                return;
            }
        }

        setActionLoading(true);
        try {
            await apiClient.put(`/admin/users/${editingUser.id}`, editForm);
            setEditingUser(null);
            fetchUsers();
            alert('User identity record revised successfully.');
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || 'Revision failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = ((u.firstName || '') + ' ' + (u.lastName || '') + (u.email || '') + (u.phone || '')).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = activeTab === 'ACTIVE' ? u.active !== false : u.active === false;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Control Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">User <span className="text-primary italic">Governance</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Network Operator Oversight</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setShowProvisionModal(true)}
                            className="h-12 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            <UserPlus size={18} />
                            Provision
                        </button>
                        <div className="h-12 bg-white/5 border border-white/10 p-1 rounded-2xl flex">
                            <button 
                                onClick={() => setActiveTab('ACTIVE')}
                                className={`px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Active
                            </button>
                            <button 
                                onClick={() => setActiveTab('ARCHIVED')}
                                className={`px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ARCHIVED' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Archived
                            </button>
                        </div>
                        <div className="relative flex-1 md:w-64">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search identity..." 
                                className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-app-bg-dark border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none md:w-32 text-center"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">Roles</option>
                            <option value="ROLE_ADMIN">Admins</option>
                            <option value="ROLE_SELLER">Sellers</option>
                            <option value="ROLE_GARAGE">Garages</option>
                            <option value="ROLE_CUSTOMER">Customers</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-48 md:pt-56 max-w-7xl mx-auto space-y-10 pb-20">
                {/* User Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && users.length === 0 ? (
                        Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-[#121216] rounded-[2rem] animate-pulse border border-white/5" />)
                    ) : filteredUsers.map(user => (
                        <div key={user.id} className="bg-[#121216] border border-white/5 p-8 rounded-[2rem] space-y-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${
                                    user.role === 'ROLE_ADMIN' ? 'text-purple-500 border-purple-500/20 bg-purple-500/5' :
                                    user.role === 'ROLE_SELLER' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                                    'text-green-500 border-green-500/20 bg-green-500/5'
                                }`}>
                                    {user.role?.replace('ROLE_', '')}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Users size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{user.firstName} {user.lastName}</h3>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1 italic">Operator #{user.id}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Mail size={14} className="text-primary" />
                                    <span className="text-xs font-bold truncate lowercase">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Phone size={14} className="text-primary" />
                                    <span className="text-xs font-bold">{user.phone || 'NO DATA'}</span>
                                </div>
                            </div>

                             <div className="flex gap-2 pt-2">
                                {activeTab === 'ACTIVE' ? (
                                    <>
                                        <button 
                                            onClick={() => handleSuspend(user.id)}
                                            disabled={actionLoading || user.role === 'ROLE_ADMIN'}
                                            className="flex-1 bg-red-500/10 py-3 rounded-xl text-[9px] font-black uppercase text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                                        >
                                            Delete Account
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(user)}
                                            className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all"
                                        >
                                            <RefreshCw size={16}/>
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleRestore(user.id)}
                                        disabled={actionLoading}
                                        className="w-full bg-primary py-3 rounded-xl text-[9px] font-black uppercase text-white hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={14} />
                                        Restore Account
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && !loading && (
                    <div className="py-40 text-center">
                        <Shield size={48} className="mx-auto text-gray-800 mb-6" />
                        <h3 className="text-lg font-black italic uppercase text-gray-500">No matching records found</h3>
                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mt-2">Check identifying criteria or role filters</p>
                    </div>
                )}
            </div>

            {/* Edit Modal - Restricted to Email/Phone only */}
            {editingUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#121216] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Identity <span className="text-primary">Revision</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2 italic">Updating Operator #{editingUser.id}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 opacity-50">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-500 ml-2">First Name (Static)</label>
                                    <input 
                                        readOnly
                                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none cursor-not-allowed"
                                        value={editForm.firstName}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Last Name (Static)</label>
                                    <input 
                                        readOnly
                                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none cursor-not-allowed"
                                        value={editForm.lastName}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Contact Email</label>
                                <input 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                    placeholder="operator@madgarage.com"
                                    value={editForm.email}
                                    onChange={e => setEditForm({...editForm, email: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Phone Terminal</label>
                                <input 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                    placeholder="+91..."
                                    value={editForm.phone}
                                    onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Assigned Role</label>
                                <select 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                    value={editForm.role}
                                    onChange={e => setEditForm({...editForm, role: e.target.value})}
                                >
                                    <option value="ROLE_CUSTOMER">CUSTOMER</option>
                                    <option value="ROLE_SELLER">SELLER</option>
                                    <option value="ROLE_GARAGE">GARAGE</option>
                                    <option value="ROLE_ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="p-4 bg-primary/5 border border-white/5 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest text-center">Passwords cannot be modified by administrators.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="flex-1 bg-white/5 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateUser}
                                disabled={actionLoading}
                                className="flex-1 bg-primary py-4 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-red-700 transition-all shadow-lg shadow-primary/20"
                            >
                                {actionLoading ? 'Updating...' : 'Save Revisions'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Provision Modal */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <form onSubmit={handleProvision} className="bg-[#121216] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">Account <span className="text-primary">Provisioning</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2 italic">Register New Network Operator</p>
                        </div>

                        {formError && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl">{formError}</div>}

                        <div className="flex bg-black/40 p-1.5 rounded-2xl">
                            {['ROLE_SELLER', 'ROLE_GARAGE', 'ROLE_ADMIN'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setProvisionForm({ ...provisionForm, role: r })}
                                    className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${provisionForm.role === r ? 'bg-primary shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {r.replace('ROLE_', '')}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                    placeholder="First Name"
                                    value={provisionForm.firstName}
                                    onChange={e => setProvisionForm({...provisionForm, firstName: e.target.value})}
                                />
                                <input 
                                    className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                    placeholder="Last Name"
                                    value={provisionForm.lastName}
                                    onChange={e => setProvisionForm({...provisionForm, lastName: e.target.value})}
                                />
                            </div>
                            <input 
                                className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                placeholder="Core Email Address"
                                value={provisionForm.email}
                                onChange={e => setProvisionForm({...provisionForm, email: e.target.value})}
                            />
                            <input 
                                className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                placeholder="Phone Terminal"
                                value={provisionForm.phone}
                                onChange={e => setProvisionForm({...provisionForm, phone: e.target.value})}
                            />
                             <div className="relative">
                                 <input 
                                     type={showPassword ? "text" : "password"}
                                     className="bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold w-full outline-none focus:border-primary transition-all"
                                     placeholder="Root Password (Required)"
                                     value={provisionForm.password}
                                     onChange={e => setProvisionForm({...provisionForm, password: e.target.value})}
                                 />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowProvisionModal(false)}
                                className="flex-1 bg-white/5 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                            >
                                Abort
                            </button>
                            <button 
                                type="submit"
                                disabled={actionLoading}
                                className="flex-1 bg-primary py-4 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-red-700 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                            >
                                {actionLoading ? 'Initializing...' : 'Provision Operator'} <Fingerprint size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
