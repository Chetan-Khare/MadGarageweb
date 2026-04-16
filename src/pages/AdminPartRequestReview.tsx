import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Search,
    Clock, CheckCircle, RefreshCw, Phone, Mail,
    Car, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const AdminPartRequestReview: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [syncError, setSyncError] = useState('');

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setSyncError('');
        try {
            const res = await apiClient.get('/admin/requests');
            setRequests(res.data);
        } catch (err: any) {
            let errorMsg = err.response?.data || err.message || 'Unknown Sourcing Pipeline Sync Failure';
            if (typeof errorMsg === 'object') {
                errorMsg = errorMsg.message || JSON.stringify(errorMsg);
            }
            setSyncError(errorMsg);
            console.error('Sourcing Sync Failure:', errorMsg);
            // Non-destructive fallback for graceful UI degradation
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        setUpdatingId(id);
        try {
            await apiClient.put(`/admin/requests/${id}/status?status=${newStatus}`);
            // Update local state for immediate feedback
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert('Status update failed. Check backend connectivity.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        inProgress: requests.filter(r => r.status === 'IN_PROGRESS' || r.status === 'ORDERED').length,
        completed: requests.filter(r => r.status === 'COMPLETED').length
    };

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Part <span className="text-primary italic">Requests</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Sourcing Pipeline Monitor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parts or clients..."
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
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-48 md:pt-56 max-w-7xl mx-auto space-y-10 pb-20">
                {/* Error Banner */}
                {syncError && (
                    <div className="bg-primary/10 border-2 border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-pulse shadow-2xl shadow-primary/5">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <AlertCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">System <span className="text-primary italic">Synchronisation Failure</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1">{syncError}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchRequests}
                            className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border border-white/10 transition-all"
                        >
                            Retry Sync
                        </button>
                    </div>
                )}

                {/* Micro Stats */}
                <div className="grid grid-cols-3 gap-6">
                    <MiniStat label="Awaiting Review" val={stats.pending} color="text-orange-500" icon={<Clock size={14} />} />
                    <MiniStat label="In Sourcing" val={stats.inProgress} color="text-blue-500" icon={<RefreshCw size={14} />} />
                    <MiniStat label="Fulfilled" val={stats.completed} color="text-green-500" icon={<CheckCircle size={14} />} />
                </div>

                {/* Table Layout */}
                <div className="bg-[#121216] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/5">
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Client Identity</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Part & Vehicle</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Description</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Pipeline Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-4">Establishing Secure Link...</p>
                                        </td>
                                    </tr>
                                ) : filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-all group">
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-black text-white italic uppercase">{req.customerName}</p>
                                                <div className="flex items-center gap-2 text-gray-500 text-[9px] font-bold uppercase tracking-widest">
                                                    <Phone size={10} className="text-primary" /> {req.customerPhone}
                                                </div>
                                                {req.customerEmail && <div className="flex items-center gap-2 text-gray-500 text-[9px] font-bold uppercase tracking-widest lowercase italic">
                                                    <Mail size={10} className="text-blue-500" /> {req.customerEmail}
                                                </div>}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <p className="text-primary font-black uppercase italic tracking-tighter leading-none">{req.partName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Car size={10} /> {req.year} {req.make} {req.model}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-[11px] font-medium text-gray-400 line-clamp-2 italic leading-relaxed">"{req.description}"</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${req.status === 'PENDING' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                                        req.status === 'COMPLETED' ? 'text-green-500 border-green-500/20 bg-green-500/5' :
                                                            'text-blue-500 border-blue-500/20 bg-blue-500/5'
                                                    }`}>
                                                    {req.status}
                                                </span>

                                                <div className="flex gap-2">
                                                    <button
                                                        disabled={updatingId === req.id}
                                                        onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}
                                                        className="h-8 w-8 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                        title="Sourcing"
                                                    ><RefreshCw size={14} className={updatingId === req.id ? 'animate-spin' : ''} /></button>
                                                    <button
                                                        disabled={updatingId === req.id}
                                                        onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                                                        className="h-8 w-8 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                                        title="Resolve"
                                                    ><CheckCircle2 size={14} /></button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MiniStat: React.FC<{ label: string, val: number, color: string, icon: React.ReactNode }> = ({ label, val, color, icon }) => (
    <div className="bg-[#121216] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:border-white/10 transition-all">
        <div>
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-1">{label}</p>
            <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{val}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </div>
);

export default AdminPartRequestReview;
