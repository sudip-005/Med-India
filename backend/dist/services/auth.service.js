"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("../config/supabase");
const env_1 = require("../config/env");
class AuthService {
    /**
     * Registers a Patient user and inserts their profile.
     */
    static async signupPatient(email, password, profileData) {
        const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Authentication signup failed');
        }
        const userId = authData.user.id;
        // Insert patient profile
        const { error: profileError } = await supabase_1.supabaseAdmin
            .from('patients')
            .insert({
            patient_id: userId,
            email,
            ...profileData,
        });
        if (profileError) {
            // Clean up the created auth user so they can retry
            await supabase_1.supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(`Failed to create Patient profile: ${profileError.message}`);
        }
        return authData;
    }
    /**
     * Registers a Doctor user and inserts their profile.
     */
    static async signupDoctor(email, password, profileData) {
        const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Authentication signup failed');
        }
        const userId = authData.user.id;
        // Insert doctor profile
        const { error: profileError } = await supabase_1.supabaseAdmin
            .from('doctors')
            .insert({
            doctor_id: userId,
            email,
            ...profileData,
        });
        if (profileError) {
            await supabase_1.supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(`Failed to create Doctor profile: ${profileError.message}`);
        }
        return authData;
    }
    /**
     * Registers a Retailer user and inserts their profile.
     */
    static async signupRetailer(email, password, profileData) {
        const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (authError || !authData.user) {
            throw new Error(authError?.message || 'Authentication signup failed');
        }
        const userId = authData.user.id;
        // Insert retailer profile
        const { error: profileError } = await supabase_1.supabaseAdmin
            .from('retailers')
            .insert({
            retailer_id: userId,
            email,
            ...profileData,
        });
        if (profileError) {
            await supabase_1.supabaseAdmin.auth.admin.deleteUser(userId);
            throw new Error(`Failed to create Retailer profile: ${profileError.message}`);
        }
        return authData;
    }
    /**
     * Authenticates user via email and password.
     */
    static async login(email, password) {
        const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            throw new Error(error.message);
        }
        return data;
    }
    /**
     * Terminates active session.
     */
    static async logout(token) {
        const userClient = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY, {
            auth: { persistSession: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { error } = await userClient.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
    }
    /**
     * Retrieves profile data for a specific user ID based on their role.
     */
    static async getProfile(userId, role) {
        const { table, key } = this.getRoleTableMapping(role);
        const { data, error } = await supabase_1.supabaseAdmin
            .from(table)
            .select('*')
            .eq(key, userId)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to retrieve profile: ${error.message}`);
        }
        if (!data) {
            throw new Error('Profile not found');
        }
        return data;
    }
    /**
     * Updates profile data for a user.
     */
    static async updateProfile(userId, role, updateData) {
        const { table, key } = this.getRoleTableMapping(role);
        const { data, error } = await supabase_1.supabaseAdmin
            .from(table)
            .update(updateData)
            .eq(key, userId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
        return data;
    }
    /**
     * Helper mapping UserRole to Database Table Name.
     */
    static getRoleTableMapping(role) {
        switch (role) {
            case 'PATIENT':
                return { table: 'patients', key: 'patient_id' };
            case 'DOCTOR':
                return { table: 'doctors', key: 'doctor_id' };
            case 'RETAILER':
                return { table: 'retailers', key: 'retailer_id' };
            default:
                throw new Error('Invalid user role');
        }
    }
}
exports.AuthService = AuthService;
