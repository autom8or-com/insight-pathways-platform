# AI Development Agent Guidelines

## Project Overview
**Project:** insight-pathways-platform
**** Here is the enhanced repository summary, tailored to your build goals.

***

## Enhanced Repository Summary: Foundation for the Blackcod Group Insight Quizzing Platform

This repository provides an excellent technical foundation for building the frontend of the **"Blackcod Group Insight Quizzing Platform MVP."** Originally a Next.js starter template, its architecture, technology stack, and component library are highly aligned with the project's requirements, offering a significant head start on development. This summary analyzes the existing codebase and provides a strategic roadmap for adapting it to meet the specific goals outlined in the Product Requirements Document (PRD).

### 1. What this codebase does (purpose and functionality)

This codebase serves as a robust starting point for the client-side application, providing core functionalities that directly map to the quizzing platform's needs:

*   **User Authentication & Role Foundation:** The platform enables users to sign up and sign in using "Better Auth." This is the essential first step for implementing the required user roles (Manager, Respondent, Executive, Admin) as defined in **FR13**. All users will use this system to access their respective dashboards and features.
*   **Foundation for Role-Specific Dashboards:** The existing dashboard is a perfect template for the multiple views required by the platform. It can be adapted to serve as:
    *   The **Respondent Dashboard** (**FR8**), listing assigned content and deadlines.
    *   The **Manager Dashboard** (**FR10**), displaying high-level response rates and completion statuses using the provided card and chart components.
    *   The **Admin Panel** for user and role management.
*   **Rich, Data-Forward User Interface:** Leveraging `shadcn/ui`, the repository provides a comprehensive set of components (forms, tables, charts, modals) necessary for building the entire platform—from the content editor (**FR1**) to the detailed analytics views (**FR11**). This aligns perfectly with the UI goal of creating a "modern, enterprise-grade business intelligence tool."
*   **Branding and Theming:** The built-in theming system (light/dark/system) and use of CSS variables will make it straightforward to incorporate the official Blackcod Group branding (logos, color palette, typography) for a consistent and professional user experience.

### 2. Key Architecture and Technology Choices

The platform's modern technology stack is well-suited for the performance, security, and maintainability goals of the quizzing platform:

*   **Frontend Framework:** **Next.js** (with the App Router) provides server-side rendering and server components, which are ideal for building performant, data-heavy analytics dashboards (**FR11, FR12**) and ensuring core actions complete in under 3 seconds (**NFR3**).
*   **Language:** **TypeScript** is used throughout, directly satisfying the project's technical requirement for a modern, type-safe stack that ensures long-term maintainability.
*   **Authentication & Database:** **"Better Auth"** integrated with **Drizzle ORM** and **PostgreSQL** provides a secure and scalable foundation for user management. This stack is the ideal starting point for building the Role-Based Access Control (RBAC) system (**FR13**) by extending the Drizzle schema to include roles and permissions.
*   **Styling:** **Tailwind CSS** enables rapid development of the clean, professional UI specified in the design goals.
*   **UI Component Library:** **`shadcn/ui`** is a critical asset. Its components are accessible by default, helping to meet the **WCAG 2.1 AA** standard. Its composition-based nature makes it easy to build complex interfaces like the "Content Creation/Editor" and the "Insight Pathways" visualizations.

### 3. Main Components and how they interact

The existing components provide direct starting points for key features of the quizzing platform:

*   **`app/(auth)/...` (Authentication Pages):** These pages will serve as the single entry point for all user roles to log in.
*   **`app/dashboard/page.tsx` (Dashboard View):** This is the primary canvas to be extended. It will need to be refactored into a role-based layout system that directs users to the correct view upon login:
    *   **Respondents** see their task list (**FR8**).
    *   **Managers** see their reporting dashboard (**FR10**).
    *   **Admins** see the user management panel (**FR13**).
*   **`components/ui/data-table.tsx`:** A crucial, reusable component. It can be immediately leveraged to:
    *   List drafts and published content for managers (**FR2, Story 1.4**).
    *   Display detailed, per-respondent quiz results (**FR11**).
    *   Manage users and roles in the Admin Panel.
