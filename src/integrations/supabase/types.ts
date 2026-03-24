export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.1" }
  public: {
    Tables: {
      products: {
        Row: {
          id: string; name: string; description: string | null; price: number
          offer_price: number | null; image: string | null; category: string
          diet_type: string; is_available: boolean; is_advance_order: boolean
          is_featured: boolean; created_at: string
        }
        Insert: {
          id?: string; name: string; description?: string | null; price: number
          offer_price?: number | null; image?: string | null; category: string
          diet_type?: string; is_available?: boolean; is_advance_order?: boolean
          is_featured?: boolean
        }
        Update: {
          name?: string; description?: string | null; price?: number
          offer_price?: number | null; image?: string | null; category?: string
          diet_type?: string; is_available?: boolean; is_advance_order?: boolean
          is_featured?: boolean
        }
      }
      orders: {
        Row: {
          id: string; customer_name: string; customer_phone: string
          customer_email: string | null; delivery_address: string; notes: string | null
          subtotal: number; delivery_charge: number; grand_total: number
          payment_method: string; payment_status: string
          razorpay_order_id: string | null; razorpay_payment_id: string | null
          order_status: string; created_at: string; updated_at: string
        }
        Insert: {
          id: string; customer_name: string; customer_phone: string
          customer_email?: string | null; delivery_address: string; notes?: string | null
          subtotal: number; delivery_charge: number; grand_total: number
          payment_method?: string; payment_status?: string
          razorpay_order_id?: string | null; razorpay_payment_id?: string | null
          order_status?: string
        }
        Update: {
          order_status?: string; payment_status?: string
          razorpay_order_id?: string | null; razorpay_payment_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string; order_id: string; product_id: string; name: string
          price: number; quantity: number; delivery_date: string | null; delivery_time: string | null
        }
        Insert: {
          id?: string; order_id: string; product_id: string; name: string
          price: number; quantity: number; delivery_date?: string | null; delivery_time?: string | null
        }
        Update: { quantity?: number }
      }
      offers: {
        Row: {
          id: string; title: string; description: string | null; badge: string | null
          discount_pct: number; is_active: boolean; sort_order: number; created_at: string
        }
        Insert: {
          id?: string; title: string; description?: string | null; badge?: string | null
          discount_pct?: number; is_active?: boolean; sort_order?: number
        }
        Update: {
          title?: string; description?: string | null; badge?: string | null
          discount_pct?: number; is_active?: boolean; sort_order?: number
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
