import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Camera, CheckCircle, ChevronLeft, 
  Trash2, Truck, Activity,
  Info, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import imageCompression from 'browser-image-compression';

const PART_CATEGORIES = ['Engine', 'Brakes', 'Suspension', 'Exhaust', 'Electrical', 'Exterior', 'Interior', 'others'];

const AddProductPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editProduct = location.state?.autoEdit;

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        partName: '',
        brand: 'MAD GARAGE',
        sku: `MG-${Math.floor(Math.random() * 10000)}`,
        category: 'Engine',
        price: '',
        stockQuantity: '10',
        description: '',
        fitmentCategory: 'ENGINE',
        condition: 'NEW',
        color: 'Black',
        isUniversal: false
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Vehicle Selection State
    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<string[]>([]);
    const [fuels, setFuels] = useState<string[]>([]);
    const [trims, setTrims] = useState<string[]>([]);
    const [engines, setEngines] = useState<string[]>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<any[]>([]);

    const [vehicle, setVehicle] = useState({
        make: '',
        model: '',
        year: '',
        fuel: '',
        trim: '',
        engine: ''
    });

    useEffect(() => {
        if (editProduct) {
            setFormData({
                partName: editProduct.partName || editProduct.name || '',
                brand: editProduct.brand || 'MAD GARAGE',
                sku: editProduct.sku || '',
                category: editProduct.category || 'Engine',
                price: editProduct.price ? String(editProduct.price) : '',
                stockQuantity: String(editProduct.stockQuantity || editProduct.stock || '0'),
                description: editProduct.description || '',
                fitmentCategory: editProduct.fitmentCategory || 'ENGINE',
                condition: editProduct.condition || 'NEW',
                color: editProduct.color || 'Black',
                isUniversal: editProduct.fitmentCategory === 'UNIVERSAL'
            });

            if (editProduct.imageUrl) {
                const fullUrl = editProduct.imageUrl.startsWith('http') ? editProduct.imageUrl : `${BASE_SERVER_URL}${editProduct.imageUrl}`;
                setImagePreviews([fullUrl]);
            }

            if (editProduct.fittedVehicles) {
                setSelectedVehicles(editProduct.fittedVehicles);
            }
        }
    }, [editProduct]);

    useEffect(() => {
        apiClient.get('/vehicles/makes').then(res => setMakes(res.data));
    }, []);

    useEffect(() => {
        if (vehicle.make) {
            apiClient.get(`/vehicles/models?make=${vehicle.make}`).then(res => {
                setModels(res.data);
                setVehicle(v => ({...v, model: '', year: '', fuel: '', trim: '', engine: ''}));
            });
        }
    }, [vehicle.make]);

    useEffect(() => {
        if (vehicle.make && vehicle.model) {
            apiClient.get(`/vehicles/years?make=${vehicle.make}&model=${vehicle.model}`).then(res => {
                setYears(res.data.map((y: any) => y.toString()));
                setVehicle(v => ({...v, year: '', fuel: '', trim: '', engine: ''}));
            });
        }
    }, [vehicle.model]);

    useEffect(() => {
        if (vehicle.make && vehicle.model && vehicle.year) {
            apiClient.get(`/vehicles/fuels?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}`).then(res => {
                setFuels(res.data);
                setVehicle(v => ({...v, fuel: '', trim: '', engine: ''}));
            });
        }
    }, [vehicle.year]);

    useEffect(() => {
        if (vehicle.make && vehicle.model && vehicle.year && vehicle.fuel) {
            apiClient.get(`/vehicles/trims?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&fuel=${vehicle.fuel}`).then(res => {
                setTrims(res.data);
                setVehicle(v => ({...v, trim: '', engine: ''}));
            });
        }
    }, [vehicle.fuel]);

    useEffect(() => {
        if (vehicle.make && vehicle.model && vehicle.year && vehicle.fuel && vehicle.trim) {
            apiClient.get(`/vehicles/engines?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&fuel=${vehicle.fuel}&trim=${vehicle.trim}`).then(res => {
                setEngines(res.data);
                setVehicle(v => ({...v, engine: ''}));
            });
        }
    }, [vehicle.trim]);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageFiles.length > 5) {
            setError('Max 5 images allowed');
            return;
        }

        // COMPRESSION OPTIONS
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true
        };

        for (const file of files) {
            try {
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                    setImageFiles(prev => [...prev, compressedFile as File]);
                };
                reader.readAsDataURL(compressedFile);
            } catch (err) {
                console.error("Compression failed", err);
            }
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddFitment = async () => {
        if (!vehicle.engine) {
            setError('Please complete the vehicle specification before adding.');
            return;
        }

        try {
            const res = await apiClient.get(`/vehicles/search?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&fuel=${vehicle.fuel}&trim=${vehicle.trim}&engine=${vehicle.engine}`);
            if (res.data && res.data.length > 0) {
                // We add the first match (or all if user expects bulk, but usually search returns exact)
                const newVehicles = res.data.filter((v: any) => !selectedVehicles.some(sv => sv.id === v.id));
                if (newVehicles.length === 0) {
                    setError('This vehicle is already in the compatibility list.');
                    return;
                }
                setSelectedVehicles(prev => [...prev, ...newVehicles]);
                setSuccess(`Added ${vehicle.make} ${vehicle.model} to fitment list.`);
                // Reset dropdowns for next car (keep make/model for convenience maybe? no, clear for clarity)
                setVehicle({ make: '', model: '', year: '', fuel: '', trim: '', engine: '' });
                setTimeout(() => setSuccess(''), 2000);
            } else {
                setError('No matching vehicle found in database.');
            }
        } catch (err) {
            setError('Failed to verify vehicle compatibility.');
        }
    };

    const removeFitment = (id: number) => {
        setSelectedVehicles(prev => prev.filter(v => v.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setUploading(true);

        try {
            let vehicleIds: number[] = [];
            if (!formData.isUniversal) {
                if (selectedVehicles.length === 0 && !vehicle.engine) {
                    setError('Please add at least one compatible vehicle or mark as Universal.');
                    setUploading(false);
                    return;
                }
                
                // Collect IDs from selected list
                vehicleIds = selectedVehicles.map(v => v.id);

                // Check if there's a pending selection not yet added
                if (vehicle.engine) {
                     const res = await apiClient.get(`/vehicles/search?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}&fuel=${vehicle.fuel}&trim=${vehicle.trim}&engine=${vehicle.engine}`);
                     const ids = res.data.map((v: any) => v.id);
                     vehicleIds = [...new Set([...vehicleIds, ...ids])];
                }
            }

            // Convert images to base64
            const base64Images = await Promise.all(imageFiles.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(file);
                });
            }));

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stockQuantity: parseInt(formData.stockQuantity),
                fitmentCategory: formData.isUniversal ? 'UNIVERSAL' : formData.fitmentCategory,
                vehicleIds,
                base64Images
            };

            if (editProduct?.id) {
                await apiClient.put(`/seller/inventory/${editProduct.id}/base64`, payload);
                setSuccess('Product successfully updated!');
            } else {
                await apiClient.post('/seller/inventory/base64', payload);
                setSuccess('Product successfully listed!');
            }
            setTimeout(() => navigate(-1), 1500);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to list product.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all border border-white/5">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                                {editProduct ? 'Edit' : 'New'} <span className="text-primary">Market Listing</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mt-1">Inventory Provisioning Terminal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 text-green-500">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Official Merchant</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Section */}
                    <div className="bg-[#121216] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-6 flex items-center gap-2">
                             Visual Assets <div className="h-px w-8 bg-primary/30" />
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="relative aspect-square group">
                                    <img src={src} className="w-full h-full object-cover rounded-2xl border border-white/10 shadow-lg" alt="Preview" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-2 right-2 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                    >
                                        <PlusCircle size={16} className="rotate-45" />
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.length < 5 && (
                                <label className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-white/10 transition-all group">
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageSelect} />
                                    <Camera size={32} className="text-gray-600 group-hover:text-primary transition-colors" />
                                    <span className="text-[9px] font-black uppercase text-gray-600 mt-2 tracking-widest group-hover:text-white">Add Photo</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-[#121216] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Product Identity</label>
                                <input 
                                    required
                                    placeholder="Part Name (e.g. Forged Pistons)"
                                    className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                    value={formData.partName}
                                    onChange={e => setFormData({...formData, partName: e.target.value})}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        placeholder="Manufacturer"
                                        className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={formData.brand}
                                        onChange={e => setFormData({...formData, brand: e.target.value})}
                                    />
                                    <input 
                                        placeholder="SKU Code"
                                        className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                        value={formData.sku}
                                        onChange={e => setFormData({...formData, sku: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Market Data</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                        <input 
                                            required
                                            type="number"
                                            placeholder="Price"
                                            className="w-full bg-black/40 border border-white/5 p-5 pl-10 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            required
                                            type="number"
                                            placeholder="Stock Qty"
                                            className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all disabled:opacity-50"
                                            value={formData.stockQuantity}
                                            onChange={e => setFormData({...formData, stockQuantity: e.target.value})}
                                            disabled={['USED', 'REFURBISHED'].includes(formData.condition)}
                                        />
                                        {['USED', 'REFURBISHED'].includes(formData.condition) && <p className="text-[8px] font-black uppercase text-orange-500 mt-2 ml-2 tracking-widest leading-tight">Locked to 1 unit</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary appearance-none transition-all"
                                        value={formData.condition}
                                        onChange={e => {
                                            const isUnique = ['USED', 'REFURBISHED'].includes(e.target.value);
                                            setFormData({
                                                ...formData, 
                                                condition: e.target.value,
                                                stockQuantity: isUnique ? '1' : formData.stockQuantity
                                            });
                                        }}
                                    >
                                        <option value="NEW">New</option>
                                        <option value="REFURBISHED">Refurbished</option>
                                        <option value="USED">Used</option>
                                    </select>
                                    <select 
                                        className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary appearance-none transition-all"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Specifications</label>
                            <textarea 
                                placeholder="Neural blueprint and technical specifications..."
                                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all h-32"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Fitment Matrix */}
                    <div className="bg-[#121216] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Truck size={120} />
                        </div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2">
                                Fitment Matrix <div className="h-px w-8 bg-primary/30" />
                            </h2>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, isUniversal: false})}
                                    className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${!formData.isUniversal ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Specific
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, isUniversal: true})}
                                    className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${formData.isUniversal ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Universal
                                </button>
                            </div>
                        </div>

                        {!formData.isUniversal ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Make</label>
                                        <select className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white" value={vehicle.make} onChange={e => setVehicle({...vehicle, make: e.target.value})}>
                                            <option value="">Select Make</option>
                                            {makes.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Model</label>
                                        <select disabled={!vehicle.make} className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" value={vehicle.model} onChange={e => setVehicle({...vehicle, model: e.target.value})}>
                                            <option value="">Select Model</option>
                                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Year</label>
                                        <select disabled={!vehicle.model} className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" value={vehicle.year} onChange={e => setVehicle({...vehicle, year: e.target.value})}>
                                            <option value="">Select Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Fuel</label>
                                        <select disabled={!vehicle.year} className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" value={vehicle.fuel} onChange={e => setVehicle({...vehicle, fuel: e.target.value})}>
                                            <option value="">Select Fuel</option>
                                            {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Trim</label>
                                        <select disabled={!vehicle.fuel} className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" value={vehicle.trim} onChange={e => setVehicle({...vehicle, trim: e.target.value})}>
                                            <option value="">Select Trim</option>
                                            {trims.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-gray-600 ml-1">Engine</label>
                                        <select disabled={!vehicle.trim} className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-xs font-bold text-white disabled:opacity-30" value={vehicle.engine} onChange={e => setVehicle({...vehicle, engine: e.target.value})}>
                                            <option value="">Select Engine</option>
                                            {engines.map(en => <option key={en} value={en}>{en}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleAddFitment}
                                    className="w-full py-4 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-primary"
                                >
                                    <PlusCircle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add to Compatibility List</span>
                                </button>

                                {selectedVehicles.length > 0 && (
                                    <div className="pt-4 space-y-3">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-1 tracking-widest">Confirmed Compatible Vehicles ({selectedVehicles.length})</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedVehicles.map(v => (
                                                <div key={v.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl">
                                                    <div>
                                                        <p className="text-xs font-bold text-white italic">{v.carModel.make.name} {v.carModel.name}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{v.year} | {v.engineType}</p>
                                                    </div>
                                                    <button type="button" onClick={() => removeFitment(v.id)} className="h-8 w-8 text-gray-500 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <Activity className="text-primary animate-pulse" size={48} />
                                <div>
                                    <p className="text-sm font-black italic tracking-wide">Global Compatibility Enabled</p>
                                    <p className="text-[10px] uppercase text-gray-500 tracking-[0.2em] mt-2">This part will be visible across all vehicle catalogs</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-4">
                            <Info size={20} />
                            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center gap-4">
                            <CheckCircle size={20} />
                            <p className="text-xs font-black uppercase tracking-widest">{success}</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-red-600/30 group"
                    >
                        {uploading ? (
                            <div className="flex items-center gap-3">
                                <Loader2Icon className="animate-spin" /> {editProduct ? 'SYNCING CHANGES...' : 'PROVISIONING...'}
                            </div>
                        ) : (
                            <>{editProduct ? 'SAVE CATALOG UPDATES' : 'PUBLISH TO GLOBAL MARKET'} <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} /></>
                        )}
                    </button>
                    <p className="text-[9px] font-black text-center uppercase text-gray-600 tracking-[0.5em] pb-12">Mad Garage Forge Protocol // Authorization Approved</p>
                </form>
            </div>
        </div>
    );
};

const Loader2Icon = ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default AddProductPage;
