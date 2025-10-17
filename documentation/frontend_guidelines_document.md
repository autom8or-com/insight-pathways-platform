# Frontend Guidelines Document

# Frontend Guideline Document for Blackcod Group Insight Quizzing Platform

This document outlines the frontend setup, design principles, and technologies used in the Insight Quizzing Platform MVP. It’s written in everyday language so anyone—technical or not—can understand how the frontend is organized and why it’s built this way.

## 1. Frontend Architecture

### 1.1 Core Frameworks and Libraries
- **Next.js (App Router):** Provides file-based routing, server-side rendering (SSR), and server components. This means pages like dashboards and analytics load quickly and can fetch data securely on the server.
- **React & TypeScript:** Ensures a component-based structure and type safety across the codebase. Components are easier to refactor, and types catch errors before you run the app.
- **Tailwind CSS:** A utility-first styling framework that speeds up development and keeps CSS consistent and purged of unused rules.
- **shadcn/ui:** A headless, accessible UI component library built on top of Radix primitives and Tailwind. Offers ready-made forms, tables, charts, and more—all meeting WCAG 2.1 AA standards out of the box.
- **Better Auth Integration:** A lightweight authentication system that ties into our frontend via `lib/auth.ts` and Next.js middleware. It handles sign-in, sign-up, and role checks (Manager, Respondent, Executive, Admin).

### 1.2 Supporting Scalability, Maintainability, and Performance
- **Server vs. Client Components:** Data-heavy pages (e.g., analytics dashboards) render on the server to reduce client load. Interactive widgets and stateful pieces live as client components.
- **Feature-Based Organization:** Code lives under `/app/` by feature (e.g., `/app/dashboard/manager`, `/app/take-quiz/[assignmentId]`). This makes it easy to find and extend functionality.
- **CSS Variables for Theming:** Global CSS variables mean swapping color palettes or fonts is just a matter of updating a few lines in `globals.css`.
- **TypeScript Everywhere:** Reduces runtime errors, accelerates refactors, and documents code intent.

## 2. Design Principles

### 2.1 Key Principles
- **Usability:** Clear layouts, meaningful labels, and straightforward workflows (e.g., wizard-style quiz creation). Users shouldn’t need a manual to click through the app.
- **Accessibility:** All components follow WCAG 2.1 AA guidelines (keyboard navigation, focus indicators, sufficient color contrast).
- **Responsiveness:** Fluid layouts that adapt from desktop dashboards to mobile quiz-taking screens. Tailwind’s responsive utilities make breakpoints simple.
- **Consistency:** Shared typography, spacing, and component behaviors ensure the app feels cohesive.

### 2.2 Applying the Principles
- **Accessible Forms:** shadcn/ui form components come with proper labels, error feedback, and ARIA attributes.
- **Responsive Cards and Tables:** Dashboard metrics and data tables reflow on smaller screens—cards stack, tables become scrollable.
- **Error Handling:** User-friendly messages guide recovery (e.g., “Your CSV upload failed—please check your file format.”).

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS:** Utility classes (`bg-primary`, `text-lg`, `flex`, `gap-4`) keep styling co-located and eliminate long CSS files.
- **CSS Variables:** Define core colors, fonts, and spacing in `:root`, then use Tailwind’s `theme.extend` to pull them in.

### 3.2 Theming
- **Built-in Light/Dark/System Themes:** Controlled via a ThemeProvider or Next.js middleware; toggles update CSS variables.
- **Branding Plug-in:** Swap in the official Blackcod Group logos and color values in one place (`globals.css`) to brand the entire app.

### 3.3 Visual Style
- **Overall Style:** Modern flat design with subtle glassmorphism accents on modals and cards for a polished, enterprise look.
- **Color Palette:**
  • Primary: #1D4ED8 (blue)
  • Secondary: #10B981 (emerald)
  • Success: #22C55E (green)
  • Warning: #F59E0B (amber)
  • Error: #EF4444 (red)
  • Background: #F9FAFB (light gray)
  • Surface: #FFFFFF (white)
  • Text Primary: #111827 (dark)
  • Text Secondary: #6B7280 (gray)

