import mongoose from 'mongoose';

export async function connectToDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(databaseUrl, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000
  });
}


