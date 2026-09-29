import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { Screen } from './components/Sidebar';
import { Dashboard } from './screens/Dashboard';
import { MapView } from './screens/MapView';
import { RiskAnalysis } from './screens/RiskAnalysis';
import { AIAdvisory } from './screens/AIAdvisory';
import { UserFlow } from './screens/UserFlow';
import { MobilePreview } from './screens/MobilePreview';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar active={screen} onNavigate={setScreen} />
      <main className="flex-1 overflow-hidden relative">
        {screen === 'userflow'  && <UserFlow />}
        {screen === 'dashboard' && <Dashboard onNavigate={setScreen} />}
        {screen === 'map'       && <MapView />}
        {screen === 'risk'      && <RiskAnalysis />}
        {screen === 'advisory'  && <AIAdvisory />}
        {screen === 'mobile'    && <MobilePreview />}
      </main>
    </div>
  );
}
