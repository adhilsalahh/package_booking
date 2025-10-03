# Kerala Trip Package Website - Setup Instructions

## Project Overview
A comprehensive Kerala tour package booking platform with user and admin functionalities, including payment processing and booking management.

## Features Implemented

### User Side
- ✅ Sign Up / Sign In / Sign Out with email, username, password, and phone
- ✅ Browse packages with images, price, duration, and details
- ✅ View package details with itinerary, inclusions, exclusions, and available dates
- ✅ Book packages with auto-filled user details
- ✅ Add multiple members with name, age, and optional phone
- ✅ Advance payment (₹500/head) and full payment options
- ✅ UPI payment with QR code generation
- ✅ Upload payment screenshot and UTR ID
- ✅ View booking status (Pending/Confirmed)
- ✅ Track all bookings and payments

### Admin Side
- ✅ Admin dashboard with statistics
- ✅ View all bookings (All/Pending/Confirmed)
- ✅ Confirm bookings
- ✅ Verify/Reject payments
- ✅ Full CRUD operations on packages
- ✅ Manage packages (create, edit, delete, activate/deactivate)

## Important Setup Steps

### 1. Create Storage Bucket for Payment Screenshots

You need to create a storage bucket in Supabase for payment screenshots:

1. Go to your Supabase Dashboard
2. Navigate to Storage section
3. Click "Create a new bucket"
4. Name it: **`payments`**
5. Make it **PUBLIC** (so admins can view screenshots)
6. Click "Create bucket"

### 2. Create an Admin User

Since users sign up as regular users by default, you need to manually create an admin:

1. Sign up a new user through the application
2. Go to Supabase Dashboard → Table Editor → `profiles` table
3. Find the user you just created
4. Change the `role` field from `'user'` to `'admin'`
5. Sign out and sign back in

### 3. Add Sample Package Data

To add packages, you can:

1. Sign in as admin
2. Navigate to Packages menu
3. Click "Add Package"
4. Fill in the form with:
   - **Title**: e.g., "Munnar Hill Station Retreat"
   - **Description**: Detailed package description
   - **Price per Head**: e.g., 15000
   - **Duration**: e.g., "5 Days 4 Nights"
   - **Images** (JSON array):
     ```json
     ["https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg"]
     ```
   - **Inclusions** (one per line):
     ```
     Accommodation
     All meals
     Transportation
     Guide services
     Entry fees
     ```
   - **Exclusions** (one per line):
     ```
     Personal expenses
     Travel insurance
     Additional activities
     ```
   - **Itinerary** (JSON format):
     ```json
     [
       {"day": 1, "title": "Arrival in Munnar", "description": "Pick up from Cochin airport and drive to Munnar"},
       {"day": 2, "title": "Munnar Sightseeing", "description": "Visit tea plantations and viewpoints"},
       {"day": 3, "title": "Eravikulam National Park", "description": "Wildlife experience"},
       {"day": 4, "title": "Mattupetty Dam", "description": "Boating and scenic views"},
       {"day": 5, "title": "Departure", "description": "Return to Cochin airport"}
     ]
     ```
   - **Available Dates** (JSON format):
     ```json
     [
       {"date": "2025-11-15", "slotsAvailable": 15},
       {"date": "2025-12-01", "slotsAvailable": 20},
       {"date": "2025-12-20", "slotsAvailable": 10}
     ]
     ```

### 4. WhatsApp Integration (Future Enhancement)

The WhatsApp notification feature requires integration with WhatsApp Business API. Here's how to set it up:

#### Option 1: Twilio WhatsApp API
1. Create a Twilio account
2. Set up WhatsApp sender
3. Get API credentials
4. Store in `web_settings` table

#### Option 2: Meta WhatsApp Business API
1. Create a Meta Business account
2. Register for WhatsApp Business API
3. Get access token
4. Store in `web_settings` table

#### Implementation
You would need to create a Supabase Edge Function to send WhatsApp messages when:
- Admin confirms a booking
- Payment is verified

Example Edge Function structure:
```typescript
// Send WhatsApp message via API
const sendWhatsAppMessage = async (phone: string, message: string) => {
  // Use Twilio or Meta API to send message
  // Include booking confirmation details
};
```

### 5. Update UPI Settings

To customize the UPI payment details:

1. Go to Supabase Dashboard → Table Editor → `web_settings`
2. Update the row with:
   - **upi_number**: Your actual UPI ID (e.g., `yourname@paytm`)
   - **contact_email**: Your business email
   - **contact_phone**: Your business phone
   - **advance_amount_per_head**: 500 (or change as needed)

## Database Schema

The application uses the following tables:
- **profiles** - Extended user information with role
- **packages** - Tour package details
- **bookings** - Booking records
- **booking_members** - Individual member details per booking
- **payments** - Payment transactions with UTR and screenshots
- **web_settings** - Website configuration

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only view/edit their own data
- ✅ Admins have full access
- ✅ Payment screenshots stored securely
- ✅ Authentication with Supabase Auth

## Payment Flow

1. User fills booking form → Auto-fills name, email, phone
2. User adds member details → Name, age, phone (optional)
3. System calculates: Total = Members × Price per head
4. User proceeds to payment page
5. User selects Advance (₹500/head) or Full payment
6. System generates UPI QR code
7. User pays via UPI app
8. User enters UTR ID and uploads screenshot
9. Payment submitted as "Pending"
10. Admin verifies payment
11. Admin confirms booking
12. Status updates to "Confirmed" for user
13. (Future) WhatsApp confirmation sent

## Testing the Application

### As User:
1. Sign up with username, email, password, phone
2. Browse packages
3. View package details
4. Book a package
5. Complete payment process
6. Check "My Bookings" for status

### As Admin:
1. Create admin user (see step 2 above)
2. Sign in as admin
3. View dashboard statistics
4. Manage packages (CRUD)
5. View and confirm bookings
6. Verify payments

## Notes

- The payment screenshot upload requires the `payments` storage bucket to be created
- QR codes are generated dynamically using an external API
- The advance payment is set to ₹500 per person by default
- All monetary values are in Indian Rupees (₹)
- Dates should be in YYYY-MM-DD format

## Support

For any issues or questions regarding setup, please check:
- Database migrations applied correctly
- Storage bucket created and public
- Admin role assigned properly
- Environment variables configured

Enjoy managing your Kerala tour packages!
