import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
const PrivacyPolicyPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "Privacy Policy | Mad Garage";
  }, []);

  return (
    <div className="min-h-screen bg-app-bg-light pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 shadow-2xl shadow-red-500/10">
            <Shield size={40} />
          </div>
          <h1 className="text-5xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-4">
            Privacy <span className="text-primary italic">Policy</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            LAST UPDATED: MAY 6, 2026 • VERSION 1.0
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="p-8 md:p-16 space-y-12 text-app-bg-dark">
            
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Information We Collect</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                At MAD GARAGE, we prioritize the security of your automotive data. To provide precision fitment and AI-driven recommendations, we collect:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary" />
                  <span className="text-xs font-bold">Vehicle Build Specifications</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary" />
                  <span className="text-xs font-bold">Precise Location (Geo-fencing)</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary" />
                  <span className="text-xs font-bold">Transaction History</span>
                </li>
                <li className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary" />
                  <span className="text-xs font-bold">AI Chat Interactions</span>
                </li>
              </ul>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Lock size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Data Security Protocol</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our infrastructure is hardened with enterprise-grade encryption. Every transmission is secured via TLS 1.3, and personal identifiers are purged from our AI training models to ensure absolute anonymity.
              </p>
              <div className="p-6 bg-app-bg-dark rounded-[2rem] border border-primary/20 flex items-center gap-6 group hover:border-primary transition-all">
                <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest">End-to-End Encryption</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Your garage telemetry is private.</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <FileText size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Third-Party Partners</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We only share limited telemetry with verified sellers and logistics partners when necessary to fulfill your precision fitment requests or logistics. No data is ever sold for marketing purposes.
              </p>
            </section>

          </div>
          
          <div className="bg-gray-50 p-12 text-center border-t border-gray-100">
             <p className="text-sm text-gray-400 font-bold mb-6 italic uppercase tracking-tighter">
               Questions regarding our data sovereignty?
             </p>
             <button 
               onClick={() => window.location.href = 'mailto:support@madgarage.com'}
               className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-primary transition-all shadow-xl shadow-red-500/10 active:scale-95"
             >
               Contact Security Desk
             </button>
          </div>
        </div>

        {/* Bottom Notice */}
        <p className="mt-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-50">
          MAD GARAGE PERFORMANCE INC. • SECURE DATA INITIATIVE
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
