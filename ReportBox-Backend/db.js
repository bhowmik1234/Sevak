import mongoose from 'mongoose';

// Cache the connection across warm serverless invocations (Vercel) so we don't
// open a new MongoDB connection on every request, which would quickly exhaust
// the Atlas free-tier connection limit. On a long-lived server it simply
// connects once.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    cached.promise = mongoose.connect(uri);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected');
  } catch (error) {
    // Reset so the next request can retry instead of being stuck on a rejected
    // promise. Do not process.exit() — that would kill the serverless function.
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
