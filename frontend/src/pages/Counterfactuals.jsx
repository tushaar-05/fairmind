import React, { useState } from 'react';
import { RefreshCcw, ArrowRight, User } from 'lucide-react';

export default function Counterfactuals() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setResult('Approved');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Counterfactual Simulator</h1>
          <p className="text-slate-500 mt-1">What if the applicant's protected attributes were different?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-slate-400" />
              Applicant Profile (Denied)
            </h2>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Income</label>
              <input type="text" disabled value="$65,000" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 cursor-not-allowed" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Credit Score</label>
              <input type="text" disabled value="680" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-700 cursor-not-allowed" />
            </div>
            
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Protected Attributes to Vary</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Gender</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="Female">Female (Current)</option>
                    <option value="Male">Male (Counterfactual)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Age</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                    <option value="28">28 (Current)</option>
                    <option value="45">45 (Counterfactual)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSimulating ? (
                <RefreshCcw size={18} className="animate-spin" />
              ) : (
                <RefreshCcw size={18} />
              )}
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col justify-center">
          {!isSimulating && !result && (
            <div className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
              <ArrowRight size={32} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-1">Ready to simulate</h3>
              <p className="text-sm text-slate-400">Change attributes and run simulation to see outcome differences.</p>
            </div>
          )}
          
          {isSimulating && (
            <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-slate-600">Running Dice-ML inference...</p>
            </div>
          )}
          
          {result && !isSimulating && (
            <div className="animate-in zoom-in duration-500 bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-500 p-6 text-center">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wider">Simulation Result</span>
                <h2 className="text-4xl font-bold text-white mb-1">Approved</h2>
                <p className="text-emerald-100 font-medium">Outcome Flipped!</p>
              </div>
              <div className="p-6">
                <p className="text-slate-600 leading-relaxed mb-6">
                  By changing the applicant's gender from <strong>Female</strong> to <strong>Male</strong>, while keeping Income and Credit Score identical, the model decision changed from Denied to Approved.
                </p>
                
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5">
                    <span className="flex h-5 w-5 rounded-full bg-red-100 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Direct Bias Detected</h4>
                    <p className="text-xs text-red-600 mt-1">The model is directly penalizing the "Female" attribute. This violates equal opportunity guidelines.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
