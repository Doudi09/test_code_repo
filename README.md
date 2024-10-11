# Product Management APIs

This is a Node.js and Express for product and category management APIs. With user authentication using JWT access tokens and refresh tokens. Role-Based Access Control (RBAC). The API allows users to register, log in, refresh their access tokens, and provides different levels of access to resources based on user roles (Admin, Manager, Client).
We also have different CRUD operations for the products and categories, with pagination and soft delete.

## Features

- User registration and login
- JWT-based authentication (access token expires after 15 minutes)
- Refresh token mechanism (refresh token expires after 12 months)
- Role-Based Access Control (RBAC) with three roles: Admin, Manager, and Client
- Protected routes with different access levels
- Secure refresh token handling and revocation
- Soft delete
- Pagination
- Product filtering by category and price range
- Input data validation
- Unit tests added for the CRUD operations of products and categories

## Technologies Used

- Node.js
- Express.js
- Mongoose (MongoDB)
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- express-validator for input validation
- dotenv for environment variables
- jest, supertest for testing
- cross-env for testing environment variables
- dotenv for .env variables
- cookie parser for http only cookies

## Prerequisites

Before running the project on another machine, make sure the following are installed:

1. **Node.js**: Install from https://nodejs.org/
2. **MongoDB**: Install MongoDB locally from https://www.mongodb.com/try/download/community

## Project Structure

```
.
├── config
│   └── db.js           #db connection
├── controlers
│   ├── auth.js         # user authentication
│   ├── category.js     # category CRUD
│   ├── product.js      # product CRUD
│   └── user.js         # user update role, delte and read
├── middlewares
│   ├── validation      # express validator configuration for input validation
│   │   ├── auth.js
│   │   ├── category.js
│   │   ├── product.js
│   │   └── user.js
│   ├── auth.js         # authorization middleware
│   └── validator.js     # validation middleware
├── models                # DB models
│   ├── category.js
│   ├── product.js
│   └── user.js
├── routes                # application routes
│   ├── auth.js
│   ├── category.js
│   ├── product.js
│   └── user.js
├── tests                 # unit tests
│   ├── category.test.js
│   ├── jest.config.js
│   └── product.js
├── utils                  # helper functions used in the auth controller
│   └── auth.js
├── .env
├── postman_collection.json        # a postman collection json file
├── app.js
├── index.js          # server file
└── README.md
```

## Steps to Run the Project

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Doudi09/test_code_repo.git
   cd test_code_repo
   ```

2. Run the following command to install dependecies and start the Node.js server:

   ```bash
    npm install
    npm start
   ```

3. Run the following command to start the tests :

   ```bash
    npm test
   ```
