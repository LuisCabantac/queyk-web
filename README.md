# Queyk Web: Earthquake Monitoring and Emergency Response Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Queyk Web is a progressive web application (PWA) built with Next.js 15, React 19, and TypeScript. It serves as the centralized dashboard and emergency response portal for institutional earthquake safety, aggregating real-time seismic sensor feeds, managing multi-floor evacuation plans, dispatching Web Push/SMS notifications, and displaying PHIVOLCS/NDRRMC-compliant safety protocols.

---

## 1. Overview & Key Capabilities

Queyk Web bridges IoT seismic hardware with institutional safety coordinators, staff, and students. It ingests seismic metrics, visualizes activity trends, handles emergency notification dispatching, and ensures offline readiness through PWA support and downloadable evacuation schematics.

### Key Capabilities

- **Real-Time Seismic Dashboard**: Live charts powered by Recharts and Socket.io, displaying hourly magnitude, peak ground acceleration metrics, and daily rolling averages with custom date range filtering.
- **Evacuation Plan Navigator**: Interactive multi-floor architectural viewer highlighting primary/secondary evacuation routes, fire exits, and outdoor assembly zones for desktop and mobile viewports.
- **Incident & Protocol Documentation**: Comprehensive before/during/after safety procedures aligned with NDRRMC, PHIVOLCS, and Republic Act 10121 guidelines.
- **Notification Subsystems**:
  - **Web Push Notifications**: Browser-level push alert subscriptions using the Web Push standard and service workers.
  - **SMS Alert Dispatching**: Direct phone number management and SMS dispatch integrations.
- **PDF Report Generation**: Built-in client-side report generator (`jspdf` and `jspdf-autotable`) for exporting tabular seismic logs and safety summaries.
- **Domain-Restricted Authentication**: Auth.js v5 implementation supporting Google OAuth and Google One Tap, restricted to verified institutional email domains (`AUTH_EMAIL_DOMAIN`).
- **Role-Based User Management**: Administrative portal for viewing active users, modifying access roles (`admin` / `user`), and configuring notification permissions.
- **Progressive Web App (PWA)**: Full offline service worker caching, installable on mobile devices and desktops with Android Trusted Web Activity (TWA) asset link verification.

---

## 2. Architecture / How it Works

The web platform acts as both an administrative dashboard and an API proxy layer between authenticated client sessions, third-party services (Google OAuth, Web Push), and the core backend microservices.

```mermaid
flowchart TD
    subgraph Client ["Client Browser / Mobile PWA"]
        A[User Access] --> B{Authenticated?}
        B -- No --> C[Sign-in Page / Google One Tap]
        C --> D[Auth.js Session Callback & Domain Check]
        D --> B
        B -- Yes --> E[Role-Based View: Admin / User]
        E --> F[Live Dashboard & Recharts]
        E --> G[Evacuation Floor Plans]
        E --> H[Safety Protocols & User Manual]
        E --> I[User Profile & Notification Settings]
    end

    subgraph AppRouter ["Next.js App Router Proxy Layer"]
        F --> J["GET /api/readings (Date Range Query)"]
        F --> K["GET /api/earthquakes"]
        I --> L["POST /api/push-subscribe"]
        I --> M["POST /api/phone-number"]
        E --> N["GET/PUT /api/users (Admin Only)"]
    end

    subgraph ExternalBackend ["Queyk Backend & Push Gateway"]
        J --> O["Backend Service: /v1/api/readings"]
        K --> P["Backend Service: /v1/api/earthquakes"]
        N --> Q["Backend Service: /v1/api/users"]
        L --> R["Web Push Gateway (VAPID)"]
        M --> S["SMS Gateway / Backend DB"]
    end
```

### Data Flow Overview

1. **Authentication Flow**: Users log in via Google OAuth or Google One Tap. Auth.js validates the user's institutional email domain against `AUTH_EMAIL_DOMAIN` and synchronizes user profiles with the backend via `signInBackendAction`.
2. **Telemetry Ingestion & Visualizations**: The dashboard polls `/api/readings` with date parameters or receives live socket updates. TanStack Query manages query caching, background refetching, and state deduplication.
3. **Emergency Alerts**: When the backend flags a seismic event, web push payloads are routed to subscribed service workers, immediately popping push notifications across registered client devices.

