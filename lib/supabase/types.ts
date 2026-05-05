/**
 * Placeholder Database type. Replace with output of:
 *   supabase gen types typescript --linked --schema public > lib/supabase/types.ts
 *
 * Until then, this permissive shape lets the rest of the app compile while
 * keeping `from()` calls type-checked against table names.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface LazRow {
  id: string;
  wallet_address: string;
  identity_pda: string | null;
  slug: string;
  name: string;
  registration_number: string;
  region: string;
  jurisdiction_level: "NATIONAL" | "PROVINCIAL" | "REGENCY" | "MOSQUE";
  website_url: string | null;
  contact_email: string | null;
  logo_url: string | null;
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  total_received_idrz: number;
  total_distributed_idrz: number;
  mustahik_count: number;
  donor_count: number;
  registered_at: string;
  updated_at: string;
}

export interface LazAdminRow {
  id: string;
  user_id: string;
  laz_id: string;
  role: "AMIL" | "HEAD_AMIL" | "OBSERVER";
  display_name: string | null;
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
}

export interface MustahikRow {
  id: string;
  laz_id: string;
  wallet_address: string;
  identity_pda: string | null;
  internal_id: string;
  internal_id_hash: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  initials: string;
  asnaf_category:
    | "FAKIR"
    | "MISKIN"
    | "AMIL"
    | "MUALLAF"
    | "RIQAB"
    | "GHARIMIN"
    | "FISABILILLAH"
    | "IBNU_SABIL";
  region: string;
  age_range: "CHILD" | "TEEN" | "ADULT" | "ELDER";
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  registered_at: string;
  registered_by: string | null;
  last_updated: string;
}

export interface DonationsMetaRow {
  id: string;
  donation_commitment_pda: string;
  donor_wallet: string;
  laz_id: string;
  donor_email: string | null;
  donor_display_name: string | null;
  encrypted_message: string | null;
  donation_type: "ZAKAT_MAL" | "ZAKAT_FITRAH" | "SEDEKAH" | "INFAQ";
  amount_idrz: number;
  category_preference: string[] | null;
  token_transfer_signature: string;
  block_height: number | null;
  status:
    | "PENDING_DISTRIBUTION"
    | "PARTIALLY_DISTRIBUTED"
    | "FULLY_DISTRIBUTED"
    | "FULLY_CONFIRMED";
  total_distributed_idrz: number;
  distribution_count: number;
  confirmation_count: number;
  created_at: string;
  fully_distributed_at: string | null;
  fully_confirmed_at: string | null;
}

export interface DistributionsMetaRow {
  id: string;
  distribution_decision_pda: string;
  donation_commitment_pda: string;
  laz_id: string;
  mustahik_id: string;
  amil_user_id: string;
  amount_idrz: number;
  category: string;
  asnaf: string;
  purpose_description: string;
  internal_notes: string | null;
  token_transfer_signature: string;
  block_height: number | null;
  receipt_pda: string | null;
  receipt_confirmed_at: string | null;
  thank_you_message_encrypted: string | null;
  magic_link_sent_at: string | null;
  magic_link_clicked_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  event_type:
    | "DONATION_CREATED"
    | "DISTRIBUTION_CREATED"
    | "RECEIPT_CONFIRMED"
    | "LAZ_REGISTERED"
    | "MUSTAHIK_REGISTERED"
    | "ADMIN_LOGIN"
    | "ADMIN_INVITED";
  actor_user_id: string | null;
  actor_wallet: string | null;
  actor_role: string | null;
  laz_id: string | null;
  mustahik_id: string | null;
  donation_pda: string | null;
  distribution_pda: string | null;
  receipt_pda: string | null;
  amount_idrz: number | null;
  category: string | null;
  region: string | null;
  mustahik_initials: string | null;
  laz_slug: string | null;
  purpose_short: string | null;
  metadata: Json | null;
  occurred_at: string;
}

export interface FeedCacheRow {
  id: string;
  event_type: AuditLogRow["event_type"];
  amount_idrz: number | null;
  category: string | null;
  region: string | null;
  mustahik_initials: string | null;
  laz_slug: string | null;
  purpose_short: string | null;
  occurred_at: string;
}

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      laz: TableShape<LazRow>;
      laz_admins: TableShape<LazAdminRow>;
      mustahik: TableShape<MustahikRow>;
      donations_meta: TableShape<DonationsMetaRow>;
      distributions_meta: TableShape<DistributionsMetaRow>;
      audit_log: TableShape<AuditLogRow>;
    };
    Views: {
      feed_cache: { Row: FeedCacheRow; Relationships: [] };
    };
    Functions: {
      current_laz_id: { Args: Record<string, never>; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
