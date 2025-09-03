const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. This is required for the application to function.');
  throw new Error('MONGODB_URI environment variable is required');
}

// Global variables to cache the database connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  try {
    // If we already have a connection, use it
    if (cachedClient && cachedDb) {
      console.log('Using cached database connection');
      return cachedDb;
    }
    
    console.log('Creating new MongoDB connection...');
    // Connection options optimized for serverless
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Use database name from URI path if provided; else default to 'smartbite'
    const dbNameFromUri = (uri && uri.split('/')[3].split('?')[0]) || 'smartbite';
    const db = client.db(dbNameFromUri || 'smartbite');
    
    // Cache the client and connection
    cachedClient = client;
    cachedDb = db;
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error; // Re-throw to be handled by the caller
  }
}

function getDb() {
  if (!cachedDb) throw new Error('Database not initialized');
  return cachedDb;
}

module.exports = { connectToDatabase, getDb };

