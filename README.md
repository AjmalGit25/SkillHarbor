# SkillHarbor

A full-stack e-learning platform where instructors sell knowledge and learners build skills. Built with the MERN stack featuring JWT authentication, role-based access control, Stripe payments, Cloudinary image hosting, course progress tracking, and certificate generation.

---

## Tech Stack

**Frontend**
- React 19, Vite, Tailwind CSS v4
- React Router DOM v7
- Axios, React Hot Toast, React Icons
- Stripe.js (`@stripe/react-stripe-js`)

**Backend**
- Node.js, Express v5
- MongoDB, Mongoose
- JWT (jsonwebtoken), bcrypt
- Cloudinary (image uploads), express-fileupload
- Stripe (payments), Zod (validation), cookie-parser, CORS, uuid

---

## Project Structure

```
SkillHarbor/
├── backend/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── course.controller.js
│   │   ├── order.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── admin.mid.js
│   │   └── user.mid.js
│   ├── models/
│   │   ├── admin.model.js
│   │   ├── assessment.model.js
│   │   ├── certificate.model.js
│   │   ├── course.model.js
│   │   ├── courseProgress.model.js
│   │   ├── lesson.model.js
│   │   ├── module.model.js
│   │   ├── order.model.js
│   │   ├── purchase.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── admin.route.js
│   │   ├── course.route.js
│   │   ├── order.route.js
│   │   └── user.route.js
│   ├── config.js
│   ├── index.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── logo.png
    ├── src/
    │   ├── admin/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminLogin.jsx
    │   │   ├── AdminSignup.jsx
    │   │   ├── CourseCreate.jsx
    │   │   ├── OurCourses.jsx
    │   │   └── UpdateCourse.jsx
    │   ├── components/
    │   │   ├── Buy.jsx
    │   │   ├── Courses.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── Purchases.jsx
    │   │   ├── Signup.jsx
    │   │   └── UserDashboard.jsx
    │   ├── utils/
    │   │   └── utils.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Data Architecture

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │ purchases
       ▼
┌─────────────┐
│  PURCHASE   │  (enrollment record after Stripe payment)
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│                  COURSE                  │
│  title · description · price · image     │
│  adminId → Admin                         │
└───────────────────┬──────────────────────┘
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    ┌───────────┐       ┌────────────┐
    │  MODULE   │       │ ASSESSMENT │
    │  order    │       │ (course or │
    └─────┬─────┘       │  module)   │
          │             └────────────┘
   ┌──────┴──────┐
   ▼             ▼
┌────────┐   ┌────────┐
│ LESSON │   │ LESSON │
│videoUrl│   │duration│
└────────┘   └────────┘

USER + COURSE
      │
      ▼
┌──────────────────────┐
│    COURSE PROGRESS   │
│  completedLessons[]  │
│  completionPercent   │
│  lastAccessed        │
│  startedAt           │
│  completedAt         │
└──────────┬───────────┘
           │ 100% complete
           ▼
    ┌─────────────┐
    │ CERTIFICATE │
    │ certificateId (uuid) │
    │ issuedAt    │
    └─────────────┘
```

---

## Models

| Model | File | Description |
|-------|------|-------------|
| User | `user.model.js` | Learner accounts |
| Admin | `admin.model.js` | Instructor / admin accounts |
| Course | `course.model.js` | Course with title, description, price, image |
| Module | `module.model.js` | Ordered sections inside a course |
| Lesson | `lesson.model.js` | Video lessons inside a module |
| Assessment | `assessment.model.js` | Quiz attached to a course or module |
| Purchase | `purchase.model.js` | Enrollment record (userId + courseId) |
| Order | `order.model.js` | Stripe payment record |
| CourseProgress | `courseProgress.model.js` | Per-user lesson completion + timestamps |
| Certificate | `certificate.model.js` | Auto-generated on 100% course completion |

### Key constraints
- `CourseProgress` — unique index on `{ userId, courseId }` (one doc per user per course)
- `Certificate` — unique index on `{ userId, courseId }` (one cert per user per course)
- `Certificate.certificateId` — UUID v4, globally unique, usable for public verification
- `Lesson.duration` — stored in seconds
- `Assessment.moduleId` — optional; if omitted the assessment is course-level

---

## Features

### User
- Signup / Login / Logout with JWT (HTTP-only cookies)
- Browse and search all available courses
- Purchase courses via Stripe payment
- Personal dashboard with enrolled courses and stats
- Track lesson-by-lesson progress per course
- Earn a certificate on 100% course completion

### Admin
- Separate admin Signup / Login / Logout
- Create courses with title, description, price, and thumbnail (Cloudinary)
- Update and delete existing courses
- View all published courses

---

## API Endpoints

**Base URL:** `/api/v1`

### User — `/user`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive JWT cookie |
| GET | `/logout` | Logout and clear cookie |
| GET | `/purchases` | Get user's purchased courses (auth required) |

### Admin — `/admin`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new admin |
| POST | `/login` | Admin login |
| GET | `/logout` | Admin logout |

### Course — `/course`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | Get all courses (public) |
| GET | `/:courseId` | Get single course details |
| POST | `/create` | Create a course (admin only) |
| PUT | `/update/:courseId` | Update a course (admin only) |
| DELETE | `/delete/:courseId` | Delete a course (admin only) |
| POST | `/buy/:courseId` | Purchase a course (user auth required) |

### Order — `/order`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create Stripe payment order (user auth required) |

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=4001
MONGO_URI=your_mongodb_connection_string

JWT_USER_PASSWORD=your_jwt_user_secret
JWT_ADMIN_PASSWORD=your_jwt_admin_secret

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_KEY=your_stripe_publishable_key

FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/src/utils/utils.js`

```js
export const BACKEND_URL = "http://localhost:4001/api/v1";
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SkillHarbor.git
cd SkillHarbor
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory using the variables listed above, then:

```bash
npm run dev
```

Backend runs on `http://localhost:4001`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Frontend Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/courses` | Courses | Public |
| `/buy/:courseId` | Buy | User |
| `/purchases` | Purchases | User (auth) |
| `/dashboard` | UserDashboard | User (auth) |
| `/admin/signup` | AdminSignup | Public |
| `/admin/login` | AdminLogin | Public |
| `/admin/dashboard` | AdminDashboard | Admin (auth) |
| `/admin/create-course` | CourseCreate | Admin |
| `/admin/our-courses` | OurCourses | Admin |
| `/admin/update-course/:courseId` | UpdateCourse | Admin |

---

## License

MIT — see [LICENSE](./LICENSE)

---

> Built by **Md Ajmal Hussain** &copy; 2026
