import mongoose from 'mongoose';

export async function connectDb() {
  const raw = process.env.MONGODB_URI;
  const uri = typeof raw === 'string' ? raw.trim() : '';
  const isProduction = process.env.NODE_ENV === 'production';

  if (!uri) {
    if (isProduction) {
      throw new Error('[DB] MONGODB_URI is required in production.');
    }
    console.warn('[DB] MONGODB_URI is not set. Backend will start but data will not persist.');
    return;
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[DB] MONGODB_URI must start with mongodb:// or mongodb+srv://. Check your env var on Render (no quotes, no placeholder).');
    if (isProduction) process.exit(1);
    throw new Error('Invalid MONGODB_URI scheme.');
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

