import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Clock, ShieldAlert, Zap, AlertTriangle, FileText, Printer, Lock, CheckCircle, Car, ArrowRight, Flame, ShieldCheck, Eye, Camera, BarChart3, Globe2, Server } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Custom Leaflet Icons for Camera Nodes
const cameraIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const redAlertIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/564/564619.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

export default function TrajectoryTracker({ selectedPlate, setSelectedPlate, onNavigate, alertCount = 0 }) {
  const [searchPlate, setSearchPlate] = useState(selectedPlate || 'TS 07 EA 9012');
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [barrierLocked, setBarrierLocked] = useState(false);
  const [mapMode, setMapMode] = useState('trajectory'); // 'trajectory' or 'heatmap'

  const fetchTrajectory = async (plate) => {
    setLoading(true);
    setError('');
    setBarrierLocked(false);
    try {
      const res = await axios.get(`/api/trajectory/${encodeURIComponent(plate)}`);
      setTrajectoryData(res.data);
    } catch (err) {
      setError('Failed to fetch trajectory data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('/api/audit-logs');
      setAuditLogs(res.data.audit_logs || []);
      setShowAuditModal(true);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  useEffect(() => {
    fetchTrajectory(searchPlate);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchPlate.trim()) {
      fetchTrajectory(searchPlate.trim());
    }
  };

  const handlePresetSelect = (plate) => {
    setSearchPlate(plate);
    fetchTrajectory(plate);
  };

  const handleBarrierLock = () => {
    setBarrierLocked(true);
  };

  // Node locations for Real-Time Traffic Density Heatmap
  const heatmapNodes = [
    { name: "CAM-01: MGIT Gate", lat: 17.3850, lon: 78.3180, density: 45, status: "Smooth", color: "#10b981" },
    { name: "CAM-02: Gandipet Circle", lat: 17.3910, lon: 78.3240, density: 78, status: "Moderate", color: "#f59e0b" },
    { name: "CAM-03: Kokapet SEZ", lat: 17.3980, lon: 78.3360, density: 32, status: "Smooth", color: "#10b981" },
    { name: "CAM-04: Narsingi Rotary", lat: 17.3800, lon: 78.3610, density: 95, status: "Congested", color: "#ef4444" }
  ];

  const navItems = [
    { id: 'surveillance', label: 'Multi-Cam Surveillance', icon: Camera },
    { id: 'trajectory', label: 'GIS Trajectory', icon: Navigation },
    { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert, badge: alertCount },
  ];

  return (
    <div className="min-h-screen bg-[#eef3f8] text-slate-900 flex">
      {/* CITYFLUX COMMAND SIDEBAR, shared visual language with Multi-Cam */}
      <aside className="hidden lg:flex w-[250px] shrink-0 bg-[#0b1424] text-white flex-col sticky top-0 h-screen border-r border-slate-800 z-40">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black tracking-tight text-base">CITYFLUX</p>
              <p className="text-[11px] text-slate-400 font-semibold tracking-widest">COMMAND CENTER</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="px-3 mb-2 text-[11px] uppercase tracking-[0.18em] font-bold text-slate-500">Operations</p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.id === 'trajectory';
              return (
                <button key={item.id} onClick={() => onNavigate?.(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-bold flex-1">{item.label}</span>
                  {item.badge > 0 && <span className="min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider">System Status</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-black text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">4/4 camera nodes responding</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* Page title, matching the first command-center screen */}
        <div className="bg-white border-b border-slate-200 px-5 lg:px-7 py-5 shrink-0">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl lg:text-[28px] font-black tracking-tight">GIS Trajectory &amp; Interception</h1>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black">CITYFLUX · SIH 26127</span>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">Spatial-temporal vehicle tracking, route reconstruction and predictive node intelligence.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> GIS ENGINE ONLINE
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
      {/* Search Header Bar with Quick Presets & Privacy Audit Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 shrink-0">
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              placeholder="Enter License Plate Number (e.g. TS 07 EA 9012)"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono font-extrabold pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-600 text-sm tracking-wider uppercase shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-sm transition shrink-0"
          >
            Reconstruct GIS Trajectory
          </button>
        </form>

        {/* Preset Badges & Audit Trail Action */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => handlePresetSelect('TS 07 EA 9012')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              searchPlate === 'TS 07 EA 9012'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            🎯 TS 07 EA 9012 (Stolen Bike Target)
          </button>
          <button
            onClick={() => handlePresetSelect('TS 08 AB 5678')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              searchPlate === 'TS 08 AB 5678'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🚗 TS 08 AB 5678 (Swift)
          </button>
          <button
            onClick={() => handlePresetSelect('TS 09 FL 9999')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
              searchPlate === 'TS 09 FL 9999'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ⚠️ TS 09 FL 9999 (Unpaid Fine)
          </button>

          {/* Privacy Audit Trail Button (Responsible AI) */}
          <button
            onClick={fetchAuditLogs}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Privacy Safeguards & Access Audit Logs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Officer Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Main Trajectory Workspace (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
        {/* Left Column (1 Col): Vehicle Profile & Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 shadow-sm overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-xs">
              Reconstructing GIS Trajectory...
            </div>
          ) : trajectoryData && trajectoryData.found ? (
            <>
              {/* Target Profile Card */}
              <div className={`p-4 rounded-xl border ${
                trajectoryData.is_blacklisted ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold">TARGET PROFILE</span>
                  {trajectoryData.is_blacklisted && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                      <ShieldAlert className="w-3 h-3" />
                      CRITICAL WATCHLIST
                    </span>
                  )}
                </div>

                <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-wider mb-2">
                  {trajectoryData.plate_number}
                </div>

                {trajectoryData.blacklist_details && (
                  <div className="text-xs text-slate-700 space-y-1 mb-3 pt-2 border-t border-red-200">
                    <div>Owner: <strong className="text-slate-900">{trajectoryData.blacklist_details.owner_name}</strong></div>
                    <div>Model: <strong>{trajectoryData.blacklist_details.vehicle_model}</strong></div>
                    <div className="text-red-700 font-bold text-[11px]">Reason: {trajectoryData.blacklist_details.reason}</div>
                  </div>
                )}

                {/* Metrics Summary */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">TOTAL DIST</div>
                    <div className="font-extrabold text-slate-900">{trajectoryData.total_distance_km} km</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">NODES</div>
                    <div className="font-extrabold text-emerald-700">{trajectoryData.unique_nodes_passed} / 4</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold">PASSES</div>
                    <div className="font-extrabold text-blue-700">{trajectoryData.total_detections}</div>
                  </div>
                </div>
              </div>

              {/* Export Official PDF Report Action */}
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Export Surveillance Report (PDF)</span>
              </button>

              {/* Route Anomalies Card */}
              {trajectoryData.anomalies && trajectoryData.anomalies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-red-700 flex items-center gap-1 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Route Anomalies ({trajectoryData.anomalies.length})
                  </div>
                  {trajectoryData.anomalies.map((a, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 shadow-2xs">
                      <div className="font-bold flex items-center justify-between mb-1">
                        <span>{a.type}</span>
                        <span className="text-[10px] font-mono text-red-700">{a.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug">{a.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-4 text-center">
              <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
              <span className="font-bold text-slate-700 text-sm mb-1">No Trajectory Recorded</span>
              <span>Vehicle plate "{searchPlate}" has no recorded passes in the Hyderabad network.</span>
            </div>
          )}
        </div>

        {/* Center Column (2 Cols): Predictive Banner + Interactive GIS Map */}
        <div className="lg:col-span-2 flex flex-col gap-3 h-full overflow-hidden">
          {/* High-Impact Hero Predictive Interception Banner */}
          {trajectoryData && trajectoryData.next_predicted_node && (
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-4 shadow-md shrink-0 border border-blue-700/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-bold mb-1">
                    <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>PREDICTIVE NEXT-NODE INTERCEPTION</span>
                    <span className="bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] px-2 py-0.5 rounded font-extrabold">
                      {trajectoryData.next_predicted_node.confidence_score}
                    </span>
                  </div>
                  <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>{trajectoryData.next_predicted_node.predicted_node}</span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <span className="text-amber-300 font-mono text-sm">ETA ~{trajectoryData.next_predicted_node.estimated_eta_mins} mins</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Recommended Action: <strong className="text-emerald-400">{trajectoryData.next_predicted_node.action}</strong>
                  </div>
                </div>

                {/* Emergency Barrier Lockdown Interactive Command */}
                <div>
                  {barrierLocked ? (
                    <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-2 animate-pulse">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>TOLL BARRIER LOCKED AT {trajectoryData.next_predicted_node.predicted_node.split(':')[0]}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleBarrierLock}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform active:scale-95"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Deploy Toll Gate Barrier Lockdown Signal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive GIS Leaflet Map with Trajectory / Traffic Heatmap Layer Toggle */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative flex-1">
            <MapContainer
              center={[17.3880, 78.3350]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Trajectory Route Mode */}
              {mapMode === 'trajectory' && trajectoryData && trajectoryData.path_coordinates && (
                <>
                  <MapRecenter coords={trajectoryData.path_coordinates} />
                  
                  {/* Route Polyline connecting cameras */}
                  <Polyline
                    positions={trajectoryData.path_coordinates}
                    pathOptions={{
                      color: trajectoryData.is_blacklisted ? '#dc2626' : '#2563eb',
                      weight: 5,
                      dashArray: '8, 8',
                      opacity: 0.85
                    }}
                  />

                  {/* Markers for each camera pass */}
                  {trajectoryData.trajectory.map((p) => (
                    <Marker
                      key={p.sequence}
                      position={[p.lat, p.lon]}
                      icon={p.is_blacklisted ? redAlertIcon : cameraIcon}
                    >
                      <Popup>
                        <div className="p-1 font-mono text-xs">
                          <div className="font-bold text-slate-900 mb-1">{p.camera_name}</div>
                          <div className="text-slate-600">Time: {p.timestamp}</div>
                          <div className="text-slate-600">Speed: {p.recorded_speed_kmh} km/h</div>
                          <div className="text-emerald-700 font-bold mt-1">Passage #{p.sequence}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </>
              )}

              {/* Real-Time City Traffic Density Heatmap Layer Mode (SIH Explicit Deliverable!) */}
              {mapMode === 'heatmap' && (
                <>
                  {heatmapNodes.map((h, idx) => (
                    <React.Fragment key={idx}>
                      <CircleMarker
                        center={[h.lat, h.lon]}
                        radius={h.density / 2}
                        pathOptions={{
                          fillColor: h.color,
                          fillOpacity: 0.35,
                          color: h.color,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="p-1 font-mono text-xs">
                            <div className="font-bold text-slate-900">{h.name}</div>
                            <div className="text-slate-700">Traffic Density: <strong>{h.density} veh/min</strong></div>
                            <div className="text-slate-700">Status: <strong style={{ color: h.color }}>{h.status}</strong></div>
                          </div>
                        </Popup>
                      </CircleMarker>
                      <CircleMarker
                        center={[h.lat, h.lon]}
                        radius={6}
                        pathOptions={{ fillColor: h.color, fillOpacity: 0.9, color: '#ffffff', weight: 2 }}
                      />
                    </React.Fragment>
                  ))}
                </>
              )}
            </MapContainer>

            {/* Map Mode Layer Selector (Trajectory Route vs Traffic Heatmap) */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1 text-xs font-mono font-bold">
              <button
                onClick={() => setMapMode('trajectory')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  mapMode === 'trajectory' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GIS Trajectory Route</span>
              </button>
              <button
                onClick={() => setMapMode('heatmap')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  mapMode === 'heatmap' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>City Traffic Heatmap Layer</span>
              </button>
            </div>

            {/* Map Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 z-[1000] flex items-center gap-3 shadow-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>HYDERABAD GIS NODE NETWORK</span>
              </div>
              <span className="text-slate-300">|</span>
              <span>4 CAMERA NODES ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Chronological Node Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full shadow-sm overflow-hidden">
          <div className="text-xs font-extrabold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-200 pb-2 shrink-0">
            Chronological Node Timeline
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {trajectoryData && trajectoryData.trajectory ? (
              <div className="relative border-l-2 border-blue-500 ml-3 space-y-3.5 pl-4">
                {trajectoryData.trajectory.map((point) => (
                  <div key={point.sequence} className="relative bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs">
                    {/* Node Dot */}
                    <span className="absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-2xs"></span>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{point.camera_name}</span>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {point.timestamp.split(' ')[1]}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{point.location}</span>
                    </div>

                    {point.sequence > 1 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-600 font-semibold">
                        <span>Speed: {point.recorded_speed_kmh} km/h</span>
                        <span>Time: {point.travel_time_min} mins</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-mono">No timeline nodes logged.</div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Audit Trail Modal (Responsible AI Safeguards) */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-[3000]">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Officer Search Query Audit Logs (Privacy & Compliance)
                </h3>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Every search query is immutably logged for legal compliance, preventing unauthorized surveillance abuse.
            </p>

            <table className="w-full text-left text-xs font-mono border border-slate-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-bold">OFFICER ID</th>
                  <th className="p-2.5 font-bold">PLATE QUERIED</th>
                  <th className="p-2.5 font-bold">TIMESTAMP</th>
                  <th className="p-2.5 font-bold">WARRANT / REASON</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 text-slate-900 font-semibold">{log.officer_id}</td>
                    <td className="p-2.5 text-blue-700 font-extrabold">{log.plate_queried}</td>
                    <td className="p-2.5 text-slate-600">{log.timestamp}</td>
                    <td className="p-2.5 text-slate-700 font-medium">{log.warrant_no}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <button onClick={() => setShowAuditModal(false)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Close Audit Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Official Police Investigation Surveillance Report Printable Modal */}
      {showReportModal && trajectoryData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-[3000]">
          <div className="bg-white border border-slate-300 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                  HYDERABAD CITY POLICE SURVEILLANCE REPORT
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Multi-Camera ANPR Trajectory Tracking & Forensic Analysis Docket
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-500">
                <div>DOCKET NO: #HYD-ANPR-2026-9012</div>
                <div>DATE: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block font-semibold">VEHICLE PLATE NUMBER</span>
                  <span className="text-base font-extrabold text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {trajectoryData.plate_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">WARRANT & STATUS</span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                    {trajectoryData.is_blacklisted ? 'SECURITY WATCHLIST / STOLEN' : 'NORMAL COMMUTER'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">REGISTERED OWNER</span>
                  <span className="text-slate-900 font-bold">{trajectoryData.blacklist_details?.owner_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">VEHICLE MODEL</span>
                  <span className="text-slate-900 font-bold">{trajectoryData.blacklist_details?.vehicle_model || 'N/A'}</span>
                </div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Reconstructed Spatial-Temporal Trajectory ({trajectoryData.unique_nodes_passed} Camera Nodes)
            </h3>
            <table className="w-full text-left text-xs font-mono mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-bold">SEQ</th>
                  <th className="p-2.5 font-bold">NODE NAME</th>
                  <th className="p-2.5 font-bold">TIMESTAMP</th>
                  <th className="p-2.5 font-bold">SPEED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trajectoryData.trajectory.map((p) => (
                  <tr key={p.sequence}>
                    <td className="p-2.5 font-bold">{p.sequence}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{p.camera_name}</td>
                    <td className="p-2.5">{p.timestamp}</td>
                    <td className="p-2.5 font-bold text-blue-700">{p.recorded_speed_kmh} km/h</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {trajectoryData.next_predicted_node && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-900">
                <div className="font-extrabold text-blue-800 mb-1">PREDICTIVE INTERCEPTION COMMAND</div>
                <div>Target Predicted Node: <strong>{trajectoryData.next_predicted_node.predicted_node}</strong></div>
                <div>Interception Action: <strong>{trajectoryData.next_predicted_node.action}</strong></div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300">Close Report</button>
              <button onClick={() => window.print()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm">
                <Printer className="w-4 h-4" />
                <span>Print / Save as Official PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
