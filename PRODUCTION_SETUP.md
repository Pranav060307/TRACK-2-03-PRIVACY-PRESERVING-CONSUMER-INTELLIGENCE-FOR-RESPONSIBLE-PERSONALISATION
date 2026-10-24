# CohortLens / ÆGIS Retail — Production Deployment Guide
**Pragyan 2K26 Track 2-03: Privacy-Preserving Consumer Intelligence for Responsible Personalisation**
*Compliance Baseline: Digital Personal Data Protection (DPDP) Act 2023 & DPDP Rules 2025*

---

## 1. Environment Variables Reference

Create a `.env` file in the project root directory. Use `.env.example` as a template.

### 🌐 Core Server & Runtime Configuration

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` / `APP_ENV` | `string` | `production` | Runtime mode (`development`, `production`, `test`). In production, static assets in `/dist` are served automatically. |
| `PORT` | `number` | `5000` | Port on which the unified Express server listens. |
| `HOST` | `string` | `0.0.0.0` | Host IP binding. Use `0.0.0.0` for Docker, cloud containers, and VPS; `127.0.0.1` for local-only. |
| `CORS_ORIGIN` | `string` | `*` / localhost ports | Comma-separated list of allowed frontend domains. In production, set to your domain (e.g., `https://kirana.yourdomain.com`). |

### 💻 Client (React / Vite) Configuration

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `string` | `/api` (prod) | Base URL for API calls. If served on the same host/port via Express or reverse proxy, leave as `/api`. For separate frontend hosting (e.g. Vercel), set to `https://api.yourdomain.com/api`. |

### 🔒 Cryptographic & Privacy Controls (DPDP Mandates)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `HMAC_SECRET_SALT` | `string` | `shop_secret_...` | **Critical**: High-entropy secret key used for HMAC-SHA256 pseudonymisation (T1 raw phone $\to$ T2 keyed hash). Must be $\ge 32$ chars and rotated yearly. |
| `DP_EPSILON` | `number` | `0.5` | Differential Privacy privacy budget $\varepsilon$. Controls Laplace noise scale ($b = \Delta f / \varepsilon$). Default `0.5` provides high differential privacy. |
| `K_ANONYMITY_THRESHOLD` | `number` | `10` | Minimum cohort group threshold $k$. Cohorts with true size $< k$ are strictly suppressed or merged before display. |
| `OTP_EXPIRY_MS` | `number` | `300000` | Expiration window (in ms) for Counter QR 2-step deletion OTP verification (5 minutes). |

### 📡 Blind-Send Enclave & Communication Channels

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `BLIND_SEND_MODE` | `string` | `simulated` | Set to `simulated` for zero-cost testing, or `live` when connecting external gateways. |
| `WHATSAPP_API_TOKEN` | `string` | `""` | WhatsApp Business Cloud API Bearer Token (accessed strictly within the isolated blind enclave). |
| `WHATSAPP_PHONE_NUMBER_ID` | `string` | `""` | WhatsApp Phone Number ID registered under Meta Business Manager. |
| `SMS_GATEWAY_API_KEY` | `string` | `""` | API Key for transactional SMS gateway (Fast2SMS, MSG91, Twilio). |
| `SMS_SENDER_ID` | `string` | `COHORT` | 6-character DLT-approved Header/Sender ID for Indian telecom compliance. |

---

## 2. Quick Local Production Run

To test the application in true production mode locally:

```bash
# 1. Build the production client bundle
npm run build

# 2. Launch the unified production server
npm start
```
The server will automatically detect the `/dist` directory and serve both:
- **Web UI**: `http://localhost:5000`
- **Backend APIs**: `http://localhost:5000/api`

---

## 3. Docker Deployment (Recommended)

The repository includes a production multi-stage `Dockerfile` and `docker-compose.yml`.

### Using Docker Compose
```bash
# Copy and adjust environment variables
cp .env.example .env

# Build and start container in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Check health
docker compose ps
```

### Using Plain Docker
```bash
# Build production image
docker build -t cohortlens:latest .

# Run container
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name cohortlens-production \
  cohortlens:latest
```

---

## 4. Cloud Deployment Options

### Option A: Render / Railway / Fly.io (Single Container)
1. Link your GitHub repository.
2. Build Command: `npm run build`
3. Start Command: `npx tsx server/index.ts`
4. Set Environment Variables in dashboard:
   - `APP_ENV=production`
   - `PORT=5000`
   - `HMAC_SECRET_SALT=<your_random_32_char_secret>`

### Option B: Decoupled (Vercel Frontend + Render/VPS Backend)
- **Frontend (Vercel)**:
  - Framework Preset: `Vite`
  - Root directory: `./`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
- **Backend (Render / VPS)**:
  - Build command: `npm install`
  - Start command: `npx tsx server/index.ts`
  - Environment variable: `CORS_ORIGIN=https://your-frontend.vercel.app`

---

## 5. Security & DPDP Compliance Pre-Flight Checklist

Before deploying to production, verify:
- [x] **No T0 Data Collected**: Ensure caste, religion, health, or biometric fields never enter ingest pipelines.
- [x] **HMAC Salt Uniqueness**: Ensure `HMAC_SECRET_SALT` is randomized and not using the default placeholder.
- [x] **T1 Auto-Purge**: Raw bills and plain phone numbers are held $\le 7$ days before purging.
- [x] **Differential Privacy Active**: Verify $\varepsilon \le 1.0$ and $k \ge 10$ suppression on `/api/cohorts/summary`.
- [x] **Dark Pattern Scanner**: All weekly AI campaigns must pass CCPA/DPDP 15-point check prior to dispatch.
- [x] **Blind Send Enclave**: Zero plain-text contact numbers exposed to retail dashboard users.
