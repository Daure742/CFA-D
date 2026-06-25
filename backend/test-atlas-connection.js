#!/usr/bin/env node
// test-atlas-connection.js - Diagnostic tool for MongoDB Atlas connectivity

const mongoose = require('mongoose');
const dns = require('dns').promises;

async function testAtlasConnection() {
  console.log('\n🔍 MongoDB Atlas Connection Diagnostic\n');
  
  // Test environment
  console.log('📋 Environment Setup:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  MONGO_URI_ATLAS:', process.env.MONGO_URI_ATLAS ? '✓ Set' : '✗ Not set');
  console.log('  MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Not set');
  console.log('  MONGO_URI_LOCAL:', process.env.MONGO_URI_LOCAL ? '✓ Set' : '✗ Not set');

  const atlasUri = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI;
  if (!atlasUri) {
    console.log('\n❌ No Atlas URI configured');
    return;
  }

  // Extract hostname from MongoDB SRV URL
  const srvMatch = atlasUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (!srvMatch) {
    console.log('\n❌ Invalid MongoDB URI format');
    return;
  }

  const [, username, password, host] = srvMatch;
  console.log('\n📍 Connection Details (from URI):');
  console.log('  Host:', host);
  console.log('  Username:', username ? `${username.substring(0, 3)}***` : 'N/A');

  // Test DNS resolution
  console.log('\n🌐 Testing DNS Resolution:');
  try {
    const srvRecord = `_mongodb._tcp.${host}`;
    console.log('  Looking up SRV record:', srvRecord);
    const addresses = await dns.resolveSrv(srvRecord);
    console.log('  ✅ SRV resolved successfully');
    console.log('  Servers found:', addresses.length);
    addresses.slice(0, 3).forEach((addr, i) => {
      console.log(`    ${i + 1}. ${addr.name}:${addr.port}`);
    });
  } catch (err) {
    console.log('  ❌ SRV resolution failed:', err.code || err.message);
    
    // Try standard A record resolution
    try {
      console.log('\n  Trying standard DNS (A record)...');
      const ips = await dns.resolve4(host);
      console.log('  ✅ A record resolved successfully');
      console.log('  IPs:', ips.slice(0, 3).join(', '));
    } catch (err2) {
      console.log('  ❌ A record resolution also failed:', err2.code || err2.message);
    }
  }

  // Test MongoDB connection
  console.log('\n🔗 Testing MongoDB Connection:');
  const options = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  };

  try {
    console.log('  Connecting to Atlas...');
    const conn = await mongoose.connect(atlasUri, options);
    console.log('  ✅ Successfully connected to MongoDB Atlas');
    console.log('  Connected to:', conn.connection.host);
    console.log('  Database:', conn.connection.name);
    
    // Check collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📦 Collections found:', collections.length);
    collections.slice(0, 5).forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.log('  ❌ Connection failed:', err.message);
    console.log('  Error code:', err.code);
    
    // Suggest solutions
    console.log('\n💡 Troubleshooting suggestions:');
    if (err.message.includes('ECONNREFUSED')) {
      console.log('  • Network connection refused - check firewall/proxy');
      console.log('  • MongoDB Atlas may be down or unreachable');
    }
    if (err.message.includes('ENOTFOUND')) {
      console.log('  • DNS resolution failed');
      console.log('  • Check your internet connection');
      console.log('  • Try: ping 8.8.8.8');
    }
    if (err.message.includes('authentication failed')) {
      console.log('  • Invalid credentials');
      console.log('  • Check username and password in MONGO_URI');
    }
    if (err.message.includes('timed out')) {
      console.log('  • Connection timeout');
      console.log('  • Network latency too high or Atlas unreachable');
    }
  }

  console.log('\n✅ Diagnostic complete\n');
}

// Run diagnostic
require('dotenv').config();
testAtlasConnection().catch(console.error);
