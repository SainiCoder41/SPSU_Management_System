import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { seedDatabase } from './seed/seed.js';

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Initializing empty database with default seed data...');
      await seedDatabase(false);
    }

    const PORT = parseInt(ENV.PORT, 10) || 5000;
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🏛️  SPSU Campus Management System (v1.0 SIS)`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${ENV.NODE_ENV}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
