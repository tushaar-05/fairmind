// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import { Activity, ShieldAlert, BarChart3, Users, Settings, Database, CheckCircle2, AlertTriangle, Menu, Search, Bell } from 'lucide-react';
// import Overview from './pages/Overview';
// import DatasetForensics from './pages/DatasetForensics';
// import FairnessMetrics from './pages/FairnessMetrics';
// import Counterfactuals from './pages/Counterfactuals';

// const SidebarItem = ({ icon: Icon, label, path, isActive }) => (
//   <Link to={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
//     <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
//     <span className="font-medium text-sm">{label}</span>
//   </Link>
// );

// const Sidebar = () => {
//   const location = useLocation();
//   const navItems = [
//     { icon: Activity, label: 'Overview', path: '/' },
//     { icon: Database, label: 'Dataset Forensics', path: '/dataset' },
//     { icon: BarChart3, label: 'Fairness Metrics', path: '/metrics' },
//     { icon: Users, label: 'Counterfactuals', path: '/counterfactuals' },
//   ];

//   return (
//     <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 text-white z-20">
//       <div className="h-16 flex items-center px-6 border-b border-slate-800">
//         <div className="flex items-center gap-2 text-primary-500">
//           <ShieldAlert size={26} className="text-primary-500" />
//           <span className="text-xl font-bold tracking-tight text-white">Fair<span className="text-primary-500">Mind</span></span>
//         </div>
//       </div>

//       <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
//         <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Analytics</div>
//         {navItems.map((item) => (
//           <SidebarItem
//             key={item.path}
//             icon={item.icon}
//             label={item.label}
//             path={item.path}
//             isActive={location.pathname === item.path}
//           />
//         ))}
//       </div>

//       <div className="p-4 border-t border-slate-800">
//         <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all">
//           <Settings size={20} />
//           <span className="font-medium text-sm">Settings</span>
//         </Link>
//       </div>
//     </aside>
//   );
// };

// const Header = () => (
//   <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
//     <div className="flex items-center gap-4">
//       <button className="lg:hidden text-slate-500 hover:text-slate-700">
//         <Menu size={24} />
//       </button>
//       <div className="relative hidden md:block">
//         <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//         <input
//           type="text"
//           placeholder="Search audits..."
//           className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white w-64 transition-all"
//         />
//       </div>
//     </div>
//     <div className="flex items-center gap-4">
//       <button className="p-2 text-slate-400 hover:text-slate-600 relative">
//         <Bell size={20} />
//         <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
//       </button>
//       <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 text-white flex items-center justify-center font-semibold shadow-sm cursor-pointer">
//         HG
//       </div>
//     </div>
//   </header>
// );

// function App() {
//   return (
//     <Router>
//       <div className="flex min-h-screen bg-slate-50 font-sans">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 flex flex-col relative min-h-screen">
//           <Header />
//           <div className="p-8 flex-1">
//             <Routes>
//               <Route path="/" element={<Overview />} />
//               <Route path="/dataset" element={<DatasetForensics />} />
//               <Route path="/metrics" element={<FairnessMetrics />} />
//               <Route path="/counterfactuals" element={<Counterfactuals />} />
//             </Routes>
//           </div>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Overview from "./pages/Overview";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/overview" element={<Overview />} />
      </Routes>
    </Router>
  );
};

export default App;
