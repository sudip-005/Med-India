import { supabaseAdmin } from '../config/supabase';

/**
 * Service handling operations related to Patient accounts and Addresses.
 */
export class PatientService {
  /**
   * Deletes a patient user from Supabase Auth.
   * Due to foreign key cascades (ON DELETE CASCADE), this automatically deletes the profile,
   * addresses, cart, and prescriptions associated with the user.
   */
  static async deletePatient(userId: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Failed to delete patient account: ${error.message}`);
    }
  }

  /**
   * Lists all addresses for a user, sorting default addresses to the top.
   */
  static async getAddresses(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list addresses: ${error.message}`);
    }
    return data;
  }

  /**
   * Adds a new address. If marked as default, resets any existing default address.
   */
  static async addAddress(userId: string, addressData: any) {
    if (addressData.is_default) {
      // Unset previous defaults
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: userId,
        ...addressData,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add address: ${error.message}`);
    }
    return data;
  }

  /**
   * Deletes a user's address.
   */
  static async deleteAddress(userId: string, addressId: string) {
    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('address_id', addressId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }
}
