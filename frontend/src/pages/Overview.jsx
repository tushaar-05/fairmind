import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Info, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', compliance: 85, biasRisk: 40 },
  { name: 'Feb', compliance: 88, biasRisk: 35 },
  { name: 'Mar', compliance: 92, biasRisk: 25 },
  { name: 'Apr', compliance: 90, biasRisk: 28 },
  { name: 'May', compliance: 95, biasRisk: 15 },
  { name: 'Jun', compliance: 98, biasRisk: 10 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, gradientClass }) => (
  <div className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500 ${gradientClass}`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass} size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
        {trend === 'up' ? '↑' : '↓'} {trendValue}
      </span>
      <span className="text-slate-400 text-xs">vs last month</span>
    </div>
  </div>
);

const LegalBadge = ({ label, status }) => {
  const isPass = status === 'Pass';
  const isWarn = status === 'Warning';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors">
      <span className="font-medium text-slate-700">{label}</span>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
        isPass ? 'bg-emerald-100 text-emerald-700' : 
        isWarn ? 'bg-amber-100 text-amber-700' : 
        'bg-red-100 text-red-700'
      }`}>
        {isPass ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
        {status}
      </div>
    </div>
  );
};

export default function Overview() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Real-time health checkup for your ML models.</p>
        </div>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-primary-500/20 transition-all flex items-center gap-2">
          <TrendingUp size={18} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Overall Fairness Score" 
          value="94/100" 
          icon={ShieldAlert} 
          trend="up" 
          trendValue="4.2%" 
          colorClass="text-primary-500"
          gradientClass="bg-primary-500"
        />
        <StatCard 
          title="Detected Bias Alerts" 
          value="2" 
          icon={AlertTriangle} 
          trend="down" 
          trendValue="1.5%" 
          colorClass="text-amber-500"
          gradientClass="bg-amber-500"
        />
        <StatCard 
          title="Active Audits" 
          value="14" 
          icon={Activity} 
          trend="up" 
          trendValue="12%" 
          colorClass="text-indigo-500"
          gradientClass="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Compliance & Risk Trend</h2>
            <button className="text-slate-400 hover:text-primary-500 transition-colors">
              <Info size={18} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompliance)" />
                <Area type="monotone" dataKey="biasRisk" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Legal Compliance</h2>
            <p className="text-sm text-slate-500 mt-1">Regulatory mapping status</p>
          </div>
          
          <div className="space-y-3 flex-1">
            <LegalBadge label="EU AI Act (Title III)" status="Pass" />
            <LegalBadge label="GDPR Article 22" status="Pass" />
            <LegalBadge label="Equal Credit Opportunity Act" status="Warning" />
            <LegalBadge label="NYC AI Hiring Law" status="Fail" />
          </div>
          
          <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors">
            View Detailed Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
