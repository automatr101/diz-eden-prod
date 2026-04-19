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
      blocked_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          property_id: string | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          property_id?: string | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          property_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_reference: string
          check_in: string
          check_out: string
          cleaning_fee: number | null
          created_at: string | null
          currency: string | null
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          nightly_rate: number
          num_guests: number
          num_nights: number
          property_id: string | null
          service_fee: number | null
          special_requests: string | null
          status: string | null
          stripe_payment_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_reference?: string
          check_in: string
          check_out: string
          cleaning_fee?: number | null
          created_at?: string | null
          currency?: string | null
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          nightly_rate: number
          num_guests?: number
          num_nights: number
          property_id?: string | null
          service_fee?: number | null
          special_requests?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_reference?: string
          check_in?: string
          check_out?: string
          cleaning_fee?: number | null
          created_at?: string | null
          currency?: string | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          nightly_rate?: number
          num_guests?: number
          num_nights?: number
          property_id?: string | null
          service_fee?: number | null
          special_requests?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: Json | null
          base_price: number
          bathrooms: number
          bedrooms: number
          cleaning_fee: number | null
          created_at: string | null
          description: string | null
          floor_area_m2: number | null
          house_rules: Json | null
          id: string
          images: Json | null
          location: string | null
          max_guests: number
          name: string
          published: boolean | null
          slug: string
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          base_price: number
          bathrooms: number
          bedrooms: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          floor_area_m2?: number | null
          house_rules?: Json | null
          id?: string
          images?: Json | null
          location?: string | null
          max_guests: number
          name: string
          published?: boolean | null
          slug: string
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          base_price?: number
          bathrooms?: number
          bedrooms?: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          floor_area_m2?: number | null
          house_rules?: Json | null
          id?: string
          images?: Json | null
          location?: string | null
          max_guests?: number
          name?: string
          published?: boolean | null
          slug?: string
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          guest_name: string
          id: string
          property_id: string | null
          published: boolean | null
          rating: number
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guest_name: string
          id?: string
          property_id?: string | null
          published?: boolean | null
          rating: number
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guest_name?: string
          id?: string
          property_id?: string | null
          published?: boolean | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
