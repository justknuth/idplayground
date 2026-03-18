# IDPlayground: Security-First Reference Architecture

**Mission Statement:** IDPlayground is a Multi-IDP Identity Orchestration Sandbox designed to act as a Security-First Reference Architecture. It provides a visual, zero-risk environment for engineering and security teams to test, validate, and audit complex OIDC and OAuth2 flows across competing Identity Providers (IDPs) like Okta and Auth0.

## The "Why": Solving Identity Integration Anxiety & ROI

Identity is consistently the most exploited attack vector in modern cloud infrastructure. Implementing secure authentication flows often leads to "Integration Anxiety"—a state where developers struggle with opaque protocol documentation, leading to misconfigurations and security vulnerabilities.

Security integrations are notoriously complex and time-consuming. Assuming a standard developer labor rate of $84/hr, prolonged identity integration cycles represent a massive hidden cost to engineering organizations. IDPlayground features a real-time ROI ticker that quantifies this friction, demonstrating the immediate financial impact of providing developers with a transparent, pre-configured identity sandbox. Reducing integration time directly translates to significant cost savings and accelerated time-to-market.

## Core Features

*   **Flight Recorder**: Built for "Compliance-as-Code." The Flight Recorder captures and visualizes the exact sequence of PKCE handshakes, state validations, scopes, and token exchanges. This provides the "Traceable Evidence" required by platforms like Vanta or Drata during SOC2 or ISO27001 audits, proving that secure authentication flows are actively enforced.
*   **Token Lab**: A dedicated environment featuring JWT decoding logic. It allows engineers to inspect ID, Access, and Refresh tokens, validating claim mapping, issuer verification, and audience restrictions across different IDPs.
*   **Live API Explorer**: Provides direct, audited access to critical security endpoints (e.g., Logs, Roles, Tenant Settings). This allows security teams to validate access control and monitoring capabilities directly against the IDP Management APIs.
*   **Multi-IDP Logic**: A global toggle orchestrates seamless switching between Auth0 and Okta. The application dynamically handles the subtle but critical differences in authentication headers—specifically injecting `SSWS` tokens for Okta versus `Bearer` tokens for Auth0—proving true protocol agnosticism.

## Architecture

*   **Stateless Proxy Model (Zero-Trust)**: Direct client-to-IDP Management API communication introduces unacceptable risks, including CORS bypass vulnerabilities and catastrophic token leakage. IDPlayground employs a Stateless Pass-Through Proxy utilizing an Azure Function. By abstracting sensitive Management API calls to a secure, server-side runtime, the architecture guarantees that administrative tokens and secrets are never exposed to or stored within the browser environment.
*   **Separation of Concerns**: 
    *   **Frontend**: React, Vite, and strict TypeScript ensure robust type safety, deterministic UI states, and a modular CSS architecture.
    *   **Backend**: Azure Functions utilizing the Node.js v4 programming model. The backend is written entirely in Vanilla JavaScript to ensure "High-Transparency execution." This deliberate choice removes the obfuscation of build steps or transpilation, allowing security teams to audit the proxy logic directly.

## Installation & Setup

### Prerequisites
Ensure you have Node.js 18+ installed. Then, install the Azure Functions Core Tools globally using the following terminal command:

```bash
npm install -g azure-functions-core-tools@4
```

### Local Environment Setup

The configuration is strictly separated between frontend environment variables and backend runtime settings to maintain a clear security boundary.

**1. Frontend Secrets (.env)**
Create a `.env` file in the root directory of the project to define your target IDP environments:

```env
VITE_AUTH0_DOMAIN=dev-xxxx.us.auth0.com
VITE_OKTA_DOMAIN=dev-xxxx.okta.com
```

**2. Backend Config (api/local.settings.json)**
Navigate to the `/api` directory and create a `local.settings.json` file for the Azure Functions runtime:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```
*Note: The backend proxy requires no hardcoded API keys or secrets in this file because it utilizes a Pass-Through Token Model. The client provides the scoped token, and the proxy securely forwards it.*

## Execution

You can run the application using either the traditional Dual-Boot method or configure a Single-Command start for streamlined development.

### The "Dual-Boot" Method
This method requires running the frontend and backend in separate terminal windows.

1.  **Start the Backend**: Open a terminal, navigate to the `/api` directory, and start the function app.
    ```bash
    cd api
    func start
    ```
2.  **Start the Frontend**: Open a second terminal, navigate to the project root, and start the Vite server.
    ```bash
    npm run dev
    ```

### The "Single-Command" Method
For a more efficient workflow, you can orchestrate both environments using a single command via `concurrently`.

1.  Install `concurrently` as a development dependency in the root directory:
    ```bash
    npm install -D concurrently
    ```
2.  Update your root `package.json` to include the `dev:all` script:
    ```json
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "dev:all": "concurrently \"npm run dev\" \"cd api && func start\""
    }
    ```
3.  Start the entire stack with one command:
    ```bash
    npm run dev:all
    ```
