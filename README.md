# RT Next Static Starter

Static frontend starter for SaaS, e-commerce, and dashboard-style projects. The app keeps the visual starter experience, demo pages, validation, theme toggle, and UI components, but does not require auth, Redux, RTK Query, Firebase, Socket.IO, cookies, or a backend API to run.

## Prerequisites

- Node.js v20+ (v24 recommended)
- npm v10+

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Forms | react-hook-form + Zod |
| Icons | Lucide React |
| Animations | Framer Motion |
| Toasts | react-hot-toast |
| Theme | next-themes (dark/light/system) |

## Quick Start

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Static Behavior

- Dashboard routes are not protected.
- `middleware.ts` is pass-through only.
- Auth pages validate locally and navigate with demo success toasts.
- Dashboard data is hardcoded example data.
- Sidebar state is local to the dashboard layout.
- `ProtectedRoute` and `NotificationListener` are no-op compatibility components.
- Redux/RTK files remain in the repo as dormant legacy scaffolding, but the rendered app no longer depends on them.

## Folder Structure

```text
rt-next-static-starter/
├── app/
│   ├── (auth)/                   # Static login, signup, forgot-password pages
│   ├── (dashboard)/              # Static dashboard and settings pages
│   ├── (marketing)/              # Landing page
│   ├── globals.css               # Design tokens and global styles
│   ├── layout.tsx                # Root layout, theme provider, toaster
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── layout/                   # Navbar, Sidebar, Footer, ThemeToggle
│   ├── auth/                     # Static ProtectedRoute compatibility wrapper
│   └── common/                   # ErrorBoundary, EmptyState, ConfirmDialog
├── hooks/                        # Custom React hooks
├── lib/                          # Core utilities
├── utils/                        # Formatters, validators, optional legacy helpers
├── types/                        # TypeScript definitions
├── constants/                    # App config, routes, nav items
├── docs/                         # Project conventions
└── middleware.ts                 # Static pass-through middleware
```

## Common Changes

Update the app name in `constants/config.ts`, then replace the example content in:

- `app/(marketing)/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `constants/nav.ts`

Add a new dashboard page by creating a route under `app/(dashboard)/your-page/page.tsx` and adding its link to `constants/nav.ts`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm run format
```
