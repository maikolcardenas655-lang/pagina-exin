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
      acquisition_photos: {
        Row: {
          acquisition_id: string
          created_at: string
          id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          acquisition_id: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          acquisition_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "acquisition_photos_acquisition_id_fkey"
            columns: ["acquisition_id"]
            isOneToOne: false
            referencedRelation: "acquisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      acquisitions: {
        Row: {
          address: string | null
          area_m2: number | null
          assigned_to: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          consent: boolean
          created_at: string
          expected_price: number | null
          id: string
          notes: string | null
          operation: Database["public"]["Enums"]["operation_type"]
          owner_email: string | null
          owner_name: string
          owner_phone: string
          parking: number | null
          preferred_contact: string | null
          property_type: string | null
          status: Database["public"]["Enums"]["acquisition_status"]
          updated_at: string
          zone: string | null
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          consent?: boolean
          created_at?: string
          expected_price?: number | null
          id?: string
          notes?: string | null
          operation?: Database["public"]["Enums"]["operation_type"]
          owner_email?: string | null
          owner_name: string
          owner_phone: string
          parking?: number | null
          preferred_contact?: string | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["acquisition_status"]
          updated_at?: string
          zone?: string | null
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          assigned_to?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          consent?: boolean
          created_at?: string
          expected_price?: number | null
          id?: string
          notes?: string | null
          operation?: Database["public"]["Enums"]["operation_type"]
          owner_email?: string | null
          owner_name?: string
          owner_phone?: string
          parking?: number | null
          preferred_contact?: string | null
          property_type?: string | null
          status?: Database["public"]["Enums"]["acquisition_status"]
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          advisor_id: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          contact_id: string | null
          created_at: string
          id: string
          notes: string | null
          property_code: string | null
          property_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          advisor_id?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_code?: string | null
          property_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          advisor_id?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_code?: string | null
          property_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_path: string | null
          name: string
          sort_order: number
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name: string
          sort_order?: number
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_path?: string | null
          name?: string
          sort_order?: number
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          assigned_to: string | null
          consent: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          notes: string | null
          phone: string | null
          preferred_contact: string | null
          property_code: string | null
          property_id: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          property_code?: string | null
          property_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?: string | null
          property_code?: string | null
          property_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          approx_amount: number | null
          assigned_to: string | null
          city: string | null
          consent: boolean
          created_at: string
          credit_type: Database["public"]["Enums"]["credit_type"]
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          property_code: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["credit_status"]
          updated_at: string
        }
        Insert: {
          approx_amount?: number | null
          assigned_to?: string | null
          city?: string | null
          consent?: boolean
          created_at?: string
          credit_type?: Database["public"]["Enums"]["credit_type"]
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          property_code?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["credit_status"]
          updated_at?: string
        }
        Update: {
          approx_amount?: number | null
          assigned_to?: string | null
          city?: string | null
          consent?: boolean
          created_at?: string
          credit_type?: Database["public"]["Enums"]["credit_type"]
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          property_code?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["credit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          admin_fee: number | null
          amenities: string[]
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          featured_at: string | null
          id: string
          is_featured: boolean
          name: string
          operation: Database["public"]["Enums"]["operation_type"]
          parking: number | null
          price: number | null
          property_type_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["property_status"]
          stratum: number | null
          updated_at: string
          verification_code: string
          zone: string | null
        }
        Insert: {
          address?: string | null
          admin_fee?: number | null
          amenities?: string[]
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          featured_at?: string | null
          id?: string
          is_featured?: boolean
          name: string
          operation?: Database["public"]["Enums"]["operation_type"]
          parking?: number | null
          price?: number | null
          property_type_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["property_status"]
          stratum?: number | null
          updated_at?: string
          verification_code: string
          zone?: string | null
        }
        Update: {
          address?: string | null
          admin_fee?: number | null
          amenities?: string[]
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          featured_at?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          operation?: Database["public"]["Enums"]["operation_type"]
          parking?: number | null
          price?: number | null
          property_type_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["property_status"]
          stratum?: number | null
          updated_at?: string
          verification_code?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_cover: boolean
          name: string | null
          property_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          name?: string | null
          property_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          name?: string | null
          property_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      submission_log: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          kind: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          kind: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          kind?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      acquisition_status:
        | "nueva"
        | "en_revision"
        | "aceptada"
        | "rechazada"
        | "publicada"
      app_role: "superadmin" | "administrador" | "asesor"
      appointment_status: "pendiente" | "confirmada" | "cancelada" | "realizada"
      credit_status:
        | "nueva"
        | "contactado"
        | "en_estudio"
        | "aprobada"
        | "rechazada"
        | "cerrada"
      credit_type: "hipotecario" | "leasing"
      lead_status:
        | "nuevo"
        | "contactado"
        | "en_seguimiento"
        | "cita"
        | "negociacion"
        | "cerrado"
      operation_type: "venta" | "arriendo"
      property_status:
        | "borrador"
        | "publicada"
        | "vendida"
        | "arrendada"
        | "archivada"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acquisition_status: [
        "nueva",
        "en_revision",
        "aceptada",
        "rechazada",
        "publicada",
      ],
      app_role: ["superadmin", "administrador", "asesor"],
      appointment_status: ["pendiente", "confirmada", "cancelada", "realizada"],
      credit_status: [
        "nueva",
        "contactado",
        "en_estudio",
        "aprobada",
        "rechazada",
        "cerrada",
      ],
      credit_type: ["hipotecario", "leasing"],
      lead_status: [
        "nuevo",
        "contactado",
        "en_seguimiento",
        "cita",
        "negociacion",
        "cerrado",
      ],
      operation_type: ["venta", "arriendo"],
      property_status: [
        "borrador",
        "publicada",
        "vendida",
        "arrendada",
        "archivada",
      ],
    },
  },
} as const
