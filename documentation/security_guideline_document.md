# Security Guidelines for the Blackcod Group Insight Quizzing Platform

This document defines the security principles, controls, and best practices that must be embedded throughout the design, implementation, and operation of the Insight Quizzing Platform MVP. Adherence to these guidelines ensures a robust, resilient, and trustworthy application.

## 1. Security by Design & Architecture

*   **Threat Modeling**: Early in design, identify and document potential threats (e.g., unauthorized data access, injection attacks, CSRF). Update regularly as features evolve.

*   **Least Privilege**: Grant each service, database user, and API endpoint only the minimal permissions required. For example, the CSV‐upload function should only have read/write access to a dedicated staging schema.

*   **Defense in Depth**: Layer controls across the stack:

    *   Network: VPC segmentation, firewall rules limiting database access to application servers.
    *   Application: Authentication & authorization checks, input validation, output encoding.
    *   Data: Encryption at rest and in transit, secure key management.

## 2. Authentication & Access Control

*   **Strong Authentication**:

    *   Use Better Auth integrated with Drizzle ORM + PostgreSQL.
    *   Enforce complex password policies (minimum length ≥12, mixed character classes, rotation).
    *   Store passwords with Argon2 or bcrypt + unique salt per user.

*   **Session Management & JWT**:

    *   Issue JWTs signed with a secure algorithm (HS256 or RS256); never use “none.”
    *   Validate `exp`, `iat`, and `aud` on every request.
    *   Store tokens in secure, HttpOnly, Secure, SameSite-strict cookies.
    *   Implement idle and absolute session timeouts; provide server-side logout invalidation.

*   **Role‐Based Access Control (RBAC)**:

    *   Define roles: Admin, Manager, Executive, Respondent.
    *   Extend user schema in `lib/auth.ts` to include roles and permissions.
    *   Enforce server-side checks (e.g., Next.js middleware) on every protected route and API endpoint.

*   **Multi-Factor Authentication (MFA)**:

    *   Require MFA (TOTP or SMS) for Admin and Executive logins, and optionally for Managers.

## 3. Input Validation & Output Encoding

*   **Server-Side Validation**:

    *   Never rely solely on client-side checks; revalidate on the backend.
    *   Use schema validation libraries (e.g., Zod) for JSON payloads.

*   **Prevent Injection Attacks**:

    *   Always use Drizzle ORM’s parameterized queries—never string-concatenate SQL.
    *   For CSV uploads, restrict file extensions to `.csv`, validate MIME type, file size (e.g., ≤5 MB), and parse with a hardened CSV parser.

*   **XSS & Template Injection**:

    *   Escape and HTML-encode user-supplied quiz content when rendering.
    *   Employ a strict Content Security Policy (CSP) that disallows inline scripts and only allows trusted script origins.

*   **Redirect & URL Whitelisting**:

    *   Validate redirect targets against an allow-list of internal routes to prevent open-redirect attacks.

## 4. Data Protection & Privacy

*   **Encryption in Transit & At Rest**:

    *   Enforce HTTPS (TLS 1.2+). Redirect all HTTP traffic to HTTPS.
    *   Use PostgreSQL’s built-in encryption (e.g., `pgcrypto`) or disk-level AES-256 encryption for backups.

*   **Secrets Management**:

    *   Store API keys, database credentials, and JWT signing keys in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault). Do not hard-code in code or environment files.

*   **PII Handling & Compliance**:

    *   Classify PII (user names, emails, IPs). Mask or redact in logs and UIs when not required.
    *   Implement data-deletion workflows to comply with GDPR/CCPA erase and portability requests.

*   **Error Handling & Logging**:

    *   Do not expose stack traces or sensitive details in API responses.
    *   Log at INFO/WARN/ERROR levels; redact sensitive fields.
    *   Centralize logs in a secure, write-only system and monitor for anomalies.

## 5. API & Web Application Security

*   **Rate Limiting & Throttling**:

    *   Enforce per-IP and per-account rate limits on login, quiz submissions, and CSV upload endpoints.

*   **CORS & CSRF**:

    *   Restrict CORS to known origins (e.g., `https://app.blackcodgroup.com`).
    *   Protect all state-changing endpoints (POST/PUT/DELETE) with anti-CSRF tokens.

*   **Security Headers**:

    *   `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
    *   `X-Content-Type-Options: nosniff`
    *   `X-Frame-Options: DENY`
    *   `Referrer-Policy: same-origin`
    *   `Content-Security-Policy` as noted above.

*   **Secure Cookie Attributes**:

    *   `HttpOnly`, `Secure`, and `SameSite=Strict` on session/auth cookies.

## 6. Infrastructure & CI/CD Hardening

*   **Server & Network Hardening**:

    *   Disable unused ports and services on application servers.
    *   Enforce centralized patch management; apply OS and dependency updates regularly.
    *   Use container-scanning tools to detect vulnerable base images.

*   **CI/CD Pipeline Security**:

    *   Store secrets in pipeline vaults, not in plaintext.
    *   Integrate SCA tools (e.g., Dependabot, Snyk) to scan for vulnerable dependencies on every pull request.
    *   Require successful unit, integration, and end-to-end test passes before merging/deployment.
    *   Enforce branch protection rules and peer code review.

## 7. Dependency & Supply Chain Management

*   **Lockfiles & Pinning**:

    *   Commit `package-lock.json` or `yarn.lock` to ensure reproducible builds.

*   **Vulnerability Scanning**:

    *   Automate CVE scanning in CI (e.g., OWASP Dependency-Check).

*   **Minimize Third-Party Footprint**:

    *   Only include libraries actively maintained with a healthy security track record.

## 8. Continuous Monitoring & Incident Response

*   **Monitoring & Alerting**:

    *   Instrument application and infrastructure with logs, metrics, and distributed tracing.
    *   Alert on unusual behaviors (e.g., high error rates, spikes in failed logins).

*   **Incident Response Plan**:

    *   Document roles, escalation paths, and recovery procedures for security incidents.
    *   Conduct regular tabletop exercises and post-mortems.

Adherence to these guidelines will ensure the Insight Quizzing Platform meets stringent security, privacy, and compliance standards while delivering a reliable, user-centric experience. Regular audits and reviews should be scheduled to validate ongoing compliance and to address emerging threats.
