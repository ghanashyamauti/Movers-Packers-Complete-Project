# 📦Movers & Packers Web Application

A full-featured Movers & Packers web application built with Node.js, Express.js, PostgreSQL, and EJS. It supports guest bookings, user accounts, an admin panel, dynamic pricing, and contact query management.

---

## 🚀 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Backend      | Node.js + Express.js                |
| Database     | PostgreSQL (via `pg` driver)        |
| View Engine  | EJS (Embedded JavaScript Templates) |
| Session      | express-session                     |
| Auth         | bcryptjs                            |
| File Upload  | multer                              |

---

## 🎨 Design

- **Color Scheme:** Navy Blue (`#1a3a5c`) + Amber/Orange (`#f6921e`)
- **Fonts:** Playfair Display (headings) + DM Sans (body)

---

## 📁 Project Structure

```
movers-packers/
├── app.js                        # Application entry point
├── .env                          # Environment variables
├── config/
│   └── db.js                     # PostgreSQL connection config
├── db/
│   ├── schema.sql                # Database schema definitions
│   └── pricing.sql               # Pricing data seeds
├── middleware/
│   └── auth.js                   # Auth middleware (user & admin)
├── routes/
│   ├── public.js                 # Public-facing routes
│   ├── user.js                   # Authenticated user routes
│   └── admin.js                  # Admin panel routes
├── views/
│   ├── partials/                 # Shared EJS partials
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   ├── admin-header.ejs
│   │   └── admin-footer.ejs
│   ├── public/                   # Public pages
│   │   ├── home.ejs
│   │   ├── services.ejs
│   │   ├── about.ejs
│   │   ├── contact.ejs
│   │   ├── login.ejs
│   │   ├── signup.ejs
│   │   ├── request-quote.ejs
│   │   └── price-estimator.ejs
│   ├── user/                     # Logged-in user pages
│   │   ├── dashboard.ejs
│   │   ├── my-requests.ejs
│   │   ├── booking-detail.ejs
│   │   ├── my-account.ejs
│   │   └── change-password.ejs
│   ├── admin/                    # Admin panel pages
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── services.ejs
│   │   ├── service-form.ejs
│   │   ├── bookings.ejs
│   │   ├── booking-detail.ejs
│   │   ├── queries.ejs
│   │   ├── query-detail.ejs
│   │   ├── users.ejs
│   │   ├── user-detail.ejs
│   │   ├── pages.ejs
│   │   ├── page-edit.ejs
│   │   ├── reports.ejs
│   │   ├── profile.ejs
│   │   ├── change-password.ejs
│   │   ├── price-items.ejs
│   │   ├── price-item-form.ejs
│   │   └── price-slabs.ejs
│   ├── 404.ejs
│   └── 500.ejs
└── public/
    ├── css/
    │   ├── main.css              # Public-facing styles
    │   └── admin.css             # Admin panel styles
    ├── js/
    │   ├── main.js               # Public-facing scripts
    │   └── admin.js              # Admin panel scripts
    └── images/                   # Uploaded and static images
```

---

## 🗄️ Database Tables

| Table              | Description                                              |
|--------------------|----------------------------------------------------------|
| `admins`           | Admin accounts                                           |
| `users`            | Registered user accounts                                 |
| `services`         | Moving/packing services offered                          |
| `bookings`         | Booking requests (supports guest bookings without login) |
| `contact_queries`  | Messages submitted via the contact form                  |
| `pages`            | Editable static page content (managed by admin)          |
| `price_items`      | Items with category, name, weight (kg), and base price   |
| `distance_slabs`   | Distance-based pricing (label, km range, price per kg)   |

---

## ✨ Features

### Public / Guest
- Home, Services, About, and Contact pages
- Guest booking — no login required
- Price Estimator with distance slabs and item-weight-based pricing
- User registration and login

### Registered Users
- User dashboard
- View and track own bookings
- Account management and password change

### Admin Panel
- Secure admin login
- Dashboard overview
- Full CRUD for Services (with image upload via multer)
- Booking management with status workflow:
  `pending → approved → rejected → completed → cancelled`
- Contact query management
- User management and detail view
- Editable static pages (CMS-lite)
- Price item and distance slab management
- Reports filtered by date range

---

## 🔐 Default Admin Credentials

```
Email:    admin@moverspackersco.com
Password: Admin@123
```

> ⚠️ Change these credentials immediately after your first login in a production environment.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following:

```env
PORT=3000
SESSION_SECRET=your_secret_key_here

DB_HOST=localhost
DB_PORT=5432
DB_NAME=movers_packers
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/movers-packers.git
cd movers-packers
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

Create a PostgreSQL database, then run the schema and seed files:

```bash
psql -U your_db_user -d movers_packers -f db/schema.sql
psql -U your_db_user -d movers_packers -f db/pricing.sql
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 5. Start the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The application will be available at `http://localhost:3000`.

---

## 📦 Key NPM Packages

```json
{
  "express": "^4.x",
  "ejs": "^3.x",
  "pg": "^8.x",
  "bcryptjs": "^2.x",
  "express-session": "^1.x",
  "multer": "^1.x",
  "dotenv": "^16.x"
}
```

---

## 📸 Image Uploads

Service images are uploaded via the admin panel using `multer` and stored in the `public/images/` directory. Ensure this directory is writable by the server process.

---

## 🔒 Security Notes

- Passwords are hashed using `bcryptjs` before storage.
- Sessions are managed with `express-session` — use a strong `SESSION_SECRET` in production.
- Admin and user routes are protected by authentication middleware (`middleware/auth.js`).
- In production, use HTTPS and set `cookie: { secure: true }` in session config.

---

## 📄 License

This project is proprietary and owned by **Ghanashyam Auti**. All rights reserved.

---

## 🤝 Contact

For support or inquiries, please use the **Contact** page on the website or reach out to the development team directly.
