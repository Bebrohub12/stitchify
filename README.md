# Stitchify - Full-Stack Next.js Application

This is a full-stack embroidery design eCommerce platform built entirely with Next.js 14, featuring both frontend and backend in a single application.

## Features

- **Full-Stack Next.js**: Frontend and backend API routes in one application
- **Next.js 14** with App Router and TypeScript
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **PayPal Integration** for payment processing
- **Responsive Design** with Tailwind CSS
- **React Query** for data fetching
- **React Hook Form** for form management

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── designs/       # Design management
│   │   │   ├── categories/    # Category management
│   │   │   ├── payments/      # PayPal integration
│   │   │   └── users/         # User management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── designs/           # Design pages
│   │   ├── profile/           # User profile
│   │   ├── admin/             # Admin dashboard
│   │   ├── contact/           # Contact form
│   │   └── payment/           # Payment pages
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utility functions
│   │   ├── db.ts             # MongoDB connection
│   │   └── auth.ts           # JWT utilities
│   ├── models/                # Mongoose models
│   └── types/                 # TypeScript types
├── scripts/                   # Database seeding
├── public/                    # Static assets
└── package.json
```

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- PayPal Developer Account (for payments)

## Installation

1. **Clone and install dependencies:**
```bash
cd client
npm install
```

2. **Create environment file:**
```bash
cp .env.local.example .env.local
```

3. **Configure environment variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stitchify

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# PayPal (for production, use live credentials)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

4. **Seed the database:**
```bash
npm run seed
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Designs
- `GET /api/designs` - Get all designs with filters
- `GET /api/designs/featured` - Get featured designs
- `GET /api/designs/popular` - Get popular designs
- `GET /api/designs/[id]` - Get single design

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/main` - Get main categories

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorites` - Get user favorites
- `GET /api/users/purchases` - Get user purchases

### Payments
- `POST /api/payments/create` - Create PayPal payment
- `POST /api/payments/execute` - Execute PayPal payment
- `GET /api/payments/transactions` - Get user transactions

## Database Models

- **User**: Authentication and profile information
- **Design**: Embroidery design details and metadata
- **Category**: Design categories and subcategories
- **Transaction**: Payment and purchase records

## Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. JWT token is generated and returned
3. Frontend stores token in localStorage or secure storage
4. Token is sent with API requests in Authorization header
5. Backend validates token and extracts user information

## Payment Integration

- PayPal REST API integration
- Payment creation and execution
- Transaction recording
- Download access after successful payment

## Development

### Adding New API Routes
Create new files in `src/app/api/` following the Next.js App Router convention:

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Handle GET request
}

export async function POST(request: NextRequest) {
  // Handle POST request
}
```

### Database Operations
Use the `connectDB()` function and Mongoose models:

```typescript
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET() {
  await connectDB()
  const users = await User.find()
  return NextResponse.json(users)
}
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- Build: `npm run build`
- Start: `npm run start`
- Set environment variables
- Deploy to your preferred platform

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Use Tailwind CSS for styling
4. Test your changes thoroughly
5. Update documentation as needed

## License

MIT License - see LICENSE file for details
