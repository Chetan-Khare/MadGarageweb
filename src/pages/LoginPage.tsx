import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert, Phone, Hash, ChevronLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const LoginPage: React.FC = () => {
  const [authTab, setAuthTab] = useState<'CUSTOMER' | 'STAFF'>('CUSTOMER');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired')) {
        setError('Your session has expired. Please sign in again for security.');
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/send-otp', { phone });
      setShowOtpInput(true);
      setResendTimer(30);
    } catch (err: any) {
      if (err.response?.status === 429) {
          const waitTime = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfterSeconds || '900', 10);
          setResendTimer(waitTime);
          setError(`Rate Limit Exceeded: Please wait ${Math.ceil(waitTime / 60)} minutes.`);
      } else {
          setError(err.response?.data?.error || err.response?.data || 'Failed to send OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
        setError('Please enter the 6-digit code.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/verify-otp', { phone, otp });
      const data = response.data;

      if (data?.requiresRegistration) {
          navigate('/complete-profile', { 
              state: { 
                  registrationToken: data.registrationToken,
                  phone: phone 
              } 
          });
      } else {
          handleLoginSuccess(data);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
          const waitTime = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfterSeconds || '900', 10);
          setError(`Brute-force protection: Please wait ${Math.ceil(waitTime / 60)} minutes.`);
          setResendTimer(waitTime);
      } else {
          setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Email and Password are required.');
        return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { 
          email: email.trim().toLowerCase(), 
          password: password.trim() 
      });
      handleLoginSuccess(response.data);
    } catch (err: any) {
      if (err.response?.status === 429) {
          const waitTime = parseInt(err.response.headers['retry-after'] || err.response.data?.retryAfterSeconds || '900', 10);
          setError(`Authorization Lockout: Too many failures. Wait ${Math.ceil(waitTime / 60)} minutes.`);
      } else {
          setError(err.response?.data?.message || 'Authorization failed. Check your keys.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (data: any) => {
    if (data?.token) {
        login(data, data.token);
        
        // Handle post-login redirection
        const from = (location.state as any)?.from?.pathname || (location.state as any)?.from || null;
        if (from) {
            navigate(from, { replace: true });
            return;
        }

        // Dynamic Role-Based Redirection (Standardized)
        const rawRole = (data.role || 'CUSTOMER').toUpperCase();
        const role = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole}`;

        if (role === 'ROLE_ADMIN') {
            navigate('/admin');
        } else if (role === 'ROLE_SELLER') {
            navigate('/seller');
        } else if (role === 'ROLE_GARAGE') {
            navigate('/'); // Redirect Garage to Marketplace
        } else {
            navigate('/'); // Standard customers go to Home
        }
    } else {
        setError('Authentication failed. No secure token received.');
    }
  };

  return (
    <div className="min-h-screen flex font-inter overflow-hidden">
      {/* Left Side: Dark Automotive Imagery (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-app-bg-dark relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-black/80 z-10" />
           <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-white">MAD GARAGE</Link>
          <h2 className="text-6xl font-black italic tracking-tighter text-white mt-20 uppercase leading-none">
            {authTab === 'CUSTOMER' ? 'Unlock Your' : 'Fleet Control'} <br/>
            <span className="text-primary italic">{authTab === 'CUSTOMER' ? 'Performance.' : 'Authorized Only.'}</span>
          </h2>
        </div>

        <div className="relative z-10">
           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs tracking-[0.5em]">Global Sourcing • Precision Fitment • Speed</p>
        </div>
      </div>

      {/* Right Side: Auth Forms */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden text-2xl font-black italic tracking-tighter text-primary mb-8 block">MAD GARAGE</Link>
          
          {/* Dual Tab Switch */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-10 border border-gray-100">
            <button 
              onClick={() => {setAuthTab('CUSTOMER'); setError(''); setShowOtpInput(false);}}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authTab === 'CUSTOMER' ? 'bg-white text-app-bg-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => {setAuthTab('STAFF'); setError('');}}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authTab === 'STAFF' ? 'bg-white text-app-bg-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Staff Portal
            </button>
          </div>

          <h1 className="text-4xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-2">
            {authTab === 'CUSTOMER' ? 'Secure Login' : 'Admin Access'}
          </h1>
          <p className="text-gray-500 font-medium mb-10">
            {authTab === 'CUSTOMER' 
              ? 'Enter your phone number to receive a secure access code.' 
              : 'Enter your enterprise credentials to manage operations.'}
          </p>

          {error && (
            <div className="bg-red-50 text-primary border border-primary/20 p-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-6">
              <ShieldAlert size={18} /> {error}
            </div>
          )}

          {authTab === 'CUSTOMER' ? (
            !showOtpInput ? (
                <form className="space-y-6" onSubmit={handleSendOtp}>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                required
                                type="tel" 
                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                    >
                        {loading ? 'Sending...' : 'Send Access Code'} <ArrowRight size={18} />
                    </button>
                </form>
            ) : (
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-3 px-2">
                            <label className="text-[10px] font-black uppercase text-gray-400">6-Digit Code</label>
                            <button 
                                type="button" 
                                onClick={() => setShowOtpInput(false)}
                                className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                            >
                                <ChevronLeft size={10} /> Change Number
                            </button>
                        </div>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input 
                                required
                                autoFocus
                                type="text" 
                                maxLength={6}
                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none tracking-[1em] focus:border-primary transition-all"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                    >
                        {loading ? 'Verifying...' : 'Verify & Sign In'} <ShieldCheck size={18} />
                    </button>
                    <div className="text-center">
                        <button 
                            type="button"
                            disabled={resendTimer > 0}
                            onClick={handleSendOtp}
                            className={`text-[10px] font-black uppercase tracking-widest ${resendTimer > 0 ? 'text-gray-300' : 'text-primary hover:underline'}`}
                        >
                            {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code Now'}
                        </button>
                    </div>
                </form>
            )
          ) : (
            <form className="space-y-6" onSubmit={handleStaffLogin}>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Enterprise Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            required
                            type="email" 
                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all"
                            placeholder="staff@madgarage.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Secret Key</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            required
                            type={showPassword ? "text" : "password"} 
                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-app-bg-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10"
                >
                    {loading ? 'Authorizing...' : 'Authorize Session'} <ArrowRight size={18} />
                </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
