import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Mail, Phone, 
  ChevronRight, ArrowLeft, Shield, MoreVertical,
  UserCheck, UserX, Star, Trash2, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const AdminUserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            // Fallback for demo
            setUsers([
                { id: 1, firstName: 'Chetan', lastName: 'Khare', email: 'admin@madgarage.com', phone: '9876543210', role: 'ROLE_ADMIN', createdAt: '2024-01-15' },
                { id: 2, firstName: 'Brembo', lastName: 'Seller', email: 'sales@brembo.in', phone: '8888888888', role: 'ROLE_SELLER', createdAt: '2024-02-10' },
                { id: 3, firstName: 'Speed', lastName: 'Garage', email: 'contact@speed.in', phone: '7777777777', role: 'ROLE_GARAGE', createdAt: '2024-03-01' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName + u.email + u.phone).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
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
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search identity records..." 
                                className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="bg-app-bg-dark border border-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none md:w-40 text-center"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option value="ALL">All Roles</option>
                            <option value="ROLE_ADMIN">Admins</option>
                            <option value="ROLE_SELLER">Sellers</option>
                            <option value="ROLE_GARAGE">Garages</option>
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
                                    {user.role.replace('ROLE_', '')}
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
                                    <span className="text-xs font-bold">{user.phone}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="flex-1 bg-white/5 py-3 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:bg-primary hover:text-white transition-all">Suspend</button>
                                <button className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all"><MoreVertical size={16}/></button>
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
        </div>
    );
};

export default AdminUserManagement;
