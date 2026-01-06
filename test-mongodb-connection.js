// Test MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }
    
    // Mask password in output
    const maskedUri = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log('📡 Connecting to:', maskedUri);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('📊 Database name:', dbName);
    
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    if (collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Tip: Check your username and password in .env.local');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 Tip: Check your MongoDB URI and network connection');
    } else if (error.message.includes('IP')) {
      console.error('\n💡 Tip: Make sure your IP is whitelisted in MongoDB Atlas Network Access');
    }
    
    process.exit(1);
  }
}

testConnection();