*   **`components/ui/` (General Components):** The collection of forms, inputs, buttons, and calendar components are the building blocks for the **Content Creation/Editor** (**FR1, Story 1.3**) and for setting deadlines and scheduling publication dates (**FR5, FR3, Story 1.5**).
*   **`lib/auth.ts` (Server-side Auth):** This file is where the core logic for the RBAC system (**FR13**) will be implemented. Server-side checks will be added here to protect API routes and data, ensuring managers cannot access admin functions, for example.

### 4. Notable Patterns and Design Decisions

The repository's design patterns strongly support the quizzing platform's objectives:

*   **`shadcn/ui` Philosophy:** Copying components directly into the project (`components/ui/`) provides full control. This is essential for customizing components to meet the specific needs of the quiz builder and for applying the precise Blackcod Group branding.
*   **CSS Variables for Theming:** This makes implementing the brand guidelines a simple configuration change in `globals.css`, ensuring a consistent look and feel across the application.
*   **Next.js App Router & Server Components:** This modern architecture is key for performance. It allows analytics data to be fetched and rendered on the server, minimizing client-side load times and creating a snappy user experience for managers and executives viewing reports.

### 5. Overall Code Structure and Organization

The repository's clean, feature-oriented structure is an excellent fit for the project and aligns with the proposed Monorepo architecture. It can be easily extended to accommodate the new features:

*   **`app/dashboard/(manager)/content/...`**: New routes for content creation, editing, and assignment.
*   **`app/dashboard/(manager)/analytics/...`**: New routes for detailed reporting and Insight Pathways.
*   **`app/take-quiz/[assignmentId]/`**: A dedicated route for the respondent's quiz-taking experience.
*   **`lib/`**: This directory will expand to include business logic for quiz management, scoring, and analytics calculations.

### 6. Code Quality Observations and Recommendations

The codebase is a solid starting point. To elevate it to an enterprise-grade application as per the PRD, the following are crucial:

*   **Implement a Comprehensive Testing Strategy:** The PRD explicitly requires a "Full Testing Pyramid," which is currently missing.
    *   **Recommendation:** Immediately implement a testing framework (e.g., Vitest with React Testing Library). Create unit tests for UI components and business logic, integration tests for API interactions, and end-to-end tests (using Playwright/Cypress) for critical user flows like "Manager creates and assigns a quiz" (**Epic 1**) and "Respondent completes a quiz" (**Epic 2**). This directly addresses a key technical requirement.
*   **Enhance Error Handling:**
    *   **Recommendation:** Implement robust error handling for user-facing features. For example, when a manager uploads an invalid CSV (**Story 1.6**), the UI must display a clear, user-friendly error message. Use Next.js error boundaries to gracefully handle rendering failures in the analytics dashboards.
*   **Add Domain-Specific Comments:**
    *   **Recommendation:** As business logic for scoring, scheduling (**Story 1.5**), and Insight Pathways analysis (**Epic 3**) is added, ensure it is well-commented to explain the rules and calculations.

### 7. Actionable Roadmap: Adapting the Template for the MVP

This section outlines the key extensions and refactoring required to transform this template into the Insight Quizzing Platform MVP.

*   **1. Build the Core Data Model & API:**
    *   **Action:** The highest priority is to replace the static `data.json`. Define and migrate the full Drizzle schema for `Quizzes`, `Questions`, `Teams`, `Assignments`, `Submissions`, and `Roles`. Build out the corresponding serverless backend API endpoints that the frontend will consume.
    *   **Benefit:** This enables all dynamic functionality and is the foundation for every functional requirement.
*   **2. Implement Role-Based Access Control (RBAC):**
    *   **Action:** Extend the `lib/auth.ts` configuration and user schema to include roles. Implement Next.js middleware or higher-order components to protect routes and layouts based on the logged-in user's role (e.g., `/dashboard/manager/*` is only accessible to Managers).
    *   **Benefit:** Fulfills the critical security and administrative requirement of **FR13**.
