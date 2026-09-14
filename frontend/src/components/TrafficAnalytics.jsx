import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  CheckCircle2,
  Gauge,
  Globe2,
  Map,
  Radio,
  Server,
  ShieldAlert,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const demoCameras = [
  { id: 'CAM-01', name: 'MGIT Main Gate', location: 'MGIT College Rd, Gandipet', density: 3, speed: 50.2, status: 'SMOOTH' },
  { id: 'CAM-02', name: 'Gandipet Circle', location: 'Gandipet Junction', density: 3, speed: 49.3, status: 'SMOOTH' },
  { id: 'CAM-03', name: 'Kokapet SEZ Junction', location: 'Kokapet Financial Dist Link', density: 3, speed: 55.3, status: 'SMOOTH' },
  { id: 'CAM-04', name: 'Narsingi Rotary', location: 'Narsingi ORR Service Rd', density: 2, speed: 71.2, status: 'SMOOTH' },
];

const fallbackTrend = [
  { time: '08:00', vehicles: 118 }, { time: '09:00', vehicles: 172 },
  { time: '10:00', vehicles: 228 }, { time: '11:00', vehicles: 278 },
  { time: '12:00', vehicles: 312 }, { time: '13:00', vehicles: 333 },
  { time: '14:00', vehicles: 340 }, { time: '15:00', vehicles: 288 },
  { time: '16:00', vehicles: 232 }, { time: '17:00', vehicles: 210 },
  { time: '18:00', vehicles: 195 },
];

const fallbackOD = [
  ['MGIT Main Gate', 'Gandipet Circle', 42, '4.1 mins'],
  ['Gandipet Circle', 'Kokapet SEZ Junction', 38, '4.5 mins'],
  ['Kokapet SEZ Junction', 'Narsingi Rotary', 31, '3.8 mins'],
  ['Narsingi Rotary', 'Financial District ORR', 26, '5.2 mins'],
];

