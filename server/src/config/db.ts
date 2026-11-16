import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env.js';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false);

    // Attempt connecting to configured MONGODB_URI with a 2-second timeout
    console.log(`Connecting to MongoDB at: ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}).`);
    console.log('🚀 Initializing MongoMemoryServer (In-Memory Database fallback)...');
    try {
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✅ Connected to In-Memory MongoDB successfully at: ${inMemoryUri}`);
    } catch (fallbackError: any) {
      console.error('❌ Failed to connect to In-Memory MongoDB:', fallbackError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
