# Foodie - Food Information App

### Hosted Website Link

[Website Link](https://smart-bite-qvxu.vercel.app/)

## Deployment to Vercel

This application has been configured to be deployed on Vercel. Follow these steps to deploy:

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database (or any MongoDB provider)
3. [Node.js](https://nodejs.org/) installed locally

### Setup Environment Variables

You'll need to set up the following environment variables in your Vercel project:

- `MONGODB_URI`: Your MongoDB connection string (must include database name)
  - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/smartbite?retryWrites=true&w=majority`
  - Make sure to replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your actual values
  - **Important**: Include the database name before the query parameters (e.g., `/smartbite?`)
- `ACCESS_TOKEN_SECRET`: Secret for JWT access tokens
- `REFRESH_TOKEN_SECRET`: Secret for JWT refresh tokens
- `NODE_ENV`: Set to `production` for deployment

**Note**: If you're experiencing authentication issues, verify that:
1. Your MongoDB Atlas username and password are correct
2. Your IP address is whitelisted in MongoDB Atlas Network Access settings
3. The database name is correctly specified in the connection string

### Deployment Steps

1. Install Vercel CLI (optional):
   ```
   npm install -g vercel
   ```

2. Login to Vercel (if using CLI):
   ```
   vercel login
   ```

3. Deploy your application:
   ```
   vercel
   ```

### Troubleshooting Vercel Deployment

If you encounter errors during deployment, check the following:

#### MongoDB Connection Issues

- **Authentication Failed**: Verify your MongoDB username and password in the connection string
- **IP Access List**: Make sure Vercel's IP addresses are whitelisted in MongoDB Atlas (or enable "Allow access from anywhere")
- **Database Name**: Ensure your connection string includes the database name before query parameters
- **Connection String Format**: Double-check the format of your MongoDB URI

#### Server.js Export Issues

- Make sure `server.js` exports the Express app with `module.exports = app;`
- Verify that all middleware and routes are properly configured

#### Environment Variables

- Check that all required environment variables are set in Vercel project settings
- Ensure environment variables are properly accessed in your code

### Deployment Methods

#### Option 1: Using Vercel CLI
```
vercel
```

#### Option 2: Using Vercel Dashboard
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
