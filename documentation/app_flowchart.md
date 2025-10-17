# App Flowchart

flowchart TD
  A[Start] --> B[Login Page]
  B --> C{Authenticated}
  C -->|No| B
  C -->|Yes| D{User Role}
  D -->|Manager| E[Manager Dashboard]
  D -->|Respondent| F[Respondent Dashboard]
  D -->|Executive| G[Executive Dashboard]
  D -->|Admin| H[Admin Panel]
  E --> I[Content Management]
  I --> J[Create Quiz]
  I --> K[Schedule Quiz]
  K --> L[Assign Participants]
  F --> M[View Assignments]
  M --> N[Take Quiz]
  N --> O[Submit Quiz]
  O --> P[View Feedback]
  G --> Q[View Reports]
  Q --> R[Insight Pathways]
  H --> S[Manage Users]
  H --> T[Manage Roles]

---
**Document Details**
- **Project ID**: 670e52ca-d96e-4055-8d23-de8ffa92eaae
- **Document ID**: e597ff58-85c9-4c90-a8c7-281ff7cece68
- **Type**: custom
- **Custom Type**: app_flowchart
- **Status**: completed
- **Generated On**: 2025-10-17T10:20:46.408Z
- **Last Updated**: 2025-10-17T11:19:49.456Z
