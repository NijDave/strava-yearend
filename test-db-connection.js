// Quick test script to verify MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Database is ready. Collections:', collections.length);
    
    await mongoose.disconnect();
    console.log('✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

