import React, { useState, useEffect } from 'react';
import { Sidebar, ViewState } from './components/Sidebar';
import { FlightRecorder } from './components/FlightRecorder';
import { TokenLab } from './components/TokenLab';
import { ApiExplorer } from './components/ApiExplorer';
import { simulateLoginFlow, FlightLog } from './utils/mockAuthEngine';
import './App.css';

export type IdpMode = 'auth0' | 'okta';

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('Token Lab');
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [idpMode, setIdpMode] = useState<IdpMode>(() => {
    const saved = localStorage.getItem('idpMode');
    return (saved === 'auth0' || saved === 'okta') ? saved : 'auth0';
  });

  useEffect(() => {
    localStorage.setItem('idpMode', idpMode);
    if (idpMode === 'auth0') {
      document.body.classList.add('theme-auth0');
      document.body.classList.remove('theme-okta');
    } else {
      document.body.classList.add('theme-okta');
      document.body.classList.remove('theme-auth0');
    }
  }, [idpMode]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setFlightLogs(simulateLoginFlow());
    setIsSimulating(false);
  };

  return (
    <div className={`app-container theme-${idpMode}`}>
      <Sidebar activeView={activeView} onViewChange={setActiveView} idpMode={idpMode} setIdpMode={setIdpMode} />
      
      <main className="main-stage">
        <header className="panel">
          <h2>{activeView}</h2>
          <p className="text-muted">
            {activeView === 'Token Lab' && `Decode, inspect, and validate ${idpMode === 'auth0' ? 'Auth0' : 'Okta'} OIDC JWTs (ID, Access, Refresh tokens).`}
            {activeView === 'API Explorer' && `Interact with ${idpMode === 'auth0' ? 'Auth0' : 'Okta'} Admin APIs using scoped tokens.`}
            {activeView === 'Flight Recorder' && 'Visualize the underlying protocol handshakes (PKCE, Scopes, Redirects).'}
          </p>
        </header>

        <section className="panel main-stage-content">
          {activeView === 'Flight Recorder' ? (
            <div className="flight-recorder-container">
              <div className="simulate-btn-container">
                <button 
                  className="simulate-btn"
                  onClick={handleSimulate} 
                  disabled={isSimulating}
                >
                  {isSimulating ? 'Simulating...' : 'Run OIDC Simulation'}
                </button>
              </div>
              <FlightRecorder logs={flightLogs} />
            </div>
          ) : activeView === 'Token Lab' ? (
            <TokenLab idpMode={idpMode} />
          ) : activeView === 'API Explorer' ? (
            <ApiExplorer idpMode={idpMode} />
          ) : (
            <div className="terminal-output">
              <span className="prompt-char">{'>'}</span> Awaiting {activeView} initialization...
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
