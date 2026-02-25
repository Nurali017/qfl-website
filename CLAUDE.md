# QFL Website — CLAUDE.md

## Project Overview

QFL (Qazaqstan Football League) — the official website for Kazakhstan football leagues. Built with Next.js 14 App Router, server components, and per-tournament theming via CSS variables.

## Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build (standalone output)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run test           # Vitest (single run)
npm run test:watch     # Vitest (watch mode)
npm run test:coverage  # Vitest with v8 coverage
npm run gen:api-types  # Generate TypeScript types from OpenAPI spec
npm run audit:api      # Audit API usage
```

## Tech Stack

- **Framework**: Next.js 14, React 18, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4, class-based dark mode (`dark:` prefix)
- **Data fetching**: SWR 2 for client-side, `safePrefetch()` for SSR
- **i18n**: i18next + react-i18next, languages: `kz` (default), `ru`
- **Icons**: lucide-react
- **Animation**: motion (Framer Motion)
- **Charts**: recharts
- **Testing**: Vitest + React Testing Library + MSW 2, jsdom environment
- **Utilities**: clsx, tailwind-merge, date-fns
- **API types**: openapi-typescript (generated into `src/lib/api/generated/openapi.ts`)

## Architecture

### Provider Hierarchy (`src/app/providers.tsx`)

```
ThemeProvider → SWRConfig → I18nextProvider → Suspense → TournamentProvider
```

### Data Flow

1. **Services** (`src/lib/api/services/`) — typed functions calling the HTTP client
2. **HTTP client** (`src/lib/api/http/client.ts`) — fetch wrapper with `ApiClientError`, auto-detects server/client base URL
3. **SWR hooks** (`src/hooks/`) — call services, return `{ data, loading, error }`
4. **Query keys** (`src/lib/api/queryKeys/`) — centralized SWR cache keys, include language for per-locale caching
5. **SSR prefetch** (`src/lib/api/server/prefetch.ts`) — `safePrefetch()` wraps async calls, returns `undefined` on failure; `getServerPrefetchContext()` reads language/tournament from cookies

### API Configuration (`src/config/index.ts`)

- Client: `NEXT_PUBLIC_API_BASE_URL` (default `/api/v1`) — proxied via Next.js rewrites to backend
- Server: `API_BASE_URL` (default `http://localhost:8000/api/v1`) — direct to backend
- API calls are proxied through `next.config.js` rewrites: `/api/:path*` → backend

### Tournament System

Each tournament defines its own color palette via CSS variables (`--league-primary`, `--league-accent`, etc.). Tailwind maps these to `primary`, `accent` color tokens. Tournament configs live in `src/config/tournaments`.

## Key Directories

```
src/
├── app/              # Next.js App Router pages (league, matches, news, stats, team, player, etc.)
├── components/       # Shared UI components
├── config/           # App config, tournament definitions
├── contexts/         # React contexts (ThemeContext, TournamentContext)
├── hooks/            # SWR data hooks (useMatches, useTeam, useNews, etc.)
├── i18n/             # i18next setup
├── lib/
│   ├── api/
│   │   ├── http/     # HTTP client + error types
│   │   ├── services/ # API service functions
│   │   ├── adapters/ # Response transformers (news, player, match)
│   │   ├── queryKeys/# SWR cache key factories
│   │   ├── server/   # SSR prefetch utilities
│   │   └── generated/# OpenAPI-generated types
│   ├── i18n/         # Language utilities, cookies
│   ├── swr/          # SWR config
│   └── tournament/   # Tournament cookies
├── test/             # Test setup (MSW handlers, etc.)
└── types/            # Shared TypeScript types
```

## Coding Conventions

### Components
- Functional components, default export
- Tailwind for all styling, use `clsx()` or `tailwind-merge` for conditional classes
- `'use client'` directive only when the component needs hooks/interactivity
- Server components by default (no directive needed)

### Hooks
- SWR-based data hooks in `src/hooks/`, named `use<Entity>.ts`
- Return shape: `{ data, loading, error }` (aliased from SWR's `isLoading`)
- Always include `language` in query keys for per-locale cache isolation

### API Layer
- Service files: `src/lib/api/services/<entity>Service.ts`
- Adapters: `src/lib/api/adapters/<entity>Adapter.ts` — transform API responses
- Query keys: factory functions in `src/lib/api/queryKeys/index.ts`
- All API paths start with `/api/v1/`

### i18n
- 11 namespaces: common, navigation, footer, errors, table, league, news, match, team, player, statistics
- Use `useTranslation('namespace')` in components
- Default language: `kz`, fallback chain: `['kz', 'ru']`
- Translation files: `public/locales/{kz,ru}/<namespace>.json`

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json and vitest.config.ts)

### Testing
- Vitest + React Testing Library + MSW for API mocking
- Test files: colocated as `*.test.ts(x)` or in `__tests__/` directories
- Setup: `src/test/setup.ts`
- Globals enabled (no need to import `describe`, `it`, `expect`)

### Images
- Use `next/image` with avif/webp formats
- Remote patterns configured in `next.config.js`
- Fallback pattern with `onError` for broken images

### Dark Mode
- Class-based (`darkMode: 'class'` in Tailwind config)
- Use `dark:` prefix for dark mode variants
- Dark theme tokens: `dark-bg`, `dark-surface`, `dark-border`, etc.
