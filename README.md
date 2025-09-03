# Foodie - Food Information App

## Deployment to Vercel

This application has been configured to be deployed on Vercel. Follow these steps to deploy:

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (or any MongoDB provider)
3. [Node.js](https://nodejs.org/) installed locally

### Setup Environment Variables

You'll need to set up the following environment variables in your Vercel project:

- `MONGODB_URI`: Your MongoDB connection string
- `ACCESS_TOKEN_SECRET`: Secret for JWT access tokens
- `REFRESH_TOKEN_SECRET`: Secret for JWT refresh tokens
- `NODE_ENV`: Set to `production` for deployment

### Deployment Steps

1. Install Vercel CLI (optional):
   ```
   npm install -g vercel
   ```

2. Login to Vercel (if using CLI):
   ```
   vercel login
   ```

3. Deploy using one of these methods:

   **Option 1: Using Vercel CLI**
   ```
   vercel
   ```

   **Option 2: Using Vercel Dashboard**
   - Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
   - Import the repository in the Vercel dashboard
   - Configure environment variables
   - Deploy

### Local Development

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/config` - Configuration files
- `/controllers` - Route controllers
- `/middleware` - Express middleware
- `/model` - Data models
- `/public` - Static assets
- `/routes` - API routes
- `/views` - HTML templates

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT Authentication