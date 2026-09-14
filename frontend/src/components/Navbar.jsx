import React, { useState, useEffect } from 'react';
import { Camera, Navigation, BarChart3, ShieldAlert, Cpu, Activity, Signal, Globe } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, alertCount }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'multicam', label: 'Multi-Cam Surveillance', icon: Camera },
    { id: 'trajectory', label: 'GIS Trajectory & Interception', icon: Navigation },
    { id: 'analytics', label: 'Urban Traffic Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Security Watchlist & Alerts', icon: ShieldAlert, badge: alertCount },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-[2000]">
      {/* Top Municipal Status Bar */}
      <div className="bg-slate-900 text-white px-6 py-1 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">HYDERABAD SMART CITY NETWORK: ONLINE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">4 CAMERA NODES STREAMING</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">AI ANPR ENGINE v2.4 ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">METROPOLITAN SECTOR: GANDIPET / FINANCIAL DIST</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300 font-bold">{time} IST</span>
        </div>
      </div>

      {/* Main Command Portal Navbar */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
                HYDERABAD URBAN TRAFFIC INTELLIGENCE PORTAL
              </h1>
              <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                Official Command System
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-Camera ANPR Spatial-Temporal Surveillance & Autonomous Interception Network
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
