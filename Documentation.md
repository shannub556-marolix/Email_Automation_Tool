# 📚 Email Automation Tool – Production Documentation

---

## Table of Contents
1. [Introduction](#introduction)
2. [Frontend Architecture](#frontend-architecture)
    - [Tech Stack & Libraries](#frontend-tech-stack--libraries)
    - [Folder Structure](#frontend-folder-structure)
    - [Routing & Navigation](#frontend-routing--navigation)
    - [State Management](#frontend-state-management)
    - [Main Pages & Components](#frontend-main-pages--components)
    - [UI/UX Techniques](#frontend-uiux-techniques)
    - [Security Practices](#frontend-security-practices)
    - [API Integration](#frontend-api-integration)
3. [Backend Architecture](#backend-architecture)
    - [Tech Stack & Libraries](#backend-tech-stack--libraries)
    - [Folder Structure](#backend-folder-structure)
    - [API Design & Endpoints](#backend-api-design--endpoints)
    - [Authentication & Security](#backend-authentication--security)
    - [Database Models](#backend-database-models)
    - [Email Sending Logic](#backend-email-sending-logic)
    - [Error Handling & Validation](#backend-error-handling--validation)
    - [Frontend Integration](#backend-frontend-integration)
4. [Feature-by-Feature & Page-by-Page Explanation](#feature-by-feature--page-by-page-explanation)
5. [Best Practices & Advanced Techniques](#best-practices--advanced-techniques)
6. [Extensibility & Future Enhancements](#extensibility--future-enhancements)
7. [References](#references)

---

## Introduction

The **Email Automation Tool** is a robust, production-ready web application for sending personalized bulk emails using Excel uploads and custom SMTP configurations. It is designed for scalability, security, and ease of use, with a modern tech stack and best practices throughout. This documentation provides a deep dive into the architecture, logic, and design decisions for both frontend and backend, suitable for onboarding developers, technical audits, or future maintainers.

---

## Frontend Architecture

### Frontend Tech Stack & Libraries
- **React** (with Hooks): Component-based UI, SPA architecture
- **TypeScript**: Type safety, better maintainability
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS for rapid, responsive design
- **shadcn-ui**: Modern, accessible UI components
- **Redux Toolkit**: State management (auth, SMTP, email status)
- **React Router**: SPA routing and protected routes
- **Axios**: HTTP client for API calls
- **react-hot-toast**: User notifications
- **Material-UI**: Additional UI elements (Stepper, Paper, Avatar, etc.)

### Frontend Folder Structure
```
Frontend/
  src/
    components/      # Reusable UI components (forms, tables, nav, etc.)
    hooks/           # Custom React hooks
    pages/           # Main route pages (Dashboard, Login, History, etc.)
    services/        # API abstraction (api.js)
    store/           # Redux slices and store config
    config/          # Environment config (API URLs)
    App.tsx          # Main app entry
    main.tsx         # App bootstrap
```

### Frontend Routing & Navigation
- **React Router** is used for SPA navigation.
- **ProtectedRoute** component ensures only authenticated users can access dashboard/history.
- Main routes:
  - `/login` – Login page
  - `/dashboard` – Main workflow (SMTP → Upload → Status)
  - `/history` – Email logs/history
  - `*` – 404 Not Found

### Frontend State Management
- **Redux Toolkit** manages global state:
  - `authSlice`: Auth state, JWT, user info
  - `smtpSlice`: SMTP config, validation status
  - `emailSlice`: Email upload, status, logs, selection
- **Persisted State**: JWT token and user info are persisted for session continuity.

### Frontend Main Pages & Components
- **LoginPage.jsx**: Auth form, redirects if already logged in
- **DashboardPage.jsx**: Stepper UI for SMTP setup, file upload, and status view
- **SMTPForm.jsx**: Collects and validates SMTP credentials, email subject/body
- **UploadForm.jsx**: Drag-and-drop or browse Excel upload, file validation, triggers email sending
- **EmailStatusView.jsx**: Real-time status of current batch (sent, pending, failed)
- **EmailHistoryPage.jsx**: Searchable, filterable log of all sent emails, with delete/clear options
- **EmailTable.jsx**: Tabular display of email logs
- **Pagination.jsx**: Paginated navigation for logs
- **Navbar.jsx**: Top navigation bar
- **ProtectedRoute.jsx**: Guards private routes
- **ProgressBar.jsx**: Visual feedback for sending progress
- **SearchBar.jsx**: Search/filter for logs

### Frontend UI/UX Techniques
- **Stepper Workflow**: Guides users through SMTP setup → upload → status
- **Responsive Design**: Tailwind and shadcn-ui ensure mobile and desktop usability
- **Toasts & Feedback**: `react-hot-toast` for instant user feedback
- **Form Validation**: Client-side checks for required fields, email format, file type
- **Accessibility**: Semantic HTML, ARIA roles, keyboard navigation
- **Error Boundaries**: User-friendly error messages and fallback UI

### Frontend Security Practices
- **JWT Storage**: JWT stored in memory or secure storage, not in localStorage if possible
- **Protected Routes**: Only authenticated users can access sensitive pages
- **Input Sanitization**: Prevents XSS in forms and templates
- **API Error Handling**: Graceful handling of backend errors

### Frontend API Integration
- **API Layer**: All backend calls are abstracted in `services/api.js`
- **Token Handling**: JWT is attached to API requests for protected endpoints
- **Error Handling**: API errors are caught and displayed to users

---

## Backend Architecture

### Backend Tech Stack & Libraries
- **FastAPI**: High-performance Python web framework
- **Pydantic**: Data validation and serialization
- **Motor**: Async MongoDB driver
- **smtplib**: Native Python SMTP for email sending
- **openpyxl / pandas**: Excel file parsing and data extraction
- **bcrypt**: Password hashing
- **PyJWT**: JWT token creation and validation
- **Uvicorn**: ASGI server for FastAPI

### Backend Folder Structure
```
Backend/
  routers/         # API route handlers (auth, email, smtp)
  models/          # Database models (User, EmailRecord)
  schemas.py       # Pydantic schemas for request/response
  utils.py         # Utility functions (JWT, SMTP validation, etc.)
  config.py        # App config (env vars, secrets)
  database.py      # MongoDB connection
  main.py          # FastAPI app entrypoint
```

### Backend API Design & Endpoints
- **/auth/register**: User registration
- **/auth/login**: User login, returns JWT
- **/smtp/validate**: Validates SMTP credentials
- **/upload-excel**: Uploads Excel, parses, queues emails
- **/emails/status**: Real-time status for a batch
- **/emails/logs**: Paginated, searchable email logs
- **/emails** (DELETE): Bulk delete selected emails
- **/emails/clear**: Clear all email logs for user

### Backend Authentication & Security
- **JWT Auth**: All protected endpoints require a valid JWT
- **Password Hashing**: User passwords are hashed with bcrypt
- **SMTP Credentials**: Only validated SMTP credentials are accepted
- **Input Validation**: Pydantic schemas and custom checks for all inputs
- **CORS**: Configured for secure frontend-backend communication

### Backend Database Models
- **User**: Stores email, password hash, created_at
- **EmailRecord**: Stores recipient, status, error, timestamp, subject, body, user_id, batch_id
- **Batch**: (Implicit via batch_id) for grouping emails

### Backend Email Sending Logic
- **Excel Parsing**: Reads `.xlsx` file, extracts emails and dynamic fields
- **Personalization**: Replaces placeholders in subject/body with row data
- **Batch Processing**: Each upload is a batch; emails are queued and sent asynchronously
- **Status Tracking**: Each email record is updated with sent/failed/pending
- **Error Handling**: SMTP errors, invalid emails, and other issues are logged per record

### Backend Error Handling & Validation
- **Custom Exceptions**: For invalid tokens, bad SMTP, malformed Excel, etc.
- **Detailed Error Messages**: Returned to frontend for user feedback
- **Logging**: Errors and important events are logged for auditability

### Backend Frontend Integration
- **RESTful API**: Clean, versionable endpoints
- **CORS**: Allows secure cross-origin requests from frontend
- **Consistent Schemas**: Pydantic ensures predictable API responses

---

## Feature-by-Feature & Page-by-Page Explanation

### 1. **Authentication (Login/Register)**
- **Frontend**: LoginPage.jsx, LoginForm.jsx, Redux `authSlice`
- **Backend**: `/auth/register`, `/auth/login`, JWT, bcrypt
- **Logic**: User registers/logins, receives JWT, which is used for all protected actions

### 2. **SMTP Setup**
- **Frontend**: SMTPForm.jsx, Redux `smtpSlice`
- **Backend**: `/smtp/validate`, SMTP validation utility
- **Logic**: User enters SMTP credentials, validated in real-time before proceeding

### 3. **Excel Upload & Email Personalization**
- **Frontend**: UploadForm.jsx, drag-and-drop, file validation
- **Backend**: `/upload-excel`, pandas/openpyxl for parsing, placeholder replacement
- **Logic**: User uploads Excel, backend parses and queues emails, replacing placeholders with row data

### 4. **Bulk Email Sending**
- **Frontend**: DashboardPage.jsx, progress/status UI
- **Backend**: Background tasks for sending, status updates in DB
- **Logic**: Emails are sent asynchronously, status is updated in real-time

### 5. **Status Tracking**
- **Frontend**: EmailStatusView.jsx, ProgressBar.jsx
- **Backend**: `/emails/status`, aggregation pipeline for counts
- **Logic**: User sees real-time stats for sent, failed, pending emails in a batch

### 6. **Email History & Logs**
- **Frontend**: EmailHistoryPage.jsx, EmailTable.jsx, SearchBar.jsx, Pagination.jsx
- **Backend**: `/emails/logs`, `/emails`, `/emails/clear`
- **Logic**: User can search, filter, delete, or clear email logs

### 7. **UI/UX & Navigation**
- **Frontend**: Navbar.jsx, ProtectedRoute.jsx, responsive design, toasts
- **Logic**: Smooth navigation, feedback, and error handling throughout

---

## Best Practices & Advanced Techniques
- **Async/Await**: Backend uses async DB and email operations for scalability
- **Separation of Concerns**: Clear separation between API, business logic, and data models
- **Type Safety**: TypeScript on frontend, Pydantic on backend
- **Security**: JWT, bcrypt, CORS, input validation, error handling
- **User Experience**: Stepper workflow, real-time feedback, mobile-first design
- **Extensibility**: Modular codebase, easy to add new features or endpoints

---

## Extensibility & Future Enhancements
- **Email Scheduling**: Add Celery or APScheduler for scheduled campaigns
- **HTML Templates**: Integrate a WYSIWYG editor and support for attachments
- **Analytics**: Track opens, clicks, and bounces (Mailgun, SendGrid, etc.)
- **User Roles**: RBAC for admin/manager/viewer
- **Integrations**: Google Sheets, CRMs, Notion API
- **Internationalization**: i18n for multi-language support

---

## References
- [Live Demo](https://email-automation-tool-one.vercel.app/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-ui](https://ui.shadcn.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [openpyxl](https://openpyxl.readthedocs.io/en/stable/)
- [pandas](https://pandas.pydata.org/)

---

*For further questions or contributions, see the main [README](./README.md) or contact the project maintainer.* 