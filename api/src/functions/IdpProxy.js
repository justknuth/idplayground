const { app } = require('@azure/functions');

app.http('IdpProxy', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            // 1. Parse the incoming request body to get the requested endpoint, domain, idpMode, and token
            const body = await request.json();
            const endpoint = body.endpoint;
            const domain = body.domain;
            const idpMode = body.idpMode;
            const token = body.token;

            if (!endpoint || !domain || !idpMode || !token) {
                return {
                    status: 400,
                    jsonBody: { error: 'Missing endpoint, domain, idpMode, or token in request body' }
                };
            }

            const authHeader = idpMode === 'okta' ? `SSWS ${token}` : `Bearer ${token}`;

            // 2. Construct the full URL
            // Ensure domain doesn't have a trailing slash and endpoint has a leading slash
            const cleanDomain = domain.replace(/\/$/, '');
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const url = `https://${cleanDomain}${cleanEndpoint}`;

            // 3. Use the native Node fetch API to make a GET request to that URL
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            // 4. Return the resulting JSON back to the client. Include error handling for non-200 responses.
            if (!response.ok) {
                let errorDetails;
                try {
                    errorDetails = await response.json();
                } catch (e) {
                    errorDetails = await response.text();
                }

                context.log.error(`IDP API returned ${response.status}:`, errorDetails);
                
                return {
                    status: response.status,
                    jsonBody: { 
                        error: `IDP API error: ${response.statusText}`,
                        details: errorDetails
                    }
                };
            }

            const data = await response.json();

            return {
                status: 200,
                jsonBody: data
            };

        } catch (error) {
            context.log.error('Error in IdpProxy:', error);
            return {
                status: 500,
                jsonBody: { error: 'Internal server error', message: error.message }
            };
        }
    }
});
