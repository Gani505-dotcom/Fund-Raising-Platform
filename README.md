<div align="center">

# 🌿 NayePankh Fundraising Portal

**Together, We Can Create a Better Tomorrow.**

A full-stack fundraising and donation management platform built for **NayePankh Foundation**, enabling volunteers and interns to raise funds through personalized referral links, track donations in real time, and manage campaigns end-to-end.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

[Live Demo](#-live-deployment) · [Report Bug](#-support--contact) · [Request Feature](#-support--contact)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Payment Integration](#-payment-integration)
- [Referral System](#-referral-system)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [Author](#-author)

---

## 🌟 Overview

**NayePankh Fundraising Portal** is a production-structured web application that empowers volunteers, interns, and supporters to raise funds on behalf of NayePankh Foundation. Each registered user receives a **unique referral code** and a **personalized donation link**, which they can share via WhatsApp, social media, or QR code. Every donation made through that link is automatically attributed to the referrer, with real-time dashboard updates, analytics, and transaction tracking.

The platform is built to feel like a real NGO fundraising SaaS product — not a prototype — with secure authentication, verified payment processing, an admin panel, and a fully responsive interface across desktop, tablet, and mobile.

**Core user journey:**

1. A user registers and receives a unique referral code (e.g. `NPF-GANI-8X92`).
2. The system generates a personalized donation link.
3. The user shares the link via WhatsApp, social platforms, or QR code.
4. A donor opens the link — the referral code is detected and validated server-side.
5. The donor completes a secure payment (Razorpay or Mock Payment Mode).
6. The backend verifies the payment and records the transaction.
7. The referrer's dashboard, transactions, and analytics update automatically.

---

## ✨ Features

### Public
- Modern landing page, campaign listings, and campaign detail pages
- Secure donation flow with referral tracking
- FAQ, About, Contact, Privacy Policy, and Terms pages

### User Portal
- Registration & login with JWT authentication
- Personal dashboard with fundraising goal, progress bar, and stats
- Unique referral code & shareable donation link (with QR code)
- One-click **Copy Link** and **Share on WhatsApp**
- Transaction history with search, filters, sorting, and pagination
- Downloadable PDF donation receipts
- Referral Center with click/visit/conversion funnel analytics
- Notifications, profile management, and settings
- Milestone badges and a top-fundraiser leaderboard

### Admin Portal
- Admin dashboard with platform-wide statistics
- User management (search, activate/deactivate)
- Campaign management (create, edit, delete, activate/deactivate)
- Transaction management with CSV/Excel export
- Referral analytics and downloadable reports

### Platform-Wide
- Fully responsive (375px → 1920px) with mobile drawer navigation
- Accessible (semantic HTML, ARIA labels, keyboard navigation)
- Toast notifications, skeleton loaders, and empty/error states
- Optional dark mode and PWA installability
- Swagger/OpenAPI documentation at `/api-docs`

---

## 🛠 Tech Stack

**Frontend**
| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Axios | HTTP client |
| TanStack React Query | Server-state & caching |
| React Hook Form + Zod | Form handling & validation |
| Recharts | Analytics charts |
| Lucide React | Icons |

**Backend**
| Tool | Purpose |
|---|---|
| Node.js + Express + TypeScript | REST API server |
| Prisma ORM | Database access layer |
| MySQL | Relational database |
| JWT + bcrypt | Authentication & password hashing |
| Helmet, CORS, rate-limiting | Security middleware |

**Payments**
- Razorpay Checkout & Orders API
- Built-in **Mock Payment Mode** for demos without live credentials

**Deployment**
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: Railway MySQL / PlanetScale-compatible MySQL

---

## 🏗 Architecture

```
Frontend (React + Vite)
        │  Axios / React Query
        ▼
Backend API (Express + TypeScript)
        │  Prisma ORM
        ▼
MySQL Database
        │
        ▼
Razorpay API (or Mock Payment Mode)
```

Key architectural principles:
- **Referral integrity is server-enforced.** The frontend never decides which user a donation belongs to — the backend validates the referral code, verifies it belongs to an active user, and confirms the campaign is active before recording a transaction.
- **Payments are verified server-side.** A transaction is only marked `SUCCESS` after the backend validates the Razorpay payment signature — never based on a frontend response alone.
- **Swap-in-ready payments.** Mock Payment Mode and live Razorpay share the same order/verification interface, so switching to production requires only environment variable changes.

---

## 🗄 Database Schema

Managed via Prisma ORM (`prisma/schema.prisma`).

| Model | Key Fields |
|---|---|
| **User** | `id`, `name`, `email`, `phone`, `password`, `role`, `referralCode`, `profileImage`, `isActive` |
| **Campaign** | `id`, `title`, `slug`, `description`, `goalAmount`, `raisedAmount`, `image`, `category`, `startDate`, `endDate`, `status` |
| **Donation** | `id`, `donorName`, `donorEmail`, `donorPhone`, `amount`, `campaignId`, `referrerId`, `referralCode`, `paymentId`, `orderId`, `status`, `isAnonymous`, `message` |
| **Notification** | `id`, `userId`, `title`, `message`, `type`, `isRead` |
| **ReferralClick** | `id`, `referralCode`, `userId`, `ipAddress`, `userAgent` |

Donation `status` values: `PENDING` · `SUCCESS` · `FAILED` · `REFUNDED`
User `role` values: `USER` · `ADMIN`

Run migrations with:
```bash
npx prisma migrate dev
npx prisma generate
```

---

## 📡 API Documentation

Interactive Swagger/OpenAPI docs are available at **`/api-docs`** once the backend is running. Summary of endpoints:

**Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

**Users**
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/password
```

**Campaigns**
```
GET    /api/campaigns
GET    /api/campaigns/:id
POST   /api/campaigns          (admin)
PUT    /api/campaigns/:id      (admin)
DELETE /api/campaigns/:id      (admin)
```

**Donations**
```
POST   /api/donations/create-order
POST   /api/donations/verify
GET    /api/donations/my-donations
GET    /api/donations/:id
```

**Referrals**
```
GET    /api/referrals/me
GET    /api/referrals/stats
GET    /api/referrals/transactions
```

**Admin**
```
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/donations
GET    /api/admin/campaigns
GET    /api/admin/reports
```

---

## 🔐 Authentication

- **JWT-based** authentication with short-lived access tokens
- Passwords hashed with **bcrypt**
- Sessions stored via **HTTP-only, secure cookies** (not exposed to client-side JavaScript) rather than relying solely on `localStorage`
- **Role-based access control**: `USER` and `ADMIN` roles, enforced by middleware on protected and admin routes
- Protected routes: `/dashboard`, `/transactions`, `/referrals`, `/profile`, `/settings`
- Admin-only routes: `/admin/*`

---

## 💳 Payment Integration

**Razorpay** is used for real Indian payment processing:

1. Frontend requests a payment order from the backend.
2. Backend creates a Razorpay order and returns the order ID.
3. Frontend opens Razorpay Checkout.
4. On completion, Razorpay returns payment details to the frontend.
5. Backend **independently verifies the payment signature** before persisting the transaction.
6. Only verified, successful payments are stored as `SUCCESS`.

**Mock Payment Mode** (`MOCK_PAYMENT=true`) lets evaluators simulate successful, failed, and cancelled payments without live Razorpay credentials — ideal for demos and local development. Switching to production requires only updating environment variables; no application logic changes are needed.

> 🔒 Razorpay secret keys are **never** exposed to the frontend and are only referenced via environment variables on the backend.

---

## 🔗 Referral System

Every user receives a unique referral code (e.g. `NPF-GANI-8X92`) and a personalized donation link:

```
https://naye-pankh-fundraise.com/donate?ref=NPF-GANI-8X92
```

- **Copy Donation Link** — copies the link to the clipboard with a confirmation toast (with a graceful fallback if clipboard permissions are denied)
- **Share on WhatsApp** — opens a pre-filled, URL-encoded WhatsApp message containing the donor's personalized link
- Additional sharing: Telegram, Facebook, LinkedIn, Email, and the native Web Share API on supported mobile devices
- **Downloadable QR code** for offline sharing

**Server-side validation on every donation:**
1. The referral code exists.
2. It belongs to an active user.
3. The associated campaign is active.

Referral clicks, page visits, payment initiations, and successful donations are tracked to power a conversion funnel on the **Referral Center** page.

---

## 📸 Screenshots

> _Add screenshots or GIFs of the Landing Page, Dashboard, Referral Center, Donation Flow, and Admin Panel here once available._

| Landing Page | User Dashboard | Referral Center |
|---|---|---|
| _placeholder_ | _placeholder_ | _placeholder_ |

---

## ⚙️ Installation

**Prerequisites**
- Node.js 18+
- MySQL 8+
- npm or yarn

```bash
# Clone the repository
git clone https://github.com/<username>/naye-pankh-fundraising.git
cd naye-pankh-fundraising

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```
---

## ▶️ Running Locally

```bash
# 1. Set up the database
cd backend
npx prisma migrate dev
npx prisma db seed

# 2. Start the backend (http://localhost:5000)
npm run dev

# 3. Start the frontend (http://localhost:5173)
cd ../frontend
npm run dev
```

Seed data includes 5 campaigns, 10 users, 25 donations, referral statistics, and notifications so the dashboard is populated for demonstration.

---

## 🧪 Testing

**Frontend** (Vitest + React Testing Library)
```bash
cd frontend
npm run test
```
Covers: login form, donation form, referral code generation, copy-link behavior, dashboard rendering.

**Backend**
```bash
cd backend
npm run test
```
Covers: authentication, referral validation, donation creation, payment verification.

---

## 🚀 Deployment

| Layer | Suggested Platform |
|---|---|
| Frontend | Vercel / Netlify |
| Backend | Render / Railway |
| Database | Railway MySQL / PlanetScale-compatible MySQL |

Ensure CORS is configured to allow only the deployed `FRONTEND_URL`.

### Live Deployment
- **Frontend:** `https://naye-pankh-fundraising.vercel.app`
- **Backend API:** `https://naye-pankh-api.onrender.com`
- **Repository:** `https://github.com/<username>/naye-pankh-fundraising`

---

## 📁 Project Structure

```
naye-pankh-fundraising/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── layouts/        # Sidebar/dashboard/public layouts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer (Axios)
│   │   ├── context/        # Auth & global context providers
│   │   ├── utils/          # Helpers & formatters
│   │   ├── types/          # TypeScript types
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── services/       # Business logic (referrals, payments)
│   │   ├── models/
│   │   ├── utils/
│   │   ├── config/
│   │   └── server.ts
│   └── package.json
│
├── prisma/
│   └── schema.prisma
│
├── .env.example
├── README.md
└── package.json
```

---

## 🔒 Security

- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies where possible
- Helmet, CORS, and rate limiting on the API
- Input validation on every endpoint
- SQL injection protection via Prisma ORM
- XSS protection and sanitized inputs
- Server-side payment signature verification
- Donor privacy: emails, phone numbers, and payment IDs are never exposed publicly; anonymous donations display as "Anonymous Donor"

---

## 🗺 Future Improvements

- Real-time updates via WebSockets in place of polling/refetching
- Email notification service for donation confirmations
- Multi-campaign referral codes
- Multi-currency and international payment gateway support
- Advanced admin reporting and data visualization
- Full PWA offline support

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Please open an issue first to discuss significant changes.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

---

## 👤 Author

**NayePankh Foundation — Development Team**

Built as part of an internship engineering initiative for NayePankh Foundation's fundraising operations.

---

## 📄 License

Distributed under the MIT License.

<div align="center">

_"Together, We Can Create a Better Tomorrow."_ 🌿

</div>
