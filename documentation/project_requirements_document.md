# Project Requirements Document (PRD)

## 1. Project Overview

The **Blackcod Group Insight Quizzing Platform MVP** is a web-based tool that lets organizations create, deliver, and analyze quizzes or surveys for their teams. Managers can author questions, schedule publishing, assign quizzes in bulk, and track completion rates. Respondents receive clear deadlines, take quizzes in a distraction-free interface, and get personalized feedback. Executives and managers gain real-time insights through interactive dashboards and specialized "Insight Pathways" visualizations that show response trends over time.

This platform solves the problem of fragmented feedback collection and reporting in large organizations. Instead of juggling spreadsheets and multiple tools, companies get an all-in-one system built on a modern, type-safe stack. Key success criteria for version 1 include: 
- Secure authentication and role-based access control (RBAC) for Managers, Respondents, Executives, and Admins.
- A content management workflow for quiz creation, scheduling, and bulk assignment.
- A reliable respondent experience with timed quizzes and automated notifications.
- Dynamic dashboards and charts that load in under 3 seconds and meet accessibility standards (WCAG 2.1 AA).

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1):**
- User Authentication & Roles (FR13) using Better Auth + Drizzle ORM + PostgreSQL.
- Manager Content Workflow: create/edit quizzes, drafts, schedule publication, CSV bulk upload (FR1–FR6).
- Respondent Dashboard & Quiz Interface: list assignments, timed quiz environment, auto-save, no backtracking (FR8, FR9).
- Manager & Executive Dashboards: completion rates, outstanding tasks, executive summary view (FR10).
- Insight Pathways: line charts showing response trends over time (FR11, FR12).
- Admin Panel for user/role management.
- Email notifications on quiz assignments and completion feedback.
- Basic CI/CD: GitHub Actions for testing and deployment.
- Comprehensive testing: unit, integration, end-to-end (Vitest, React Testing Library, Playwright or Cypress).

**Out-of-Scope (Phase 2+):**
- Mobile-only native apps (React Native or SwiftUI).
- Advanced AI-driven question generation or analysis.
- Multi-language localization.
- Real-time chat or collaboration features.
- Deep organizational reporting (e.g., budget tracking, learning paths).

## 3. User Flow

A new user visits the platform’s home page and clicks “Sign Up.” They register with an email and password via the Better Auth form. After verification, they land on a role-based dashboard: Managers see a sidebar with “Content,” “Analytics,” and “Users” tabs; Respondents see “My Quizzes” and “History.” Executives get a read-only dashboard with high-level metrics.

When a Manager creates a quiz, they open the Content tab, build questions with inline editing components, set deadlines with a calendar picker, and upload respondent lists via CSV. Upon publication, the system emails assigned users. Respondents log in, view the assignment list, click a quiz, and enter a timed, full-screen quiz interface. Completion triggers an email with results. Managers and Executives return to their dashboards to view updated charts and tables that reflect the new data.

## 4. Core Features

- **Authentication & RBAC**: Secure sign-up/sign-in, role enforcement on routes and APIs.
- **Content Management**: Quiz builder with text inputs, multiple-choice options, deadlines.
- **Drafts & Scheduling**: Save drafts, schedule publication dates, edit before go-live.
- **Bulk Assignment**: CSV import of respondent emails and team metadata.
- **Respondent Experience**: Assignment list, timed quiz, auto-save answers, no backtracking.
- **Notifications**: Email on assignment and post-completion feedback.
- **Manager Dashboard**: Cards and charts for response rates, late submissions.
- **Executive Dashboard**: Summarized KPIs, high-level trends.
- **Insight Pathways**: Time-series line charts for cohort & individual trends.
- **Admin Panel**: Create/edit users, assign roles.
- **Testing & CI/CD**: Unit tests, integration tests, E2E flows, automated pipelines.

## 5. Tech Stack & Tools

- **Frontend Framework**: Next.js (React-based, supports server-side rendering).  
- **Language**: TypeScript (type safety).  
- **Styling**: Tailwind CSS (utility-first CSS framework).  
- **UI Components**: shadcn/ui (prebuilt accessible components).  
- **Auth & Database**: Better Auth + Drizzle ORM + PostgreSQL (relation DB).  
- **Charts**: Recharts or similar for line graphs.  
- **Serverless Functions**: Next.js API routes for backend logic.  
- **Testing**: Vitest + React Testing Library (units), Playwright or Cypress (E2E).  
- **CI/CD**: GitHub Actions.  

## 6. Non-Functional Requirements

- **Performance**: Dashboards and charts load under 3 seconds.  
- **Security**: RBAC on every endpoint; SQL injection and XSS protection.  
- **Accessibility**: Meet WCAG 2.1 AA standards.  
- **Reliability**: 99.9% uptime target; automated tests covering ≥90% of core flows.  
- **Maintainability**: Strict TypeScript linting, consistent code style, detailed domain comments.  
- **Scalability**: Database and serverless functions scale to 10,000 users.

## 7. Constraints & Assumptions

- The environment runs Node.js 18+ and supports Next.js App Router.  
- Better Auth and Drizzle ORM must support custom roles.  
- PostgreSQL instance with sufficient storage is available.  
- Email service (e.g., SendGrid) is provisioned externally.  
- No mobile offline support in V1.  
- All users have modern browsers with JavaScript enabled.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Bulk CSV upload may hit DB or email-API limits—batch imports and retry logic recommended.  
- **Time Zones & Deadlines**: Users in different zones need consistent deadline handling—store UTC and convert on display.  
- **SSR Data Caching**: Analytics pages may show stale data if caching is too aggressive—use short TTLs or revalidate on user actions.  
- **Testing Flakiness**: E2E tests can break on network delays—mock APIs or add retries/timeouts.  
- **CSV Format Variations**: Strict CSV schema required—provide templates and client-side validation before upload.  

**Mitigation Guidelines**: Use incremental rollouts, feature flags for new modules, thorough logging. Ensure clear user error messages and fallback UI for data-fetch failures.

---
*This PRD serves as the definitive source for all future technical documents—Tech Stack, Frontend Guidelines, Backend Structure, and Automated Workflows—ensuring zero ambiguity for an AI-driven development process.*