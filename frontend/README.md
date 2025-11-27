# JStore Frontend - React + TypeScript + Tailwind CSS

Modern e-commerce frontend built with React, TypeScript, Vite, Tailwind CSS, and Shadcn/ui that consumes the JStore Spring Boot REST API.

## 🎯 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios with JWT interceptor
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn/ui base components
│   │   ├── layout/          # Header, Footer, Navbar
│   │   ├── product/         # Product components
│   │   └── cart/            # Cart components
│   ├── pages/               # Route pages
│   ├── services/            # API services with JWT auth
│   ├── store/               # Zustand state stores
│   ├── types/               # TypeScript definitions
│   ├── lib/                 # Utilities (cn function)
│   └── hooks/               # Custom React hooks
├── public/
└── package.json
```

## ✅ Implemented Features

### Core Infrastructure
- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS with custom theme
- ✅ Path aliases (@/* imports)
- ✅ Proxy to backend API (localhost:8080)

### API Integration
- ✅ Axios client with JWT interceptor
- ✅ Auth Service (login, register, logout)
- ✅ Product Service (CRUD, search, inventory)
- ✅ Cart Service (add, update, remove, clear)
- ✅ Order Service (checkout, history, cancel)
- ✅ Review Service (create, view, ratings)

### State Management
- ✅ Auth Store (user session, JWT token)
- ✅ Cart Store (shopping cart state)

### UI Components
- ✅ Button (6 variants)
- ✅ Input
- ✅ Card (with Header, Title, Content, Footer)
- ✅ Badge (for cart count)
- ✅ Label (for forms)

## 🚀 Getting Started

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

App runs on: **http://localhost:5173**

## 🔌 Backend API

**Base URL**: http://localhost:8080
**Auth**: JWT Bearer Token
**Endpoints**: 21+ REST APIs

See `/home/thanhjash/JStore/docs/` for complete API documentation.

## 🎨 Theme

Custom Tailwind theme with CSS variables for colors. Supports light/dark mode.

---

**Status**: ✅ Foundation Complete - Ready for UI Development
**Next**: Authentication pages → Layout → Product pages → Integration Testing
