# 🚀 Full Stack Authentication Boilerplate

A production-ready Node.js + Express + Prisma + React boilerplate with cookie-based JWT authentication, universal pagination, and clean architecture.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-blueviolet.svg)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

## ✨ Features

### 🔐 Authentication
- ✅ Secure cookie-based JWT authentication (httpOnly cookies)
- ✅ Dual token system (access token + refresh token)
- ✅ Automatic token refresh in middleware
- ✅ Global authentication with public routes array
- ✅ XSS & CSRF protection built-in
- ✅ No token management needed on frontend

### 📊 Pagination
- ✅ Universal pagination service for all models
- ✅ Two strategies: Offset-based (pages) & Cursor-based (infinite scroll)
- ✅ Built-in search functionality
- ✅ Configurable sorting, filtering, and relations
- ✅ Performance optimized

### 🏗️ Architecture
- ✅ Clean code structure with separation of concerns
- ✅ Async handler wrapper (no try-catch blocks)
- ✅ Standardized API responses
- ✅ Global error handling
- ✅ Reusable services and utilities
- ✅ DRY principles

### 📦 Included Features
- User authentication (register, login, logout)
- User management (CRUD)
- Post management (CRUD with ownership)
- Saved posts functionality
- Pagination examples for all resources
- Search functionality

---

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── user.controller.js
│   │   │   ├── post.controller.js
│   │   │   └── savedPost.controller.js
│   │   │
│   │   ├── middlewares/          # Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   └── rateLimiter.middleware.js
│   │   ├── services/             # Business logic
│   │   │   ├── token.service.js
│   │   │   ├── password.service.js
│   │   │   ├── response.service.js
│   │   │   └── pagination.service.js
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   └── asyncHandler.js
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── user.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── savedPost.routes.js
│   │   │   └── index.js
│   │   │   
│   │   ├── app.js                # Express app setup
│   │   ├── server.js             # Server entry point
│   │   └── prisma.js             # Prisma configuration
│   │
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   │
│   ├── .env                      # Environment variables
│   └── package.json

```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL (or your preferred database)
- npm or yarn

### Backend Setup

1. **Clone and navigate:**
```bash
git clone <your-repo-url>
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment setup:**
```bash
cp .env.example .env
```

4. **Generate secrets:**
```bash
# Generate ACCESS_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. **Update `.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secrets (use the generated values above)
ACCESS_TOKEN_SECRET=your_generated_secret_here
REFRESH_TOKEN_SECRET=your_generated_secret_here

# Password
SALT_ROUNDS=10
```

6. **Setup database:**
```bash
npx prisma generate
npx prisma migrate dev
```

7. **Start server:**
```bash
npm run dev
```

Server runs at `http://localhost:5000`



## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
Set-Cookie: accessToken=xxx; HttpOnly; SameSite=Lax
Set-Cookie: refreshToken=yyy; HttpOnly; SameSite=Lax

{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```http
GET /api/user/me
Cookie: accessToken=xxx; refreshToken=yyy

Response: 200 OK
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Logout
```http
POST /api/user/logout
Cookie: accessToken=xxx; refreshToken=yyy

Response: 200 OK
{
  "success": true,
  "message": "Logout successful"
}
```

### Post Endpoints

#### Get All Posts (Paginated)
```http
# Offset-based pagination (page numbers)
GET /api/post?page=1&limit=10&search=hello

# Cursor-based pagination (infinite scroll)
GET /api/post?cursor=10&limit=10

Response: 200 OK
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "captions": "My post",
        "userId": 1,
        "user": { "id": 1, "name": "John Doe" }
      }
    ],
    "pagination": {
      "type": "offset",
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true
    }
  }
}
```

#### Create Post
```http
POST /api/post
Cookie: accessToken=xxx
Content-Type: application/json

{
  "captions": "My new post"
}

Response: 201 Created
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "captions": "My new post",
    "userId": 1
  }
}
```

#### Update Post
```http
PUT /api/post/:id
Cookie: accessToken=xxx
Content-Type: application/json

{
  "captions": "Updated content"
}

Response: 200 OK
```

#### Delete Post
```http
DELETE /api/post/:id
Cookie: accessToken=xxx

Response: 200 OK
```

### Saved Posts Endpoints

#### Save Post
```http
POST /api/savedPosts
Cookie: accessToken=xxx
Content-Type: application/json

{
  "postId": 1
}

Response: 200 OK
```

#### Get My Saved Posts
```http
GET /api/my-saved-posts?page=1&limit=10
Cookie: accessToken=xxx

Response: 200 OK
```

---

## 🔧 Usage Examples

### Backend: Creating a New Controller

```javascript
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse, errorResponse } from "../services/response.service.js";
import { paginate, getPaginationParams } from "../services/pagination.service.js";

export default {
    getAll: asyncHandler(async (req, res) => {
        const paginationParams = getPaginationParams(req.query);
        
        const result = await paginate({
            model: 'yourModel',
            where: { /* filters */ },
            include: { /* relations */ },
            ...paginationParams
        });
        
        return successResponse(res, 'Data fetched successfully', result);
    }),

    create: asyncHandler(async (req, res) => {
        const { field1, field2 } = req.body;
        const userId = req.user.id; // From auth middleware
        
        // Validation
        if (!field1) {
            return errorResponse(res, 'Field1 is required');
        }
        
        // Create
        const item = await prisma.yourModel.create({
            data: { field1, field2, userId }
        });
        
        return createdResponse(res, 'Created successfully', item);
    })
};
```

### Frontend: Using the API

```javascript
// lib/axios.js - Already configured
import api from './lib/axios';

