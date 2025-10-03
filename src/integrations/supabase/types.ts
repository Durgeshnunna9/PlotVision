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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          active_listings: number | null
          clients_count: number | null
          id: string
          manager_id: string | null
          name: string
          rating: number | null
          specialization: string | null
          total_sales: number | null
        }
        Insert: {
          active_listings?: number | null
          clients_count?: number | null
          id?: string
          manager_id?: string | null
          name: string
          rating?: number | null
          specialization?: string | null
          total_sales?: number | null
        }
        Update: {
          active_listings?: number | null
          clients_count?: number | null
          id?: string
          manager_id?: string | null
          name?: string
          rating?: number | null
          specialization?: string | null
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agent_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      company_profile: {
        Row: {
          address: string | null
          city: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          id: string
          state: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_email?: string | null
          company_name: string
          company_phone?: string | null
          id?: string
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          id?: string
          state?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          agent_id: string
          amount: number
          commission: number
          created_at: string | null
          id: string
          status: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          commission: number
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          commission?: number
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      image_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      manager_agents: {
        Row: {
          agent_id: string
          assigned_at: string | null
          id: string
          manager_id: string
        }
        Insert: {
          agent_id: string
          assigned_at?: string | null
          id?: string
          manager_id: string
        }
        Update: {
          agent_id?: string
          assigned_at?: string | null
          id?: string
          manager_id?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          email: boolean | null
          id: string
          marketing: boolean | null
          push: boolean | null
          sms: boolean | null
        }
        Insert: {
          email?: boolean | null
          id?: string
          marketing?: boolean | null
          push?: boolean | null
          sms?: boolean | null
        }
        Update: {
          email?: boolean | null
          id?: string
          marketing?: boolean | null
          push?: boolean | null
          sms?: boolean | null
        }
        Relationships: []
      }
      performance: {
        Row: {
          clients: number | null
          created_at: string
          id: number
          listing: number | null
          rating: string | null
          sale: number | null
        }
        Insert: {
          clients?: number | null
          created_at?: string
          id?: number
          listing?: number | null
          rating?: string | null
          sale?: number | null
        }
        Update: {
          clients?: number | null
          created_at?: string
          id?: number
          listing?: number | null
          rating?: string | null
          sale?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string
          id: string
          phone: number
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          full_name: string
          id: string
          phone: number
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          full_name?: string
          id?: string
          phone?: number
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          about_property: string | null
          advantages: Json | null
          building_age: string | null
          building_condition: string | null
          corner_peice: string | null
          corner_side: string | null
          distance: string | null
          electricity: string | null
          entry_direction: string | null
          facilities: Json | null
          floor: string | null
          footfall_per_hour: number | null
          front_offset: number | null
          generator: string | null
          id: string
          landmark: string | null
          location: string | null
          owner_contacted: string | null
          parking_availability: string | null
          parking_capacity_2w: number | null
          parking_capacity_4w: number | null
          parking_photos: Json | null
          property_photos: Json | null
          property_type: string | null
          rental_value: number | null
          road_facing: string | null
          setback: string | null
          shutter_length: number | null
          shutter_width: number | null
          snack_spend: number | null
          sold_at: string | null
          store_length: number | null
          store_model: string | null
          store_position: string | null
          store_size: number | null
          store_width: number | null
          user_id: string
          video: Json | null
          washroom: string | null
          water: string | null
        }
        Insert: {
          about_property?: string | null
          advantages?: Json | null
          building_age?: string | null
          building_condition?: string | null
          corner_peice?: string | null
          corner_side?: string | null
          distance?: string | null
          electricity?: string | null
          entry_direction?: string | null
          facilities?: Json | null
          floor?: string | null
          footfall_per_hour?: number | null
          front_offset?: number | null
          generator?: string | null
          id?: string
          landmark?: string | null
          location?: string | null
          owner_contacted?: string | null
          parking_availability?: string | null
          parking_capacity_2w?: number | null
          parking_capacity_4w?: number | null
          parking_photos?: Json | null
          property_photos?: Json | null
          property_type?: string | null
          rental_value?: number | null
          road_facing?: string | null
          setback?: string | null
          shutter_length?: number | null
          shutter_width?: number | null
          snack_spend?: number | null
          sold_at?: string | null
          store_length?: number | null
          store_model?: string | null
          store_position?: string | null
          store_size?: number | null
          store_width?: number | null
          user_id?: string
          video?: Json | null
          washroom?: string | null
          water?: string | null
        }
        Update: {
          about_property?: string | null
          advantages?: Json | null
          building_age?: string | null
          building_condition?: string | null
          corner_peice?: string | null
          corner_side?: string | null
          distance?: string | null
          electricity?: string | null
          entry_direction?: string | null
          facilities?: Json | null
          floor?: string | null
          footfall_per_hour?: number | null
          front_offset?: number | null
          generator?: string | null
          id?: string
          landmark?: string | null
          location?: string | null
          owner_contacted?: string | null
          parking_availability?: string | null
          parking_capacity_2w?: number | null
          parking_capacity_4w?: number | null
          parking_photos?: Json | null
          property_photos?: Json | null
          property_type?: string | null
          rental_value?: number | null
          road_facing?: string | null
          setback?: string | null
          shutter_length?: number | null
          shutter_width?: number | null
          snack_spend?: number | null
          sold_at?: string | null
          store_length?: number | null
          store_model?: string | null
          store_position?: string | null
          store_size?: number | null
          store_width?: number | null
          user_id?: string
          video?: Json | null
          washroom?: string | null
          water?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          agent_id: string | null
          amount: number
          id: string
          property_id: string | null
          sale_date: string | null
        }
        Insert: {
          agent_id?: string | null
          amount: number
          id?: string
          property_id?: string | null
          sale_date?: string | null
        }
        Update: {
          agent_id?: string | null
          amount?: number
          id?: string
          property_id?: string | null
          sale_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          currency: string | null
          date_format: string | null
          id: string
          language: string | null
          theme: string | null
          timezone: string | null
        }
        Insert: {
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
        }
        Update: {
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          theme?: string | null
          timezone?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          agent_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          task_name: string | null
          title: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          task_name?: string | null
          title: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          task_name?: string | null
          title?: string
        }
        Relationships: []
      }
      trigger_log: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "agent"
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
    Enums: {
      app_role: ["admin", "manager", "agent"],
    },
  },
} as const
