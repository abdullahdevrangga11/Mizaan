export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          actor_role: string | null
          actor_user_id: string | null
          actor_wallet: string | null
          amount_idrz: number | null
          category: string | null
          distribution_pda: string | null
          donation_pda: string | null
          event_type: string
          id: string
          laz_id: string | null
          laz_slug: string | null
          metadata: Json | null
          mustahik_id: string | null
          mustahik_initials: string | null
          occurred_at: string
          purpose_short: string | null
          receipt_pda: string | null
          region: string | null
        }
        Insert: {
          actor_role?: string | null
          actor_user_id?: string | null
          actor_wallet?: string | null
          amount_idrz?: number | null
          category?: string | null
          distribution_pda?: string | null
          donation_pda?: string | null
          event_type: string
          id?: string
          laz_id?: string | null
          laz_slug?: string | null
          metadata?: Json | null
          mustahik_id?: string | null
          mustahik_initials?: string | null
          occurred_at?: string
          purpose_short?: string | null
          receipt_pda?: string | null
          region?: string | null
        }
        Update: {
          actor_role?: string | null
          actor_user_id?: string | null
          actor_wallet?: string | null
          amount_idrz?: number | null
          category?: string | null
          distribution_pda?: string | null
          donation_pda?: string | null
          event_type?: string
          id?: string
          laz_id?: string | null
          laz_slug?: string | null
          metadata?: Json | null
          mustahik_id?: string | null
          mustahik_initials?: string | null
          occurred_at?: string
          purpose_short?: string | null
          receipt_pda?: string | null
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_laz_id_fkey"
            columns: ["laz_id"]
            isOneToOne: false
            referencedRelation: "laz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_mustahik_id_fkey"
            columns: ["mustahik_id"]
            isOneToOne: false
            referencedRelation: "mustahik"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions_meta: {
        Row: {
          amil_user_id: string | null
          amount_idrz: number
          asnaf: string
          block_height: number | null
          category: string
          created_at: string
          distribution_decision_pda: string
          donation_commitment_pda: string
          id: string
          internal_notes: string | null
          laz_id: string
          magic_link_clicked_at: string | null
          magic_link_sent_at: string | null
          mustahik_id: string
          purpose_description: string
          receipt_confirmed_at: string | null
          receipt_pda: string | null
          thank_you_message_encrypted: string | null
          token_transfer_signature: string
        }
        Insert: {
          amil_user_id?: string | null
          amount_idrz: number
          asnaf: string
          block_height?: number | null
          category: string
          created_at?: string
          distribution_decision_pda: string
          donation_commitment_pda: string
          id?: string
          internal_notes?: string | null
          laz_id: string
          magic_link_clicked_at?: string | null
          magic_link_sent_at?: string | null
          mustahik_id: string
          purpose_description: string
          receipt_confirmed_at?: string | null
          receipt_pda?: string | null
          thank_you_message_encrypted?: string | null
          token_transfer_signature: string
        }
        Update: {
          amil_user_id?: string | null
          amount_idrz?: number
          asnaf?: string
          block_height?: number | null
          category?: string
          created_at?: string
          distribution_decision_pda?: string
          donation_commitment_pda?: string
          id?: string
          internal_notes?: string | null
          laz_id?: string
          magic_link_clicked_at?: string | null
          magic_link_sent_at?: string | null
          mustahik_id?: string
          purpose_description?: string
          receipt_confirmed_at?: string | null
          receipt_pda?: string | null
          thank_you_message_encrypted?: string | null
          token_transfer_signature?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributions_meta_donation_commitment_pda_fkey"
            columns: ["donation_commitment_pda"]
            isOneToOne: false
            referencedRelation: "donations_meta"
            referencedColumns: ["donation_commitment_pda"]
          },
          {
            foreignKeyName: "distributions_meta_laz_id_fkey"
            columns: ["laz_id"]
            isOneToOne: false
            referencedRelation: "laz"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_meta_mustahik_id_fkey"
            columns: ["mustahik_id"]
            isOneToOne: false
            referencedRelation: "mustahik"
            referencedColumns: ["id"]
          },
        ]
      }
      donations_meta: {
        Row: {
          amount_idrz: number
          block_height: number | null
          category_preference: string[] | null
          confirmation_count: number
          created_at: string
          distribution_count: number
          donation_commitment_pda: string
          donation_type: string
          donor_display_name: string | null
          donor_email: string | null
          donor_wallet: string
          encrypted_message: string | null
          fully_confirmed_at: string | null
          fully_distributed_at: string | null
          id: string
          laz_id: string
          status: string
          token_transfer_signature: string
          total_distributed_idrz: number
        }
        Insert: {
          amount_idrz: number
          block_height?: number | null
          category_preference?: string[] | null
          confirmation_count?: number
          created_at?: string
          distribution_count?: number
          donation_commitment_pda: string
          donation_type: string
          donor_display_name?: string | null
          donor_email?: string | null
          donor_wallet: string
          encrypted_message?: string | null
          fully_confirmed_at?: string | null
          fully_distributed_at?: string | null
          id?: string
          laz_id: string
          status?: string
          token_transfer_signature: string
          total_distributed_idrz?: number
        }
        Update: {
          amount_idrz?: number
          block_height?: number | null
          category_preference?: string[] | null
          confirmation_count?: number
          created_at?: string
          distribution_count?: number
          donation_commitment_pda?: string
          donation_type?: string
          donor_display_name?: string | null
          donor_email?: string | null
          donor_wallet?: string
          encrypted_message?: string | null
          fully_confirmed_at?: string | null
          fully_distributed_at?: string | null
          id?: string
          laz_id?: string
          status?: string
          token_transfer_signature?: string
          total_distributed_idrz?: number
        }
        Relationships: [
          {
            foreignKeyName: "donations_meta_laz_id_fkey"
            columns: ["laz_id"]
            isOneToOne: false
            referencedRelation: "laz"
            referencedColumns: ["id"]
          },
        ]
      }
      laz: {
        Row: {
          contact_email: string | null
          donor_count: number
          id: string
          identity_pda: string | null
          jurisdiction_level: string
          logo_url: string | null
          mustahik_count: number
          name: string
          region: string
          registered_at: string
          registration_number: string
          slug: string
          status: string
          total_distributed_idrz: number
          total_received_idrz: number
          updated_at: string
          wallet_address: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          donor_count?: number
          id?: string
          identity_pda?: string | null
          jurisdiction_level: string
          logo_url?: string | null
          mustahik_count?: number
          name: string
          region: string
          registered_at?: string
          registration_number: string
          slug: string
          status?: string
          total_distributed_idrz?: number
          total_received_idrz?: number
          updated_at?: string
          wallet_address: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          donor_count?: number
          id?: string
          identity_pda?: string | null
          jurisdiction_level?: string
          logo_url?: string | null
          mustahik_count?: number
          name?: string
          region?: string
          registered_at?: string
          registration_number?: string
          slug?: string
          status?: string
          total_distributed_idrz?: number
          total_received_idrz?: number
          updated_at?: string
          wallet_address?: string
          website_url?: string | null
        }
        Relationships: []
      }
      laz_admins: {
        Row: {
          display_name: string | null
          id: string
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          laz_id: string
          role: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          laz_id: string
          role?: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          laz_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laz_admins_laz_id_fkey"
            columns: ["laz_id"]
            isOneToOne: false
            referencedRelation: "laz"
            referencedColumns: ["id"]
          },
        ]
      }
      mustahik: {
        Row: {
          age_range: string
          asnaf_category: string
          email: string | null
          full_name: string
          id: string
          identity_pda: string | null
          initials: string
          internal_id: string
          internal_id_hash: string
          last_updated: string
          laz_id: string
          phone: string | null
          region: string
          registered_at: string
          registered_by: string | null
          status: string
          wallet_address: string
        }
        Insert: {
          age_range: string
          asnaf_category: string
          email?: string | null
          full_name: string
          id?: string
          identity_pda?: string | null
          initials: string
          internal_id: string
          internal_id_hash: string
          last_updated?: string
          laz_id: string
          phone?: string | null
          region: string
          registered_at?: string
          registered_by?: string | null
          status?: string
          wallet_address: string
        }
        Update: {
          age_range?: string
          asnaf_category?: string
          email?: string | null
          full_name?: string
          id?: string
          identity_pda?: string | null
          initials?: string
          internal_id?: string
          internal_id_hash?: string
          last_updated?: string
          laz_id?: string
          phone?: string | null
          region?: string
          registered_at?: string
          registered_by?: string | null
          status?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "mustahik_laz_id_fkey"
            columns: ["laz_id"]
            isOneToOne: false
            referencedRelation: "laz"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      feed_cache: {
        Row: {
          amount_idrz: number | null
          category: string | null
          event_type: string | null
          id: string | null
          laz_slug: string | null
          mustahik_initials: string | null
          occurred_at: string | null
          purpose_short: string | null
          region: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_laz_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ─── Named row aliases used by lib/db/*.ts ──────────────────────────
export type LazRow = Database["public"]["Tables"]["laz"]["Row"]
export type LazInsert = Database["public"]["Tables"]["laz"]["Insert"]
export type LazAdminsRow = Database["public"]["Tables"]["laz_admins"]["Row"]
export type MustahikRow = Database["public"]["Tables"]["mustahik"]["Row"]
export type MustahikInsert = Database["public"]["Tables"]["mustahik"]["Insert"]
export type DonationsMetaRow = Database["public"]["Tables"]["donations_meta"]["Row"]
export type DonationsMetaInsert = Database["public"]["Tables"]["donations_meta"]["Insert"]
export type DistributionsMetaRow = Database["public"]["Tables"]["distributions_meta"]["Row"]
export type DistributionsMetaInsert = Database["public"]["Tables"]["distributions_meta"]["Insert"]
export type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"]
export type AuditLogInsert = Database["public"]["Tables"]["audit_log"]["Insert"]
export type FeedCacheRow = Database["public"]["Views"]["feed_cache"]["Row"]
