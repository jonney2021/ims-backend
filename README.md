# Inventory Management System - Backend

This is the backend server for the Inventory Management System, built with Node.js and Express.

## Features

- RESTful API for inventory management
- User authentication and authorization
- Database integration with MongoDB
- Email notifications for low stock items

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- Nodemailer for email notifications
- Cloudinary for image storage

## Prerequisites

- Node.js
- MongoDB
- Cloudinary account

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/jonney2021/ims-backend.git
   cd ims-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   CLOUDINARY_URL=your_cloudinary_url
   ```

   Replace the placeholders with your actual MongoDB URI, JWT secret, and email credentials.

4. Start the server:
   ```
   npm start
   ```

The server will start running on [http://localhost:5000](http://localhost:5000).

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/items` - Item management routes
- `/api/categories` - Category management routes
- `/api/users` - User management routes

## Available Scripts

- `npm start`: Starts the server
- `npm run dev`: Starts the server with nodemon for development
- `npm test`: Runs the test suite

## Image Uploads

This project uses Cloudinary for image storage and management. When users upload images, the images are sent to Cloudinary for storage, and the resulting URL is saved in the database. This allows for efficient image management and delivery.
