import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Register a new user and create their profile via DB trigger.
 */
export async function registerUser(form: any) {
  const email = form.email?.trim().toLowerCase();
  const password = form.password;
  const name = form.name?.trim();
  const mobile = form.mobile?.trim();
  const role = form.role;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, 
    user_metadata: { name, mobile, role } 
  });

  if (authError) {
    if (authError.message.includes("already registered") || authError.status === 422) {
      const error = new Error("This email is already registered. Please login instead.");
      (error as any).status = 400;
      throw error;
    }
    if (authError.message.toLowerCase().includes("rate limit")) {
      const error = new Error("Email signups are temporarily limited. Please try again in a minute.");
      (error as any).status = 429;
      throw error;
    }
    throw authError;
  }

  return authData;
}

/**
 * Admin-led user creation (via Dashboard).
 * Uses admin.createUser to avoid session hijacking.
 */
export async function adminCreateUser(form: any) {
  const { email, password, name, mobile, role } = form;

  if (!email || !password || !name || !mobile) {
    throw new Error("email, password, name and mobile are required");
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Automatically confirm email for admin-created users
    user_metadata: { name, mobile, role } // passed to raw_user_meta_data for trigger
  });

  if (authError) throw authError;
  return userData;
}

/**
 * Update a user's Auth data (password) and Profile data.
 */
export async function updateUser(id: string, updateData: any) {
  if (!id) throw new Error("User id is required");

  const { password, ...profileFields } = updateData;
  const normalizedEmail =
    typeof profileFields.email === "string" && profileFields.email.trim()
      ? profileFields.email.trim().toLowerCase()
      : undefined;

  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from("profiles")
    .select("name,email,mobile,role,status")
    .eq("id", id)
    .maybeSingle();

  if (existingProfileError) throw existingProfileError;


  const nextName = profileFields.name ?? existingProfile?.name ?? null;
  const nextMobile = profileFields.mobile ?? existingProfile?.mobile ?? null;
  const nextRole = profileFields.role ?? existingProfile?.role ?? "user";

  const authPayload: Record<string, unknown> = {};
  if (normalizedEmail) {
    authPayload.email = normalizedEmail;
    authPayload.email_confirm = true;
  }
  if (password && password.trim() !== "") {
    authPayload.password = password;
  }

  authPayload.user_metadata = {
    name: nextName,
    mobile: nextMobile,
    role: nextRole,
  };

  // 1. Update Auth user so login credentials and metadata stay in sync.
  if (Object.keys(authPayload).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authPayload);
    if (authError) throw authError;
  }

  // 2. Update Profile
  if (normalizedEmail) {
    profileFields.email = normalizedEmail;
  }

  const { data, error: profileError } = await supabaseAdmin
    .from("profiles")
    .update(profileFields)
    .eq("id", id)
    .select();

  if (profileError) throw profileError;
  return data[0];
}

/**
 * Delete a user from both Auth and Profiles.
 */
export async function deleteUser(id: string) {
  // Profiles table has CASCADE delete via FK, so deleting from Auth is enough.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;
  return { success: true };
}

/**
 * Fetch all user profiles.
 */
export async function getAllProfiles(search?: string) {
  let query = supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q},mobile.ilike.${q},role.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Login a user.
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email?.trim().toLowerCase(),
    password,
  });

  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) return data;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (profile?.status === "inactive") {
    await supabase.auth.signOut();
    throw new Error("Your account is inactive. Please contact admin.");
  }

  return {
    ...data,
    user: {
      ...data.user,
      ...profile,
      user_metadata: {
        ...(data.user?.user_metadata || {}),
        name: profile?.name ?? data.user?.user_metadata?.name,
        mobile: profile?.mobile ?? data.user?.user_metadata?.mobile,
        role: profile?.role ?? data.user?.user_metadata?.role,
        status: profile?.status ?? "active",
      },
    },
  };
}

/**
 * Logout a user.
 */
export async function logoutUser() {
  await supabase.auth.signOut();
}
