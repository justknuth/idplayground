import React, { useState, useEffect } from 'react';
import { IdpMode } from '../App';
import './ApiExplorer.css';

type Endpoint = string;

const AUTH0_ENDPOINTS: Endpoint[] = [
  '/api/v2/users',
  '/api/v2/roles',
  '/api/v2/logs',
  '/api/v2/clients',
  '/api/v2/tenant/settings',
  '/api/v2/actions/actions',
  '/api/v2/connections',
  '/api/v2/grants',
  '/api/v2/device-credentials',
  '/api/v2/stats/daily'
];

const OKTA_ENDPOINTS: Endpoint[] = [
  '/api/v1/users',
  '/api/v1/logs',
  '/api/v1/groups',
  '/api/v1/apps',
  '/api/v1/sessions',
  '/api/v1/policies',
  '/api/v1/zones',
  '/api/v1/trustedOrigins',
  '/api/v1/authorizationServers'
];

export const ApiExplorer: React.FC<{ idpMode: IdpMode }> = ({ idpMode }) => {
  const [domain, setDomain] = useState<string>(
    import.meta.env.VITE_AUTH0_DOMAIN || 'dev-xxxx.us.auth0.com'
  );
  const [apiToken, setApiToken] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>('/api/v2/users');
  const [responsePayload, setResponsePayload] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const endpoints = idpMode === 'auth0' ? AUTH0_ENDPOINTS : OKTA_ENDPOINTS;

  useEffect(() => {
    setSelectedEndpoint(endpoints[0]);
    if (idpMode === 'okta') {
      setDomain(import.meta.env.VITE_OKTA_DOMAIN || 'dev-xxxx.okta.com');
    } else {
      setDomain(import.meta.env.VITE_AUTH0_DOMAIN || 'dev-xxxx.us.auth0.com');
    }
  }, [idpMode, endpoints]);

  const handleFetch = async () => {
    if (!apiToken.trim()) {
      setResponsePayload(JSON.stringify({ error: 'Missing Auth0 Management API Token. Please provide a token to proceed.' }, null, 2));
      return;
    }

    setIsLoading(true);
    setResponsePayload(null);
    
    try {
      const res = await fetch('/api/IdpProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: selectedEndpoint, domain, idpMode, token: apiToken })
      });
      
      const data = await res.json();
      setResponsePayload(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponsePayload(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-explorer">
      <div className="api-form-section">
        <div className="api-security-badge">
          <span className="prompt-char">✓</span> Pass-Through Mode: API Token is sent securely to the backend proxy.
        </div>
        
        <div className="form-group">
          <label htmlFor="domain">{idpMode === 'auth0' ? 'Auth0' : 'Okta'} Domain</label>
          <input 
            type="text" 
            id="domain" 
            value={domain} 
            onChange={(e) => setDomain(e.target.value)} 
            className="api-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiToken">{idpMode === 'auth0' ? 'Auth0 Management API Token' : 'Okta API Token'}</label>
          <input 
            type="password" 
            id="apiToken" 
            value={apiToken} 
            onChange={(e) => setApiToken(e.target.value)} 
            className="api-input"
            placeholder="ey..."
          />
          <small className="security-tooltip" style={{ color: 'var(--success-green)', display: 'block', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Zero-Retention Mode: Token is held in memory and passed securely to the backend proxy. It is never stored in your browser.
          </small>
        </div>
      </div>

      <div className="api-action-section">
        <div className="form-group row-group">
          <label htmlFor="endpoint">Endpoint:</label>
          <select 
            id="endpoint" 
            value={selectedEndpoint} 
            onChange={(e) => setSelectedEndpoint(e.target.value as Endpoint)}
            className="api-select"
          >
            {endpoints.map(ep => (
              <option key={ep} value={ep}>{ep}</option>
            ))}
          </select>
          <button 
            className="simulate-btn" 
            onClick={handleFetch}
            disabled={isLoading}
          >
            {isLoading ? 'Fetching...' : 'Send Request'}
          </button>
        </div>
      </div>

      <div className="api-response-section">
        <div className="terminal-box">
          <div className="glue-header">
            // Response Payload
          </div>
          <pre>
            <code>
              {responsePayload ? responsePayload : <span className="text-muted">Awaiting request...</span>}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
