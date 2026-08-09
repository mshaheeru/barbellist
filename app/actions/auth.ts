"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  friendlySignUpError,
  signUpSchema,
  type SignUpInput,
} from "@/lib/validations/auth";

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "gym";
}

async function uniqueOrgSlug(base: string) {
  const admin = createAdminClient();
  let slug = base;
  let i = 0;
  while (i < 20) {
    const { data } = await admin
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    i += 1;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function uniqueGymSlug(base: string) {
  const admin = createAdminClient();
  let slug = base;
  let i = 0;
  while (i < 20) {
    const { data } = await admin
      .from("gyms")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    i += 1;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Creates organization + first branch gym + auth user + owner staff row.
 * Uses service role when SUPABASE_SERVICE_ROLE_KEY is set;
 * otherwise signs up via auth + register_gym RPC.
 */
export async function signUpGym(
  raw: SignUpInput,
): Promise<{ error: string | null }> {
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const data = parsed.data;
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  try {
    if (hasServiceRole) {
      return await signUpWithAdmin(data);
    }
    return await signUpWithRpc(data);
  } catch (e) {
    return {
      error: friendlySignUpError(
        e instanceof Error ? e.message : "Registration failed. Please try again.",
      ),
    };
  }
}

async function signUpWithAdmin(
  data: SignUpInput,
): Promise<{ error: string | null }> {
  const admin = createAdminClient();
  const baseSlug = slugify(data.gymName);
  const orgSlug = await uniqueOrgSlug(baseSlug);
  const gymSlug = await uniqueGymSlug(baseSlug);

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: data.gymName,
      slug: orgSlug,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return {
      error: friendlySignUpError(
        orgError?.message ?? "Failed to create organization",
      ),
    };
  }

  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .insert({
      name: data.gymName,
      slug: gymSlug,
      email: data.email,
      phone: data.phone,
      city: data.city,
      country: data.country,
      organization_id: org.id,
    })
    .select("id")
    .single();

  if (gymError || !gym) {
    await admin.from("organizations").delete().eq("id", org.id);
    return {
      error: friendlySignUpError(gymError?.message ?? "Failed to create gym"),
    };
  }

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      app_metadata: {
        organization_id: org.id,
        gym_id: gym.id,
        role: "owner",
      },
      user_metadata: {
        name: data.ownerName,
      },
    });

  if (authError || !authData.user) {
    await admin.from("gyms").delete().eq("id", gym.id);
    await admin.from("organizations").delete().eq("id", org.id);
    return {
      error: friendlySignUpError(
        authError?.message ?? "Failed to create account",
      ),
    };
  }

  const { error: memberError } = await admin
    .from("organization_members")
    .insert({
      organization_id: org.id,
      auth_user_id: authData.user.id,
      role: "owner",
    });

  if (memberError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("gyms").delete().eq("id", gym.id);
    await admin.from("organizations").delete().eq("id", org.id);
    return { error: friendlySignUpError(memberError.message) };
  }

  const { error: staffError } = await admin.from("staff").insert({
    gym_id: gym.id,
    auth_user_id: authData.user.id,
    name: data.ownerName,
    email: data.email,
    phone: data.phone,
    role: "owner",
    status: "active",
  });

  if (staffError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("gyms").delete().eq("id", gym.id);
    await admin.from("organizations").delete().eq("id", org.id);
    return { error: friendlySignUpError(staffError.message) };
  }

  return { error: null };
}

async function signUpWithRpc(
  data: SignUpInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const baseSlug = slugify(data.gymName);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.ownerName,
      },
    },
  });

  if (authError) {
    return { error: friendlySignUpError(authError.message) };
  }

  if (!authData.session) {
    return {
      error:
        "Account created but email confirmation is required. Check your inbox, or contact support if you need help.",
    };
  }

  const { error: rpcError } = await supabase.rpc("register_gym", {
    p_gym_name: data.gymName,
    p_slug: slug,
    p_owner_name: data.ownerName,
    p_email: data.email,
    p_phone: data.phone,
    p_city: data.city,
    p_country: data.country,
  });

  if (rpcError) {
    return { error: friendlySignUpError(rpcError.message) };
  }

  await supabase.auth.refreshSession();
  return { error: null };
}
