# CardVault - Credit Card Management System

A full-stack banking dashboard built with React.js and Node.js.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, React Hot Toast  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, PDFKit

---

## Project Structure

```
amazon-q-project/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation bar
│   │   ├── Sidebar.jsx           # Collapsible sidebar
│   │   ├── CardList.jsx          # Credit card grid
│   │   ├── CardForm.jsx          # Create/edit card modal
│   │   ├── UserTable.jsx         # Users data table
│   │   └── Loader.jsx            # Loading spinner & skeletons
│   ├── pages/
│   │   ├── Login.jsx             # Authentication page
│   │   ├── Dashboard.jsx         # Main dashboard with charts
│   │   ├── Profile.jsx           # User profile & settings
│   │   ├── Users.jsx             # User management (admin)
│   │   ├── CreditCards.jsx       # Card management
│   │   └── NotFound.jsx          # 404 page
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management
│   ├── services/
│   │   └── api.js                # Axios API service layer
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Route guards
│   ├── App.jsx                   # Root component & routing
│   └── main.jsx                  # React entry point
│
└── backend/                      # Node.js Backend
    ├── config/
    │   └── db.js                 # MongoDB connection
    ├── models/
    │   ├── User.js               # User mongoose model
    │   └── CreditCard.js         # Credit card mongoose model
    ├── controllers/
    │   ├── authController.js     # Auth logic
    │   ├── userController.js     # User CRUD
    │   └── cardController.js     # Card CRUD + PDF + PIN
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   └── cardRoutes.js
    ├── middleware/
    │   └── authMiddleware.js     # JWT verification
    ├── server.js                 # Express app entry
    └── .env                      # Environment variables
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Backend Environment
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/creditcard_db
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Install Frontend Dependencies
```bash
# From project root
npm install
```

### 4. Seed Admin User
Start MongoDB, then run the seeder:
```bash
cd backend
node seed.js
```

### 5. Start Backend
```bash
cd backend
npm run dev
```

### 6. Start Frontend
```bash
# From project root
npm run dev
```

### 7. Open Browser
Visit: `http://localhost:5173`

---

## Default Login Credentials

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@cardvault.com     | admin123   |
| User  | user@cardvault.com      | user123    |

---

## API Reference

### Auth
| Method | Endpoint              | Description       | Auth |
|--------|-----------------------|-------------------|------|
| POST   | /api/auth/register    | Register user     | No   |
| POST   | /api/auth/login       | Login             | No   |
| POST   | /api/auth/logout      | Logout            | Yes  |
| GET    | /api/auth/profile     | Get auth profile  | Yes  |

### Users
| Method | Endpoint                    | Description          | Auth  |
|--------|-----------------------------|----------------------|-------|
| GET    | /api/users                  | List all users       | Admin |
| POST   | /api/users                  | Create user          | Admin |
| GET    | /api/users/:id              | Get user by ID       | Admin |
| PUT    | /api/users/:id              | Update user          | Admin |
| DELETE | /api/users/:id              | Delete user          | Admin |
| PUT    | /api/users/profile          | Update own profile   | Yes   |
| PUT    | /api/users/change-password  | Change password      | Yes   |

### Credit Cards
| Method | Endpoint                    | Description          | Auth |
|--------|-----------------------------|----------------------|------|
| GET    | /api/cards                  | List all cards       | Yes  |
| POST   | /api/cards                  | Create card          | Yes  |
| GET    | /api/cards/:id              | Get card by ID       | Yes  |
| PUT    | /api/cards/:id              | Update card          | Yes  |
| DELETE | /api/cards/:id              | Delete card          | Yes  |
| PUT    | /api/cards/change-pin/:id   | Change PIN           | Yes  |
| GET    | /api/cards/download/:id     | Download PDF         | Yes  |
| GET    | /api/cards/stats            | Dashboard statistics | Yes  |

---

## Features

- **JWT Authentication** - Secure login with token-based auth
- **Role-Based Access** - Admin vs User permissions
- **Credit Card CRUD** - Create, read, update, delete cards
- **PIN Management** - Encrypted 4-digit PIN change
- **PDF Download** - Generate card details as PDF
- **Dashboard Charts** - Pie chart (status) + Bar chart (registrations)
- **User Management** - Admin can manage all users
- **Dark Mode** - System-wide dark/light toggle
- **Responsive UI** - Mobile, tablet, and desktop layouts
- **Search & Filter** - Real-time search with debouncing
- **Pagination** - Server-side pagination for lists
- **Toast Notifications** - Success/error feedback

## Security

- Bcrypt password hashing (12 salt rounds)
- PIN and CVV hashing at rest
- JWT token verification middleware
- Helmet.js HTTP headers
- CORS protection
- MongoDB sanitization (injection prevention)
- Rate limiting (100 req/15min)
- Sensitive fields excluded from API responses
