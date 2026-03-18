import React, { useState, useMemo, useEffect } from 'react';
import { IdpMode } from '../App';
import './TokenLab.css';

// A realistic mock Auth0 ID Token
const auth0HeaderObj = { alg: "RS256", kid: "mock-key-id" };
const auth0PayloadObj = {
  sub: "auth0|1234567890",
  name: "Dev Eloper",
  email: "developer@idplayground.local",
  iss: "https://dev-xxxx.us.auth0.com/",
  aud: "auth0_client_id_123",
  iat: 1710000000,
  exp: 1710003600,
  jti: "id.12345",
  "https://idplayground.local/groups": ["Everyone", "Developers"]
};

// A realistic mock Okta ID Token
const oktaHeaderObj = { alg: "RS256", kid: "okta-mock-key-id" };
const oktaPayloadObj = {
  sub: "00u1234567890",
  name: "Dev Eloper",
  email: "developer@idplayground.local",
  iss: "https://dev-xxxx.okta.com/oauth2/default",
  aud: "okta_client_id_123",
  iat: 1710000000,
  exp: 1710003600,
  jti: "id.okta.12345",
  groups: ["Everyone", "Developers"]
};

const AUTH0_MOCK_TOKEN = `${btoa(JSON.stringify(auth0HeaderObj))}.${btoa(JSON.stringify(auth0PayloadObj))}.mock-signature-bytes-that-would-be-here`;
const OKTA_MOCK_TOKEN = `${btoa(JSON.stringify(oktaHeaderObj))}.${btoa(JSON.stringify(oktaPayloadObj))}.mock-signature-bytes-that-would-be-here`;

const decodeBase64Url = (str: string) => {
  try {
    // Pad string with trailing '='
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    // Decode base64 to string, then parse JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const highlightJSON = (jsonString: string) => {
  const escaped = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlighted = escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'json-value';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    } else {
      cls = 'json-number';
    }
    return `<span class="${cls}">${match}</span>`;
  });
  return { __html: highlighted };
};

export const TokenLab: React.FC<{ idpMode: IdpMode }> = ({ idpMode }) => {
  const defaultToken = idpMode === 'auth0' ? AUTH0_MOCK_TOKEN : OKTA_MOCK_TOKEN;
  const [inputToken, setInputToken] = useState(defaultToken);
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (!isCustomMode) {
      setInputToken(defaultToken);
    }
  }, [idpMode, defaultToken, isCustomMode]);

  const handleToggleMode = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
      setInputToken(defaultToken);
    } else {
      setIsCustomMode(true);
      setInputToken('');
    }
  };

  const parts = inputToken.split('.');
  const header = parts[0] || '';
  const payload = parts[1] || '';
  const signature = parts[2] || '';

  const decodedPayload = useMemo(() => {
    if (!payload) return null;
    return decodeBase64Url(payload);
  }, [payload]);

  const decodedHeader = useMemo(() => {
    if (!header) return null;
    return decodeBase64Url(header);
  }, [header]);

  const isValidJWT = parts.length === 3 && decodedHeader && decodedPayload;

  return (
    <div className="token-lab">
      <div className="token-lab-header" style={{ marginBottom: '1rem' }}>
        <button className="simulate-btn" onClick={handleToggleMode}>
          {isCustomMode ? '[-] Reset to Default Mock' : '[+] Try your own JWT'}
        </button>
      </div>

      <div className="token-lab-section">
        <h3 className="section-title">Raw JSON Web Token (JWT)</h3>
        <p className="text-muted token-lab-section-desc">
          A JWT consists of three parts separated by dots (<code>.</code>): Header, Payload, and Signature.
        </p>
        
        {isCustomMode ? (
          <textarea
            className="api-input terminal-textarea"
            style={{ width: '100%', minHeight: '100px', fontFamily: 'var(--font-mono)', padding: '1rem', backgroundColor: '#000', color: 'var(--text-light)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            placeholder="Paste a Base64Url JWT here..."
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
          />
        ) : (
          <div className="raw-token-box">
            <span className="token-part-header">{header}</span>
            <span className="token-dot">.</span>
            <span className="token-part-payload">{payload}</span>
            <span className="token-dot">.</span>
            <span className="token-part-signature">{signature}</span>
          </div>
        )}
      </div>

      <div className="token-lab-grid">
        <div className="token-lab-section">
          <h3 className="section-title">Decoded Payload</h3>
          <div className="terminal-box">
            <pre>
              <code>
                {(!inputToken && isCustomMode) ? (
                  <span className="text-muted">Awaiting JWT...</span>
                ) : decodedPayload ? (
                  <span dangerouslySetInnerHTML={highlightJSON(JSON.stringify(decodedPayload, null, 2))} />
                ) : (
                  <span style={{ color: '#ef4444' }}>{'>'} ERROR: Invalid JWT signature</span>
                )}
              </code>
            </pre>
          </div>
        </div>

        {isValidJWT && (
          <div className="token-lab-section">
            <h3 className="section-title">Claims Explainer</h3>
            <div className="claims-explainer">
              <div className="claim-card">
                <div className="claim-header">
                  <span className="claim-key">sub</span> (Subject)
                </div>
                <div className="claim-body">
                  The unique identifier for the user in {idpMode === 'auth0' ? 'Auth0' : 'Okta'}. This is the primary key you should use to link this {idpMode === 'auth0' ? 'Auth0' : 'Okta'} user to a user record in your own database.
                  <br /><br />
                  <strong>Value:</strong> <code>{decodedPayload?.sub || 'N/A'}</code>
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-header">
                  <span className="claim-key">iss</span> (Issuer)
                </div>
                <div className="claim-body">
                  The URL of the {idpMode === 'auth0' ? 'Auth0' : 'Okta'} Authorization Server that issued this token. Your application must validate that this matches your expected {idpMode === 'auth0' ? 'Auth0' : 'Okta'} Domain to prevent token spoofing.
                  <br /><br />
                  <strong>Value:</strong> <code>{decodedPayload?.iss || 'N/A'}</code>
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-header">
                  <span className="claim-key">{idpMode === 'auth0' ? 'https://idplayground.local/groups' : 'groups'}</span> (Custom Claim)
                </div>
                <div className="claim-body">
                  A list of groups the user belongs to. {idpMode === 'auth0' ? 'In Auth0, custom claims must be namespaced with a URI to prevent collisions with standard OIDC claims.' : 'In Okta, custom claims can be added directly without a namespace if configured in the Authorization Server.'} This is often used for Role-Based Access Control (RBAC).
                  <br /><br />
                  <strong>Value:</strong> <code>{decodedPayload ? JSON.stringify(idpMode === 'auth0' ? decodedPayload['https://idplayground.local/groups'] : decodedPayload.groups) : 'N/A'}</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
