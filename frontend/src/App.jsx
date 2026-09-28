import React, { useState, useEffect } from 'react';
import MultiCamViewer from './components/MultiCamViewer';
import TrajectoryTracker from './components/TrajectoryTracker';
import TrafficAnalytics from './components/TrafficAnalytics';
import AlertCenter from './components/AlertCenter';
import api from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('multicam');
  const [selectedPlate, setSelectedPlate] = useState('TS 07 EA 9012');
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const res = await api.get('/api/alerts');
        setAlertCount(res.data.total_active_alerts || res.data.filter?.((a) => a.status === 'NEW').length || 0);
      } catch (err) {
        console.error('Error checking alerts:', err);
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPlate = (plate) => {
    setSelectedPlate(plate);
    setActiveTab('trajectory');
  };

  const handleNavigate = (section) => {
    const routes = {
      surveillance: 'multicam',
      multicam: 'multicam',
      trajectory: 'trajectory',
      analytics: 'analytics',
      alerts: 'alerts',
    };
    if (routes[section]) setActiveTab(routes[section]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <main className="min-h-screen">
        {activeTab === 'multicam' && (
          <MultiCamViewer
            onSelectPlate={handleSelectPlate}
            onNavigate={handleNavigate}
            alertCount={alertCount}
          />
        )}
        {activeTab === 'trajectory' && (
          <TrajectoryTracker
            selectedPlate={selectedPlate}
            setSelectedPlate={setSelectedPlate}
            onNavigate={handleNavigate}
            alertCount={alertCount}
          />
        )}
        {activeTab === 'analytics' && (
          <TrafficAnalytics onNavigate={handleNavigate} />
        )}
        {activeTab === 'alerts' && (
          <AlertCenter onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}
