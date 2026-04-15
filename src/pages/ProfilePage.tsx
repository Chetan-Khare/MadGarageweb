import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, 
  ShieldCheck, ChevronLeft, Save, 
  Eye, EyeOff, AlertCircle, CheckCircle2,
  Camera, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user: authUser, login } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/users/me');
            if (response.data) {
                const [fName, ...lNameParts] = (response.data.name || '').split(' ');
                setFormData(prev => ({
                    ...prev,
                    firstName: response.data.firstName || fName || '',
                    lastName: response.data.lastName || lNameParts.join(' ') || '',
                    email: response.data.email || '',
                    phone: response.data.phone || ''
                }));
                setProfileImageUrl(response.data.profileImageUrl || null);
                
                // SYNC WITH AUTH CONTEXT for headers
                if (authUser && response.data.profileImageUrl) {
                    login({ ...authUser, profileImageUrl: response.data.profileImageUrl }, localStorage.getItem('token') || '');
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Could not establish secure link to profile data.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('System Error: File type must be an image.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Content = (reader.result as string).split(',')[1];
                const extension = file.name.split('.').pop() || 'jpg';

                const response = await apiClient.post('/users/profile-image/base64', {
                    base64Image: base64Content,
                    extension: extension
                });

                if (response.data) {
                    const newImageUrl = response.data;
                    setProfileImageUrl(newImageUrl);
                    
                    // Update AuthContext to sync header immediately
                    if (authUser) {
                        login({ ...authUser, profileImageUrl: newImageUrl }, localStorage.getItem('token') || '');
                    }
                    
                    setSuccess('Profile image updated successfully.');
                    setTimeout(() => setSuccess(''), 3000);
                }
            };
        } catch (err: any) {
            console.error('Image upload failed:', err);
            setError('Transmission error: Could not upload profile image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Only validate if user is attempting to change password
        if (formData.password.trim() && formData.password.trim() !== formData.confirmPassword.trim()) {
            setError('Security breach: Passwords do not match.');
            return;
        }

        setSaving(true);
        try {
            const response = await apiClient.put('/users/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password.trim() || null
            });

            if (response.data?.token) {
                login(response.data, response.data.token);
            }

            setSuccess('Profile re-calibrated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.response?.data?.message || 'Transmission error. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-app-bg-dark flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.5em]">Establishing Secure Link...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-app-bg-light font-inter py-12 px-4 md:py-20 lg:px-0 scroll-smooth">
            <div className="container mx-auto max-w-4xl">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all mb-12 md:mb-16 group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Profile Summary Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-app-bg-dark rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-black/20 border border-white/5">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16" />
                             
                             <div className="relative z-10 space-y-6">
                                <div className="relative group mx-auto w-32 h-32">
                                    <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl group-hover:bg-primary/40 transition-all duration-500" />
                                    <div className="relative h-32 w-32 bg-white/5 border-2 border-primary/30 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-primary/60 transition-all duration-300">
                                        {uploading ? (
                                            <Loader2 size={32} className="text-primary animate-spin" />
                                        ) : profileImageUrl ? (
                                            <img src={`${BASE_SERVER_URL}${profileImageUrl}`} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-black text-primary italic">
                                                {formData.firstName?.[0]}{formData.lastName?.[0] || 'G'}
                                            </span>
                                        )}
                                        
                                        {/* Camera Overlay */}
                                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera size={24} className="text-white" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>
                                
                                <div>
                                    <h2 className="text-xl font-black italic text-white uppercase tracking-tight">{formData.firstName} {formData.lastName}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 italic">{authUser?.role?.split('_')[1] || 'MEMBER'}</p>
                                </div>
                             </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-black/5 space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-4">Workshop Stats</h4>
                            <div className="space-y-4">
                                <StatItem label="Profile Status" value="Verified" color="text-green-500" />
                                <StatItem label="Security Level" value="High" color="text-blue-500" />
                                <StatItem label="Encryption" value="Active" color="text-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Main Form Content */}
                    <div className="md:col-span-2 space-y-8">
                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Identity Section */}
                            <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-2xl space-y-12">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic text-app-bg-dark uppercase tracking-tighter flex items-center gap-3">
                                        <User size={24} className="text-primary" /> Identity Configuration
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-9">Manage your personal workshop credentials</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField 
                                            label="First Name" 
                                            value={formData.firstName} 
                                            onChange={(v) => setFormData({...formData, firstName: v})} 
                                            placeholder="John"
                                        />
                                        <InputField 
                                            label="Last Name" 
                                            value={formData.lastName} 
                                            onChange={(v) => setFormData({...formData, lastName: v})} 
                                            placeholder="Doe"
                                        />
                                    </div>

                                    <InputField 
                                        label="Email Address" 
                                        value={formData.email} 
                                        onChange={(v) => setFormData({...formData, email: v})}
                                        icon={<Mail size={16} />}
                                    />

                                    <InputField 
                                        label="Contact Number" 
                                        value={formData.phone} 
                                        onChange={(v) => setFormData({...formData, phone: v.replace(/[^0-9]/g, '')})} 
                                        placeholder="9876543210"
                                        icon={<Phone size={16} />}
                                    />
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-2xl space-y-12">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black italic text-app-bg-dark uppercase tracking-tighter flex items-center gap-3">
                                        <ShieldCheck size={24} className="text-primary" /> Security Protocol
                                    </h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-9">Update your access key (Leave blank to keep current)</p>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">New Password</p>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    className="w-full bg-gray-50 border border-transparent p-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:bg-white focus:border-primary transition-all"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Confirm Access</p>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                                    className="w-full bg-gray-50 border border-transparent p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none border-gray-100 focus:bg-white focus:border-primary transition-all"
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notifications */}
                            {error && (
                                <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-3xl text-primary animate-in fade-in slide-in-from-top-4 duration-300">
                                    <AlertCircle size={20} />
                                    <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-100 rounded-3xl text-green-600 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <CheckCircle2 size={20} />
                                    <p className="text-xs font-black uppercase tracking-widest">{success}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-app-bg-dark text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {saving ? (
                                    <>Transmitting Data...</>
                                ) : (
                                    <>Save Configuration <Save size={20} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, placeholder?: string, onChange?: (v: string) => void, readOnly?: boolean, icon?: React.ReactNode }> = ({ label, value, placeholder, onChange, readOnly, icon }) => (
    <div className="space-y-4">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                readOnly={readOnly}
                className={`w-full border p-4 rounded-2xl text-sm font-bold text-app-bg-dark outline-none transition-all ${icon ? 'pl-12' : 'pl-6'} ${readOnly ? 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-transparent focus:bg-white focus:border-primary'}`}
                placeholder={placeholder}
            />
        </div>
    </div>
);

const StatItem: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{value}</span>
    </div>
);

export default ProfilePage;
