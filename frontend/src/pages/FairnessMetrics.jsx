import React, { useState, useEffect } from 'react';
import { BarChart3, Info, Check, X, RefreshCcw, ShieldCheck, AlertTriangle } from 'lucide-react';

const MetricCard = ({ title, description, plainEnglish, formula, value, status, groupA, groupB, isRatio }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className={`p-2 rounded-lg ${status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {status === 'Pass' ? <Check size={20} /> : <X size={20} />}
      </div>
    </div>
    
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm text-slate-700 leading-relaxed">
      <strong>What this means:</strong> {plainEnglish}
    </div>
    
    <div className="mt-auto space-y-5">
      <div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium text-slate-700">Group: {groupA.name}</span>
          <span className="font-bold text-slate-900">{groupA.val}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${groupA.pct}%` }}></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium text-slate-700">Group: {groupB.name}</span>
          <span className="font-bold text-slate-900">{groupB.val}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${status === 'Pass' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${groupB.pct}%` }}></div>
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
      <span className="text-slate-500 text-sm font-medium">Final Metric Value</span>
      <span className={`text-2xl font-bold ${status === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>{value}</span>
    </div>
  </div>
);

export default function FairnessMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMitigating, setIsMitigating] = useState(false);
  const [mitigationDone, setMitigationDone] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/audits/run?dataset_id=demo_123', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMitigate = async () => {
    setIsMitigating(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/audits/mitigate', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Mitigation failed');
      const data = await response.json();
      setMetrics(data);
      setMitigationDone(true);
    } catch (err) {
      console.error(err);
      alert('Error running mitigation engine: ' + err.message);
    } finally {
      setIsMitigating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-[60vh]">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Training ML Model & Analyzing Bias...</h2>
        <p className="text-slate-500 font-medium">Running Scikit-Learn Random Forest on your data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center h-96">
        <X size={32} className="text-red-500 mb-4" />
        <p className="text-slate-800 font-medium">Error connecting to FastAPI backend:</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={fetchMetrics} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium">Retry Analysis</button>
      </div>
    );
  }

  const di_status = metrics.disparate_impact.status;
  const di_val = metrics.disparate_impact.value;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fairness Metrics</h1>
          <p className="text-slate-500 mt-1">Plain-English explanations of mathematical bias across your uploaded data.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <span className="text-sm text-slate-500 font-medium">Analyzing Protected Attribute:</span>
          <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded font-bold text-sm">
            {metrics.demographic_parity.groupA.name} vs {metrics.demographic_parity.groupB.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <MetricCard 
          title="Demographic Parity" 
          description="Are both groups being approved at the exact same rate?"
          plainEnglish={`The AI model approved ${metrics.demographic_parity.groupA.val} of applicants in Group ${metrics.demographic_parity.groupA.name}, and approved ${metrics.demographic_parity.groupB.val} of applicants in Group ${metrics.demographic_parity.groupB.name}. The difference between them is ${metrics.demographic_parity.value}.`}
          formula="P(Y_hat=1 | Group=A) - P(Y_hat=1 | Group=B)"
          value={metrics.demographic_parity.value}
          status={metrics.demographic_parity.status}
          groupA={metrics.demographic_parity.groupA}
          groupB={metrics.demographic_parity.groupB}
          isRatio={false}
        />
        
        <MetricCard 
          title="Equal Opportunity" 
          description="Are qualified people in both groups equally likely to be approved?"
          plainEnglish={`Out of all the people who ACTUALLY deserved a loan, the model correctly approved ${metrics.equal_opportunity.groupA.val} in Group ${metrics.equal_opportunity.groupA.name}, compared to ${metrics.equal_opportunity.groupB.val} in Group ${metrics.equal_opportunity.groupB.name}.`}
          formula="True Positive Rate (Group A) - True Positive Rate (Group B)"
          value={metrics.equal_opportunity.value}
          status={metrics.equal_opportunity.status}
          groupA={metrics.equal_opportunity.groupA}
          groupB={metrics.equal_opportunity.groupB}
          isRatio={false}
        />
        
        <MetricCard 
          title="Disparate Impact" 
          description="The 80% Rule (Legal Standard for Discrimination)"
          plainEnglish={`This is the ratio of approval rates between the groups. If the ratio falls below 0.80 (80%), it is legally considered "Disparate Impact" under US hiring and lending laws.`}
          formula="Approval Rate (Minority) / Approval Rate (Majority)"
          value={metrics.disparate_impact.value}
          status={metrics.disparate_impact.status}
          groupA={metrics.disparate_impact.groupA}
          groupB={metrics.disparate_impact.groupB}
          isRatio={true}
        />
        
        <div className={`rounded-2xl border p-8 flex flex-col items-center justify-center text-center transition-all ${
          mitigationDone ? 'bg-emerald-50 border-emerald-200' : 
          di_status === 'Pass' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            {mitigationDone ? (
              <ShieldCheck size={32} className="text-emerald-500" />
            ) : di_status === 'Pass' ? (
              <Check size={32} className="text-emerald-500" />
            ) : (
              <AlertTriangle size={32} className="text-red-500" />
            )}
          </div>
          
          {mitigationDone ? (
            <>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Model Successfully Mitigated</h3>
              <p className="text-emerald-700 mb-6 max-w-sm">
                FairMind's AI engine re-weighted the model using Fairlearn. The Disparate Impact ratio is now {metrics.disparate_impact.value}, making it legally compliant!
              </p>
              <div className="flex gap-2 w-full max-w-sm">
                <button disabled className="bg-emerald-200 text-emerald-800 px-4 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-2">
                  <Check size={20} /> Bias Removed
                </button>
                <a 
                  href="http://localhost:8000/api/v1/datasets/download_mitigated" 
                  download 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export Data
                </a>
              </div>
            </>
          ) : di_status === 'Pass' ? (
            <>
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Model is Legally Compliant</h3>
              <p className="text-emerald-700 mb-6 max-w-sm">
                Your model passes the Disparate Impact threshold ({di_val} &gt; 0.80). No severe bias detected across these groups.
              </p>
              <button disabled className="bg-emerald-200 text-emerald-800 px-6 py-3 rounded-xl font-bold w-full max-w-xs">
                No Mitigation Needed
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-red-800 mb-2">Compliance Action Required</h3>
              <p className="text-red-700 mb-6 max-w-sm">
                Your model fails the Disparate Impact threshold ({di_val} &lt; 0.80). This poses a high legal risk under ECOA.
              </p>
              <button 
                onClick={handleMitigate}
                disabled={isMitigating}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-red-500/20 transition-all w-full max-w-xs flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isMitigating ? <RefreshCcw size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                {isMitigating ? 'Reweighting Model...' : 'Run Mitigation Engine'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
