import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      // Mocking successful registration
      login({ id: '2', name: formData.name, email: formData.email }, 'mock-jwt-token');
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex font-inter overflow-hidden">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden text-2xl font-black italic tracking-tighter text-primary mb-8 block">MAD GARAGE</Link>
          <h1 className="text-4xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-2">Create Account</h1>
          <p className="text-gray-500 font-medium mb-10">Join the performance network and start your build.</p>

          {error && (
            <div className="bg-red-50 text-primary p-4 rounded-xl text-sm font-bold flex items-center gap-3 mb-6 border border-primary/10">
               {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            required
                            type="password" 
                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">Confirm</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            required
                            type="password" 
                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <button 
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                >
                Create Account <ArrowRight size={18} />
                </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Already have an account? <Link to="/login" className="text-primary font-black hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Decorative Section (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-app-bg-dark relative flex-col justify-end p-12">
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-black/90 z-10" />
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center scale-110 hover:scale-100 transition-transform duration-1000" />
        </div>
        
        <div className="relative z-20">
            <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/50">
                <ShieldCheck size={24} className="text-white" />
            </div>
            <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">
                Elite Member <br/>Benefits.
            </h3>
            <ul className="text-gray-300 space-y-3 font-bold uppercase tracking-widest text-[10px]">
                <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 bg-primary rounded-full"></span> Priority Sourcing for Hard-to-Find Parts</li>
                <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 bg-primary rounded-full"></span> Real-time Order Tracking & Custom Quoting</li>
                <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 bg-primary rounded-full"></span> Exclusive Access to Performance Community</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