---

## 3. Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Styling & UI**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) Primitives
  - [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
  - [Motion](https://motion.dev/) (Framer Motion)
- **State Management & Data Fetching**:
  - [TanStack React Query v5](https://tanstack.com/query/latest)
  - [TanStack React Table v8](https://tanstack.com/table/latest)
- **Authentication**:
  - [Auth.js (NextAuth v5 beta)](https://authjs.dev/) with Google OAuth & Google One Tap credentials provider
  - [jwt-decode](https://github.com/auth0/jwt-decode)
- **Real-Time & Alerts**:
  - [Socket.io Client](https://socket.io/)
  - [web-push](https://github.com/web-push-libs/web-push)
- **Reporting & Visualization**:
  - [Recharts](https://recharts.org/)
  - [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **PWA Integration**:
  - [`@ducanh2912/next-pwa`](https://github.com/DuCanhDe/next-pwa)

---

## 4. Project Structure

```
queyk-web/
├── app/                        # Next.js App Router root
│   ├── (main)/                 # Protected application routes with shared sidebar
│   │   ├── dashboard/          # Real-time seismic analytics dashboard
│   │   ├── evacuation-plan/    # Interactive desktop & mobile floor plans
│   │   ├── profile/            # User profile, push subscriptions, SMS settings
│   │   ├── protocols/          # Safety protocols (NDRRMC/PHIVOLCS standards)
│   │   ├── user-management/    # Admin user management and role delegation
│   │   └── user-manual/        # System documentation and usage guide
│   ├── api/                    # API Route Handlers (Backend proxies)
│   │   ├── auth/               # Auth.js / NextAuth route handlers
│   │   ├── earthquakes/        # Historical earthquake event endpoints
│   │   ├── notifications/      # Notification dispatch endpoints
│   │   ├── phone-number/       # SMS contact endpoints
│   │   ├── push-subscribe/     # Web Push subscription handler
│   │   ├── push-unsubscribe/   # Web Push unsubscription handler
│   │   ├── readings/           # Sensor reading telemetry query proxy
│   │   └── users/              # User management proxy endpoints
│   ├── signin/                 # Custom login page with Google OAuth & One Tap
│   ├── error/                  # Authentication & system error handler page
│   ├── layout.tsx              # Root HTML layout with PWA meta tags
│   └── page.tsx                # Public landing page
├── components/                 # React UI components
│   ├── ui/                     # Reusable shadcn/ui components (Dialog, Table, etc.)
│   ├── app-sidebar.tsx         # Responsive collapsible sidebar navigation
│   ├── Dashboard.tsx           # Dashboard view with charts, filters, and PDF export
│   ├── DesktopFloorPlans.tsx   # Large-screen floor plan canvas
│   ├── MobileFloorPlans.tsx    # Touch-optimized mobile floor plan viewer
│   ├── GoogleOneTap.tsx        # One Tap authentication prompt
│   └── UserManagementPage.tsx  # Admin tabular user management interface
├── hooks/                      # Custom React hooks
├── lib/                        # Business logic, configuration, and helpers
│   ├── auth-actions.ts         # Server actions for backend authentication
│   ├── pdf-generator.ts        # Client-side PDF export logic for seismic data
│   ├── protocols.ts            # NDRRMC/PHIVOLCS emergency protocol content
│   ├── push-actions.ts         # Service worker push notification helpers
│   └── utils.ts                # Class merging (cn) and formatting utilities
├── public/                     # Static assets, floor plan SVG/images, icons, manifest
├── types/                      # TypeScript definitions (auth, API, models)
├── auth.ts                     # NextAuth v5 configuration & JWT callbacks
├── middleware.ts               # Route protection & auth error redirection
├── next.config.ts              # Next.js & PWA compiler settings
└── package.json                # Project dependencies and npm scripts
```

---

## 5. Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.18.0 or newer
- Package manager: `npm`, `pnpm`, `yarn`, or `bun`
- A Google Cloud Console project with OAuth 2.0 credentials configured
- A running instance of the Queyk backend API

### Installation

1. Clone the repository and navigate to `queyk-web`:
   ```bash
   git clone <repository-url>
   cd queyk-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

### Environment Variables

Configure the following variables in `.env.local`:

| Variable | Description | Example / Required |
| :--- | :--- | :--- |
| `NEXTAUTH_URL` | Canonical URL of the Next.js application | `http://localhost:3000` |
| `AUTH_SECRET` | Secret key used to encrypt Auth.js session cookies (`openssl rand -hex 32`) | `your-32-char-random-secret` |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID (Server-side) | `123456789.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | `GOCSPX-xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_AUTH_GOOGLE_ID` | Google OAuth Client ID exposed to client (for Google One Tap) | `123456789.apps.googleusercontent.com` |
| `AUTH_EMAIL_DOMAIN` | Restricts login to a specific email domain (e.g., institutional email) | `@school.edu.ph` |
| `NEXT_PUBLIC_APP_URL` | Base public URL of the web app | `http://localhost:3000` |
| `NEXT_PUBLIC_BACKEND_URL` | Public-facing URL of the Queyk backend API | `http://localhost:8000` |
| `BACKEND_URL` | Server-to-server URL of the Queyk backend API | `http://localhost:8000` |
| `AUTH_TOKEN` | General backend authentication token | `secret-auth-token` |
| `ADMIN_TOKEN` | Token used by Next.js API routes for privileged backend calls | `secret-admin-token` |
| `USER_TOKEN` | Token used for standard user proxy endpoints | `secret-user-token` |
| `IOT_TOKEN` | IoT communication verification token | `secret-iot-token` |
| `SHA256_FINGERPRINT` | Optional SHA-256 cert fingerprint for Android TWA `.well-known/assetlinks.json` | `14:6D:E8:...` |

### Running Locally

Run the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 6. Usage & Navigation

### 1. Dashboard (`/dashboard`)
- **Seismic Charts**: View real-time graphs of Spectral Intensity (SI) and Peak Ground Acceleration (PGA).
- **Date Range Picker**: Filter metrics by custom start and end dates.
- **Export Data**: Click **Export PDF** to generate an instant printable incident report containing metric tables and statistics.

### 2. Evacuation Plans (`/evacuation-plan`)
- **Interactive Floor Plan**: Switch between Building levels/floors.
- **Route Markers**: Inspect marked primary exit pathways, emergency stairwells, fire extinguisher locations, and open-air assembly zones.
- **Offline Mode**: Floor plans remain accessible offline through PWA service worker caching.

### 3. Emergency Protocols (`/protocols`)
- **Actionable Guidelines**: View clear protocols for the three disaster management phases:
  - **Before**: Structural checks, emergency kit preparation, drill planning.
  - **During**: Duck, Cover, and Hold instructions for classrooms and open areas.
  - **After**: Evacuation guidelines, injury reporting, aftershock safety.
- **Intensity Scales**: Reference table explaining PHIVOLCS Earthquake Intensity Scale (PEIS) levels.

### 4. User Profile & Notifications (`/profile`)
- **Web Push**: Toggle browser push notifications for real-time seismic alerts.
- **SMS Alerts**: Link and verify your phone number to receive critical emergency alerts via SMS.

### 5. User Management (`/user-management` — Admins Only)
- **Role Control**: View registered users and promote accounts between `user` and `admin` roles.
- **Search & Pagination**: Filter users by name or email.

---

## 7. Troubleshooting & Common Issues

| Issue / Error | Potential Cause | Solution |
| :--- | :--- | :--- |
| `AccessDenied` on Login | Email domain does not match `AUTH_EMAIL_DOMAIN` | Ensure you are signing in with an authorized email address matching the configured domain filter. |
| Google One Tap prompt fails to appear | Missing `NEXT_PUBLIC_AUTH_GOOGLE_ID` or invalid origin | Add `http://localhost:3000` to **Authorized JavaScript origins** in Google Cloud Console. |
| `500 Failed to retrieve readings` | Backend server unreachable or token rejected | Check that `BACKEND_URL` is running and verify `ADMIN_TOKEN` matches your backend configuration. |
| Web Push fails to register | Service worker blocked or insecure origin | Web Push requires HTTPS (or `localhost` for development) and notification permissions granted in the browser. |
| Turbopack build warning on PWA | Duplicate worker files in `public/` | Run `npm run build` to let `@ducanh2912/next-pwa` regenerate `sw.js` and workbox bundles automatically. |

---

## License

This project is licensed under the [MIT License](LICENSE).
