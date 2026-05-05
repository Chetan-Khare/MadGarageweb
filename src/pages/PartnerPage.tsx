import React, { useState } from 'react';
import { Store, Wrench, Globe, ShieldCheck, Send, CheckCircle, Building2, MapPin, Sparkles } from 'lucide-react';
import apiClient from '../services/apiClient';

const PartnerPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    role: 'ROLE_SELLER',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/public/partner-requests', formData);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || 'Failed to submit application. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-32 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white max-w-2xl mx-auto p-12 md:p-20 rounded-[3rem] shadow-2xl border border-gray-100">
          <div className="h-24 w-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-3 group-hover:rotate-0 transition-transform">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-6">Application Received!</h2>
          <p className="text-lg text-gray-500 font-medium mb-12 max-w-md mx-auto leading-relaxed">
            Our network auditing team has been notified. We will review your business profile and contact you at <span className="text-app-bg-dark font-black">{formData.email}</span> within 48 hours for further information.
          </p>
          <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Next Steps</p>
            <p className="text-xs font-bold text-gray-600 mt-2">Keep your business registration documents ready for the verification call.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-12 bg-app-bg-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg-light min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-app-bg-dark py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Global Expansion 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase mb-6 leading-none">
                Join the <span className="text-primary italic">Elite</span> Network
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                Empower your automotive business with MAD GARAGE. Whether you're a high-performance parts seller or a precision installation garage, we have the platform you need.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-12 pb-32 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Benefits Column */}
          <div className="lg:w-5/12 space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {[
                    { icon: Store, title: 'Global Reach', desc: 'Sell your inventory to thousands of performance enthusiasts across the nation.', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { icon: ShieldCheck, title: 'Verified Status', desc: 'Get the "Mad Garage Verified" badge and build instant trust with premium customers.', color: 'text-green-500', bg: 'bg-green-50' },
                    { icon: Globe, title: 'Supply Chain', desc: 'Garages get exclusive access to bulk pricing and hard-to-find global spares.', color: 'text-purple-500', bg: 'bg-purple-50' },
                    { icon: Wrench, title: 'Network Leads', desc: 'Local garages receive direct installation bookings from our marketplace users.', color: 'text-orange-500', bg: 'bg-orange-50' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 flex gap-6 group hover:border-primary/20 transition-all">
                        <div className={`h-16 w-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <item.icon size={28} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase italic text-app-bg-dark mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 
            <div className="bg-app-bg-dark p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black italic text-white uppercase mb-4 tracking-tighter">Ready to scale?</h3>
                    <p className="text-gray-400 text-sm font-medium mb-8">Join <span className="text-white font-black">1,200+</span> businesses already growing with our ecosystem.</p>
                    <div className="flex items-center gap-4 text-primary font-black text-xs uppercase tracking-widest">
                        <span>Partner Program</span>
                        <ArrowRight size={16} />
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            </div>
            */}
          </div>

          {/* Form Column */}
          <div className="lg:w-7/12 w-full">
            <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-8">
                    <div>
                        <h3 className="text-3xl font-black uppercase italic text-app-bg-dark">Partnership Application</h3>
                        <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Enterprise Provisioning Portal</p>
                    </div>
                    <Building2 size={40} className="text-gray-200" />
                </div>
                
                <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && <div className="p-4 bg-red-50 text-primary text-xs font-bold rounded-xl border border-primary/10 animate-shake">{error}</div>}
                    
                    {/* Role Selection */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-4 ml-2 tracking-[0.2em]">Select Business Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_SELLER'})}
                                className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.role === 'ROLE_SELLER' ? 'border-primary bg-red-50/50 shadow-lg shadow-red-500/10' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <Store size={24} className={formData.role === 'ROLE_SELLER' ? 'text-primary' : 'text-gray-400'} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'ROLE_SELLER' ? 'text-primary' : 'text-gray-500'}`}>Spare Parts Seller</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'ROLE_GARAGE'})}
                                className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.role === 'ROLE_GARAGE' ? 'border-primary bg-red-50/50 shadow-lg shadow-red-500/10' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <Wrench size={24} className={formData.role === 'ROLE_GARAGE' ? 'text-primary' : 'text-gray-400'} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.role === 'ROLE_GARAGE' ? 'text-primary' : 'text-gray-500'}`}>Certified Garage</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Business Name</label>
                            <input 
                                required
                                type="text"
                                className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="e.g. Apex Performance Spares"
                                value={formData.businessName}
                                onChange={e => setFormData({...formData, businessName: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Authorized Contact Person</label>
                            <input 
                                required
                                type="text"
                                className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="Full Name"
                                value={formData.contactName}
                                onChange={e => setFormData({...formData, contactName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Business Email</label>
                            <input 
                                required
                                type="email"
                                className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Contact Phone (WhatsApp preferred)</label>
                            <input 
                                required
                                type="tel"
                                pattern="\d{10}"
                                className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="10-digit mobile number"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="pt-8 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin size={16} className="text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-app-bg-dark">Business Location</h4>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Full Address (Street, Building)</label>
                                <input 
                                    required
                                    type="text"
                                    className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                    placeholder="Registered office or shop address"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">City</label>
                                    <input 
                                        required
                                        type="text"
                                        className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                        placeholder="Mumbai"
                                        value={formData.city}
                                        onChange={e => setFormData({...formData, city: e.target.value})}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">State</label>
                                    <input 
                                        required
                                        type="text"
                                        className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                        placeholder="Maharashtra"
                                        value={formData.state}
                                        onChange={e => setFormData({...formData, state: e.target.value})}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black uppercase text-gray-500 mb-3 ml-2 tracking-widest">Pincode</label>
                                    <input 
                                        required
                                        type="text"
                                        className="bg-gray-50/50 border border-gray-200 p-5 rounded-[1.2rem] text-sm font-bold text-app-bg-dark outline-none focus:border-primary transition-all placeholder:text-gray-400"
                                        placeholder="400001"
                                        value={formData.pincode}
                                        onChange={e => setFormData({...formData, pincode: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-2xl shadow-red-500/30 group active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Submit Application</span>
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                        By submitting, you agree to Mad Garage's Merchant Terms of Service.<br />All applications are subject to mandatory audit and background checks.
                    </p>
                </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA Section */}
      <div className="bg-white border-t border-gray-100 py-20 text-center">
          <div className="container mx-auto px-4">
              <h2 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-4">Still have questions?</h2>
              <p className="text-gray-500 font-medium mb-10">Our business development team is here to help you onboard.</p>
              <div className="flex flex-wrap justify-center gap-6">
                  <a href="mailto:partners@madgarage.com" className="flex items-center gap-3 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 font-bold text-sm hover:border-primary/20 transition-all">
                      partners@madgarage.com
                  </a>
                  <a href="tel:+919876543210" className="flex items-center gap-3 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 font-bold text-sm hover:border-primary/20 transition-all">
                      +91 98765 43210
                  </a>
              </div>
          </div>
      </div>
    </div>
  );
};

export default PartnerPage;
