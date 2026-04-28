import React, { useState, useRef } from 'react';
import { Database, UploadCloud, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DatasetForensics() {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [targetCol, setTargetCol] = useState('Personal Loan');
  const [protectedCol, setProtectedCol] = useState('Education');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setDatasetInfo(null);
    setError(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_column', targetCol);
    formData.append('protected_attribute', protectedCol);

    try {
      const response = await fetch('http://localhost:8000/api/v1/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setDatasetInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const formatChartData = (groupsDict) => {
    if (!groupsDict) return [];
    const colors = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
    return Object.entries(groupsDict).map(([group, count], index) => ({
      group: group.toString(),
      count,
      color: colors[index % colors.length]
    }));
  };

  const chartData = datasetInfo ? formatChartData(datasetInfo.groups) : [];
  
  let imbalanceAlert = false;
  let minGroup = null;
  let maxGroup = null;
  
  if (chartData.length >= 2) {
    const sorted = [...chartData].sort((a, b) => b.count - a.count);
    maxGroup = sorted[0];
    minGroup = sorted[sorted.length - 1];
    if (maxGroup.count > minGroup.count * 2) {
      imbalanceAlert = true;
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dataset Forensics</h1>
          <p className="text-slate-500 mt-1">Identify representation gaps and missing groups before training.</p>
        </div>
        
        {datasetInfo && (
          <button 
            onClick={resetUpload}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <UploadCloud size={18} />
            Upload New File
          </button>
        )}
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="mt-0.5" />
          <div>
            <h3 className="font-bold">Upload Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {datasetInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database size={18} className="text-primary-500" /> 
                Dataset Metadata
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Filename</span>
                  <span className="font-medium text-slate-800 text-sm truncate max-w-[150px]">{datasetInfo.filename}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Target Column</span>
                  <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{datasetInfo.target_col || targetCol}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Protected Attr</span>
                  <span className="font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs">{datasetInfo.protected_attribute}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Total Rows</span>
                  <span className="font-medium text-slate-800 text-sm">{datasetInfo.total_rows.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Missing Values</span>
                  <span className={`font-medium text-sm ${datasetInfo.data_quality?.missing_values > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {datasetInfo.data_quality?.missing_values || 0}
                  </span>
                </div>
              </div>
            </div>

            {imbalanceAlert ? (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-500">
                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} /> 
                  Severe Imbalance Alert
                </h3>
                <p className="text-sm text-red-600 mb-3">
                  The group <strong>{minGroup?.group}</strong> ({minGroup?.count}) is severely underrepresented compared to <strong>{maxGroup?.group}</strong> ({maxGroup?.count}). This may lead to biased model performance.
                </p>
                <button className="text-red-700 text-sm font-semibold hover:underline">Read Mitigation Guide →</button>
              </div>
            ) : (
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-500">
                <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18} /> 
                  Healthy Distribution
                </h3>
                <p className="text-sm text-emerald-600">
                  The protected groups have adequate representation in the dataset. No severe class imbalances detected.
                </p>
              </div>
            )}
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Representation by {datasetInfo.protected_attribute}</h2>
              <p className="text-sm text-slate-500 mt-1">Distribution of instances across the protected attribute.</p>
            </div>
            
            <div className="flex-1 w-full min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-white shadow-sm">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Database size={32} className="text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload your Dataset</h2>
          <p className="text-slate-500 max-w-lg text-center mb-8">
            Before uploading your CSV file, please specify the exact column headers from your file so FairMind knows what to audit.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-10 text-left">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <label className="block font-bold text-slate-800 mb-1 text-lg">Target Column</label>
              <p className="text-sm text-slate-500 mb-4">
                The exact header name of the outcome you are predicting (e.g. <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">loan_approved</code> or <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">Personal Loan</code>).
              </p>
              <input 
                type="text" 
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                placeholder="e.g. Personal Loan"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-medium bg-white"
              />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <label className="block font-bold text-slate-800 mb-1 text-lg">Protected Attribute</label>
              <p className="text-sm text-slate-500 mb-4">
                The sensitive demographic column you want to audit for bias (e.g. <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">Gender</code> or <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">Education</code>).
              </p>
              <input 
                type="text" 
                value={protectedCol}
                onChange={(e) => setProtectedCol(e.target.value)}
                placeholder="e.g. Education"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 font-medium bg-white"
              />
            </div>
          </div>

          <button 
            onClick={handleUploadClick}
            disabled={isUploading || !targetCol || !protectedCol}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-md shadow-primary-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            {isUploading ? 'Analyzing Dataset...' : 'Select CSV File'}
          </button>
          
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <Info size={16} className="text-slate-400" />
            <span>Files are processed locally and never stored permanently.</span>
          </div>
        </div>
      )}
    </div>
  );
}
