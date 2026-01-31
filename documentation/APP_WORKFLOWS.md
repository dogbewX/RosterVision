# Application Workflows

## Web App Workflow
The Web Dashboard is the central hub for data analysis and administrative management.

```mermaid
graph TD
    A[Start] --> B{Has Account?}
    B -- No --> C[Register Page]
    B -- Yes --> D[Login Page]
    C --> D
    D --> E[Dashboard - Main View]
    
    E --> F[View Players]
    F --> G[Filter by Position]
    F --> H[Sort by Value/FPPG]
    
    E --> I{Is Admin?}
    I -- Yes --> J[Admin Page]
    J --> K[Select Year/Week]
    K --> L[Upload CSV]
    L --> M[Overwrite Option]
    M --> N[Server Updates Database]
    N --> E
```

### Key Features
1.  **Authentication**: Secure Register/Login flow.
2.  **Dashboard**: Real-time filtering and sorting of thousands of players.
3.  **Admin Panel**: Restricted area for uploading weekly player data (CSV).

---

## Mobile App Workflow
The Mobile App focuses on Roster Construction using the data provided by the Web App.

```mermaid
graph TD
    A[Open App] --> B{Has Token?}
    B -- Yes --> C[Dashboard Screen]
    B -- No --> D[Login Screen]
    
    D --> C
    
    C --> E[View Players (Current Week)]
    E --> F[Tap Player (+)]
    F --> G{Roster Full?}
    G -- No --> H[Add to Roster]
    G -- Yes --> I[Show Alert]
    
    C --> J[My Roster Tab]
    H --> J
    
    J --> K[View Selected Team]
    K --> L[Remove Player (-)]
    K --> M[Save Roster]
    M --> N[Sync with Server]
```

### Key Features
1.  **Roster Building**: Select players up to the salary cap ($60,000).
2.  **Live Stats**: Uses the latest FPPG/Salary data from the production database.
3.  **Synchronization**: Saves rosters to the backend to persist across devices.
