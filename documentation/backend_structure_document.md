# Backend Structure Document

# Backend Structure Document

This document outlines the backend architecture, database management, APIs, hosting, infrastructure, security, and monitoring strategies for the Blackcod Group Insight Quizzing Platform. It uses clear, everyday language so anyone can understand how the backend is built and how it all works together.

## 1. Backend Architecture

Overall, the backend is built with modern, serverless principles in mind. It uses Next.js API routes and server components to keep things fast and easy to maintain.

• Frameworks and patterns:
  - **Next.js (App Router)**: Provides server-side rendering, server components, and API routes in a single codebase.
  - **Serverless functions**: Each API route scales automatically, so we don’t have to manage servers.
  - **Drizzle ORM**: A lightweight, TypeScript-friendly ORM for talking to our SQL database.
  - **Better Auth**: Handles user sign-up, sign-in, sessions, and role checks.

• How it supports our goals:
  - **Scalability**: Serverless functions scale up or down based on traffic without manual intervention.
  - **Maintainability**: TypeScript and Drizzle ORM enforce types and help catch bugs early. Code is organized by feature.
  - **Performance**: Server components fetch data on the server, minimizing the JavaScript sent to the browser. Responses are cached at the edge when possible.

## 2. Database Management

We use a traditional SQL database because quiz data and user roles fit well into tables with clear relationships.

• Database technology:
  - **Type**: Relational (SQL)
  - **System**: PostgreSQL (managed by a cloud provider like AWS RDS or Supabase)

• Data handling practices:
  - **Drizzle ORM** handles migrations, schema definitions, and queries in TypeScript.
  - **Backups**: Automated daily backups and point-in-time recovery.
  - **Indexes**: Created on foreign keys and frequently filtered fields to speed up queries (e.g., `user_id`, `quiz_id`).
  - **Connection pooling**: Managed by the cloud provider or a pooler like PgBouncer for efficient use of database connections.

## 3. Database Schema

Below is a human-friendly overview of our main tables and their relationships, followed by SQL definitions.

Tables and relationships:
- **Users**: Stores every person who can log in (respondents, managers, admins, executives).
- **Roles**: Defines each role (Admin, Manager, Respondent, Executive).
- **Teams**: Groups of respondents; managers oversee teams.
- **Quizzes**: High-level quiz or survey objects created by managers.
- **Questions**: Each quiz has multiple questions.
- **Assignments**: Links quizzes to teams or individuals, with deadlines.
- **Submissions**: Records of respondents’ answers and scores.

SQL schema (PostgreSQL):

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  team_id INTEGER REFERENCES teams(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER REFERENCES users(id)
);

CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  text TEXT NOT NULL,
  type TEXT NOT NULL,           -- e.g., "multiple-choice", "text"
  metadata JSONB,
  position INTEGER NOT NULL     -- order within the quiz
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id),
  assignee_team_id INTEGER REFERENCES teams(id),
  assignee_user_id INTEGER REFERENCES users(id),
  due_date TIMESTAMP NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  answers JSONB,
  score INTEGER
);
```

## 4. API Design and Endpoints

The platform uses RESTful endpoints implemented as Next.js API routes. Each endpoint is protected by role-based checks.

Key endpoints:

• `POST /api/auth/signup`  
  Purpose: Register a new user.  
  Input: email, password, desired role.  
  Output: Success message or error.

• `POST /api/auth/login`  
  Purpose: Log in an existing user.  
  Input: email, password.  
  Output: Session token and user info.

• `GET /api/users/me`  
  Purpose: Fetch the current user’s profile and role.  
  Protection: Authenticated users.

• `GET /api/quizzes`  
  Purpose: List quizzes visible to the user.  
  Protection: Managers see their quizzes; respondents see assigned quizzes.

• `POST /api/quizzes`  
  Purpose: Create a new quiz.  
  Protection: Managers and Admins only.

• `PUT /api/quizzes/:id`  
  Purpose: Update quiz details or publish it.  
  Protection: Managers (who own the quiz) or Admins.

• `POST /api/quizzes/:id/questions`  
  Purpose: Add questions to a quiz.  
  Protection: Managers only.

• `POST /api/assignments`  
  Purpose: Assign quizzes to teams or users.  
  Protection: Managers only.

• `GET /api/assignments/:id/submissions`  
  Purpose: Fetch submissions and scores for a given assignment.  
  Protection: Managers and Admins.

• `POST /api/submissions`  
  Purpose: Submit answers for a quiz.  
  Protection: Respondents only.

• `GET /api/analytics/overview`  
  Purpose: Provide high-level metrics (completion rates, average scores).  
  Protection: Managers and Executives.

• `GET /api/analytics/pathways`  
  Purpose: Return time-based response trends for Insight Pathways.  
  Protection: Managers and Executives.

## 5. Hosting Solutions

We leverage a cloud-first, serverless-friendly environment to keep operations simple and costs proportional to usage.

• **Vercel** for hosting the Next.js backend:
  - Built-in support for API routes and serverless functions.
  - Global edge network for fast responses to users worldwide.
  - Automatic deployments from GitHub with previews.

• **PostgreSQL** hosted on **AWS RDS** (or Supabase):
  - Fully managed, automated backups and scaling.
  - High availability option with multi-AZ.

Benefits:
  - **Reliability**: SLAs and automatic failover.
  - **Scalability**: Automatic scaling of serverless functions and database.
  - **Cost-effectiveness**: Pay only for what you use, with free tiers for early-stage development.

## 6. Infrastructure Components

These pieces work together to deliver a fast, resilient experience.

• **Load Balancer / Edge Network** (Vercel CDN):
  - Distributes incoming requests to the nearest edge location.
  - Caches static content and SSR pages close to users.

• **Caching mechanisms**:
  - **Edge caching** for public API responses (e.g., quiz lists).
  - **In-memory cache** (optional Redis) for heavy analytics queries.

• **Database connection pool**:
  - Managed by PgBouncer or the cloud provider to reuse database connections.

• **CI/CD pipeline** (GitHub Actions):
  - Runs tests on every pull request.
  - Deploys to a staging environment automatically.
  - Promotes to production after approval.

## 7. Security Measures

Security is baked in at every layer to protect user data and comply with regulations.

• **Authentication & Authorization**:
  - **Better Auth** provides secure sign-up, login, and session management.
  - **Role-Based Access Control (RBAC)**: Implemented in `lib/auth.ts` and Next.js middleware to guard API routes and pages.

• **Data encryption**:
  - **TLS** for all in-transit data.
  - **Encryption at rest** for database storage.

• **Environment variables**:
  - No secrets in code. Use Vercel’s or AWS’s secret stores.

• **Input validation & sanitization**:
  - All API inputs are validated in handlers to prevent SQL injection and XSS.

• **Audit logging**:
  - Key actions (quiz creation, assignments, role changes) are logged for compliance.

## 8. Monitoring and Maintenance

Keeping an eye on performance and errors ensures the platform stays healthy.

• **Monitoring tools**:
  - **Vercel Analytics** for request latency and error rates.
  - **Sentry** (or similar) for real-time error tracking in API routes.
  - **CloudWatch** (if using AWS) for database metrics.

• **Logging**:
  - Structured logs from API routes, accessible via Vercel’s dashboard.
  - Central log storage for long-term analysis.

• **Maintenance practices**:
  - **Database migrations** managed by Drizzle CLI; run as part of CI/CD.
  - **Dependency updates** reviewed weekly for security patches.
  - **Automated backups** tested quarterly to ensure restore procedures work.

## 9. Conclusion and Overall Backend Summary

The backend for the Blackcod Group Insight Quizzing Platform is built on a serverless, scalable foundation using Next.js, Drizzle ORM, and PostgreSQL. Better Auth ensures secure user management and RBAC. Hosting on Vercel and AWS RDS delivers reliability and global reach at a reasonable cost. Caching at the edge, a solid CI/CD pipeline, and robust monitoring keep performance high and issues low. All these components work in harmony to meet the project’s goals of a fast, secure, and maintainable quizzing and analytics platform.

---
**Document Details**
- **Project ID**: 670e52ca-d96e-4055-8d23-de8ffa92eaae
- **Document ID**: 5ac31ff0-c192-41f0-80f7-e5eef934fade
- **Type**: custom
- **Custom Type**: backend_structure_document
- **Status**: completed
- **Generated On**: 2025-10-17T10:20:14.669Z
- **Last Updated**: N/A
