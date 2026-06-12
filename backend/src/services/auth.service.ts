import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { UserRole } from '../types';

export class AuthService {
  /**
   * Registers a Patient user and inserts their profile.
   */
  static async signupPatient(email: string, password: string, profileData: any) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Authentication signup failed');
    }

    const userId = authData.user.id;

    // Insert patient profile
    const { error: profileError } = await supabaseAdmin
      .from('patients')
      .insert({
        patient_id: userId,
        email,
        ...profileData,
      });

    if (profileError) {
      // Clean up the created auth user so they can retry
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create Patient profile: ${profileError.message}`);
    }

    return authData;
  }

  /**
   * Registers a Doctor user and inserts their profile.
   */
  static async signupDoctor(email: string, password: string, profileData: any) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Authentication signup failed');
    }

    const userId = authData.user.id;

    // Insert doctor profile
    const { error: profileError } = await supabaseAdmin
      .from('doctors')
      .insert({
        doctor_id: userId,
        email,
        ...profileData,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create Doctor profile: ${profileError.message}`);
    }

    return authData;
  }

  /**
   * Registers a Retailer user and inserts their profile.
   */
  static async signupRetailer(email: string, password: string, profileData: any) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Authentication signup failed');
    }

    const userId = authData.user.id;

    // Insert retailer profile
    const { error: profileError } = await supabaseAdmin
      .from('retailers')
      .insert({
        retailer_id: userId,
        email,
        ...profileData,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Failed to create Retailer profile: ${profileError.message}`);
    }

    return authData;
  }

  /**
   * Authenticates user via email and password.
   */
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
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
  static async logout(token: string) {
    const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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
  static async getProfile(userId: string, role: UserRole) {
    const { table, key } = this.getRoleTableMapping(role);

    const { data, error } = await supabaseAdmin
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
  static async updateProfile(userId: string, role: UserRole, updateData: any) {
    const { table, key } = this.getRoleTableMapping(role);

    const { data, error } = await supabaseAdmin
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
  private static getRoleTableMapping(role: UserRole) {
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
