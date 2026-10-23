# 🎫 ResolveDesk - Enterprise Customer Support Ticket System (CSTS)

A complete, production-ready fullstack Customer Support Ticket Management System built with **React (Vite), Express.js, and MongoDB (Mongoose)**. Inspired by enterprise platforms like Zendesk, Freshdesk, and Linear.

---

## ✨ Features

### 1. 💬 Live Conversation Threads & Ticket Discussion
- Each ticket has its own dedicated message feed where customers and support agents reply to one another in real-time.
- Staff responses display distinct agent/admin badges and timestamps.
- Replying as an agent automatically transitions new tickets from `Open` to `In Progress`.

### 2. 📊 Dynamic Ticket Queue & Analytics Dashboard
- Live KPI cards: Total Tickets, Open Issues, In Progress, Resolved count, and Resolution Rate percentage.
- Instant search across ticket subject, description, customer name, and category.
- Status filters (`All`, `Open`, `In Progress`, `Resolved`, `Closed`) with live counters.
- Priority filters (`Urgent`, `High`, `Medium`, `Low`) and Category filters (`General`, `Billing`, `Technical`, `Account`, `Feature Request`).
- Sorting by Newest First, Oldest First, and Highest Priority.

### 3. 🛡️ Role-Based Workflows
- **Customer**: Can create tickets, view own ticket history, and reply to their active tickets.
- **Support Agent**: Can access all company tickets, change ticket status, assign tickets, and reply to customers.
- **Administrator**: Full system authority, agent re-assignments, status overrides, and ticket deletion.

### 4. 📚 Help Center & Self-Service Knowledge Base (FAQs)
- Searchable FAQ directory covering Billing, Technical Bugs, and Account Security.
- Allows users to find answers before opening a support ticket.

### 5. ⚡ Clean, Fast & Modern SaaS UI
- Built with a sleek dark slate theme, responsive layout, modal overlays, and toast notifications.
- Zero lag, lightweight (no heavy 3D canvas).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing

---

## 🚀 Running the Project

### 1. Start Backend Server
```bash
npm run dev:backend
```
Backend runs on `http://localhost:5000`.

### 2. Start Frontend App
```bash
npm run dev:frontend
```
Frontend runs on `http://localhost:5173`.

---

## 📬 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (Customer / Agent / Admin) | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/auth/me` | Current user profile | Private |
| `GET` | `/api/auth/agents` | List of support agents for ticket assignment | Staff only |

### Tickets (`/api/tickets`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/tickets` | Open a new support ticket | Private |
| `GET` | `/api/tickets` | Get tickets list (Customer's own or All for Staff) | Private |
| `GET` | `/api/tickets/:id` | Get ticket details and conversation thread | Private |
| `POST` | `/api/tickets/:id/comments` | Post a reply to the ticket discussion | Private |
| `PUT` | `/api/tickets/:id` | Update status, priority, or assigned agent | Private |
| `DELETE` | `/api/tickets/:id` | Delete ticket (Admin or Owner) | Private |

---

## 🧪 Postman Collection
Import the file `Customer_Support_API.postman_collection.json` into Postman to instantly test all endpoints.
