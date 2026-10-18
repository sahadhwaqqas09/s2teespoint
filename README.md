# S2 Teespoint — Custom Islamic T-Shirt Printing Web Application

A full-stack, responsive e-commerce web platform for **S2 Teespoint**, designed with a **Yellow (#FFD700) and Rich Black (#111111)** UI, accessible across mobile phones, tablets, and desktop PCs.

---

## Features & Page Architecture

1. **Front Page (`/`)**:
   - Islamic greeting in Arabic script using Amiri calligraphy.
   - Sincere, humanised storytelling highlighting halal business values and intention.
   - Zero emojis anywhere across copy.
   - Direct WhatsApp integration to **80562 34337** (`https://wa.me/918056234337`).
   - Sticky navigation with mobile menu and dynamic cart item counter.

2. **Catalogue Page (`/catalogue`)**:
   - Responsive category tiles (Kids, Adults, and any custom category added by the admin).
   - Dynamic real-time loading from Supabase `categories` table with fallback handling.

3. **Category View & Product Selection (`/catalogue/:categoryId`)**:
   - Displays all products assigned to that category.
   - Interactive size selection chips (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL` as defined by the admin).
   - "Add to Cart" button with selected size validation.

4. **Cart & Delivery Check (`/cart`)**:
   - List of items with real-time quantity modifiers (+ / -) and remove action.
   - Pincode delivery calculator stubbed for Delhivery integration.
   - Ready placeholder function `checkDelivery(pincode)` to plug in your live Delhivery API endpoint.
   - Order subtotal, delivery calculation, and grand total.

5. **Billing & Checkout (`/billing`)**:
   - Form fields: Full Name, 10-digit Contact Number, Full Address, Pincode, and Landmark (optional).
   - Order summary breakdown.
   - PhonePe payment gateway placeholder button saving order state (`pending`) to Supabase.
   - Automatic record creation in `orders` and `order_items` tables.

6. **Admin Management Suite (`/admin`)**:
   - **Login (`/admin/login`)**: Protected route using Supabase Email/Password authentication.
   - **Dashboard (`/admin`)**: Overview metrics showing total orders, pending orders, products count, categories count, and a recent orders table.
   - **Categories (`/admin/categories`)**: Create categories with name and image URL, or delete categories.
   - **Products (`/admin/products`)**: Add products under any category with name, description, price, photo URL, and size checklist (`XS` through `3XL`). The chosen sizes immediately reflect in the customer catalogue.
   - **Orders (`/admin/orders`)**: Complete order overview with customer details, address, landmark, contact number, expandable product breakdown, and order status selector (`pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`).

---

## Connecting Supabase

### 1. Execute SQL Schema
In your [Supabase Dashboard](https://supabase.com/dashboard), open the **SQL Editor** and run the contents of:
`supabase_schema.sql`

This creates:
- `categories` table
- `products` table (with `sizes TEXT[]` array)
- `orders` table
- `order_items` table
- Row Level Security (RLS) policies allowing public browsing and placing orders, while restricting management to authenticated admin users.

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

### 3. Create Admin Login
In your Supabase dashboard:
1. Go to **Authentication** > **Users**.
2. Click **Add user** > **Create user**.
3. Enter your admin email and password.
4. You can now log into `/admin/login`.

---

## Where to Plug in APIs

### 1. Delhivery API (Pincode & Package Shipping)
Located in `src/pages/CartPage.jsx` inside the `checkDelivery(pincode)` function:
```javascript
// Replace this stub with your live Delhivery API call:
async function checkDelivery(pincode) {
  // Call Delhivery API: https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=...
}
```

### 2. PhonePe Payment Gateway
Located in `src/pages/BillingPage.jsx` inside `handlePlaceOrder`:
```javascript
// Replace with PhonePe initiate payment API / redirect:
// const res = await fetch('/api/phonepe/initiate', { ... });
```

---

## Development Server

To run locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
