import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri) {
    if (isProduction) {
      throw new Error('[DB] MONGODB_URI is required in production.');
    }
    console.warn('[DB] MONGODB_URI is not set. Backend will start but data will not persist.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[DB] Connected to MongoDB');
  } catch (err) {
    console.error('[DB] MongoDB connection error:', err.message);
    if (isProduction) {
      process.exit(1);
    }
    throw err;
  }
}

