# Expense Manager - Approval Management System (Frontend)

This is a production-ready **Server-Side Rendered (SSR) frontend** for an "Approval Management System (AMS)" built with Next.js (TypeScript), TailwindCSS, and React.




This project is **FRONTEND ONLY**. It does not include any database, storage engine, or server-side persistence logic. All backend interactions are handled through placeholder API calls, which need to be implemented separately.

## Features

- **Authentication**: LDAP-style login with cookie-based session management.
- **Role-Based Access**: Separate layouts and routes for regular users (`/app`) and administrators (`/admin`).
- **User Management (Admin)**: A complete UI for administrators to add, edit, disable, and manage users.
- **Workflow Management**:
  - Initiate complex workflows with details, rich-text notes, and file attachments.
  - **AI-Powered Approver Suggestions**: Leverages a GenAI model to suggest optimal approvers based on workflow context.
  - Multi-level approver selection.
- **Task Management**: User dashboards with categorized task lists (My Tasks, Pooled, Finished, etc.).
- **Document Repository**: UI for browsing and managing user files, with hooks for Docuvity integration.
- **Reporting (Admin)**: UI for generating various reports with filters and CSV export functionality.
- **Responsive & Accessible**: Designed to work on all devices with a focus on accessibility.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod for validation
- **UI Components**: Radix UI (via shadcn/ui)
- **AI**: Google Gemini via Genkit

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd expense-manager
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables. These are used for placeholder content and mock API URLs.

```plaintext
# Base URL for your backend API
API_BASE_URL=http://localhost:8080

# URL for the Docuvity UI (for e-sign redirects)
DOCUVITY_UI_URL=https://docuvity.example.com

# Optional hints for the LDAP login screen
LDAP_UI_HINTS="Use your corporate network credentials."

# Google AI API Key for Genkit
GOOGLE_API_KEY=your_google_ai_api_key_here
```

### 3. Running the Development Server

To run the app in development mode, which includes hot-reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### 4. Running the Genkit AI Flow (Optional)

To test the AI approver suggestion feature, you need to run the Genkit development server in a separate terminal:

```bash
npm run genkit:dev
```

This starts the Genkit server, making the `suggestApprovers` flow available to the Next.js application.

---

## Build & Deploy

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a `.next` directory with the production-ready application.

### Running in Production

To run the built application:

```bash
npm start
```

### Deployment with Docker

A `Dockerfile` and `docker-compose.frontend.yml` are provided for containerized deployment.

1.  **Build the Docker image:**

    ```bash
    docker-compose -f docker-compose.frontend.yml build
    ```

2.  **Run the container:**

    ```bash
    docker-compose -f docker-compose.frontend.yml up -d
    ```

The frontend will be running and exposed on port `9002`. It's recommended to run this behind a reverse proxy like Nginx or Traefik in a real production environment.

---

## Backend API Placeholder Documentation

This frontend expects a backend that exposes the following API endpoints. All endpoints should be prefixed with your `API_BASE_URL`.

### Authentication

#### `POST /api/auth/ldap-login`

Authenticates a user with LDAP credentials.

-   **Request Body**:
    ```json
    {
      "username": "jdoe",
      "password": "userpassword"
    }
    ```
-   **Success Response (200 OK)**: Sets a secure, `HttpOnly` cookie and returns user info.
    ```json
    {
      "success": true,
      "user": {
        "id": "2",
        "username": "jdoe",
        "role": "user",
        "firstName": "Jane",
        "lastName": "Doe"
      }
    }
    ```
-   **Error Response (401 Unauthorized)**:
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

#### `POST /api/auth/logout`

Logs the user out by clearing the session cookie.

-   **Success Response (200 OK)**:
    ```json
    { "success": true }
    ```

### Admin

#### `GET /api/admin/users`

Fetches a paginated and searchable list of users.

-   **Query Parameters**:
    -   `page`: number (e.g., `1`)
    -   `limit`: number (e.g., `10`)
    -   `q`: string (search query for name, email, etc.)
    -   `department`: string
    -   `designation`: string
    -   `status`: 'active' | 'disabled'
-   **Success Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": "1",
          "firstName": "Admin",
          "lastName": "User",
          "username": "admin",
          "email": "admin@expensemanager.com",
          /* ... other user fields ... */
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalItems": 48
      }
    }
    ```

#### `POST /api/admin/users`

Creates a new user.

-   **Request Body**: Contains user details from the "Add User" form.
-   **Success Response (201 Created)**:
    ```json
    {
      "id": "new-user-id",
      /* ... full new user object ... */
    }
    ```

#### `PUT /api/admin/users/[id]`

Updates an existing user.

-   **Request Body**: Contains updated user fields.
-   **Success Response (200 OK)**: Returns the updated user object.

#### `DELETE /api/admin/users/[id]`

Deletes a user.

-   **Success Response (204 No Content)**

#### `PATCH /api/admin/users/[id]`

Updates a user's status (e.g., disable, recover).

-   **Request Body**:
    ```json
    { "status": "disabled" }
    ```
-   **Success Response (200 OK)**: Returns the updated user object.

#### `GET /api/admin/reports/*?export=csv`

Exports report data as a CSV file.

-   **Query Parameters**: `startDate`, `endDate`, `department`, etc.
-   **Success Response (200 OK)**: Returns a `text/csv` file.

### Workflows

#### `POST /api/workflows/start`

Initiates a new workflow.

-   **Request Body**:
    ```json
    {
      "title": "Q3 Marketing Budget",
      "department": "Marketing",
      "startDate": "2024-07-01T00:00:00.000Z",
      "noteSheet": "...",
      "approvers": [{ "id": "jsmith", "type": "user" }],
      "attachmentIds": ["doc-id-1", "doc-id-2"]
    }
    ```
-   **Success Response (201 Created)**:
    ```json
    { "workflowId": "WF-12345" }
    ```

#### `POST /api/workflows/[id]/actions`

Performs an action (approve, reject) on a workflow task.

-   **Request Body**:
    ```json
    {
      "action": "approve",
      "comment": "Looks good.",
      "signature": "data:image/png;base64,..."
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    { "success": true }
    ```

### Docuvity Integration

#### `POST /api/docuvity/upload`

Uploads a file to Docuvity.

-   **Request Body**: `multipart/form-data` with the file.
-   **Success Response (200 OK)**:
    ```json
    {
      "docuvityId": "docuvity-doc-id-123",
      "url": "https://cdn.docuvity.com/..."
    }
    ```

#### `GET /api/docuvity/preview?docId=[docId]`

Gets a secure, tokenized URL for previewing a document.

-   **Success Response (200 OK)**:
    ```json
    {
      "previewUrl": "https://api.docuvity.com/preview/...?token=..."
    }
    ```

### Webhooks

#### `POST /api/webhooks/docuvity`

The frontend does not implement webhook receivers, but it anticipates that the UI may need to reflect state changes triggered by external events (e.g., an e-signature being completed in Docuvity). A real-time notification system (e.g., WebSockets, Server-Sent Events) would be needed to push these updates to the client. When the backend receives a webhook, it should push an event to the relevant client, which can then re-fetch data or update its state optimistically.
