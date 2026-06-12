import app from './app';
import { env } from './config/env';
import { initializeStorageBuckets } from './config/supabase';

const PORT = env.PORT || 5001;

async function startServer() {
  try {
    // Automatically check and initialize Supabase storage buckets
    await initializeStorageBuckets();

    app.listen(PORT, () => {
      console.log(`🚀 Med India Backend listening on port ${PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
