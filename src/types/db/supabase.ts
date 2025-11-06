export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      chapters: {
        Row: {
          chapter_completed: number | null;
          created_at: string;
          date: string;
          id: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          chapter_completed?: number | null;
          created_at?: string;
          date: string;
          id?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          chapter_completed?: number | null;
          created_at?: string;
          date?: string;
          id?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          created_at: string;
          id: number;
          monthly: number | null;
          type: Database['public']['Enums']['goal_types'] | null;
          updated_at: string | null;
          user_id: string;
          yearly: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          monthly?: number | null;
          type?: Database['public']['Enums']['goal_types'] | null;
          updated_at?: string | null;
          user_id?: string;
          yearly?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          monthly?: number | null;
          type?: Database['public']['Enums']['goal_types'] | null;
          updated_at?: string | null;
          user_id?: string;
          yearly?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: number;
          pronouns: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: number;
          pronouns?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: number;
          pronouns?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          chapter: number[] | null;
          created_at: string;
          date: string;
          end_count: number;
          end_time: string;
          id: number;
          session_duration: string | null;
          start_count: number;
          start_time: string;
          updated_at: string | null;
          user_id: string;
          words_written: number | null;
          wpm: number | null;
        };
        Insert: {
          chapter?: number[] | null;
          created_at?: string;
          date: string;
          end_count: number;
          end_time: string;
          id?: number;
          session_duration?: string | null;
          start_count: number;
          start_time: string;
          updated_at?: string | null;
          user_id?: string;
          words_written?: number | null;
          wpm?: number | null;
        };
        Update: {
          chapter?: number[] | null;
          created_at?: string;
          date?: string;
          end_count?: number;
          end_time?: string;
          id?: number;
          session_duration?: string | null;
          start_count?: number;
          start_time?: string;
          updated_at?: string | null;
          user_id?: string;
          words_written?: number | null;
          wpm?: number | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          created_at: string;
          data_calc: Database['public']['Enums']['data_calc'];
          id: number;
          theme: Database['public']['Enums']['theme'];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data_calc?: Database['public']['Enums']['data_calc'];
          id?: number;
          theme?: Database['public']['Enums']['theme'];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data_calc?: Database['public']['Enums']['data_calc'];
          id?: number;
          theme?: Database['public']['Enums']['theme'];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      data_calc: 'per day' | 'per session';
      goal_types: 'word count' | 'chapter';
      theme: 'system' | 'dark' | 'light';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      data_calc: ['per day', 'per session'],
      goal_types: ['word count', 'chapter'],
      theme: ['system', 'dark', 'light'],
    },
  },
} as const;
