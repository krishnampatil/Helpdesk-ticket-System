# Helpdesk Ticket System (Back-End API)

A robust and secure Helpdesk Ticketing system back-end built with **Node.js**, **Express**, and **MongoDB**. This project provides a fully featured API for managing customer support tickets, featuring secure authentication, Role-Based Access Control (RBAC), automatic SLA calculations, file attachments support, threaded public comments, internal private notes, and admin management with analytics dashboards.

---

## 🚀 Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **JSON Web Tokens (JWT)** based authentication.
- **Three user roles** with specific operational scopes:
  - **Customer**: Create tickets, view their own tickets, and add/view public comments.
  - **Agent**: Update ticket status, assign tickets, view all tickets, and post internal private notes.
  - **Admin**: All agent capabilities plus user directory management (list, update roles, deactivate, delete users) and access to helpdesk analytics.

### 2. Ticket Lifecycle Management
- **Creation**: Customers can create tickets with a title, description, priority, and optional attachments.
- **Automatic SLA Calculation**: Tickets calculate due dates (`slaDueAt`) automatically based on priority:
  - `low` $\rightarrow$ 72 hours
  - `medium` $\rightarrow$ 48 hours
  - `high`/`urgent` $\rightarrow$ 24 hours
- **Assignment**: Agents and Admins can assign tickets to specific agents.
- **Status Updates**: Track ticket progress through statuses: `open`, `in_progress`, `waiting`, `resolved`, and `closed`. Resolving a ticket automatically records the `resolvedAt` timestamp.
- **Deletions**: Admins can clean up and delete tickets.

### 3. File Attachments
- Middleware powered by **Multer** handles file uploads.
- Upload filters validate size limits (up to 5MB) and allow specific MIME types (`jpg`, `png`, `pdf`, `txt`).
- Uploaded assets are saved to the local `/uploads` directory and served statically.

### 4. Interactive Comments & Notes
- Customers and agents can discuss ticket resolutions in a comment thread.
- Support for uploading files directly inside comments.
- **Internal Notes**: Agents and Admins can create private internal notes (comments flagged with `isInternal: true`) that are completely hidden from Customers.

### 5. Admin Panel & Analytics Dashboard
- View, search, update roles (promote/demote), and activate/deactivate user accounts.
- Fetch overall ticket analytics (total, open, and resolved counts).
- Run aggregations to view ticket breakdown by current status.
- Group metrics to see total workload assigned to each support agent.

---

## 🛠️ Technology Stack
- **Runtime Environment**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: `jsonwebtoken`, `bcryptjs`
- **File Uploads**: `multer`
- **Developer Utilities**: `nodemon` (auto-reloads on development changes), `morgan` (HTTP logging), `express-validator` (payload validation)

---

## 📂 Project Structure
```text
helpdeskproject/
├── config/
│   └── db.js            # MongoDB connection settings
├── middleware/
│   ├── auth.js          # JWT authentication check
│   ├── rbac.js          # Role-Based Access Control validator
│   └── upload.js        # Multer upload configuration & filters
├── models/
│   ├── User.js          # Schema for User accounts (Customer, Agent, Admin)
│   ├── Ticket.js        # Schema for Tickets (SLA, attachments, assignments)
│   └── Comment.js       # Schema for Threaded Comments and Internal Notes
├── routes/
│   ├── auth.js          # /auth authentication endpoints
│   ├── tickets.js       # /tickets core operations
│   ├── comments.js      # /tickets/:id/comments operations
│   └── admin.js         # /admin panel operations & analytics
├── uploads/             # Directory where uploaded files are stored
├── .gitignore           # List of files excluded from Git tracking
├── nodemon.json         # Nodemon ignore settings (ignores upload changes)
├── package.json         # Project manifests and dependencies
├── server.js            # Express application entrypoint
└── README.md            # Project documentation (this file)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB instance (Local or Atlas)

### Step 1: Clone the Repository
```bash
git clone https://github.com/krishnampatil/Helpdesk-ticket-System.git
cd Helpdesk-ticket-System
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a file named `.env` in the root of the project and add the following configuration:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_super_secret_jwt_key
```
> ⚠️ **Note**: Make sure to replace the `MONGO_URI` and `JWT_SECRET` with your actual MongoDB connection string and a secure secret key.

### Step 4: Run the Application
Start the development server using `nodemon`:
```bash
npm run dev
```
The server will boot up and start listening on port `5001` (or the port defined in `.env`).

---

## 🌐 API Reference

All requests must set the `Content-Type: application/json` header, except for routes that handle file uploads, which use `multipart/form-data`. Protected routes require the `Authorization` header with a valid JWT token.

### Authentication (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Public | Register a new user (`name`, `email`, `password`, and optional `role`). |
| **POST** | `/auth/login` | Public | Authenticate a user and receive a JWT token (`email`, `password`). |
| **GET** | `/auth/me` | Authenticated | Retrieve current user profile details. |

### Tickets (`/tickets`)

| Method | Endpoint | Access | Request Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/tickets` | Customer | `multipart/form-data` | Create a ticket. Accepts fields `title`, `description`, `priority`, and files under `attachments`. |
| **GET** | `/tickets` | Authenticated | JSON | List tickets. Customers see their own tickets; Agents/Admins see all tickets. |
| **GET** | `/tickets/:id` | Authenticated | JSON | Get detailed info for a single ticket. |
| **PATCH** | `/tickets/:id/status` | Agent / Admin | JSON | Update ticket status (`open`, `in_progress`, etc.). Setting to `resolved` adds resolution timestamp. |
| **PATCH** | `/tickets/:id/assign` | Agent / Admin | JSON | Assign a ticket to an agent (`assignedTo` agent ID). |
| **GET** | `/tickets/:id/attachments` | Authenticated | JSON | Get list of file attachment paths for a ticket. |
| **DELETE** | `/tickets/:id` | Admin | JSON | Delete a ticket entirely. |

### Ticket Comments (`/tickets/:id/comments`)

| Method | Endpoint | Access | Request Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/tickets/:id/comments` | Authenticated | `multipart/form-data` | Post a comment. Accepts fields `body`, `isInternal` (boolean), and files under `attachments`. |
| **GET** | `/tickets/:id/comments` | Authenticated | JSON | Retrieve comment thread. Customer views exclude comments where `isInternal: true`. |

### Admin Dashboard & Analytics (`/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/admin/users` | Admin | List all registered users (excluding password hashes). |
| **PATCH** | `/admin/users/:id` | Admin | Update user details (e.g. modify `role` or toggle `isActive` flag). |
| **DELETE** | `/admin/users/:id` | Admin | Remove a user account. |
| **GET** | `/admin/analytics/overview` | Admin | Fetch ticket summary counts: total, open, and resolved. |
| **GET** | `/admin/analytics/by-status` | Admin | Fetch tickets grouped by status. |
| **GET** | `/admin/analytics/by-agent` | Admin | Fetch workload breakdown showing ticket counts assigned to each agent. |

---

## 🔒 Security & Validation Details
- **Password Hashing**: Passwords are saved as one-way secure hashes using `bcryptjs` (salt rounds: 10).
- **Express-Validator**: Validates email formats and enforces password length constraints during registration.
- **Cross-Origin Resource Sharing (CORS)**: Preconfigured middleware allows secure cross-origin API integration.
