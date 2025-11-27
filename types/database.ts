export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          title: string
          file_url: string
          thumbnail_url: string
          file_type: string
          width: number | null
          height: number | null
          uploader_id: string
          created_at?: string
          location_name: string | null
          location_logo_url: string | null
          dj_name: string | null
          smart_links: Json | null
          hex_color: string | null
        }
        Insert: {
          id?: string
          title: string
          file_url: string
          thumbnail_url: string
          file_type: string
          width?: number | null
          height?: number | null
          uploader_id: string
          created_at?: string
          location_name?: string | null
          location_logo_url?: string | null
          dj_name?: string | null
          smart_links?: Json | null
          hex_color?: string | null
        }
        Update: {
          id?: string
          title?: string
          file_url?: string
          thumbnail_url?: string
          file_type?: string
          width?: number | null
          height?: number | null
          uploader_id?: string
          created_at?: string
          location_name?: string | null
          location_logo_url?: string | null
          dj_name?: string | null
          smart_links?: Json | null
          hex_color?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at?: string
          persona: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          persona?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          persona?: string | null
        }
      }
    }
  }
}

