import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Fetch all sites. Supports optional search query.
 */
export async function getAllSites(search?: string) {
  let query = supabaseAdmin
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.ilike('name', q);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create a new site.
 */
export async function createSite(data: { name: string }) {
  const { name } = data;

  if (!name) {
    throw new Error("Site name is required");
  }

  const { data: siteData, error } = await supabaseAdmin
    .from("sites")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return siteData;
}

/**
 * Update an existing site.
 */
export async function updateSite(id: string, updateData: { name?: string }) {
  if (!id) throw new Error("Site id is required");

  const { data, error } = await supabaseAdmin
    .from("sites")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a site.
 */
export async function deleteSite(id: string) {
  if (!id) throw new Error("Site id is required");

  const { error } = await supabaseAdmin
    .from("sites")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}
