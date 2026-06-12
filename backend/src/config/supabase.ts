import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Standard client for operations that use user-level credentials
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Admin client that bypasses Row Level Security (RLS) for server-side trusted operations
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Ensures all required storage buckets exist in Supabase.
 * If a bucket does not exist, it will be automatically created.
 */
export async function initializeStorageBuckets() {
  const buckets = [
    { name: 'profile-images', public: true },
    { name: 'doctor-documents', public: false },
    { name: 'retailer-documents', public: false },
    { name: 'prescriptions', public: false },
    { name: 'stock-files', public: false },
  ];

  try {
    console.log('📦 Checking storage buckets...');
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.warn('⚠️ Warning: Could not list storage buckets. Make sure your service role key is valid.', listError.message);
      return;
    }

    const existingNames = new Set(existingBuckets.map((b) => b.name));

    for (const bucket of buckets) {
      if (!existingNames.has(bucket.name)) {
        console.log(`📦 Creating Supabase Storage bucket: "${bucket.name}"...`);
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 10485760, // 10 MB limit
        });

        if (createError) {
          console.error(`❌ Error creating bucket "${bucket.name}":`, createError.message);
        } else {
          console.log(`✅ Bucket "${bucket.name}" created successfully.`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Failed to initialize storage buckets:', err);
  }
}
