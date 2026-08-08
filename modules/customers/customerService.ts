import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Fetch all customers. Supports optional search query.
 */
export async function getAllCustomers(search?: string) {
  const supabaseAdmin = getSupabaseAdmin();
  let query = supabaseAdmin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`name.ilike.${q},mobile.ilike.${q},type.ilike.${q},site_name.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new customer/broker/investor.
 */
export async function createCustomer(data: { name: string; mobile: string; type: string; site_name?: string }) {
  const { name, mobile, type, site_name } = data;

  if (!name || !mobile || !type) {
    throw new Error("name, mobile, and type are required");
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Check if mobile number already exists
  const { data: existingCustomer, error: searchError } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("mobile", mobile)
    .single();

  if (searchError && searchError.code !== "PGRST116") {
    throw searchError;
  }
  if (existingCustomer) {
    throw new Error("Mobile number already registered.");
  }

  const { data: customerData, error } = await supabaseAdmin
    .from("customers")
    .insert([{ name, mobile, type, site_name: site_name || null }])
    .select()
    .single();

  if (error) throw error;
  return customerData;
}

/**
 * Update an existing customer/broker/investor.
 */
export async function updateCustomer(id: string, updateData: { name?: string; mobile?: string; type?: string; site_name?: string }) {
  if (!id) throw new Error("Customer id is required");

  const supabaseAdmin = getSupabaseAdmin();

  if (updateData.mobile) {
    const { data: existingCustomer, error: searchError } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("mobile", updateData.mobile)
      .neq("id", id) // Exclude current customer
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      throw searchError;
    }
    if (existingCustomer) {
      throw new Error("Mobile number already registered.");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a customer/broker/investor.
 */
export async function deleteCustomer(id: string) {
  if (!id) throw new Error("Customer id is required");

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}
