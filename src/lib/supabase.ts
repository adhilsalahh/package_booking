import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          phone: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          phone: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          phone?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          title: string;
          description: string;
          images: any;
          price_per_head: number;
          duration: string;
          itinerary: any;
          inclusions: string[];
          exclusions: string[];
          available_dates: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          booking_date: string;
          number_of_members: number;
          total_price: number;
          advance_payment: number;
          remaining_payment: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
      };
      booking_members: {
        Row: {
          id: string;
          booking_id: string;
          name: string;
          age: number;
          phone: string | null;
          created_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_type: 'advance' | 'full';
          utr_id: string;
          screenshot_url: string;
          status: 'pending' | 'verified' | 'rejected';
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
        };
      };
      web_settings: {
        Row: {
          id: string;
          upi_number: string;
          upi_qr_code: string | null;
          whatsapp_api_key: string | null;
          whatsapp_phone_number: string | null;
          advance_amount_per_head: number;
          contact_email: string | null;
          contact_phone: string | null;
          updated_at: string;
        };
      };
    };
  };
}
