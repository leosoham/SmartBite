// Load environment variables first
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const PORT = process.env.PORT || 3500;
const { connectToDatabase } = require('./db');

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use('/', express.static(path.join(__dirname, '/public')));

// routes
// app.use('/', require('./routes/root'));
app.use('^/register$', require('./routes/register'));
app.use('/', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// app.use(verifyJWT);
app.use('/info', require('./routes/info'))
app.use('/about', require('./routes/about'))
app.use('/history', require('./routes/history'))
app.use('/profile(.html)?', require('./routes/profile'))
app.use('/savesearch', require('./routes/saveSearch'))
app.use('/home', require('./routes/home'));
app.use('/scanner', require('./routes/scanner'));
app.use('/product-info(.html)?', require('./routes/productinfo'))
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
} else {
  // For Vercel serverless environment, we don't call app.listen()
  // Instead, we just connect to the database
  // We'll connect to the database on each request to ensure connection is established
  app.use(async (req, res, next) => {
    try {
      // Try to connect to the database before processing the request
      await connectToDatabase();
      next();
    } catch (error) {
      console.error('Failed to connect to MongoDB in middleware:', error.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  });
}

// Export the Express app for Vercel serverless functions
module.exports = app;