import React, { useState, useEffect } from 'react';
import { 
    Settings, Save, RefreshCcw, 
    Truck, Package, ShieldCheck, 
    AlertCircle, CheckCircle, ChevronLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface SystemSetting {
    id: number;
    configKey: string;
    configValue: string;
    description: string;
}

const AdminSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            setMessage({ type: 'error', text: 'Failed to establish connection to configuration server.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        setSaving(key);
        setMessage(null);
        try {
            await apiClient.put('/admin/settings', { key, value });
            setMessage({ type: 'success', text: `Parameter ${key} synchronized successfully.` });
            fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to update ${key}.` });
        } finally {
            setSaving(null);
        }
    };

    const getIcon = (key: string) => {
        if (key.includes('SHIPPING')) return <Truck size={20} />;
        if (key.includes('THRESHOLD')) return <Package size={20} />;
        return <Settings size={20} />;
    };

    if (loading) return (
        <div className="min-h-screen bg-app-bg-dark flex items-center justify-center p-8">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#08080C] text-white font-inter">
            <div className="p-8 md:p-12 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/admin')} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-primary transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">System <span className="text-primary italic">Configuration</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Mad Garage Global Override</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-8 py-12 space-y-12">
                {message && (
                    <div className={`p-6 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {settings.map((setting) => (
                        <div key={setting.id} className="bg-[#121216] border border-white/5 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 group hover:border-primary/20 transition-all duration-500">
                            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                {getIcon(setting.configKey)}
                            </div>

                            <div className="flex-1 space-y-2 text-center md:text-left">
                                <h3 className="text-sm font-black italic uppercase tracking-tighter text-white">{setting.configKey.replace(/_/g, ' ')}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{setting.description}</p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-48">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black italic">₹</span>
                                    <input 
                                        type="number"
                                        defaultValue={setting.configValue}
                                        id={`input-${setting.configKey}`}
                                        className="w-full bg-black/40 border border-white/5 pl-8 pr-4 py-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        const val = (document.getElementById(`input-${setting.configKey}`) as HTMLInputElement).value;
                                        handleUpdate(setting.configKey, val);
                                    }}
                                    disabled={saving === setting.configKey}
                                    className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                                >
                                    {saving === setting.configKey ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex items-start gap-6">
                    <div className="h-12 w-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-3">Protocol Note</p>
                        <p className="text-xs text-gray-400 font-medium italic leading-relaxed">
                            "System-wide configuration changes propagate instantly to all active terminals (Mobile and Web). Use caution when modifying logistics pricing during live market sessions."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
