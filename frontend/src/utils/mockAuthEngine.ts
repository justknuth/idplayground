export type FlightLogType = 'OIDC_REDIRECT' | 'TOKEN_EXCHANGE' | 'USERINFO_REQUEST' | 'USERINFO_RESPONSE';

export interface FlightLog {
  id: string;
  timestamp: string;
  type: FlightLogType;
  summary: string;
  payload: Record<string, unknown>;
}

export const simulateLoginFlow = (): FlightLog[] => {
  const now = Date.now();
  
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
