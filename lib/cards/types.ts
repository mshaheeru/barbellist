import type { Package } from "@/lib/types";

export type CardMember = {
  id: string;
  name: string;
  member_code: string;
  photo_url: string | null;
  membership_start: string | null;
  membership_end: string | null;
  card_qr_token: string | null;
  card_issued_at: string | null;
  card_printed: boolean;
  package_id: string | null;
  package: Pick<Package, "id" | "name" | "color"> | null;
};

export type CardMemberSearchResult = {
  id: string;
  name: string;
  member_code: string;
  photo_url: string | null;
  package_name: string | null;
};

export type UnissuedCardMember = {
  id: string;
  name: string;
  member_code: string;
  photo_url: string | null;
  membership_start: string | null;
  membership_end: string | null;
  package_id: string | null;
  package: Pick<Package, "id" | "name" | "color"> | null;
};
