# **App Name**: FlowForm

## Core Features:

- LDAP Login: Allow users to log in using their LDAP credentials and POST to `/api/auth/ldap-login`.
- Admin User Management: Enable administrators to manage users, including adding, editing, disabling, deleting, and recovering users, via the `/api/admin/users` endpoint.
- Workflow Initiation: Allow users to initiate workflows with title, department, start date, note sheet editor, approver selection, and file attachments. Uploaded files are sent to a placeholder `/api/docuvity/upload` endpoint, showing progress and thumbnail, prior to starting the flow at `/api/workflows/start`.
- Task Management: Enable users to view task details, including the note sheet, attachments (preview via `/api/docuvity/preview`), approver list, audit timeline, and action panel. Handle approve/reject actions through the `/api/workflows/[id]/actions` placeholder.
- Document Repository: List user files, fetched from `/api/docuvity/list?userId=...`, with search, sort, and version control UI (calls `/api/docuvity/versions?docId=...`).
- Department-wise Report Generation: Generate department-wise workflow reports with date filter, user-wise workflow reports with date filter, and audit log viewer with IP filter with CSV export to `/api/admin/reports/*?export=csv`.
- Enhanced Workflow Automation through Predictive Approver Routing: Leverage AI to analyze historical workflow data and user roles, then provide approver suggestions and assist in the tool to determine when routing a workflow instance. A machine learning model could identify patterns to optimize approval routing. Call an AI-based recommendation system via a dedicated API endpoint and present approver suggestions when new workflow initiated.

## Style Guidelines:

- Primary color: Forest Green (#228B22) to convey trust and efficiency.
- Background color: Light Green (#F0FFF0), a very desaturated version of forest green, for a clean, minimal backdrop.
- Accent color: Gold (#FFD700) for highlighting key interactive elements.
- Body and headline font: 'Inter', sans-serif, for a modern, neutral user experience.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use streamlined, professional icons to represent various workflow actions and statuses.
- Maintain a clean, intuitive layout with a top navigation bar and left sidebar, ensuring responsive design across different devices.