# AuraExpress - E-commerce Platform

A full-stack e-commerce platform built with React, Node.js, Express, and PostgreSQL.

## Features

### User Features
- 🔐 User authentication with email and OTP verification
- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 💳 Secure checkout with Razorpay payment gateway
- 📦 Order management and tracking
- ❌ Order cancellation (for Processing/Confirmed orders)
- 👤 User profile with order history
- 📱 Responsive design for all devices

### Admin Features
- 📊 Admin dashboard with order statistics
- 🔍 Search and filter orders
- ✏️ Update order status
- 📈 View all customer orders

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Payment Gateway**: Razorpay

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Razorpay account (for payments)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd auraexpress
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auraexpress_auth
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=24h

# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Database Setup

Create the PostgreSQL database:

```bash
createdb auraexpress_auth
```

Run the schema:

```bash
psql -U postgres -d auraexpress_auth -f schema.sql
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:3001

### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

### User Flow

1. **Register**: Create an account with email and password
2. **Verify OTP**: Enter the OTP sent to your email
3. **Login**: Login with your credentials
4. **Browse Products**: Explore the product catalog
5. **Add to Cart**: Add products to your shopping cart
6. **Checkout**: Fill in shipping details and payment information
7. **Pay**: Complete payment using Razorpay (test mode)
8. **Track Order**: View order status and tracking information
9. **Cancel Order**: Cancel orders that are in Processing or Confirmed status

### Admin Flow

1. **Login**: Login with admin credentials
2. **Access Admin Panel**: Navigate to `/admin/orders`
3. **View Orders**: See all customer orders
4. **Update Status**: Change order status (Processing → Confirmed → Shipped → Delivered)
5. **Search/Filter**: Find specific orders using search and filters

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP

### Orders (User)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order

### Orders (Admin)
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order details
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/stats` - Get order statistics

### Payments
- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment
- `GET /api/payments/razorpay/key` - Get Razorpay key

## Testing

### Test Payment

Use these test card details in Razorpay:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

### Test Order Cancellation

1. Place an order
2. Go to Orders page
3. Click "Cancel Order" on any Processing/Confirmed order
4. Confirm cancellation
5. Order status changes to "Cancelled"

## Project Structure

```
auraexpress/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── repositories/    # Database operations
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── tests/               # Test files
│   ├── schema.sql           # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── lib/             # Utilities
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| DB_HOST | PostgreSQL host | Yes |
| DB_PORT | PostgreSQL port | Yes |
| DB_NAME | Database name | Yes |
| DB_USER | Database user | Yes |
| DB_PASSWORD | Database password | Yes |
| JWT_SECRET | Secret key for JWT | Yes |
| EMAIL_USER | Email for sending OTPs | Yes |
| EMAIL_PASSWORD | Email app password | Yes |
| PORT | Backend server port | No (default: 3001) |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| RAZORPAY_KEY_ID | Razorpay key ID | Yes |
| RAZORPAY_KEY_SECRET | Razorpay key secret | Yes |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS protection
- Rate limiting on sensitive endpoints
- OTP verification for email
- Payment signature verification
- SQL injection prevention with parameterized queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@auraexpress.com or open an issue in the repository.

## Acknowledgments

- Shadcn/ui for the beautiful UI components
- Razorpay for payment gateway integration
- PostgreSQL for the robust database
- React and Express communities

---

**Built with ❤️ by the AuraExpress Team**
