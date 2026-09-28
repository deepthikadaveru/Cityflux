import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Camera, CheckCircle2, Eye,
  Globe2, Map, Maximize2, Plus, Radio, RefreshCw, Server, ShieldAlert,
  Signal, Upload, Video, X, Zap, ArrowLeft
} from 'lucide-react';
import api from '../api';
const API_URL = import.meta.env.VITE_API_URL || '';

export default function MultiCamViewer({ onSelectPlate, onNavigate, alertCount = 0 }) {
  const [cameras, setCameras] = useState([]);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showAddCamModal, setShowAddCamModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [connectionState, setConnectionState] = useState({});
  const [newCam, setNewCam] = useState({
    id: '', name: '', location: '', lat: '17.4401', lon: '78.3489',
    speed_limit_kmh: '80', video_file: 'cam5.mp4', resolution: '1080p HD Node', fps: '30 FPS'
  });
  const [streamConfig, setStreamConfig] = useState({
    targetCamId: '', protocol: 'rtsp',
    rtsp_url: 'rtsp://admin:pass@10.240.18.45:554/h264/ch1',
    resolution: '4K Ultra-HD Gantry', fps: '60 FPS'
  });

  const fetchCameras = async () => {
    try {
      const res = await api.get('/api/cameras');
      const list = Array.isArray(res.data) ? res.data : (res.data.cameras || []);
      if (list.length) {
        setCameras(list);
        setStreamConfig(prev => ({ ...prev, targetCamId: prev.targetCamId || list[0].id }));
      }
    } catch (err) { console.error('Camera fetch failed:', err); }
  };

  const fetchDetections = async () => {
    try {
      const res = await api.get('/api/detections');
      setDetections(res.data.detections || []);
    } catch (err) { console.error('Detection fetch failed:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCameras();
    fetchDetections();
    const timer = setInterval(() => { fetchCameras(); fetchDetections(); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleStreamLoaded = id => setConnectionState(p => ({ ...p, [id]: 'LIVE' }));
  const handleStreamError = (id, e) => {
    setConnectionState(p => ({ ...p, [id]: 'RECONNECTING' }));
    const img = e.currentTarget;
    img.onerror = null;
    window.setTimeout(() => {
      img.src = `/api/video_feed/${id}?retry=${Date.now()}`;
      img.onload = () => handleStreamLoaded(id);
    }, 1500);
  };

  const handleFileUpload = async (camId, file) => {
    if (!file) return;
    setUploading(p => ({ ...p, [camId]: true }));
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/upload-video/${camId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchCameras(); await fetchDetections();
    } catch (err) { alert(`Upload failed for ${camId}`); }
    finally { setUploading(p => ({ ...p, [camId]: false })); }
  };

  const handleAddCameraSubmit = async e => {
    e.preventDefault();
    const payload = {
      id: newCam.id.trim() || `cam_${Date.now()}`,
      name: newCam.name || `CAM-${String(cameras.length + 1).padStart(2, '0')}: Junction Node`,
      location: newCam.location || 'Hyderabad Sector',
      lat: Number(newCam.lat) || 17.4401, lon: Number(newCam.lon) || 78.3489,
      speed_limit_kmh: Number(newCam.speed_limit_kmh) || 80,
      stream_type: 'file', stream_url: newCam.video_file,
      resolution: newCam.resolution, fps: newCam.fps
    };
    try {
      await api.post('/api/cameras', payload);
      setShowAddCamModal(false); await fetchCameras();
      setNewCam({ id:'', name:'', location:'', lat:'17.4401', lon:'78.3489', speed_limit_kmh:'80', video_file:'cam5.mp4', resolution:'1080p HD Node', fps:'30 FPS' });
    } catch { alert('Failed to register new camera node.'); }
  };

  const handleConnectStreamSubmit = async e => {
    e.preventDefault();
    const cam = cameras.find(c => c.id === streamConfig.targetCamId) || cameras[0];
    if (!cam) return;
    try {
      await api.post('/api/cameras', {
        id: cam.id, name: cam.name, location: cam.location, lat: cam.lat, lon: cam.lon,
        speed_limit_kmh: cam.speed_limit_kmh, stream_type: 'rtsp', stream_url: streamConfig.rtsp_url,
        resolution: streamConfig.resolution, fps: streamConfig.fps
      });
      setShowStreamModal(false); await fetchCameras();
    } catch { alert('Failed to connect continuous stream feed.'); }
  };

  const flaggedCount = detections.filter(d => d.is_blacklisted === 1 || d.is_blacklisted === true).length;
  const displayed = useMemo(() => filterAlertsOnly ? detections.filter(d => d.is_blacklisted === 1 || d.is_blacklisted === true) : detections, [detections, filterAlertsOnly]);
  const liveCount = cameras.filter(c => connectionState[c.id] !== 'RECONNECTING').length;

  const nav = [
    { label:'Multi-Cam Surveillance', icon:Camera, active:true, action:()=>onNavigate?.('multicam') },
    { label:'GIS Trajectory', icon:Map, action:()=>onNavigate?.('trajectory') },
    { label:'Traffic Analytics', icon:BarChart3, action:()=>onNavigate?.('analytics') },
    { label:'Security Alerts', icon:ShieldAlert, badge:alertCount, action:()=>onNavigate?.('alerts') }
  ];

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-950">
      <div className="flex min-h-screen">
        {/* OPERATIONS SIDEBAR */}
        <aside className="hidden lg:flex w-[238px] shrink-0 bg-[#091322] text-white flex-col sticky top-0 h-screen z-40">
          <div className="px-5 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/30"><Globe2 className="w-6 h-6" /></div>
              <div><div className="text-lg font-black">CITYFLUX</div><div className="text-[11px] font-bold tracking-[0.18em] text-slate-400">COMMAND CENTER</div></div>
            </div>
          </div>
          <div className="p-4">
            <p className="px-3 mb-3 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">Operations</p>
            <div className="space-y-1.5">
              {nav.map((n, i) => <button key={n.label} onClick={n.action} className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-xl text-left ${n.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-300 hover:bg-slate-800'}`}><n.icon className="w-5 h-5 shrink-0" /><span className="text-sm font-black flex-1">{n.label}</span>{n.badge !== undefined && <span className="min-w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs font-black">{n.badge}</span>}</button>)}
            </div>
          </div>
          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center gap-2 mb-3"><Server className="w-4 h-4 text-emerald-400" /><span className="text-xs font-black uppercase tracking-wider">System Status</span></div>
              <div className="flex items-center gap-2 text-sm font-black text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />Operational</div>
              <p className="mt-2 text-xs text-slate-400">{liveCount}/{cameras.length} camera nodes responding</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* ONE PAGE HEADER. No second portal title. */}
          <header className="bg-white border-b border-slate-200 px-5 lg:px-7 py-5">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3"><h1 className="text-2xl lg:text-[30px] font-black tracking-tight">Multi-Camera Surveillance</h1><span className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black">CITYFLUX · SIH 26127</span></div>
                <p className="mt-1.5 text-sm lg:text-base text-slate-500 font-semibold">Live camera monitoring, ANPR/OCR events and security intelligence.</p>
              </div>
              <div className="flex items-center gap-2.5"><div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-black text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />{liveCount}/{cameras.length} ONLINE</div><button onClick={()=>setShowAddCamModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black"><Plus className="w-5 h-5" />Add Camera</button><button onClick={()=>setShowStreamModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172235] hover:bg-[#0e1829] text-white text-sm font-black"><Radio className="w-5 h-5 text-red-400" />Connect Stream</button></div>
            </div>
          </header>

          <div className="p-4 lg:p-6">
            {/* READABLE SUMMARY */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
              <MetricCard icon={Camera} label="Camera Nodes" value={cameras.length} detail={`${liveCount} responding`} tone="blue" />
              <MetricCard icon={Eye} label="ANPR Passes" value={detections.length} detail="Latest detection events" tone="emerald" />
              <MetricCard icon={ShieldAlert} label="Security Hits" value={flaggedCount} detail="Flagged observations" tone="red" />
              <MetricCard icon={Activity} label="Vision Engine" value="ACTIVE" detail="Pipeline connected" tone="violet" />
            </section>

            {/* 2 x 2 CAMERA WALL. No detection sidebar stealing half the viewport. */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map((cam, index) => {
                const state = connectionState[cam.id] || 'LIVE';
                const isRtsp = cam.stream_type === 'rtsp';
                return (
                  <article key={cam.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all">
                    <div className="px-4 lg:px-5 py-4 border-b border-slate-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${state === 'RECONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} /><h2 className="text-base lg:text-lg font-black truncate">{cam.name}</h2></div><p className="mt-1 text-sm text-slate-500 font-semibold truncate">{cam.location}</p></div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-black ${state === 'RECONNECTING' ? 'bg-amber-50 text-amber-700 border-amber-200' : isRtsp ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{state === 'RECONNECTING' ? 'RECONNECTING' : isRtsp ? 'RTSP LIVE' : 'LIVE FEED'}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-slate-500"><span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">NODE {String(index+1).padStart(2,'0')}</span><span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">{cam.resolution || '1080p'}</span><span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">{cam.fps || '30 FPS'}</span></div>
                    </div>

                    <button type="button" onClick={()=>setSelectedCamera(cam)} className="relative block w-full h-[330px] lg:h-[365px] bg-[#020712] overflow-hidden group cursor-pointer">
                     <img src={`${API_URL}/api/video_feed/${cam.id}`} alt={cam.name} onLoad={()=>handleStreamLoaded(cam.id)} onError={e=>handleStreamError(cam.id,e)} className="absolute inset-0 w-full h-full object-contain z-10" />
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /><span className="text-xs font-black tracking-wider">LIVE</span></div>
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/80 border border-emerald-400/20 text-emerald-300"><Zap className="w-4 h-4" /><span className="text-xs font-black">ANPR / OCR ACTIVE</span></div>
                      <div className="absolute bottom-4 left-4 z-20 px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-black">CAMERA {String(index+1).padStart(2,'0')} · {cam.fps || '30 FPS'}</div>
                      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/80 border border-white/10 text-white"><Signal className="w-4 h-4 text-emerald-400" />LIMIT {cam.speed_limit_kmh || 80} KM/H</div>
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-blue-950/0 group-hover:bg-blue-950/25 transition"><span className="opacity-0 group-hover:opacity-100 transition bg-white text-slate-950 px-5 py-3 rounded-xl text-sm font-black shadow-2xl">OPEN CAMERA</span></div>
                    </button>

                    <div className="px-4 lg:px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 className="w-4 h-4 text-emerald-600" />Vision stream healthy</div><div className="flex gap-2"><label className="cursor-pointer inline-flex items-center gap-1.5 bg-white text-slate-700 text-xs font-bold px-3 py-2 rounded-lg border border-slate-300"><Upload className="w-4 h-4 text-blue-600" />{uploading[cam.id] ? 'Uploading...' : 'Replace'}<input type="file" accept="video/mp4,video/*" className="hidden" onChange={e=>handleFileUpload(cam.id,e.target.files?.[0])}/></label><button onClick={()=>setSelectedCamera(cam)} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-2 rounded-lg"><Maximize2 className="w-4 h-4" />Open</button></div></div>
                  </article>
                );
              })}
            </section>

            {/* ANPR EVENTS BELOW THE WALL */}
            <section className="mt-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div className="flex items-center gap-2"><SearchIcon /><h2 className="text-lg lg:text-xl font-black">ANPR Detection Stream</h2></div><p className="mt-1 text-sm text-slate-500 font-semibold">Latest recognized vehicle events across all camera nodes.</p></div><div className="flex gap-2 p-1 bg-slate-100 rounded-xl"><button onClick={()=>setFilterAlertsOnly(false)} className={`px-4 py-2.5 rounded-lg text-sm font-black ${!filterAlertsOnly?'bg-white shadow-sm text-slate-950':'text-slate-500'}`}>All Passes ({detections.length})</button><button onClick={()=>setFilterAlertsOnly(true)} className={`px-4 py-2.5 rounded-lg text-sm font-black ${filterAlertsOnly?'bg-red-600 text-white':'text-slate-500'}`}>Flagged ({flaggedCount})</button></div></div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">{loading ? <div className="md:col-span-2 xl:col-span-4 py-10 text-center text-sm font-semibold text-slate-400">Loading ANPR events...</div> : displayed.length ? displayed.slice(0,8).map(d=>{const flagged=d.is_blacklisted===1||d.is_blacklisted===true; return <button type="button" key={d.id} onClick={()=>onSelectPlate?.(d.plate_number)} className={`text-left p-4 rounded-xl border ${flagged?'bg-red-50 border-red-300':'bg-slate-50 border-slate-200 hover:border-blue-300'}`}><div className="flex justify-between gap-2"><span className="font-mono font-black text-base bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">{d.plate_number||'PLATE PENDING'}</span>{flagged&&<ShieldAlert className="w-5 h-5 text-red-600"/>}</div><p className="mt-3 text-sm font-bold truncate">{d.camera_name||d.camera_id}</p><div className="mt-2 flex justify-between text-sm"><span className="font-semibold text-slate-500">{d.vehicle_type||'Vehicle'}</span><span className="font-black text-emerald-600">{((d.confidence||0)*100).toFixed(1)}%</span></div><p className="mt-1 text-sm font-semibold text-slate-500">{d.speed_estimate_kmh??'--'} km/h</p></button>}) : <div className="md:col-span-2 xl:col-span-4 py-10 text-center text-sm font-semibold text-slate-400">No ANPR events logged yet.</div>}</div>
            </section>
          </div>
        </main>
      </div>

      {/* CAMERA DETAIL */}
      {selectedCamera && <div className="fixed inset-0 z-[100] bg-[#030811] flex flex-col"><div className="h-[78px] shrink-0 bg-[#0b1525] border-b border-slate-700 px-4 lg:px-6 flex items-center justify-between text-white"><div className="flex items-center gap-4 min-w-0"><button onClick={()=>setSelectedCamera(null)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-sm font-black shrink-0"><ArrowLeft className="w-4 h-4"/>Back to Camera Wall</button><div className="min-w-0"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"/><h2 className="text-lg lg:text-xl font-black truncate">{selectedCamera.name}</h2></div><p className="text-sm text-slate-400 truncate">{selectedCamera.location}</p></div></div><button onClick={()=>setSelectedCamera(null)} className="p-3 rounded-xl bg-slate-800 hover:bg-red-600 border border-slate-700"><X className="w-5 h-5"/></button></div><div className="flex-1 min-h-0 flex items-center justify-center bg-black"><img src={`${API_URL}/api/video_feed/${selectedCamera.id}`} className="w-full h-full object-contain"/><div className="absolute bottom-5 left-5 px-4 py-2.5 rounded-xl bg-black/80 border border-emerald-400/20 text-emerald-300 text-sm font-black"><Zap className="inline w-4 h-4 mr-2"/>ANPR / OCR ACTIVE</div></div></div>}

      {showAddCamModal && <Modal title="Add New Camera Node" icon={Plus} onClose={()=>setShowAddCamModal(false)}><form onSubmit={handleAddCameraSubmit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Field label="Camera ID" value={newCam.id} onChange={v=>setNewCam({...newCam,id:v})} required/><Field label="Display Name" value={newCam.name} onChange={v=>setNewCam({...newCam,name:v})} required/></div><Field label="Location" value={newCam.location} onChange={v=>setNewCam({...newCam,location:v})} required/><div className="grid sm:grid-cols-3 gap-4"><Field label="Latitude" value={newCam.lat} onChange={v=>setNewCam({...newCam,lat:v})}/><Field label="Longitude" value={newCam.lon} onChange={v=>setNewCam({...newCam,lon:v})}/><Field label="Speed Limit" value={newCam.speed_limit_kmh} onChange={v=>setNewCam({...newCam,speed_limit_kmh:v})}/></div><Field label="Video Source" value={newCam.video_file} onChange={v=>setNewCam({...newCam,video_file:v})}/><ModalActions onCancel={()=>setShowAddCamModal(false)} submitLabel="Register Camera"/></form></Modal>}
      {showStreamModal && <Modal title="Connect Continuous Stream" icon={Radio} onClose={()=>setShowStreamModal(false)}><form onSubmit={handleConnectStreamSubmit} className="space-y-4"><div><label className="block mb-1.5 text-sm font-bold">Camera Node</label><select value={streamConfig.targetCamId} onChange={e=>setStreamConfig({...streamConfig,targetCamId:e.target.value})} className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm font-semibold">{cameras.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label className="block mb-1.5 text-sm font-bold">Protocol</label><select value={streamConfig.protocol} onChange={e=>setStreamConfig({...streamConfig,protocol:e.target.value})} className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm font-semibold"><option value="rtsp">RTSP Stream</option><option value="hls">HTTP Live Stream</option><option value="webrtc">WebRTC</option></select></div><Field label="Stream URL" value={streamConfig.rtsp_url} onChange={v=>setStreamConfig({...streamConfig,rtsp_url:v})} required/><ModalActions onCancel={()=>setShowStreamModal(false)} submitLabel="Connect Stream" danger/></form></Modal>}
    </div>
  );
}

function SearchIcon(){return <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center"><Eye className="w-5 h-5 text-blue-600"/></div>}
function MetricCard({icon:Icon,label,value,detail,tone}){const tones={blue:'bg-blue-50 text-blue-600 border-blue-100',emerald:'bg-emerald-50 text-emerald-600 border-emerald-100',red:'bg-red-50 text-red-600 border-red-100',violet:'bg-violet-50 text-violet-600 border-violet-100'};return <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 shadow-sm"><div className="flex justify-between gap-3"><div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl lg:text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-400">{detail}</p></div><div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${tones[tone]}`}><Icon className="w-5 h-5"/></div></div></div>}
function Field({label,value,onChange,placeholder,required=false}){return <div><label className="block mb-1.5 text-sm font-bold text-slate-700">{label}</label><input type="text" value={value} placeholder={placeholder} required={required} onChange={e=>onChange(e.target.value)} className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"/></div>}
function Modal({title,icon:Icon,onClose,children}){return <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"><div className="p-5 border-b border-slate-200 flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-5 h-5"/></div><div><h3 className="text-xl font-black">{title}</h3><p className="text-sm text-slate-500">Configure a CityFLUX camera node</p></div></div><button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5"/></button></div><div className="p-5">{children}</div></div></div>}
function ModalActions({onCancel,submitLabel,danger=false}){return <div className="pt-4 border-t border-slate-200 flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className={`px-5 py-3 rounded-xl text-sm font-black text-white ${danger?'bg-red-600 hover:bg-red-700':'bg-blue-600 hover:bg-blue-700'}`}>{submitLabel}</button></div>}
