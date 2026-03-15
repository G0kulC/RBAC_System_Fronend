# RBAC Student Frontend

A React-based frontend for a Role-Based Access Control (RBAC) student management system. Built with Vite, Tailwind CSS, and React Router.

## Tech Stack

| Tool | Version |
|------|---------|
| React | 18.3.1 |
| React Router | 6.24.0 |
| Axios | 1.7.2 |
| Tailwind CSS | 3.4.4 |
| Vite | 5.3.1 |

## Features

- **Role-based dashboards** — Admin, Teacher, and Student each get a dedicated UI
- **JWT authentication** — Token stored in `localStorage`, auto-attached to every request via Axios interceptor
- **Auto-logout** — 401 responses clear credentials and redirect to `/login`
- **Dark mode** — Class-based Tailwind dark mode, persisted in `localStorage`
- **Protected routes** — `ProtectedRoute` component guards pages by role

## Roles

| Role | Dashboard | Capabilities |
|------|-----------|-------------|
| `admin` | `/admin/*` | Add/edit/delete students, manage user accounts, view stats |
| `teacher` | `/teacher/*` | Browse students, view and update marks |
| `student` | `/student/*` | View personal profile, marks, grades, and performance metrics |

## Project Structure

```
src/
├── api/
│   └── axios.js            # Axios instance with JWT interceptors
├── components/
│   ├── Navbar.jsx           # Top nav with role badge, dark mode toggle, logout
│   └── ProtectedRoute.jsx   # Route guard — checks token and role
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── AdminDashboard.jsx
│   ├── TeacherDashboard.jsx
│   └── StudentDashboard.jsx
├── App.jsx                  # Root component with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- The [FastAPI backend](../backend/) running on `http://localhost:8000`

### Install & Run

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## API Proxy

During development, Vite proxies all `/api` requests to `http://localhost:8000` and strips the `/api` prefix. This avoids CORS issues in development.

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

## Authentication Flow

1. User logs in → backend returns a JWT token
2. Token, role, and username are saved to `localStorage`
3. Every Axios request automatically includes `Authorization: Bearer <token>`
4. `ProtectedRoute` checks the token and role before rendering a dashboard
5. On any `401` response, credentials are cleared and the user is redirected to `/login`

## Routes

| Path | Access | Component |
|------|--------|-----------|
| `/login` | Public | `Login.jsx` |
| `/register` | Public | `Register.jsx` |
| `/admin/*` | Admin only | `AdminDashboard.jsx` |
| `/teacher/*` | Teacher only | `TeacherDashboard.jsx` |
| `/student/*` | Student only | `StudentDashboard.jsx` |
| `/` | — | Redirects to `/login` |
