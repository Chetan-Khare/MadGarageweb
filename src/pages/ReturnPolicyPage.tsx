import React from 'react';
import { RefreshCw, ShieldAlert, Truck, CheckCircle2, ChevronRight } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "Return & Refund Policy | Mad Garage";
  }, []);

  return (
    <div className="min-h-screen bg-app-bg-light pt-20 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-8 shadow-2xl shadow-red-500/10">
            <RefreshCw size={40} className="animate-spin-slow" />
          </div>
          <h1 className="text-5xl font-black italic text-app-bg-dark uppercase tracking-tighter mb-4">
            Return & <span className="text-primary italic">Refund Policy</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            LAST UPDATED: MAY 20, 2026 • VERSION 1.1
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="p-8 md:p-16 space-y-12 text-app-bg-dark">
            
            {/* General Overview */}
            <section className="space-y-4">
              <p className="text-gray-600 leading-relaxed font-medium">
                At MAD GARAGE, we design, build, and source high-performance automotive components. We want to ensure you get the absolute best fitment and engineering quality. Below is our comprehensive guidelines for returns, refunds, and replacements.
              </p>
            </section>

            {/* Section 1: Return Eligibility */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">10-Day Easy Return Policy</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Eligible items marked as **Returnable** on the product page can be returned or replaced within **10 days** from the date of delivery. To qualify:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block text-gray-800">Unused & Uninstalled</span>
                    <span className="text-[10px] text-gray-400 font-medium">The part must not have been bolted or wired onto a vehicle.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block text-gray-800">Original Packaging</span>
                    <span className="text-[10px] text-gray-400 font-medium">Must include original box, manufacturer materials, and fitment guides.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block text-gray-800">Complete Hardware</span>
                    <span className="text-[10px] text-gray-400 font-medium">Any included brackets, clips, seals, or fasteners must be returned.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary/20 transition-all">
                  <ChevronRight size={14} className="text-primary mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block text-gray-800">Proof of Purchase</span>
                    <span className="text-[10px] text-gray-400 font-medium">Receipt or Order lookup summary from the Mad Garage client.</span>
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 2: Final Sale Policy */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                  <ShieldAlert size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Non-Returnable & Final Sale Items</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Specific parts are categorized as **Non-Returnable** (Final Sale) due to manufacturer policy, structural safety concerns, or custom fabrication. 
              </p>
              <div className="p-6 bg-red-50/50 rounded-[2rem] border border-red-500/10 space-y-4">
                <p className="text-xs font-bold text-red-700 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={14} /> Critical Exception Notice
                </p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Products designated as Final Sale are ineligible for return, refund, or exchange. This includes custom turbocharger configurations, custom tuned ECUs, cut-to-length hoses/wiring harnesses, and pre-used engine assemblies once delivered. Always verify the fitment guide using our AI Chatbot before finalize purchases.
                </p>
              </div>
            </section>

            {/* Section 3: Reverse Logistics */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                  <Truck size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Reverse Logistics & Pickup</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Upon submitting a return request via your dashboard, our engineering team audits the claim. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-2">1. Request Audit</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Our staff verifies the order history, product serial numbers, and photos. Approvals are typically granted within 24 to 48 hours.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-2">2. Doorstep Collection</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Once approved, our logistics partner will initiate doorstep pickup within 2-3 business days. Heavy freight items may require additional scheduling.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Refund Processing */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                  <RefreshCw size={20} />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Refund Timelines</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Refunds are processed back to the original payment source once the returned item undergoes physical inspection at our central warehouse.
              </p>
              <div className="p-6 bg-app-bg-dark rounded-[2rem] border border-primary/20 flex items-center gap-6 group hover:border-primary transition-all">
                <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest">5-7 Business Days Processing</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Dependent on bank clearing times. Store credit options are instant.</p>
                </div>
              </div>
            </section>

          </div>
          
          <div className="bg-gray-50 p-12 text-center border-t border-gray-100">
             <p className="text-sm text-gray-400 font-bold mb-6 italic uppercase tracking-tighter">
               Need help with a return or exchange?
             </p>
             <button 
               onClick={() => window.location.href = 'mailto:returns@madgarage.com'}
               className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-primary transition-all shadow-xl shadow-red-500/10 active:scale-95"
             >
               Contact Returns Desk
             </button>
          </div>
        </div>

        {/* Bottom Notice */}
        <p className="mt-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-50">
          MAD GARAGE PERFORMANCE INC. • SECURE LOGISTICS PROTOCOL
        </p>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
