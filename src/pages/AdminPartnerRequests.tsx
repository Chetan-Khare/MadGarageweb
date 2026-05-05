import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Search, Clock, CheckCircle, RefreshCw, Phone, Mail,
    Building2, User, MapPin, X, Send, MoreVertical, ShieldCheck, 
    Trash2, MessageSquare, AlertCircle, Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const AdminPartnerRequests: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [totalPartners, setTotalPartners] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Notes Modal State
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [currentNotes, setCurrentNotes] = useState('');

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiClient.get('/admin/partner-requests');
            setRequests(res.data.requests);
            setTotalPartners(res.data.totalActivePartners);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, endpoint: string) => {
        setUpdatingId(id);
        setError('');
        setSuccessMessage('');
        try {
            const res = await apiClient.put(`/admin/partner-requests/${id}/${endpoint}`);
            setSuccessMessage(res.data);
            await fetchRequests();
        } catch (err: any) {
            setError(err.response?.data || 'Operation failed.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApprove = async (id: number) => {
        if (!window.confirm('Are you sure you want to APPROVE this partner? This will automatically create a user account.')) return;
        setUpdatingId(id);
        setError('');
        setSuccessMessage('');
        try {
            const res = await apiClient.post(`/admin/partner-requests/${id}/approve`);
            setSuccessMessage(res.data);
            await fetchRequests();
        } catch (err: any) {
            setError(err.response?.data || 'Approval failed.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('Are you sure you want to REJECT this application?')) return;
        setUpdatingId(id);
        try {
            await apiClient.delete(`/admin/partner-requests/${id}`);
            setSuccessMessage('Application rejected.');
            await fetchRequests();
        } catch (err: any) {
            setError(err.response?.data || 'Rejection failed.');
        } finally {
            setUpdatingId(null);
        }
    };

    const openNotesModal = (req: any) => {
        setSelectedRequest(req);
        setCurrentNotes(req.internalNotes || '');
        setNotesModalOpen(true);
    };

    const saveNotes = async () => {
        if (!selectedRequest) return;
        try {
            await apiClient.put(`/admin/partner-requests/${selectedRequest.id}/notes`, { notes: currentNotes });
            setSuccessMessage('Notes updated.');
            setNotesModalOpen(false);
            await fetchRequests();
        } catch (err) {
            alert('Failed to save notes.');
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        pending: requests.filter(r => r.status === 'PENDING').length,
        contacted: requests.filter(r => r.status === 'CONTACTED').length,
        approved: requests.filter(r => r.status === 'APPROVED').length
    };

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(role === 'ROLE_WORKER' ? '/worker' : '/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Partner <span className="text-primary italic">Audits</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Merchant & Garage Onboarding</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or business..."
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
                            <option value="ALL">All Applications</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONTACTED">In Audit</option>
                            <option value="APPROVED">Onboarded</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-12 pt-48 md:pt-56 max-w-7xl mx-auto space-y-10 pb-20">
                {/* Success/Error Toasts */}
                {successMessage && (
                    <div className="bg-green-500/10 border-2 border-green-500/20 p-6 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <CheckCircle className="text-green-500" size={24} />
                            <p className="text-sm font-bold text-green-500">{successMessage}</p>
                        </div>
                        <button onClick={() => setSuccessMessage('')} className="text-green-500/50 hover:text-green-500"><X size={18} /></button>
                    </div>
                )}
                {error && (
                    <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-3xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <AlertCircle className="text-primary" size={24} />
                            <p className="text-sm font-bold text-primary">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="text-primary/50 hover:text-primary"><X size={18} /></button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MiniStat label="New Requests" val={stats.pending} color="text-orange-500" icon={<Clock size={16} />} />
                    <MiniStat label="Under Audit" val={stats.contacted} color="text-blue-500" icon={<RefreshCw size={16} />} />
                    <MiniStat label="Partnerships" val={totalPartners} color="text-green-500" icon={<ShieldCheck size={16} />} />
                </div>

                {/* Table */}
                <div className="bg-[#121216] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/5">
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Business Identity</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Location</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Type & Audit</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-gray-500 uppercase font-black text-xs tracking-widest italic animate-pulse">Syncing Merchant Records...</td>
                                    </tr>
                                ) : filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${req.role === 'ROLE_SELLER' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                    {req.role === 'ROLE_SELLER' ? <Building2 size={20} /> : <Wrench size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white italic uppercase">{req.businessName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1"><User size={10} className="text-primary" /> {req.contactName}</p>
                                                    <div className="flex gap-4 mt-2">
                                                        <a href={`mailto:${req.email}`} className="text-[9px] font-black text-gray-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter"><Mail size={10} /> {req.email}</a>
                                                        <a href={`tel:${req.phone}`} className="text-[9px] font-black text-gray-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter"><Phone size={10} /> {req.phone}</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2"><MapPin size={10} className="text-primary" /> {req.city}, {req.state}</p>
                                                <p className="text-[9px] text-gray-500 font-medium italic line-clamp-1">{req.address}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${
                                                        req.status === 'PENDING' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                                                        req.status === 'CONTACTED' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' :
                                                        req.status === 'APPROVED' ? 'text-green-500 border-green-500/20 bg-green-500/5' :
                                                        'text-red-500 border-red-500/20 bg-red-500/5'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                    {req.internalNotes && (
                                                        <span className="text-gray-500" title={req.internalNotes}><MessageSquare size={12} /></span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Received: {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openNotesModal(req)}
                                                    className="h-9 w-9 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                                    title="Audit Notes"
                                                ><MoreVertical size={16} /></button>
                                                
                                                {req.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(req.id, 'status')}
                                                        className="h-9 px-4 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                                                    ><Phone size={12} /> Mark Contacted</button>
                                                )}

                                                {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                                                    <>
                                                        <button 
                                                            disabled={updatingId === req.id}
                                                            onClick={() => handleApprove(req.id)}
                                                            className="h-9 px-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center gap-2"
                                                        ><ShieldCheck size={12} /> Approve</button>
                                                        <button 
                                                            disabled={updatingId === req.id}
                                                            onClick={() => handleReject(req.id)}
                                                            className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                                            title="Reject"
                                                        ><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Notes Modal */}
            {notesModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setNotesModalOpen(false)} />
                    <div className="bg-[#121216] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-white">Audit <span className="text-primary">Notes</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{selectedRequest?.businessName}</p>
                            </div>
                            <button onClick={() => setNotesModalOpen(false)} className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:text-primary transition-all"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <textarea 
                                autoFocus
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm font-medium outline-none focus:border-primary transition-all min-h-[200px] text-gray-300"
                                placeholder="Enter details from contact call, verification notes..."
                                value={currentNotes}
                                onChange={e => setCurrentNotes(e.target.value)}
                            />
                            <button 
                                onClick={saveNotes}
                                className="w-full mt-8 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                            >
                                Save Audit Log <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MiniStat: React.FC<{ label: string, val: number, color: string, icon: React.ReactNode }> = ({ label, val, color, icon }) => (
    <div className="bg-[#121216] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/10 transition-all">
        <div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">{label}</p>
            <p className={`text-4xl font-black italic tracking-tighter ${color}`}>{val}</p>
        </div>
        <div className={`h-14 w-14 rounded-3xl bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
    </div>
);

export default AdminPartnerRequests;
