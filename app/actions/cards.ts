"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActionContext } from "@/lib/auth/get-action-context";
import {
  fetchCardMember,
  fetchUnissuedMembers,
  searchMembersForCards,
} from "@/lib/cards/queries";
import type {
  CardMember,
  CardMemberSearchResult,
  UnissuedCardMember,
} from "@/lib/cards/types";
import { signMemberQrToken } from "@/lib/qr/sign-member-token";
import type { Package } from "@/lib/types";

function revalidateCardPaths(memberId?: string) {
  revalidatePath("/dashboard/cards");
  if (memberId) {
    revalidatePath(`/dashboard/members/${memberId}`);
  }
  revalidatePath("/dashboard/members");
}

export async function getCardMember(
  memberId: string,
): Promise<{ data: CardMember | null; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const parsed = z.string().uuid().safeParse(memberId);
    if (!parsed.success) return { data: null, error: "Invalid member" };

    const data = await fetchCardMember(supabase, gymId, parsed.data);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load member",
    };
  }
}

export async function searchMembersForCardSelector(raw: {
  query: string;
}): Promise<{ data: CardMemberSearchResult[]; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: [], error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const parsed = z
      .object({ query: z.string().trim().min(1).max(80) })
      .safeParse(raw);
    if (!parsed.success) return { data: [], error: null };

    const data = await searchMembersForCards(
      supabase,
      gymId,
      parsed.data.query,
    );
    return { data, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Search failed",
    };
  }
}

export async function getPackagesForCards(): Promise<{
  data: Pick<Package, "id" | "name" | "color">[] | null;
  error: string | null;
}> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const { data, error } = await supabase
      .from("packages")
      .select("id, name, color")
      .eq("gym_id", gymId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: data ?? [], error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load packages",
    };
  }
}

export async function ensureCardToken(
  memberId: string,
): Promise<{ data: CardMember | null; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const parsed = z.string().uuid().safeParse(memberId);
    if (!parsed.success) return { data: null, error: "Invalid member" };

    const existing = await fetchCardMember(supabase, gymId, parsed.data);
    if (!existing) return { data: null, error: "Member not found" };

    if (existing.card_qr_token) {
      return { data: existing, error: null };
    }

    const token = await signMemberQrToken(parsed.data, gymId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("members")
      .update({
        card_qr_token: token,
        card_issued_at: now,
      })
      .eq("gym_id", gymId)
      .eq("id", parsed.data);

    if (error) return { data: null, error: error.message };

    revalidateCardPaths(parsed.data);
    const updated = await fetchCardMember(supabase, gymId, parsed.data);
    return { data: updated, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to issue card token",
    };
  }
}

export async function regenerateQRToken(
  memberId: string,
): Promise<{ data: CardMember | null; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const parsed = z.string().uuid().safeParse(memberId);
    if (!parsed.success) return { data: null, error: "Invalid member" };

    const existing = await fetchCardMember(supabase, gymId, parsed.data);
    if (!existing) return { data: null, error: "Member not found" };

    const token = await signMemberQrToken(parsed.data, gymId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("members")
      .update({
        card_qr_token: token,
        card_issued_at: existing.card_issued_at ?? now,
        card_printed: false,
      })
      .eq("gym_id", gymId)
      .eq("id", parsed.data);

    if (error) return { data: null, error: error.message };

    revalidateCardPaths(parsed.data);
    const updated = await fetchCardMember(supabase, gymId, parsed.data);
    return { data: updated, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to regenerate QR",
    };
  }
}

export async function markCardPrinted(
  memberId: string,
): Promise<{ data: CardMember | null; error: string | null }> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const parsed = z.string().uuid().safeParse(memberId);
    if (!parsed.success) return { data: null, error: "Invalid member" };

    const existing = await fetchCardMember(supabase, gymId, parsed.data);
    if (!existing) return { data: null, error: "Member not found" };

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("members")
      .update({
        card_printed: true,
        card_issued_at: existing.card_issued_at ?? now,
      })
      .eq("gym_id", gymId)
      .eq("id", parsed.data);

    if (error) return { data: null, error: error.message };

    revalidateCardPaths(parsed.data);
    const updated = await fetchCardMember(supabase, gymId, parsed.data);
    return { data: updated, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to mark card printed",
    };
  }
}

export async function listUnissuedMembers(): Promise<{
  data: UnissuedCardMember[] | null;
  error: string | null;
}> {
  try {
    const ctx = await getActionContext();
    if (!ctx) return { data: null, error: "Not authenticated" };
    const { gymId, supabase } = ctx;

    const data = await fetchUnissuedMembers(supabase, gymId);
    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to list unissued members",
    };
  }
}