*   **3. Develop the Content Management Workflow:**
    *   **Action:** Create new pages and components under a `/dashboard/(manager)/content` route group. Build the UI for creating quizzes/surveys (**FR1**), managing drafts (**FR4**), scheduling publication (**FR3**), and implementing the CSV bulk upload feature (**FR6**).
    *   **Benefit:** Delivers the entirety of **Epic 1** for the Manager persona.
*   **4. Construct the Respondent Experience:**
    *   **Action:** Build the respondent-specific dashboard view to list assigned content (**FR8**). Create the focused, timed quiz-taking interface (**FR9, Story 2.3**). Integrate with an email service for sending post-completion feedback (**Story 2.4**).
    *   **Benefit:** Delivers the core user journey outlined in **Epic 2**.
*   **5. Build Analytics and "Insight Pathways" Visualizations:**
    *   **Action:** Create new pages for analytics. Use the existing `data-table` and chart components, wired to the new backend API, to display completion rates (**FR10**) and detailed results (**FR11**). For **Epic 3**, build a dedicated component that uses a charting library (e.g., Recharts) to render the line graphs required for the "Insight Pathways" visualization (**FR12, Story 3.2, 3.3**).
    *   **Benefit:** Delivers the platform's key differentiator and strategic value.
*   **6. Establish the CI/CD Pipeline:**
    *   **Action:** As recommended in the original summary and required by **Story 1.1**, implement a CI/CD pipeline (e.g., using GitHub Actions) to automate testing and deployments to a development environment.
    *   **Benefit:** Ensures reliability, accelerates development, and establishes a professional workflow from day one.

## CodeGuide CLI Usage Instructions

This project is managed using CodeGuide CLI. The AI agent should follow these guidelines when working on this project.

### Essential Commands

#### Project Setup & Initialization
```bash
# Login to CodeGuide (first time setup)
codeguide login

# Start a new project (generates title, outline, docs, tasks)
codeguide start "project description prompt"

# Initialize current directory with CLI documentation
codeguide init
```

#### Task Management
```bash
# List all tasks
codeguide task list

# List tasks by status
codeguide task list --status pending
codeguide task list --status in_progress
codeguide task list --status completed

# Start working on a task
codeguide task start <task_id>

# Update task with AI results
codeguide task update <task_id> "completion summary or AI results"

# Update task status
codeguide task update <task_id> --status completed
```

#### Documentation Generation
```bash
# Generate documentation for current project
codeguide generate

# Generate documentation with custom prompt
codeguide generate --prompt "specific documentation request"

# Generate documentation for current codebase
codeguide generate --current-codebase
```

#### Project Analysis
```bash
# Analyze current project structure
codeguide analyze

# Check API health
codeguide health
```

### Workflow Guidelines

1. **Before Starting Work:**
   - Run `codeguide task list` to understand current tasks
   - Identify appropriate task to work on
   - Use `codeguide task update <task_id> --status in_progress` to begin work

2. **During Development:**
   - Follow the task requirements and scope
   - Update progress using `codeguide task update <task_id>` when significant milestones are reached
   - Generate documentation for new features using `codeguide generate`

3. **Completing Work:**
   - Update task with completion summary: `codeguide task update <task_id> "completed work summary"`
   - Mark task as completed: `codeguide task update <task_id> --status completed`
   - Generate any necessary documentation

### AI Agent Best Practices

- **Task Focus**: Work on one task at a time as indicated by the task management system
- **Documentation**: Always generate documentation for new features and significant changes
- **Communication**: Provide clear, concise updates when marking task progress
- **Quality**: Follow existing code patterns and conventions in the project
- **Testing**: Ensure all changes are properly tested before marking tasks complete

### Project Configuration
This project includes:
- `codeguide.json`: Project configuration with ID and metadata
- `documentation/`: Generated project documentation
- `AGENTS.md`: AI agent guidelines

### Getting Help
Use `codeguide --help` or `codeguide <command> --help` for detailed command information.

---
*Generated by CodeGuide CLI on 2025-10-17T12:03:43.731Z*
