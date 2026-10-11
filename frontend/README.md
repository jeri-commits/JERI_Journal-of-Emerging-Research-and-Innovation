# JERI frontend

The JERI website is a React 19 and TypeScript single-page app built with Vite. The application entry point is `src/main.tsx`; `src/App.tsx` installs the theme, router, authentication provider, layout, and route views.

## Commands

Run these commands from this directory:

```powershell
npm install
npm run dev
npm run build
npm run preview
```

The Vite development server listens on port 5173. Requests to `/api` are proxied to `http://localhost:3000`.

## Source map

- `src/views/` contains route-level pages, grouped into `public`, `auth`, `author`, and `admin` areas.
- `src/components/route/` applies route and role checks; route definitions live in `src/configs/routes.config/`.
- `src/components/layouts/` provides the public, authentication, author, and admin shells.
- `src/components/ui/` contains reusable interface components; `src/components/shared/` contains app-level shared components.
- `src/services/` contains API and authentication clients. `src/mock/` supplies the current mock authentication responses.
- `src/configs/`, `src/constants/`, `src/store/`, `src/utils/`, and `src/locales/` hold app configuration, constants, state, helpers, and translations.

The backend is not implemented. Authentication is mocked when `enableMock` is true in `src/configs/app.config.ts`; author and admin dashboard records are sample data held in page state.
