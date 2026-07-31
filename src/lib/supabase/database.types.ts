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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      coach_client_links: {
        Row: {
          client_id: string
          coach_id: string
          id: string
          requested_at: string
          requested_by: string
          responded_at: string | null
          status: Database["public"]["Enums"]["link_status"]
        }
        Insert: {
          client_id: string
          coach_id: string
          id?: string
          requested_at?: string
          requested_by: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["link_status"]
        }
        Update: {
          client_id?: string
          coach_id?: string
          id?: string
          requested_at?: string
          requested_by?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["link_status"]
        }
        Relationships: [
          {
            foreignKeyName: "coach_client_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_links_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_links_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_notes: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          exercise_id: string
          id: string
          note: string
          plan_day_exercise_id: string | null
          updated_at: string
          workout_exercise_id: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          exercise_id: string
          id?: string
          note: string
          plan_day_exercise_id?: string | null
          updated_at?: string
          workout_exercise_id?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          exercise_id?: string
          id?: string
          note?: string
          plan_day_exercise_id?: string | null
          updated_at?: string
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_notes_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_notes_plan_day_exercise_id_fkey"
            columns: ["plan_day_exercise_id"]
            isOneToOne: false
            referencedRelation: "plan_day_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_notes_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          equipment: Database["public"]["Enums"]["equipment_type"] | null
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group"] | null
          name: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"] | null
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group"] | null
          name: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"] | null
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group"] | null
          name?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string
          client_id: string
          id: string
          plan_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by: string
          client_id: string
          id?: string
          plan_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string
          client_id?: string
          id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_day_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_order: number
          id: string
          notes: string | null
          plan_day_id: string
          target_reps_max: number | null
          target_reps_min: number | null
          target_rpe: number | null
          target_sets: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_order?: number
          id?: string
          notes?: string | null
          plan_day_id: string
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_rpe?: number | null
          target_sets?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          plan_day_id?: string
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_rpe?: number | null
          target_sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_day_exercises_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_days: {
        Row: {
          created_at: string
          day_order: number
          id: string
          name: string
          plan_id: string
        }
        Insert: {
          created_at?: string
          day_order?: number
          id?: string
          name: string
          plan_id: string
        }
        Update: {
          created_at?: string
          day_order?: number
          id?: string
          name?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
          weight_unit: Database["public"]["Enums"]["weight_unit"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          username: string
          weight_unit?: Database["public"]["Enums"]["weight_unit"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          username?: string
          weight_unit?: Database["public"]["Enums"]["weight_unit"]
        }
        Relationships: []
      }
      sets: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          is_warmup: boolean
          reps: number | null
          rpe: number | null
          set_order: number
          weight: number | null
          workout_exercise_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_warmup?: boolean
          reps?: number | null
          rpe?: number | null
          set_order?: number
          weight?: number | null
          workout_exercise_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          is_warmup?: boolean
          reps?: number | null
          rpe?: number | null
          set_order?: number
          weight?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_order: number
          id: string
          notes: string | null
          plan_day_exercise_id: string | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_order?: number
          id?: string
          notes?: string | null
          plan_day_exercise_id?: string | null
          workout_session_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          plan_day_exercise_id?: string | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_plan_day_exercise_id_fkey"
            columns: ["plan_day_exercise_id"]
            isOneToOne: false
            referencedRelation: "plan_day_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string | null
          notes: string | null
          plan_day_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          plan_day_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          plan_day_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_own_account: { Args: never; Returns: undefined }
      save_plan: { Args: { payload: Json }; Returns: string }
      search_coaches: {
        Args: { query: string }
        Returns: {
          display_name: string
          id: string
          username: string
        }[]
      }
      set_exercise_video_url: {
        Args: { p_exercise_id: string; p_video_url: string }
        Returns: {
          created_at: string
          created_by: string | null
          equipment: Database["public"]["Enums"]["equipment_type"] | null
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group"] | null
          name: string
          video_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "exercises"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      equipment_type:
        | "barbell"
        | "dumbbell"
        | "machine"
        | "cable"
        | "bodyweight"
        | "kettlebell"
        | "band"
        | "other"
      link_status: "pending" | "approved" | "rejected" | "revoked"
      muscle_group:
        | "chest"
        | "back"
        | "shoulders"
        | "biceps"
        | "triceps"
        | "quads"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "core"
        | "forearms"
        | "full_body"
        | "cardio"
        | "other"
      user_role: "athlete" | "coach"
      weight_unit: "kg" | "lb"
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
      equipment_type: [
        "barbell",
        "dumbbell",
        "machine",
        "cable",
        "bodyweight",
        "kettlebell",
        "band",
        "other",
      ],
      link_status: ["pending", "approved", "rejected", "revoked"],
      muscle_group: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "core",
        "forearms",
        "full_body",
        "cardio",
        "other",
      ],
      user_role: ["athlete", "coach"],
      weight_unit: ["kg", "lb"],
    },
  },
} as const
