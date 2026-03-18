export type FlightLogType = 'OIDC_REDIRECT' | 'TOKEN_EXCHANGE' | 'USERINFO_REQUEST' | 'USERINFO_RESPONSE';

export interface FlightLog {
  id: string;
  timestamp: string;
  type: FlightLogType;
  summary: string;
  payload: Record<string, unknown>;
}

export const simulateLoginFlow = (idpMode: 'auth0' | 'okta'): FlightLog[] => {
  const now = Date.now();
  
  if (idpMode === 'okta') {
    return [
      {
        id: `log-${now}-1`,
        timestamp: new Date(now).toISOString(),
        type: 'OIDC_REDIRECT',
        summary: 'Redirecting to Okta /authorize endpoint',
        payload: {
          url: 'https://dev-xxxx.okta.com/oauth2/default/v1/authorize',
          client_id: '0oa1a2b3c4d5e6f7g8h9',
          response_type: 'code',
          scope: 'openid profile email groups',
          state: 'state-8a9b0c1d2e3f',
          code_challenge: 'QY_xyz_base64url_encoded_challenge_string',
          code_challenge_method: 'S256',
        }
      },
      {
        id: `log-${now}-2`,
        timestamp: new Date(now + 500).toISOString(),
        type: 'TOKEN_EXCHANGE',
        summary: 'Exchanging authorization code for tokens via /v1/token',
        payload: {
          grant_type: 'authorization_code',
          code: 'splxlOBeZQQYbYS6WxSbIA',
          client_id: '0oa1a2b3c4d5e6f7g8h9',
        }
      },
      {
        id: `log-${now}-3`,
        timestamp: new Date(now + 1000).toISOString(),
        type: 'USERINFO_REQUEST',
        summary: 'Requesting user profile from Okta API',
        payload: {
          method: 'GET',
          url: 'https://dev-xxxx.okta.com/oauth2/default/v1/userinfo',
          headers: {
            Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      },
      {
        id: `log-${now}-4`,
        timestamp: new Date(now + 1500).toISOString(),
        type: 'USERINFO_RESPONSE',
        summary: 'Received /userinfo profile data',
        payload: {
          sub: '00u1a2b3c4d5e6f7g8h9',
          name: 'Dev Eloper',
          email: 'developer@idplayground.local',
          groups: ['Everyone', 'Beta_Testers']
        }
      }
    ];
  }

  return [
    {
      id: `log-${now}-1`,
      timestamp: new Date(now).toISOString(),
      type: 'OIDC_REDIRECT',
      summary: 'Redirecting to Auth0 /authorize endpoint',
      payload: {
        url: 'https://dev-xxxx.us.auth0.com/authorize',
        client_id: 'auth0_client_id_123',
        response_type: 'code',
        scope: 'openid profile email groups',
        state: 'state-8a9b0c1d2e3f',
        code_challenge: 'QY_xyz_base64url_encoded_challenge_string',
        code_challenge_method: 'S256',
      }
    },
    {
      id: `log-${now}-2`,
      timestamp: new Date(now + 500).toISOString(),
      type: 'TOKEN_EXCHANGE',
      summary: 'Exchanging authorization code for tokens via /oauth/token',
      payload: {
        grant_type: 'authorization_code',
        code: 'splxlOBeZQQYbYS6WxSbIA',
        client_id: 'auth0_client_id_123',
      }
    },
    {
      id: `log-${now}-3`,
      timestamp: new Date(now + 1000).toISOString(),
      type: 'USERINFO_REQUEST',
      summary: 'Requesting user profile from Auth0 API',
      payload: {
        method: 'GET',
        url: 'https://dev-xxxx.us.auth0.com/userinfo',
        headers: {
          Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    },
    {
      id: `log-${now}-4`,
      timestamp: new Date(now + 1500).toISOString(),
      type: 'USERINFO_RESPONSE',
      summary: 'Received /userinfo profile data',
      payload: {
        sub: 'auth0|1234567890',
        name: 'Dev Eloper',
        email: 'developer@idplayground.local',
        groups: ['Everyone', 'Beta_Testers']
      }
    }
  ];
};
