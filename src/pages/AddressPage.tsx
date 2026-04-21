import React, { useState, useEffect } from 'react';
import { 
    Home, Briefcase, MapPin, Navigation, 
    Plus, Trash2, CheckCircle2, ChevronLeft, 
    Loader2, ShieldCheck, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useLocation } from '../context/LocationContext';

interface UserAddress {
    id: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    tag: 'HOME' | 'OFFICE' | 'OTHER';
    isDefault: boolean;
}

const AddressPage: React.FC = () => {
    const navigate = useNavigate();
    const { detectLocation, isLoading: detectionLoading, city: detectedCity, address: detectedAddress, location: detectedCoords } = useLocation();
    
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        flatNo: '',
        floorNo: '',
        buildingName: '',
        streetAddress: '',
        landMark: '',
        city: '',
        state: '',
        pincode: '',
        tag: 'HOME' as 'HOME' | 'OFFICE' | 'OTHER',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Sync detection to form
    useEffect(() => {
        if (showAddForm && (detectedCity || detectedAddress)) {
            setFormData(prev => ({
                ...prev,
                city: detectedCity || prev.city,
                streetAddress: detectedAddress || prev.streetAddress
            }));
        }
    }, [detectedCity, detectedAddress, showAddForm]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/addresses');
            setAddresses(response.data);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
            setError('Failed to load your address book.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // CONCATENATION PROTOCOL: Combine details for legacy backend
        const fullAddress = [
            formData.flatNo && `Flat ${formData.flatNo}`,
            formData.floorNo && `Floor ${formData.floorNo}`,
            formData.buildingName && `Bldg ${formData.buildingName}`,
            formData.landMark && `Lnd: ${formData.landMark}`,
            formData.streetAddress
        ].filter(Boolean).join(', ');

        try {
            const response = await apiClient.post('/addresses', {
                ...formData,
                address: fullAddress,
                latitude: detectedCoords?.latitude,
                longitude: detectedCoords?.longitude
            });
            setAddresses([...addresses, response.data]);
            setShowAddForm(false);
            setFormData({ 
                flatNo: '', floorNo: '', buildingName: '', streetAddress: '', landMark: '',
                city: '', state: '', pincode: '', tag: 'HOME', isDefault: false 
            });
        } catch (err) {
            console.error('Save failed:', err);
            setError('Coult not save your address. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Erase this location from your protocol?')) return;
        try {
            await apiClient.delete(`/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (err) {
            setError('Deletion failed.');
        }
    };

    const setAsDefault = async (id: number) => {
        try {
            const addr = addresses.find(a => a.id === id);
            if (!addr) return;
            await apiClient.put(`/addresses/${id}`, {
                ...addr,
                isDefault: true
            });
            fetchAddresses(); // Refresh list to update defaults
        } catch (err) {
            setError('Could not update default status.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-app-bg-dark flex items-center justify-center">
            <Loader2 className="text-primary animate-spin" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-gray-100 bg-white/80 backdrop-blur-xl fixed top-0 w-full z-40">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="h-12 w-12 bg-app-bg-dark text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-app-bg-dark underline decoration-primary decoration-4 underline-offset-8">Address <span className="text-primary italic">Protocol</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Manage your global delivery endpoints</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-red-500/20"
                    >
                        {showAddForm ? 'Cancel Transmission' : 'Add New Location'} <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8 pt-48 md:pt-56 pb-20">
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-primary flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                        <MapPin size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Add Form Overlay/Section */}
                    {showAddForm && (
                        <div className="lg:col-span-2 bg-app-bg-dark rounded-[3rem] p-10 md:p-16 border border-white/5 shadow-3xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            
                            <form onSubmit={handleSave} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="md:col-span-2 flex items-center justify-between">
                                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-4">
                                        <Globe className="text-primary" /> New Logistic Endpoint
                                    </h3>
                                    <button 
                                        type="button"
                                        onClick={detectLocation}
                                        disabled={detectionLoading}
                                        className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl group hover:bg-primary transition-all"
                                    >
                                        <Navigation size={16} className={`${detectionLoading ? 'animate-spin' : 'group-hover:scale-125'} text-primary group-hover:text-white transition-all`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Auto-Pin Location</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Flat / Plot No</p>
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.flatNo}
                                            onChange={(e) => setFormData({...formData, flatNo: e.target.value})}
                                            placeholder="G-402 or Site-12"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Floor / Level</p>
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.floorNo}
                                            onChange={(e) => setFormData({...formData, floorNo: e.target.value})}
                                            placeholder="4th Floor"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Building Name / Society</p>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={formData.buildingName}
                                        onChange={(e) => setFormData({...formData, buildingName: e.target.value})}
                                        placeholder="Speedway Apartments"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Street / Detailed Area</p>
                                    <input 
                                        required
                                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={formData.streetAddress}
                                        onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                                        placeholder="Phoenix Mall Road, Lower Parel"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Landmark (Optional)</p>
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={formData.landMark}
                                        onChange={(e) => setFormData({...formData, landMark: e.target.value})}
                                        placeholder="Near HP Petrol Pump"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Tag Type (Blinkit Style)</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'HOME', icon: <Home size={16}/>, label: 'Home' },
                                            { id: 'OFFICE', icon: <Briefcase size={16}/>, label: 'Office' },
                                            { id: 'OTHER', icon: <MapPin size={16}/>, label: 'Other' }
                                        ].map(tag => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, tag: tag.id as any})}
                                                className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${formData.tag === tag.id ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                            >
                                                {tag.icon}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{tag.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">City</p>
                                        <input 
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">State</p>
                                        <input 
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pincode</p>
                                        <input 
                                            required
                                            maxLength={6}
                                            className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                                        />
                                        <div className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all ${formData.isDefault ? 'bg-primary border-primary' : 'bg-white/5 border-white/20'}`}>
                                            {formData.isDefault && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Set as Primary Logistic Hub</span>
                                    </label>
                                </div>

                                <button 
                                    type="submit"
                                    className="md:col-span-2 bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-red-500/20 disabled:opacity-50 active:scale-95"
                                    disabled={saving}
                                >
                                    {saving ? 'Transmitting Protocols...' : 'Register Endpoint'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Address List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-4 px-4">
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Total Protocols: {addresses.length}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {addresses.map(addr => (
                                <div 
                                    key={addr.id}
                                    className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex flex-col justify-between ${addr.isDefault ? 'bg-app-bg-dark border-app-bg-dark shadow-2xl shadow-black/30' : 'bg-gray-50 border-gray-100 hover:border-primary/30'}`}
                                >
                                    {addr.isDefault && (
                                        <div className="absolute top-0 right-0 bg-primary text-white px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest">
                                            Primary Hub
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white shadow-xl shadow-red-500/20' : 'bg-white shadow-sm text-primary'}`}>
                                                {addr.tag === 'HOME' ? <Home size={22} /> : addr.tag === 'OFFICE' ? <Briefcase size={22} /> : <MapPin size={22} />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-black italic uppercase tracking-tighter ${addr.isDefault ? 'text-white' : 'text-app-bg-dark'}`}>{addr.tag} Configuration</h4>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{addr.city}</p>
                                            </div>
                                        </div>

                                        <p className={`text-xs font-medium leading-relaxed ${addr.isDefault ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {addr.address}, {addr.pincode}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-current opacity-10 flex items-center justify-between">
                                        {!addr.isDefault && (
                                            <button 
                                                onClick={() => setAsDefault(addr.id)}
                                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                                            >
                                                Make Primary
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(addr.id)}
                                            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${addr.isDefault ? 'bg-white/5 text-gray-400 hover:bg-primary hover:text-white' : 'bg-white text-gray-400 hover:bg-red-500 hover:text-white'}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {addresses.length === 0 && !showAddForm && (
                                <div className="col-span-full py-20 text-center space-y-6 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                                     <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <Globe size={32} />
                                     </div>
                                     <div className="space-y-2">
                                        <h3 className="text-xl font-black italic uppercase text-app-bg-dark tracking-tight">No Active Protocols</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[200px] mx-auto">Click 'Add New Location' to configure your first delivery hub</p>
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-20 flex items-center gap-6 p-8 bg-app-bg-dark rounded-[2rem] border border-white/5 lg:w-max mx-auto shadow-2xl shadow-black/20">
                    <ShieldCheck size={28} className="text-primary shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Logistic Security</p>
                        <p className="text-[11px] text-gray-500 mt-1 font-medium italic">"All saved coordinates are encrypted and utilized only for precision part delivery routing."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressPage;