export default function TrafficAnalytics({ onNavigate, alertCount = 0 }) {
  const [summary, setSummary] = useState(null);
  const [density, setDensity] = useState([]);
  const [od, setOd] = useState([]);
  const [speed, setSpeed] = useState([]);
  const [connected, setConnected] = useState(true);
  const [updated, setUpdated] = useState('');

  const load = async () => {
    try {
      const [s, d, o, sp] = await Promise.all([
        axios.get('/api/analytics/summary'),
        axios.get('/api/traffic/density'),
        axios.get('/api/traffic/od'),
        axios.get('/api/traffic/speed'),
      ]);
      setSummary(s.data || null);
      setDensity(Array.isArray(d.data) ? d.data : []);
      setOd(Array.isArray(o.data) ? o.data : []);
      setSpeed(Array.isArray(sp.data) ? sp.data : []);
      setConnected(true);
      setUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setConnected(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const cameras = useMemo(() => {
    if (!density.length) return demoCameras;
    const grouped = {};
    density.forEach((x) => {
      const key = String(x.road_segment_id || '').toUpperCase();
      grouped[key] = x;
    });
    return demoCameras.map((cam) => {
      const hit = Object.entries(grouped).find(([k]) => k.includes(cam.id));
      const x = hit?.[1];
      return x ? {
        ...cam,
        density: x.vehicle_count ?? cam.density,
        speed: x.avg_speed_kmph ?? cam.speed,
        status: String(x.congestion_level || cam.status).toUpperCase(),
      } : cam;
    });
  }, [density]);

  const trend = useMemo(() => {
    if (!density.length) return fallbackTrend;
    const buckets = {};
    density.slice().reverse().forEach((x) => {
      const date = new Date(x.bucket_start);
      const key = Number.isNaN(date.getTime()) ? 'LIVE' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      buckets[key] = (buckets[key] || 0) + Number(x.vehicle_count || 0);
    });
    const rows = Object.entries(buckets).map(([time, vehicles]) => ({ time, vehicles }));
    return rows.length >= 3 ? rows : fallbackTrend;
  }, [density]);

  const odRows = useMemo(() => {
    if (!od.length) return fallbackOD;
    return od.slice(0, 6).map((x) => [
      String(x.origin_camera || '').replace(/^CAM-\d+[: ]*/i, '') || 'Unknown',
      String(x.destination_camera || '').replace(/^CAM-\d+[: ]*/i, '') || 'Unknown',
      Number(x.vehicle_count || 0),
      '—',
    ]);
  }, [od]);

  const avgSpeed = summary?.average_speed_kmph ?? (cameras.reduce((a, c) => a + c.speed, 0) / cameras.length);
  const vehicles = summary?.unique_vehicles ?? summary?.vehicles_detected ?? 11;
  const alerts = summary?.active_alerts ?? alertCount ?? 4;
  const activeCameras = summary?.active_cameras ?? 4;

  const navItems = [
    { id: 'surveillance', label: 'Multi-Cam Surveillance', icon: Camera },
    { id: 'trajectory', label: 'GIS Trajectory', icon: Map },
    { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert, badge: alerts },
  ];

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900 flex font-sans">
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-[#0b1424] text-white flex-col sticky top-0 h-screen border-r border-slate-800 z-40">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30"><Globe2 className="w-6 h-6" /></div>
            <div><p className="font-black tracking-tight text-base">CITYFLUX</p><p className="text-[11px] text-slate-400 font-semibold tracking-widest">COMMAND CENTER</p></div>
          </div>
        </div>
        <div className="p-4">
          <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500">Operations</p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.id === 'analytics';
              return <button key={item.id} onClick={() => onNavigate?.(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/25' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <Icon className="w-5 h-5" /><span className="text-sm font-semibold flex-1">{item.label}</span>
                {item.badge > 0 && <span className={`min-w-6 h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${active ? 'bg-white text-blue-700' : 'bg-red-500 text-white'}`}>{item.badge}</span>}
              </button>;
            })}
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800">
          <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500">System Status</p>
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3">
            <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} /><span className="text-xs font-bold">{connected ? 'Operational' : 'API Disconnected'}</span></div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-400"><span>Camera nodes</span><b className="text-slate-200 text-right">{activeCameras}/4</b><span>Analytics</span><b className="text-emerald-400 text-right">LIVE</b></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-[82px] bg-white border-b border-slate-200 px-7 flex items-center justify-between sticky top-0 z-30">
          <div><div className="text-[11px] uppercase tracking-[0.18em] font-black text-blue-600">CITYFLUX · SIH 26127</div><h1 className="text-2xl font-black tracking-tight mt-1">Traffic Analytics</h1><p className="text-xs text-slate-500 mt-1">City-wide density, speed and origin-destination intelligence</p></div>
          <div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600"><Radio className="w-4 h-4 text-emerald-500" /> LIVE ANALYTICS</div><div className="text-right"><div className="text-[10px] uppercase tracking-widest text-slate-400">Last refresh</div><div className="text-xs font-bold text-slate-700">{updated || 'Connecting...'}</div></div></div>
        </header>

        <div className="p-6 md:p-7 space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Metric icon={Activity} label="TOTAL VEHICLES MONITORED" value={vehicles} suffix="" note="Live unique vehicle observations" tone="blue" />
            <Metric icon={Gauge} label="AVG CITY CORRIDOR SPEED" value={Number(avgSpeed).toFixed(1)} suffix="km/h" note="Within smooth flow threshold" tone="green" />
            <Metric icon={AlertTriangle} label="SECURITY ALERTS" value={alerts} suffix="" note="Flagged events requiring review" tone="red" />
            <Metric icon={Server} label="ACTIVE CAMERA NODES" value={`${activeCameras} / 4`} suffix="" note="Network node availability" tone="blue" />
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <SectionTitle icon={BarChart3} title="CAMERA NODE DENSITY & SPEED ANALYTICS" subtitle="Current traffic conditions across the monitored camera network" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
              {cameras.map((cam) => <div key={cam.id} className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 hover:border-blue-200 transition">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-sm">{cam.id}: {cam.name}</h3><p className="text-xs text-slate-500 mt-2">{cam.location}</p></div><span className={`px-2.5 py-1 rounded-md text-[10px] font-black border ${String(cam.status).includes('HIGH') || String(cam.status).includes('CONGEST') ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'}`}>{String(cam.status).toUpperCase()}</span></div>
                <div className="border-t border-slate-200 mt-4 pt-3 grid grid-cols-2"><div><div className="text-[10px] uppercase tracking-wider text-slate-500">Density</div><div className="font-black text-sm mt-1">{cam.density} <span className="font-medium text-xs">veh</span></div></div><div className="text-right"><div className="text-[10px] uppercase tracking-wider text-slate-500">Avg Speed</div><div className="font-black text-sm mt-1 text-emerald-600">{Number(cam.speed).toFixed(1)} <span className="font-medium text-xs">km/h</span></div></div></div>
              </div>)}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[390px]">
              <SectionTitle icon={TrendingUp} title="HOURLY CITY TRAFFIC VOLUME TREND" subtitle="Aggregated vehicle observations across camera nodes" />
              <div className="h-[285px] mt-5"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}><defs><linearGradient id="fluxArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.34} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.04} /></linearGradient></defs><CartesianGrid stroke="#dbe4ee" strokeDasharray="4 4" /><XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} /><YAxis tick={{ fontSize: 11, fill: '#64748b' }} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(15,23,42,.08)' }} /><Area type="monotone" dataKey="vehicles" stroke="#2563eb" strokeWidth={3} fill="url(#fluxArea)" /></AreaChart></ResponsiveContainer></div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[390px]">
              <div className="flex items-center justify-between"><SectionTitle icon={Map} title="ORIGIN-DESTINATION (O-D) CORRIDOR FLOWS" subtitle="Vehicle movement between monitored nodes" /><Zap className="w-5 h-5 text-blue-600 shrink-0" /></div>
              <div className="overflow-x-auto mt-5"><table className="w-full text-sm"><thead><tr className="bg-slate-50 border-y border-slate-200"><th className="text-left px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500">Origin Node</th><th className="text-left px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500">Destination Node</th><th className="text-right px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500">Flow Vol</th><th className="text-right px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500">Avg Travel</th></tr></thead><tbody>{odRows.map((r, i) => <tr key={i} className="border-b border-slate-100"><td className="px-3 py-3 font-bold text-slate-800 whitespace-nowrap">{r[0]}</td><td className="px-3 py-3 text-slate-600 whitespace-nowrap">{r[1]}</td><td className="px-3 py-3 text-right font-black text-blue-600">{r[2]} veh/h</td><td className="px-3 py-3 text-right font-bold text-emerald-600">{r[3]}</td></tr>)}</tbody></table></div>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Flow values update from the analytics service.</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix, note, tone }) {
  const cls = tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-emerald-600' : 'text-blue-600';
  return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"><div className="flex justify-between items-start"><div className="text-[10px] uppercase tracking-[0.14em] font-black text-slate-500">{label}</div><Icon className={`w-5 h-5 ${cls}`} /></div><div className="mt-4 flex items-baseline gap-2"><div className={`text-3xl font-black tracking-tight ${tone === 'red' ? 'text-red-600' : 'text-slate-950'}`}>{value}</div>{suffix && <span className="text-sm font-semibold text-slate-500">{suffix}</span>}</div><div className={`mt-3 text-xs font-semibold ${tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-emerald-600' : 'text-slate-500'}`}>{note}</div></div>;
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return <div className="flex items-start gap-3"><Icon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" /><div><h2 className="font-black text-base tracking-tight">{title}</h2>{subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}</div></div>;
}
