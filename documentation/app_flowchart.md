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