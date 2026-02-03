# AuraExpress Authentication System Backend

## Overview

This is the backend authentication system for AuraExpress e-commerce platform. It provides secure user registration, email verification via OTP, JWT-based authentication, and profile management.

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit
- **Testing**: Jest with fast-check for property-based testing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `DB_PASSWORD`: Your PostgreSQL password
- `JWT_SECRET`: A secure random string for JWT signing
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app password (not your regular password)

### 3. Set Up Database

Create the database:

```bash
createdb auraexpress_auth
```

Run the schema:

```bash
psql -U postgres -d auraexpress_auth -f schema.sql
```

Or use the npm script:

```bash
npm run db:setup
```

### 4. Build the Project

```bash
npm run build
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login with email and password

### User Routes (Protected)

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── models/          # TypeScript interfaces
│   └── index.ts         # Application entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── property/        # Property-based tests
│   └── integration/     # Integration tests
├── schema.sql           # Database schema
├── .env.example         # Environment variables template
└── package.json         # Project dependencies
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication with 24-hour expiry
- SQL injection prevention with parameterized queries
- Rate limiting on authentication endpoints
- CORS configuration for frontend origin
- Input validation on all endpoints
- OTP expiry (10 minutes)
- OTP resend rate limiting (3 per hour)

## License

ISC
