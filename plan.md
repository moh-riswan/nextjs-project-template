```markdown
# Detailed Implementation Plan for the JDIH Web Application

This plan outlines all necessary changes and dependent files to build a complete JDIH (Jaringan Dokumentasi dan Informasi Hukum) website application with a SQL database and an admin panel. The solution is built on Next.js with TypeScript and Tailwind CSS.

---

## 1. Database Setup

### File: database_jdih.sql
- **Create Tables:**
  - **users**: Columns (id PRIMARY KEY, name, email UNIQUE, password [hashed], role, created_at, updated_at).
  - **categories**: Columns (id PRIMARY KEY, name, description, created_at, updated_at).
  - **documents**: Columns (id PRIMARY KEY, title, description, content TEXT, file_path VARCHAR, category_id, published_at, created_at, updated_at).  
    - Add **FOREIGN KEY** for `category_id` referencing `categories`.
  - **audit_logs** (optional): Columns (id, user_id, action, timestamp) to track admin activities.
- **Error Handling:**  
  - Use `IF EXISTS` or `DROP TABLE IF EXISTS` to prevent conflicts.
  - Include sample insertions for a default admin user (with a hashed password).

---

## 2. Backend API Endpoints

### a. Authentication
- **File:** `/src/app/api/auth/login/route.ts`
  - **Method:** POST – Accepts email and password.
  - **Validation:** Use Zod schemas to validate request data.
  - **Logic:**  
    - Connect and verify credentials against the SQL database.
    - Generate and return a JWT token or set a cookie.
  - **Error Handling:**  
    - Return 400 for validation issues, 401 for invalid credentials, and catch DB errors with 500.

### b. Document Management Endpoints
- **File:** `/src/app/api/documents/route.ts`
  - **Methods:**
    - GET: Fetch a list of documents (with optional query filters for category, keyword, etc.).
    - POST: Create a new document record.
  - **Security:**  
    - Require admin JWT token in the Authorization header for mutations.
  - **Validation:** Use Zod for document metadata validation.
  - **Error Handling:** Return proper HTTP status codes for input errors, authentication failures, or DB errors.

- **File:** `/src/app/api/documents/[id]/route.ts`
  - **Methods:** GET (fetch individual document), PUT (update), DELETE (remove document).
  - **Error Handling:**  
    - Validate document existence.
    - Wrap operations in try-catch to return 404 or 500 as needed.

---

## 3. Public Website Pages

### a. Home & Document List
- **File:** `/src/app/page.tsx`
  - **Features:**  
    - Display a list of legal documents with categories.
    - Integrated search box at the top.
  - **UI Considerations:**  
    - Use modern typography and ample spacing with Tailwind CSS.
    - Clean layout with clear headings and lists.

### b. Document Detail View
- **File:** `/src/app/docs/[id].tsx`
  - **Features:**  
    - Show detailed information about a selected document.
    - Provide a download link if a file is attached.
  - **Error Handling:**  
    - Display user-friendly error messages if the document is not found.

---

## 4. Admin Panel Implementation

### a. Admin Authentication & Layout
- **File:** `/src/app/admin/login.tsx`
  - **Features:**  
    - Provide a clean login form (email and password) styled using Tailwind CSS.
    - Display error messages on invalid credentials.
- **File:** `/src/app/admin/dashboard.tsx`
  - **Features:**  
    - Overview of documents (presented in a table or list) with options to create, edit, or delete.
    - Use responsive design and consistent spacing.
- **File:** `/src/app/admin/document-editor.tsx`
  - **Features:**  
    - Form for creating/editing documents.
    - Fields for title, description, category (drop-down), and a file input for uploads.
- **File:** `/src/app/admin/users.tsx`
  - **Features:**  
    - Manage admin or user accounts with basic form fields.
- **Shared Layout:**  
  - Create an admin layout component (e.g., `/src/app/admin/admin-layout.tsx`) for common header and navigation.
  - **Error Handling:**  
    - Implement route protection middleware (or server-side checks) that verify admin JWT status before rendering protected pages.

---

## 5. UI/UX & Best Practices

- **Modern, Minimalist Design:**
  - Use Tailwind CSS classes for typography, spacing, and color themes.
  - Avoid external image libraries; use only simple divs and text for icons or indicators.
- **Form & Input Validation:**
  - Client-side validations (e.g., required fields, proper formatting).
  - Real-time error feedback using clear, contrasting text.
- **Error & Exception Handling:**
  - Wrap API calls in try-catch blocks.
  - Display concise error messages on the UI, and log server-side errors.
- **Security Considerations:**
  - Use secure password hashing (e.g., bcrypt).
  - Protect endpoints via JWT or session validation to prevent unauthorized access.
- **Environment & Dependent Configurations:**
  - Update README with environment variable instructions (DB connection string, JWT secret).
  - Document steps to run the SQL file during initial setup.

---

## 6. Testing & Integration

- **API Testing:**
  - Use curl commands to simulate POST and GET requests for auth and document endpoints.
  - Validate proper HTTP status codes and JSON response structure.
- **UI Testing:**
  - Test forms, page navigations, and admin access through manual browser testing.
  - Ensure responsiveness across devices.
- **Deployment:**
  - Verify environment variables in Vercel or similar deployment platforms.
  - Include error logging and monitoring guidelines.

---

## Summary

- Create a SQL file (`database_jdih.sql`) defining tables for users, categories, documents, and audit logs with proper relationships.  
- Build REST API endpoints for authentication and document management with input validation and error handling using Zod and try-catch blocks.  
- Develop public pages (home and document detail) with modern, responsive Tailwind CSS layouts.  
- Implement an admin panel with dedicated login, dashboard, document editor, and user management pages, all secured via JWT/session checks.  
- Document environment variable requirements and testing procedures in the README, ensuring best practices for security and error handling.
