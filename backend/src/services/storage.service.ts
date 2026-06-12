import { supabaseAdmin } from '../config/supabase';

/**
 * Service to handle Supabase Storage interactions.
 */
export class StorageService {
  /**
   * Uploads a file buffer to a specified Supabase bucket.
   * Returns the file path within the bucket.
   */
  static async uploadFile(bucket: string, path: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return data.path;
  }

  /**
   * Gets the public URL of a file (for public buckets).
   */
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Generates a temporary signed URL to access private files.
   * Defaults to 1 hour (3600 seconds) expiration.
   */
  static async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data) {
      throw new Error(`Failed to create signed URL: ${error?.message || 'Unknown error'}`);
    }

    return data.signedUrl;
  }

  /**
   * Deletes a file from a bucket.
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) {
      throw new Error(`Failed to delete storage file: ${error.message}`);
    }
  }
}
