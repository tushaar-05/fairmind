import React, { useState, useEffect } from 'react';
import { RefreshCcw, ArrowRight, User, AlertCircle } from 'lucide-react';

export default function Counterfactuals() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const [sample, setSample] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for the manipulated features
  const [mutatedValue, setMutatedValue] = useState("");

  useEffect(() => {
    fetchSample();
  }, []);

  const fetchSample = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/audits/counterfactual/sample');
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to fetch sample');
      }
      const data = await response.json();
      setSample(data);
      setMutatedValue(data.features[data.protected_attribute].toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setResult(null);
    
    // Build the new feature payload
    const payload = { ...sample.features };
    payload[sample.protected_attribute] = parseFloat(mutatedValue);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/audits/counterfactual/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      
      // Artificial delay for UX "Simulation" feel
      setTimeout(() => {
        setIsSimulating(false);
        setResult(data.prediction);
      }, 1000);
      
    } catch (err) {
      console.error(err);
      alert('Error running simulation: ' + err.message);
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[50vh]">
        <RefreshCcw size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-slate-500 font-medium">Fetching Random Applicant from Model...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[50vh]">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Simulation Unavailable</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Note: You must first upload a dataset in the "Dataset Forensics" tab, and then visit the "Fairness Metrics" tab to train the model before running simulations.
        </p>
      </div>
    );
  }

  // Pick top 3 features to show (excluding the protected one)
  const displayFeatures = Object.keys(sample.features)
    .filter(k => k !== sample.protected_attribute)
    .slice(0, 3);

  const originalOutcomeStr = sample.original_prediction === 1 ? 'Approved' : 'Denied';
  const newOutcomeStr = result === 1 ? 'Approved' : 'Denied';
  const flipped = result !== null && result !== sample.original_prediction;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Counterfactual Simulator</h1>
          <p className="text-slate-500 mt-1">What if the applicant's protected attributes were different?</p>
        </div>
        <button onClick={fetchSample} className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-medium rounded-lg text-slate-600 flex items-center gap-2">
          <RefreshCcw size={16} /> Load New Applicant
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: Input Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-slate-400" />
              Applicant #{sample.id} ({originalOutcomeStr})
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              originalOutcomeStr === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              Original: {originalOutcomeStr}
            </div>
          </div>
          
          <div className="p-6 space-y-5 flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fixed Attributes (Locked)</h3>
            {displayFeatures.map(feat => (
              <div key={feat}>
                <label className="block text-sm font-medium text-slate-600 mb-1">{feat}</label>
                <input 
                  type="text" 
                  disabled 
                  value={sample.features[feat]} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-500 font-mono text-sm cursor-not-allowed" 
                />
              </div>
            ))}
            
            <div className="border-t border-slate-100 pt-6 mt-2">
              <h3 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">Protected Attribute to Vary</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">{sample.protected_attribute}</label>
                <p className="text-xs text-slate-500 mb-2">Original value: {sample.features[sample.protected_attribute]}</p>
                <input 
                  type="number" 
                  value={mutatedValue}
                  onChange={(e) => setMutatedValue(e.target.value)}
                  className="w-full bg-white border-2 border-primary-200 rounded-lg px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-0 mt-auto">
            <button 
              onClick={handleSimulate}
              disabled={isSimulating || mutatedValue === ""}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCcw size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
              {isSimulating ? 'Running AI Inference...' : 'Run Simulation'}
            </button>
          </div>
        </div>
        
        {/* RIGHT COLUMN: Results */}
        <div className="flex flex-col justify-center">
          {!isSimulating && result === null && (
            <div className="text-center p-12 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
              <ArrowRight size={40} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to simulate</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Change the protected attribute on the left and click "Run Simulation" to see if the AI model flips its decision.</p>
            </div>
          )}
          
          {isSimulating && (
            <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6"></div>
              <p className="font-bold text-lg text-slate-700">Evaluating Counterfactual...</p>
            </div>
          )}
          
          {result !== null && !isSimulating && (
            <div className={`animate-in zoom-in-95 duration-500 rounded-3xl border shadow-sm overflow-hidden ${
              flipped ? 'bg-white border-red-200' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-8 text-center ${
                flipped ? 'bg-red-500' : 'bg-slate-100'
              }`}>
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 uppercase tracking-wider ${
                  flipped ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  Simulation Result
                </span>
                <h2 className={`text-5xl font-black mb-2 ${flipped ? 'text-white' : 'text-slate-800'}`}>
                  {newOutcomeStr}
                </h2>
                <p className={`font-medium ${flipped ? 'text-red-100' : 'text-slate-500'}`}>
                  {flipped ? 'Outcome Flipped!' : 'Outcome Remained the Same'}
                </p>
              </div>
              
              <div className="p-8">
                <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                  By changing the applicant's {sample.protected_attribute} to <strong>{mutatedValue}</strong>, while keeping all other {displayFeatures.length} attributes identical, the model decision {flipped ? 'changed' : 'stayed the same'} from {originalOutcomeStr} to {newOutcomeStr}.
                </p>
                
                {flipped ? (
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-start gap-4">
                    <div className="mt-1">
                      <span className="flex h-6 w-6 rounded-full bg-red-200 items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-red-900">Direct Bias Detected</h4>
                      <p className="text-sm text-red-700 mt-1 leading-relaxed">
                        This proves the model is actively using {sample.protected_attribute} as a deciding factor. If it were fair, the outcome would not change based on this attribute alone.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-700">No Direct Bias in this instance</h4>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        The model relied on the other features (like {displayFeatures.join(', ')}) to make this specific decision.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
