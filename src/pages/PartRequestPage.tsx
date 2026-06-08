import React, { useState } from 'react';
import { Send, Car, Wrench, MessageSquare, CheckCircle } from 'lucide-react';
import apiClient from '../services/apiClient';

const PartRequestPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    partName: '',
    description: '',
    customerName: '',
    customerPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/requests', {
          make: formData.make.trim(),
          model: formData.model.trim(),
          year: formData.year ? parseInt(formData.year) : null,
          partName: formData.partName.trim(),
          description: formData.description.trim(),
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="bg-white max-w-md mx-auto p-12 rounded-3xl shadow-2xl border border-gray-100">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-4">Request Sent!</h2>
          <p className="text-gray-500 font-medium mb-10">Our sourcing experts will contact you within 24 hours with availability and pricing.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-app-bg-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all"
          >
            Send Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg-light min-h-[80vh] py-20">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Help Content */}
        <div className="lg:w-1/2">
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-app-bg-dark uppercase mb-8">
                Can't find the <span className="text-primary">right part?</span>
            </h1>
            <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed">
                Whether it's a rare refurbishment part for a vintage build or a cutting-edge performance mod, our sourcing team will track it down globally for you.
            </p>

            <div className="space-y-8">
                <div className="flex gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-primary shrink-0"><Car size={24} /></div>
                    <div>
                        <h4 className="font-black uppercase italic text-app-bg-dark">OEM & Aftermarket</h4>
                        <p className="text-sm text-gray-500 font-medium">Access to over 500+ premium brands and verified scrap yards.</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-primary shrink-0"><Wrench size={24} /></div>
                    <div>
                        <h4 className="font-black uppercase italic text-app-bg-dark">Condition Guaranteed</h4>
                        <p className="text-sm text-gray-500 font-medium">All refurbished requests go through a 25-point quality check.</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-primary shrink-0"><MessageSquare size={24} /></div>
                    <div>
                        <h4 className="font-black uppercase italic text-app-bg-dark">Expert Consultation</h4>
                        <p className="text-sm text-gray-500 font-medium">Not sure about fitment? Our mechanics will guide you.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Request Form */}
        <div className="lg:w-1/2 w-full">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-gray-100">
                <h3 className="text-2xl font-black uppercase italic text-app-bg-dark mb-10 border-b border-gray-100 pb-6">New Part Request</h3>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="p-4 bg-red-50 text-primary text-xs font-bold rounded-xl border border-primary/10">{error}</div>}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Make *</label>
                            <input 
                                required
                                type="text"
                                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                placeholder="e.g. Tata"
                                value={formData.make}
                                onChange={e => setFormData({...formData, make: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Model *</label>
                            <input 
                                required
                                type="text"
                                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                placeholder="e.g. Nexon"
                                value={formData.model}
                                onChange={e => setFormData({...formData, model: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col col-span-2 md:col-span-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Year</label>
                            <input 
                                type="number"
                                min="1980" max="2030"
                                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                placeholder="e.g. 2024"
                                value={formData.year}
                                onChange={e => setFormData({...formData, year: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Part Name *</label>
                        <input 
                            required
                            type="text"
                            className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                            placeholder="e.g. Front Brake Pads"
                            value={formData.partName}
                            onChange={e => setFormData({...formData, partName: e.target.value})}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Detailed Description</label>
                        <textarea 
                            required
                            rows={4}
                            className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all resize-none"
                            placeholder="Please provide any specific part numbers or condition requirements..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Your Name *</label>
                            <input 
                                required
                                type="text"
                                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                placeholder="Full Name"
                                value={formData.customerName}
                                onChange={e => setFormData({...formData, customerName: e.target.value})}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2">Phone Number *</label>
                            <input 
                                required
                                type="tel"
                                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold outline-none focus:border-primary transition-all"
                                placeholder="+91 98765 43210"
                                value={formData.customerPhone}
                                onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'} <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PartRequestPage;