// Login
const login = async (email, password) => {
    const response = await api.post('/user/login', { email, password });
    return response.data;
};

// Get paginated data (offset-based)
const getPosts = async (page = 1) => {
    const response = await api.get(`/post?page=${page}&limit=10`);
    return response.data;
};

// Get paginated data (cursor-based for infinite scroll)
const getMorePosts = async (cursor) => {
    const url = cursor ? `/post?cursor=${cursor}&limit=10` : `/post?limit=10`;
    const response = await api.get(url);
    return response.data;
};

// Create post
const createPost = async (captions) => {
    const response = await api.post('/post', { captions });
    return response.data;
};

// Logout
const logout = async () => {
    await api.post('/user/logout');
};
```

### React Component Example

```javascript
import { useState, useEffect } from 'react';
import api from './lib/axios';

function PostsList() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            const response = await api.get(`/post?page=${page}&limit=10`);
            setPosts(response.data.data.data);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {posts.map(post => (
                <div key={post.id}>{post.captions}</div>
            ))}

            <button 
                disabled={!pagination?.hasPreviousPage}
                onClick={() => setPage(p => p - 1)}
            >
                Previous
            </button>
            
            <button 
                disabled={!pagination?.hasNextPage}
                onClick={() => setPage(p => p + 1)}
            >
                Next
            </button>
        </div>
    );
}
```

---

## 🔐 Authentication Flow

### How It Works

1. **User logs in** → Backend validates credentials
2. **Backend generates JWT tokens** → Access token (15 min) + Refresh token (7 days)
3. **Backend sets httpOnly cookies** → Browser automatically stores them
4. **User makes request** → Browser automatically sends cookies
5. **Middleware validates** → If access token expired, auto-refreshes using refresh token
6. **Request proceeds** → User gets data seamlessly

**No manual token management needed!** The browser handles everything.

### Key Points

- ✅ Tokens stored in **httpOnly cookies** (JavaScript cannot access)
- ✅ **Automatic token refresh** in middleware
- ✅ **XSS protection** (cookies immune to script injection)
- ✅ **CSRF protection** (SameSite attribute)
- ✅ Frontend just needs `withCredentials: true` in axios config

For detailed explanation, see [Cookie Authentication Guide](./docs/COOKIE_AUTH_FLOW.md)

---

## 📊 Pagination System

This boilerplate includes a universal pagination service that supports two strategies:

### 1. Offset-Based Pagination (Traditional Pages)

```javascript
// Get page 2 with 10 items
GET /api/post?page=2&limit=10

// Frontend replaces data on each page
setPosts(response.data.data.data);
```

**Best for:** Admin panels, numbered pages, reports

### 2. Cursor-Based Pagination (Infinite Scroll)

```javascript
// Initial load
GET /api/post?limit=10

// Load more with cursor
GET /api/post?cursor=10&limit=10

// Frontend appends data
setPosts([...posts, ...newPosts]);
```

**Best for:** Social feeds, mobile apps, infinite scroll

### Search + Pagination

```javascript
GET /api/post?page=1&limit=10&search=hello
```

---

## 🏗️ Architecture Patterns

### 1. Async Handler Pattern

**No more try-catch blocks:**

```javascript
// ❌ Old way
async function getUser(req, res) {
    try {
        const user = await prisma.user.findUnique(...);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ✅ New way
getUser: asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique(...);
    return successResponse(res, 'User fetched', user);
})
```

### 2. Standardized Responses

```javascript
// Success
successResponse(res, 'Operation successful', data);
// → { success: true, message: '...', data: {...} }

// Error
errorResponse(res, 'Error message');
// → { success: false, message: '...' }

// Created
createdResponse(res, 'Created successfully', data);
// → Status 201 + { success: true, message: '...', data: {...} }
```

### 3. Global Error Handling

All errors are caught automatically and return consistent format:

```javascript
// Prisma errors
// JWT errors  
// Validation errors
// Custom errors
// → All handled in errorHandler middleware
```

---

## 🛡️ Security Features

- ✅ **httpOnly cookies** - Immune to XSS attacks
- ✅ **SameSite attribute** - CSRF protection
- ✅ **bcrypt password hashing** - Secure password storage
- ✅ **JWT tokens** - Stateless authentication
- ✅ **Token rotation** - Refresh tokens rotated on use
- ✅ **Short-lived access tokens** - 15-minute expiry
- ✅ **CORS configuration** - Only allowed origins
- ✅ **Environment variables** - Secrets not in code

---

## 🧪 Testing

### Manual Testing with Postman/Thunder Client


```
Cookie: accessToken=your_token_here; refreshToken=your_token_here
```

Or use Postman's cookie manager to add cookies for `localhost:5000`



---

## 📝 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Secrets
ACCESS_TOKEN_SECRET=your_64_char_random_string
REFRESH_TOKEN_SECRET=your_64_char_random_string

# Password
SALT_ROUNDS=10
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚢 Deployment

### Backend (Node.js)

1. **Set environment variables** in your hosting platform
2. **Set `NODE_ENV=production`**
3. **Run database migrations:** `npx prisma migrate deploy`
4. **Start server:** `npm start`

### Frontend (React + Vite)

1. **Update `VITE_API_BASE_URL`** to your production API URL
2. **Build:** `npm run build`
3. **Deploy** `dist` folder to your hosting platform

### Important for Production

- Set `NODE_ENV=production` in backend
- Use HTTPS (required for secure cookies)
- Set strong random secrets for JWT
- Enable rate limiting
- Add request logging
- Monitor error logs

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- React team
- All contributors

---



**Built with ❤️ by Uzair Malik, for developers**

Happy coding! 🚀