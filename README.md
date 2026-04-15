# CAEPY — Doctor Onboarding Frontend

AI-assisted doctor onboarding platform built with **Next.js**, **React 19**, and **TypeScript**.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5.9
- **Styling:** CSS Modules + CSS custom properties
- **Auth:** Firebase (Google sign-in) + OTP via API
- **API Client:** Axios with request/response interceptors
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Maps:** Google Maps API (`@react-google-maps/api`)

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_BASE_PATH` | Sub-path if app is not served at root |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps for practice location picker |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID (the **API server** must set `FIREBASE_PROJECT_ID` to this same value for Google sign-in to work) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/                        # Next.js App Router pages & layouts
├── layout.tsx              # Root layout (html, body, metadata)
├── page.tsx                # / → redirects to /login
├── login/                  # Login page
├── resume-upload/          # Resume upload (protected)
├── (doctor)/               # Route group: doctor pages with Header + Sidebar
│   ├── layout.tsx
│   ├── onboarding/
│   ├── dashboard/
│   ├── profile/
│   ├── profile-summary/
│   ├── review/
│   └── submitted/
└── admin/                  # Admin section
    ├── login/
    └── (dashboard)/        # Route group: admin pages with Header + AdminSidebar
        ├── layout.tsx
        ├── dashboard/
        ├── doctors/
        ├── doctor/[id]/
        ├── users/
        └── masters/

src/
├── views/                  # Page-level React components
├── components/             # Shared UI components
├── layouts/                # Layout CSS modules
├── hooks/                  # Custom hooks (useAssistant)
├── lib/                    # Utilities (api, firebase, validation)
└── services/               # API service layers
```

## Docker

```bash
# Build and run locally
docker compose up --build

# Open http://localhost:3000
```

The Dockerfile uses Next.js standalone output (`node server.js`) for a minimal production image.
