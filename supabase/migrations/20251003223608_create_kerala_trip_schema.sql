/*
  # Kerala Trip Package Website - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for a Kerala trip package booking platform
  with user authentication, package management, booking system, and payment tracking.

  ## New Tables

  ### 1. `profiles`
  Extends auth.users with additional user information
  - `id` (uuid, FK to auth.users)
  - `username` (text, unique)
  - `phone` (text)
  - `role` (text) - 'user' or 'admin'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `packages`
  Stores Kerala trip package details
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `images` (jsonb) - array of image URLs
  - `price_per_head` (decimal)
  - `duration` (text) - e.g., "5 Days 4 Nights"
  - `itinerary` (jsonb) - day-wise itinerary
  - `inclusions` (text[]) - array of included items
  - `exclusions` (text[]) - array of excluded items
  - `available_dates` (jsonb) - array of date objects
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `bookings`
  Stores booking information
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users)
  - `package_id` (uuid, FK to packages)
  - `booking_date` (date)
  - `number_of_members` (integer)
  - `total_price` (decimal)
  - `advance_payment` (decimal) - ₹500 per head
  - `remaining_payment` (decimal)
  - `status` (text) - 'pending', 'confirmed', 'cancelled'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `booking_members`
  Stores individual member details for each booking
  - `id` (uuid, PK)
  - `booking_id` (uuid, FK to bookings)
  - `name` (text)
  - `age` (integer)
  - `phone` (text, optional)
  - `created_at` (timestamptz)

  ### 5. `payments`
  Tracks payment transactions
  - `id` (uuid, PK)
  - `booking_id` (uuid, FK to bookings)
  - `amount` (decimal)
  - `payment_type` (text) - 'advance' or 'full'
  - `utr_id` (text) - UPI transaction reference
  - `screenshot_url` (text) - payment proof
  - `status` (text) - 'pending', 'verified', 'rejected'
  - `verified_by` (uuid, FK to auth.users, nullable)
  - `verified_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ### 6. `web_settings`
  Stores website configuration
  - `id` (uuid, PK)
  - `upi_number` (text) - Google Pay/UPI number
  - `upi_qr_code` (text) - QR code data
  - `whatsapp_api_key` (text, nullable)
  - `whatsapp_phone_number` (text, nullable)
  - `advance_amount_per_head` (decimal)
  - `contact_email` (text)
  - `contact_phone` (text)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile and bookings
  - Users can read active packages
  - Users can create bookings and payments
  - Admins have full access to all tables
  - Public can read active packages (for browsing)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  price_per_head decimal(10,2) NOT NULL,
  duration text NOT NULL,
  itinerary jsonb DEFAULT '[]'::jsonb,
  inclusions text[] DEFAULT ARRAY[]::text[],
  exclusions text[] DEFAULT ARRAY[]::text[],
  available_dates jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  number_of_members integer NOT NULL CHECK (number_of_members > 0),
  total_price decimal(10,2) NOT NULL,
  advance_payment decimal(10,2) NOT NULL,
  remaining_payment decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_members table
CREATE TABLE IF NOT EXISTS booking_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0),
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('advance', 'full')),
  utr_id text NOT NULL,
  screenshot_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create web_settings table
CREATE TABLE IF NOT EXISTS web_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_number text NOT NULL,
  upi_qr_code text,
  whatsapp_api_key text,
  whatsapp_phone_number text,
  advance_amount_per_head decimal(10,2) DEFAULT 500.00,
  contact_email text,
  contact_phone text,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO web_settings (upi_number, contact_email, contact_phone, advance_amount_per_head)
VALUES ('9876543210@ybl', 'info@keralatrips.com', '+91 98765 43210', 500.00)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Packages policies
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Booking members policies
CREATE POLICY "Users can view own booking members"
  ON booking_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create booking members"
  ON booking_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all booking members"
  ON booking_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Web settings policies
CREATE POLICY "Anyone can view web settings"
  ON web_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update web settings"
  ON web_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_members_booking_id ON booking_members(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();