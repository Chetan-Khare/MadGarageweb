import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, 
  ArrowLeft, Car, Save, X, 
  CheckCircle2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const AdminVehicleManagement: React.FC = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal/Editor State
    const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/vehicles');
            setVehicles(res.data);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            // Fallback for demo
            setVehicles([
                { id: 1, make: 'Tata', model: 'Nexon', year: '2024', fuel: 'ELECTRIC', trim: 'XZ+', engineSize: '127PS' },
                { id: 2, make: 'Mahindra', model: 'Thar', year: '2023', fuel: 'DIESEL', trim: 'LX', engineSize: '2.2L mHawk' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true); setError(''); setSuccess('');
        try {
            if (editingVehicle.id) {
                await apiClient.put(`/vehicles/${editingVehicle.id}`, editingVehicle);
                setSuccess('Vehicle updated successfully!');
            } else {
                const res = await apiClient.post('/vehicles', editingVehicle);
                setVehicles([...vehicles, res.data]);
                setSuccess('New vehicle record established.');
            }
            setTimeout(() => { setShowModal(false); fetchVehicles(); }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction failed. Check root logs.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to purge this vehicle record?')) return;
        try {
            await apiClient.delete(`/vehicles/${id}`);
            setVehicles(vehicles.filter(v => v.id !== id));
        } catch (err) {
            alert('Purge failed. Constraint violation?');
        }
    };

    const openEdit = (vehicle: any = { make: '', model: '', year: (new Date().getFullYear()).toString(), fuel: 'PETROL', trim: '', engineSize: '' }) => {
        setEditingVehicle(vehicle);
        setShowModal(true);
        setError(''); setSuccess('');
    };

    const filteredVehicles = vehicles.filter(v => 
        v.make?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            {/* Control Header */}
            <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 fixed top-0 w-full z-40 bg-[#08080C]/80 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(role === 'ROLE_WORKER' ? '/worker' : '/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Vehicle <span className="text-primary italic">Database</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Inventory & Fitment Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => openEdit()}
                        className="bg-primary text-white h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                    >
                        <Plus size={18} /> Add New
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="p-8 md:p-12 pt-40 md:pt-48 max-w-7xl mx-auto space-y-6 pb-20">
                <div className="bg-[#121216] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-white/5">
                                <tr>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Identify</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Model & Spec</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Fuel/Engine</th>
                                    <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-4">Syncing Archive...</p>
                                        </td>
                                    </tr>
                                ) : filteredVehicles.map((v) => (
                                    <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-app-bg-dark rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Car size={20} /></div>
                                                <div>
                                                    <p className="font-black text-white uppercase italic">{v.make}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{v.year}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-sm text-gray-300">{v.model}</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-tighter">{v.trim}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-xs text-gray-400">{v.fuel}</p>
                                            <p className="text-[10px] font-black text-gray-600 uppercase italic">{v.engineSize}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-3">
                                                <button onClick={() => openEdit(v)} className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={16}/></button>
                                                <button onClick={() => handleDelete(v.id)} className="h-9 w-9 bg-white/5 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex items-center justify-between px-6 text-[10px] font-black uppercase text-gray-600 tracking-widest">
                    <span>{filteredVehicles.length} Vehicles cataloged</span>
                    <button onClick={fetchVehicles} className="flex items-center gap-2 hover:text-white transition-colors"><RefreshCcw size={12}/> Refresh Sync</button>
                </div>
            </div>

            {/* Edit Modal / Slide-over */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <form onSubmit={handleSave} className="relative bg-[#121216] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">{editingVehicle.id ? 'Edit' : 'Provision'} <span className="text-primary italic">Record</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Secure Meta-Data Entry</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:text-primary transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-10 space-y-8">
                             {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl flex items-center gap-3"><AlertCircle size={14}/> {error}</div>}
                             {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase rounded-2xl flex items-center gap-3"><CheckCircle2 size={14}/> {success}</div>}

                             <div className="grid grid-cols-2 gap-6">
                                <FormGroup label="Manufacturer" value={editingVehicle.make} onChange={v => setEditingVehicle({...editingVehicle, make: v})} placeholder="e.g. Maruti Suzuki" />
                                <FormGroup label="Vehicle Model" value={editingVehicle.model} onChange={v => setEditingVehicle({...editingVehicle, model: v})} placeholder="e.g. Swift" />
                             </div>
                             <div className="grid grid-cols-3 gap-6">
                                <FormGroup label="Year" value={editingVehicle.year} onChange={v => setEditingVehicle({...editingVehicle, year: v})} placeholder="2024" />
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">Fuel Protocol</label>
                                    <select 
                                        className="bg-black/40 border border-white/10 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                        value={editingVehicle.fuel}
                                        onChange={e => setEditingVehicle({...editingVehicle, fuel: e.target.value})}
                                    >
                                        {['PETROL', 'DIESEL', 'ELECTRIC', 'CNG', 'HYBRID'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <FormGroup label="Engine / Spec" value={editingVehicle.engineSize} onChange={v => setEditingVehicle({...editingVehicle, engineSize: v})} placeholder="1.2L VVT" />
                             </div>
                             <FormGroup label="Trim Configuration" value={editingVehicle.trim} onChange={v => setEditingVehicle({...editingVehicle, trim: v})} placeholder="VXi(O) / ZXi+ Dark Edition" />
                        </div>

                        <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
                             <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white/5 hover:bg-white/10 transition-all"
                             >
                                Terminate
                             </button>
                             <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                             >
                                {isSaving ? 'Processing...' : 'Commit Changes'} <Save size={18} />
                             </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const FormGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div className="flex flex-col">
        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">{label}</label>
        <input 
            required
            type="text" 
            className="bg-black/40 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

export default AdminVehicleManagement;
