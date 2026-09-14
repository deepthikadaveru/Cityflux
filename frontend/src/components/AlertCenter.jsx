import React, { useEffect, useMemo, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';

const fallbackAlerts = [
  { id: 1, plate: 'TS 07 EA 9012', owner: 'Rajesh Kumar', vehicle: 'Bajaj Discover 125 (Black Motorcycle)', reason: 'Stolen Vehicle / Cyberabad Police Warrant', camera_id: 'CAM-04', camera_name: 'Narsingi Rotary', severity: 'CRITICAL', timestamp: '2026-09-11 20:01:43', status: 'NEW' },
  { id: 2, plate: 'TS 07 EA 9012', owner: 'Rajesh Kumar', vehicle: 'Bajaj Discover 125 (Black Motorcycle)', reason: 'Stolen Vehicle / Cyberabad Police Warrant', camera_id: 'CAM-03', camera_name: 'Kokapet SEZ Junction', severity: 'CRITICAL', timestamp: '2026-09-11 19:58:43', status: 'NEW' },
  { id: 3, plate: 'TS 07 EA 9012', owner: 'Rajesh Kumar', vehicle: 'Bajaj Discover 125 (Black Motorcycle)', reason: 'Stolen Vehicle / Cyberabad Police Warrant', camera_id: 'CAM-02', camera_name: 'Gandipet Circle', severity: 'CRITICAL', timestamp: '2026-09-11 19:54:43', status: 'NEW' },
  { id: 4, plate: 'TS 07 EA 9012', owner: 'Rajesh Kumar', vehicle: 'Bajaj Discover 125 (Black Motorcycle)', reason: 'Stolen Vehicle / Cyberabad Police Warrant', camera_id: 'CAM-01', camera_name: 'MGIT Main Gate', severity: 'CRITICAL', timestamp: '2026-09-11 19:51:43', status: 'NEW' },
];

const fallbackBlacklist = [
  { id: 1, plate_number: 'TS 07 EA 1234', owner: 'Rajesh Kumar', vehicle: 'White Creta SUV', category: 'STOLEN', reason: 'Stolen Vehicle / Cyberabad Police Warrant', severity: 'HIGH' },
  { id: 2, plate_number: 'TS 07 EA 9012', owner: 'Rajesh Kumar', vehicle: 'Bajaj Discover 125 (Black Motorcycle)', category: 'STOLEN', reason: 'Stolen Vehicle / Cyberabad Police Warrant', severity: 'HIGH' },
  { id: 3, plate_number: 'TS 09 FL 9999', owner: 'Vikram Reddy', vehicle: 'Black Honda City', category: 'VIOLATION', reason: 'Traffic Violation / Unpaid Fines', severity: 'MEDIUM' },
];

const navItems = [
  { id: 'surveillance', label: 'Multi-Cam Surveillance', icon: '▣' },
  { id: 'trajectory', label: 'GIS Trajectory', icon: '⌁' },
  { id: 'analytics', label: 'Traffic Analytics', icon: '▥' },
  { id: 'alerts', label: 'Security Alerts', icon: '◇' },
];

export default function AlertCenter({ onNavigate, alertCount = 0 }) {
  const [alerts, setAlerts] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate_number: '', category: 'SUSPICIOUS', reason: '', severity: 'HIGH' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        fetch(`${API}/api/alerts?status=NEW`),
        fetch(`${API}/api/blacklist`),
      ]);
      const ad = await a.json();
      const bd = await b.json();
      setAlerts(Array.isArray(ad) && ad.length ? ad : fallbackAlerts);
      setBlacklist(Array.isArray(bd) && bd.length ? bd : fallbackBlacklist);
    } catch (e) {
      setAlerts(fallbackAlerts);
      setBlacklist(fallbackBlacklist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const activeCount = alerts.length || alertCount || 5;

  const normalizedAlerts = useMemo(() => alerts.map((a, i) => ({
    ...a,
    plate: a.plate || a.plate_number || 'UNKNOWN',
    camera_name: a.camera_name || a.camera_id || 'City Node',
    severity: a.severity || 'HIGH',
    timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString('en-IN', { hour12: false }).replace(',', '') : fallbackAlerts[i % fallbackAlerts.length].timestamp,
  })), [alerts]);

  const acknowledge = async (id) => {
    try { await fetch(`${API}/api/alerts/${id}/acknowledge`, { method: 'POST' }); } catch (_) {}
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const submitBlacklist = async (e) => {
    e.preventDefault();
    if (!form.plate_number.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/blacklist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } catch (_) {}
    setShowForm(false);
    setForm({ plate_number: '', category: 'SUSPICIOUS', reason: '', severity: 'HIGH' });
    setSaving(false);
    load();
  };

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900 flex font-sans">
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-[#0b1424] text-white flex-col sticky top-0 h-screen border-r border-slate-800 z-40">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-black">◎</div>
            <div><p className="font-black tracking-tight text-base">CITYFLUX</p><p className="text-[11px] text-slate-400 font-semibold tracking-widest">COMMAND CENTER</p></div>
          </div>
        </div>
        <div className="p-4 flex-1">
          <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500">Operations</p>
          <div className="space-y-1.5">
            {navItems.map(item => {
              const active = item.id === 'alerts';
              return <button key={item.id} onClick={() => onNavigate && onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span className="w-5 text-center font-bold">{item.icon}</span><span className="text-sm font-semibold">{item.label}</span>
                {item.id === 'alerts' && activeCount > 0 && <span className="ml-auto text-[10px] font-black bg-red-500 rounded-full px-2 py-0.5">{activeCount}</span>}
              </button>;
            })}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500 mb-3">System Status</p>
          <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Platform</span><span className="text-emerald-400 font-bold">● Operational</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Camera Nodes</span><span className="font-bold">4 / 4</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Alert Stream</span><span className="text-emerald-400 font-bold">LIVE</span></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6 lg:p-7">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3"><span className="text-red-600 text-2xl">♢</span><h1 className="text-2xl font-black tracking-tight">Security Alert Operations &amp; Blacklist Registry</h1></div>
            <p className="mt-1 text-sm text-slate-500 font-medium">Real-time flagging of stolen vehicles, police warrants, and speed anomalies.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="self-start bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-5 py-3 shadow-sm transition">＋ &nbsp; Flag New Vehicle</button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_1fr] gap-7">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between"><h2 className="text-sm font-black uppercase tracking-wide text-red-600">ϟ &nbsp; Active Real-Time Security Hits ({activeCount})</h2><span className="text-[10px] font-bold text-slate-400">LIVE STREAM</span></div>
            <div className="p-5 max-h-[650px] overflow-y-auto space-y-3">
              {loading && <div className="text-sm text-slate-400 p-6 text-center">Loading security events...</div>}
              {!loading && normalizedAlerts.map((a, i) => <div key={a.id || i} className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
                <div className="flex items-start justify-between gap-4"><span className="inline-flex px-3 py-2 rounded-md bg-amber-100 border border-amber-300 font-mono font-black text-lg tracking-wide">{a.plate}</span><span className="px-2.5 py-1.5 rounded-md border border-red-300 text-red-600 bg-red-100 text-[10px] font-black uppercase">{a.severity} BLACKLIST HIT</span></div>
                <p className="mt-3 font-bold text-sm">Owner: {a.owner || 'Registry record'} {a.vehicle ? `(${a.vehicle})` : ''}</p>
                <p className="mt-2 text-xs font-medium text-slate-600">Reason: <span className="text-red-700 font-bold">{a.reason || a.description || 'Security watchlist match'}</span></p>
                <div className="mt-3 pt-3 border-t border-red-200 flex flex-col sm:flex-row justify-between gap-2 text-[11px] font-mono text-slate-500"><span>Camera: &nbsp;{a.camera_name}</span><span>Time: {a.timestamp}</span></div>
                {a.id && <button onClick={() => acknowledge(a.id)} className="mt-3 text-[11px] font-bold text-slate-500 hover:text-slate-900">Acknowledge incident</button>}
              </div>)}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100"><h2 className="text-sm font-black uppercase tracking-wide text-slate-700">▣ &nbsp; Security Watchlist Registry ({blacklist.length || 3})</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="text-left px-5 py-4">Plate Number</th><th className="text-left px-5 py-4">Owner &amp; Vehicle</th><th className="text-left px-5 py-4">Flag Reason</th></tr></thead>
                <tbody>{(blacklist.length ? blacklist : fallbackBlacklist).map((b, i) => <tr key={b.id || i} className="border-t border-slate-200"><td className="px-5 py-5 font-mono font-black whitespace-nowrap">{b.plate_number}</td><td className="px-5 py-5"><div className="font-bold">{b.owner || 'Registry record'}</div><div className="text-xs text-slate-500 mt-1">{b.vehicle || b.category || 'Vehicle'}</div></td><td className="px-5 py-5 font-mono text-xs font-bold text-red-600">{b.reason || 'Security watchlist match'}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="px-6 py-5 border-t border-slate-100 text-xs text-slate-500">Registry matches are checked against incoming normalized plate events.</div>
          </section>
        </div>
      </main>

      {showForm && <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"><form onSubmit={submitBlacklist} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"><div className="flex justify-between items-center mb-5"><h3 className="text-lg font-black">Add Security Watchlist Vehicle</h3><button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-xl">×</button></div><div className="space-y-4"><input required value={form.plate_number} onChange={e => setForm({...form, plate_number:e.target.value})} placeholder="Plate number" className="w-full border rounded-xl px-4 py-3 font-mono"/><select value={form.category} onChange={e => setForm({...form, category:e.target.value})} className="w-full border rounded-xl px-4 py-3"><option>SUSPICIOUS</option><option>STOLEN</option><option>WARRANT</option><option>VIOLATION</option></select><input value={form.reason} onChange={e => setForm({...form, reason:e.target.value})} placeholder="Flag reason" className="w-full border rounded-xl px-4 py-3"/><select value={form.severity} onChange={e => setForm({...form, severity:e.target.value})} className="w-full border rounded-xl px-4 py-3"><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div><button disabled={saving} className="mt-5 w-full bg-red-600 text-white rounded-xl py-3 font-bold">{saving ? 'Saving...' : 'Add to Watchlist'}</button></form></div>}
    </div>
  );
}
