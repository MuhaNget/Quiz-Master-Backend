# Quiz Master Backend

A comprehensive backend API for a Quiz Master application built with Express.js and MongoDB.

## Features

- User authentication with JWT
- Category management
- Quiz creation and management
- Question handling
- User scoring system
- Leaderboard functionality
- Email notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env` file and update with your credentials:

   ```bash
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_email_password
   ADMIN_SETUP_KEY=your_admin_setup_key
   PORT=5000
   NODE_ENV=development
   ```

3. **Start the server:**

   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## Project Structure

```
├── config/          # Configuration files (database connection)
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares (auth, error handling)
├── models/          # MongoDB models
├── routes/          # API routes
├── utils/           # Utility functions (JWT, email)
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env             # Environment variables (not in git)
```

## API Endpoints

### Auth Routes (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Category Routes (`/api/v1/categories`)

- `GET /` - Get all categories
- `POST /` - Create category
- `GET /:id` - Get category by ID
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

### Quiz Routes (`/api/v1/quizzes`)

- `GET /` - Get all quizzes
- `POST /` - Create quiz
- `GET /:id` - Get quiz by ID
- `PUT /:id` - Update quiz
- `DELETE /:id` - Delete quiz

### Question Routes (`/api/v1/questions`)

- `GET /` - Get all questions
- `POST /` - Create question
- `GET /:id` - Get question by ID
- `PUT /:id` - Update question
- `DELETE /:id` - Delete question

### User Routes (`/api/v1/users`)

- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user

### Admin Routes (`/api/v1/admin`)

- `POST /bootstrap` - Create the first admin (requires `x-admin-setup-key` header)
- `GET /stats` - Get admin dashboard stats (admins only)
- `GET /users` - List users (admins only)
- `GET /users/:id` - Get user by ID (admins only)
- `PATCH /users/:id/role` - Update user role (admins only)
- `DELETE /users/:id` - Delete user (admins only)

### Score Routes (`/api/v1/scores`)

- `POST /` - Submit quiz score
- `GET /user/:userId` - Get user scores
- `GET /quiz/:quizId` - Get quiz scores

### Leaderboard Routes (`/api/v1/leaderboard`)

- `GET /` - Get global leaderboard
- `GET /quiz/:quizId` - Get quiz-specific leaderboard

## Environment Variables

| Variable          | Description                 | Example                                 |
| ----------------- | --------------------------- | --------------------------------------- |
| `MONGODB_URI`     | MongoDB connection string   | `mongodb://localhost:27017/quiz-master` |
| `JWT_SECRET`      | Secret key for JWT tokens   | `your_secret_key`                       |
| `PORT`            | Server port                 | `5000`                                  |
| `NODE_ENV`        | Environment                 | `development` or `production`           |
| `EMAIL_HOST`      | Email service host          | `smtp.gmail.com`                        |
| `EMAIL_PORT`      | Email service port          | `587`                                   |
| `EMAIL_USER`      | Email address               | `your-email@gmail.com`                  |
| `EMAIL_PASSWORD`  | Email password/app password | `your-app-password`                     |
| `ADMIN_SETUP_KEY` | Admin bootstrap key         | `change_me`                             |

## Development

- Use `npm run dev` to run with nodemon for auto-reload
- Follow RESTful API conventions
- Use async/await with express-async-handler for error handling
- Validate input using express-validator

## License

ISC

## Contributors

- Backend Developer (Initial setup)
- [Your name]

---

**Note:** Never commit `.env` file to the repository. Use `.gitignore` to prevent accidental commits.
