# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BMW Route Dash is a React Native + Expo mapping/navigation app using Mapbox Maps SDK with real-time location tracking. Built with Expo 54, React 19, TypeScript 5.9, and file-based routing via Expo Router.

## Development Commands

```bash
pnpm ios                # Run on iOS simulator/device (requires native build)
pnpm android            # Run on Android emulator/device (requires native build)
pnpm type:check         # TypeScript type checking (tsc --noEmit)
pnpm lint               # Run ESLint
pnpm lint:fix           # Run ESLint with auto-fix
pnpm format             # Format all files with Prettier
pnpm expo:doctor        # Diagnose Expo configuration issues
pnpm clean              # Remove node_modules and .expo cache
pnpm nuke               # Full clean including ios/ and android/ directories
```

Changes to `app.json` plugins or native configuration require a full native rebuild (`pnpm ios` / `pnpm android`).

## Architecture

**Entry point:** `App.tsx` initializes the Mapbox SDK with the access token before Expo Router loads. This file imports `expo-router/entry` after Mapbox setup.

**Routing:** Expo Router file-based routing in `app/` directory. The root layout (`app/_layout.tsx`) wraps everything in a dark-themed `ThemeProvider` with stack navigation. The main screen is `app/index.tsx`.

**Styling:** Tailwind CSS v4 via NativeWind. Global styles in `styles/global.css`. PostCSS configured in `postcss.config.mjs`. Metro bundler extended with NativeWind in `metro.config.js`.

**Environment:** Single env var `EXPO_PUBLIC_MAPBOX_TOKEN` in `.env`. Must use `EXPO_PUBLIC_` prefix for Metro bundler exposure.

**Path aliases:** `@/*` maps to project root (configured in `tsconfig.json`).

## Git Conventions

**Branch naming:** `feature/*`, `bugfix/*`, `improvement/*`, `library/*`, `prerelease/*`, `release/*`, `hotfix/*`, plus `develop` and `main`. Enforced by pre-commit hook.

**Commits:** Conventional Commits enforced by commitlint. Format: `type(scope): subject` (e.g., `feat: add location tracking`).

**Pre-commit hooks (Husky):** Runs lint-staged (ESLint + Prettier on staged files), secretlint on all files, and branch name validation.

## Key Dependencies

- `@rnmapbox/maps` - Mapbox Maps SDK (configured as Expo plugin in app.json)
- `expo-location` - GPS location services (foreground permissions)
- `expo-router` - File-based routing with typed routes enabled
- `nativewind` + `tailwindcss` - Tailwind CSS for React Native
- `expo-screen-orientation` - Device rotation support
