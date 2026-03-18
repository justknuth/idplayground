import React from 'react';
import { ROITicker } from './ROITicker';
import { IdpMode } from '../App';
import './Sidebar.css';

export type ViewState = 'Token Lab' | 'API Explorer' | 'Flight Recorder';

export interface SidebarProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  idpMode: IdpMode;
  setIdpMode: (mode: IdpMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, idpMode, setIdpMode }) => {
  const views: ViewState[] = ['Token Lab', 'API Explorer', 'Flight Recorder'];

  return (
    <aside className="sidebar">
      <h1 className="brand-title">IDPlayground</h1>
      
      <div className="idp-toggle-container" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', background: 'var(--bg-dark)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setIdpMode('auth0')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: idpMode === 'auth0' ? 'var(--auth0-orange)' : 'transparent', color: idpMode === 'auth0' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          Auth0
        </button>
        <button 
          onClick={() => setIdpMode('okta')}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', background: idpMode === 'okta' ? 'var(--okta-blue)' : 'transparent', color: idpMode === 'okta' ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', transition: 'all 0.2s' }}
        >
          Okta
        </button>
      </div>

      <nav>
        <ul className="nav-list">
          {views.map((view) => (
            <li key={view}>
              <button
                className={`nav-button ${activeView === view ? 'active' : ''}`}
                onClick={() => onViewChange(view)}
              >
                <span className="prompt-char">{'>'}</span> {view}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="roi-container">
        <span className="roi-label">Developer ROI Ticker</span>
        {/* Starting with a baseline of $1,250 saved for demonstration */}
        <ROITicker initialAmount={1250.00} />
      </div>
    </aside>
  );
};
