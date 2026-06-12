"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Service to handle Supabase Storage interactions.
 */
class StorageService {
    /**
     * Uploads a file buffer to a specified Supabase bucket.
     * Returns the file path within the bucket.
     */
    static async uploadFile(bucket, path, buffer, mimeType) {
        const { data, error } = await supabase_1.supabaseAdmin.storage
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
    static getPublicUrl(bucket, path) {
        const { data } = supabase_1.supabaseAdmin.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
    /**
     * Generates a temporary signed URL to access private files.
     * Defaults to 1 hour (3600 seconds) expiration.
     */
    static async getSignedUrl(bucket, path, expiresIn = 3600) {
        const { data, error } = await supabase_1.supabaseAdmin.storage
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
    static async deleteFile(bucket, path) {
        const { error } = await supabase_1.supabaseAdmin.storage.from(bucket).remove([path]);
        if (error) {
            throw new Error(`Failed to delete storage file: ${error.message}`);
        }
    }
}
exports.StorageService = StorageService;
