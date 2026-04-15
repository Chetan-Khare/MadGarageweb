import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, UserCheck, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const CompleteProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    // Extract registration token from navigation state
    const { registrationToken, phone } = location.state || {};
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!registrationToken) {
        return (
            <div className="min-h-screen bg-[#08080C] flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <ShieldAlert size={64} className="text-primary mx-auto" />
                    <h1 className="text-2xl font-black italic uppercase text-white">Invalid Session</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Registration context expired or missing.</p>
                    <Link to="/login" className="inline-block bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all">Back to Login</Link>
                </div>
            </div>
        );
    }

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/auth/complete-registration', {
                registrationToken,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });

            // Handshake login on success
            const data = response.data;
            if (data?.token) {
                login(data, data.token);
                // Redirect based on role (always ROLE_CUSTOMER for this flow currently)
                navigate('/customer-dashboard');
            } else {
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.response?.data || 'Profile completion failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-inter bg-[#08080C] overflow-hidden">
            {/* Left Decor: Performance Focus */}
            <div className="hidden lg:flex w-1/3 bg-black relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-black z-10" />
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                </div>
                
                <div className="relative z-10">
                    <Link to="/" className="text-3xl font-black italic tracking-tighter text-white">MAD GARAGE</Link>
                    <h2 className="text-5xl font-black italic tracking-tighter text-white mt-20 uppercase leading-none">
                        Welcome to <br/>
                        <span className="text-primary italic">The Network.</span>
                    </h2>
                    <p className="mt-6 text-gray-400 font-medium max-w-xs text-sm">
                        Complete your identity profile to unlock full dashboard access, performance tracking, and order history.
                    </p>
                </div>

                <div className="relative z-10">
                   <div className="flex items-center gap-4 text-xs font-black uppercase text-gray-500 tracking-[0.3em] font-black italic">
                       <span className="h-[1px] w-8 bg-primary"></span>
                       ESTABLISHING OPERATOR ID
                   </div>
                </div>
            </div>

            {/* Right: Registration Form */}
            <div className="w-full lg:w-2/3 flex items-center justify-center p-8 md:p-16 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <div className="text-[20rem] font-black italic text-white absolute -top-40 -right-40 leading-none">IDENTITY</div>
                </div>

                <div className="w-full max-w-xl relative z-10">
                    <div className="bg-[#121216] border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-2xl">
                        <div className="mb-12">
                            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">
                                Complete <span className="text-primary">Profile</span>
                            </h1>
                            <p className="text-gray-500 font-medium">Finalizing account setup for <span className="text-white font-bold">{phone}</span></p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-primary border border-primary/20 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mb-8">
                                <ShieldAlert size={18} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleCompleteProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput 
                                    label="First Name" 
                                    icon={<User size={18} />} 
                                    placeholder="Dominic" 
                                    value={formData.firstName}
                                    onChange={(v: string) => setFormData({...formData, firstName: v})}
                                />
                                <FormInput 
                                    label="Last Name" 
                                    icon={<User size={18} />} 
                                    placeholder="Toretto" 
                                    value={formData.lastName}
                                    onChange={(v: string) => setFormData({...formData, lastName: v})}
                                />
                            </div>

                            <FormInput 
                                label="Enterprise Email" 
                                icon={<Mail size={18} />} 
                                placeholder="operator@madgarage.com"
                                type="email"
                                value={formData.email}
                                onChange={(v: string) => setFormData({...formData, email: v})}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 block">Set Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            required
                                            type={showPassword ? "text" : "password"} 
                                            className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 block">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            required
                                            type={showPassword ? "text" : "password"} 
                                            className="w-full bg-white/5 border border-white/10 p-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-500/20 mt-10"
                            >
                                {loading ? 'Initializing Access...' : 'Finalize Registration'} <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon, placeholder, value, onChange, type = "text" }: any) => (
    <div className="flex flex-col group">
        <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                {icon}
            </div>
            <input 
                required
                type={type}
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary transition-all"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default CompleteProfilePage;