### 3.4 Typography
- **Font Family:** Inter (system-font fallback: `-apple-system, BlinkMacSystemFont, sans-serif`). Clean, highly legible in dashboards and long-form content.

## 4. Component Structure

- **`components/ui/`:** Shared, generic UI pieces (buttons, inputs, data tables, modals). These are copied from shadcn/ui so we can customize them.
- **Feature Folders:** Each major feature (auth pages, manager content editor, analytics) lives under `/app/[feature]/` with its own layout, page, and subdirectory for child routes.
- **Reusable vs. Page-Specific:** Keep truly shared items in `components/ui`; place feature-specific variations in the feature folder.

Why It Matters: Component-based architecture means bug fixes and enhancements in one component automatically propagate wherever that component is used.

## 5. State Management

- **Server State:** Fetched in server components via Next.js data fetching (`fetch` with caching headers) or in client components via React Query or SWR for real-time updates.
- **Local UI State:** Managed with React’s `useState` and `useReducer` for form inputs, modals, and toggle switches.
- **Global UI State:** (e.g., theme, authenticated user info) stored in React Context providers. Kept minimal to avoid prop drilling.

## 6. Routing and Navigation

- **Next.js App Router:** File-based routing automatically maps `/app/dashboard/manager/page.tsx` to `/dashboard/manager`. Dynamic routes like `/take-quiz/[assignmentId]` handle respondent quizzes.
- **Layouts & Middleware:** Shared layouts (`layout.tsx`) wrap related routes (e.g., all manager pages). Next.js middleware enforces role-based access, redirecting unauthorized users.
- **Navigation Components:** Use Next.js `Link` and custom `NavItem` components in sidebars and headers. Active links are highlighted using Tailwind’s `aria-current` selector.

## 7. Performance Optimization

- **Server Components:** Offload data rendering to the server to reduce bundle sizes.
- **Code Splitting:** Next.js automatically splits code by route. For large components, use `next/dynamic` to lazy-load.
- **Asset Optimization:** Optimize images with `next/image`. Purge unused CSS classes in production builds.
- **Caching Layers:** Leverage HTTP caching and ISR (Incremental Static Regeneration) for dashboards that can be slightly stale.

## 8. Testing and Quality Assurance

- **Unit Tests:** Vitest + React Testing Library for components and utility functions.
- **Integration Tests:** Test data fetching hooks and form flows with mocked APIs.
- **End-to-End (E2E) Tests:** Playwright or Cypress to verify critical user journeys (login, quiz creation, quiz taking).
- **Continuous Integration:** GitHub Actions runs all tests on every pull request and blocks merges on failures. Code coverage reports ensure we maintain >80% coverage.
- **Linting & Formatting:** ESLint (with TypeScript rules) and Prettier enforce code consistency.

## 9. Conclusion and Frontend Summary

This guideline lays out a clear, scalable, and maintainable frontend for the Insight Quizzing Platform MVP:

• **Modern Stack:** Next.js + React + TypeScript + Tailwind + shadcn/ui
• **Design First:** Usable, accessible, responsive, and consistent UI
• **Solid Architecture:** Feature-based structure, server/client components, clear state patterns
• **Performance & Testing:** SSR, code splitting, comprehensive test suite, CI/CD pipeline

By following these principles and structures, the team can deliver an enterprise-grade, high-performance quizzing platform that meets all user needs and technical requirements.

---
**Document Details**
- **Project ID**: 670e52ca-d96e-4055-8d23-de8ffa92eaae
- **Document ID**: 3649c207-38f9-4a75-884b-5a549c0f1b26
- **Type**: custom
- **Custom Type**: frontend_guidelines_document
- **Status**: completed
- **Generated On**: 2025-10-17T10:22:01.838Z
- **Last Updated**: N/A
