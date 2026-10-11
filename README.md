# JERI — Journal of Emerging Research and Innovation

JERI is a React single-page application for a multidisciplinary open-access journal. It currently provides public journal pages and prototype author and administrator dashboards.

## Project structure

```text
.
├── frontend/              React, TypeScript, and Vite application
│   ├── public/             Static assets
│   └── src/
│       ├── auth/           Authentication context and hooks
│       ├── components/     Shared UI, layouts, and route guards
│       ├── configs/        App, route, theme, and endpoint configuration
│       ├── mock/           Mock authentication API and sample data
│       ├── services/       HTTP and authentication clients
│       ├── store/          Client-side state stores
│       └── views/          Public, auth, author, and admin screens
├── docs/                   Project architecture and retained references
└── netlify.toml            Netlify build and SPA routing configuration
```

There is no implemented backend yet. The `backend/` directory is reserved for future server work; current sign-in behavior is mocked, and dashboard examples are local demo state.

## Run locally

Requirements: Node.js and npm.

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. The development server proxies `/api` to `http://localhost:3000` when a backend is available.

## Build

```powershell
cd frontend
npm run build
npm run preview
```

The production bundle is written to `frontend/build`. Netlify builds from `frontend` and uses a fallback redirect for client-side routes.

## Main routes

| Area | Routes |
| --- | --- |
| Public journal | `/`, `/author-guidelines`, `/archives`, `/paper-submissions`, `/editorial-board`, `/ethics-statements`, `/contact-us` |
| Authentication | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password` |
| Author workspace | `/author`, `/author/dashboard` |
| Admin workspace | `/admin`, `/admin/dashboard` |

See [the architecture guide](docs/architecture.md) for how routing, layouts, and demo data fit together.
