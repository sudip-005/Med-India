# Med India - Healthcare Marketplace Backend & Testing Interface

A production-ready, secure, and robust Node.js backend built with Express.js, TypeScript, and Supabase, alongside an interactive Python Streamlit testing dashboard to validate the entire platform.

---

## Technical Stack

### Backend Application
*   **Runtime**: Node.js & TypeScript
*   **Framework**: Express.js
*   **Database**: PostgreSQL (Managed on Supabase)
*   **Auth**: Supabase Auth (with custom profiles sync)
*   **Storage**: Supabase Storage Buckets
*   **Security & Helpers**: Helmet (secure HTTP headers), CORS, Morgan (logger), express-rate-limit
*   **Validation**: Zod Schemas

### Testing Interface
*   **Framework**: Python Streamlit
*   **Libraries**: Requests (HTTP Client), Pandas, Dotenv

---

## Directory Structure

```text
backend/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   ├── env.ts          # Zod environment validator
│   │   └── supabase.ts     # Supabase clients & auto-storage setup
│   ├── middleware/
│   │   ├── auth.ts         # Supabase JWT parser & role mapping
│   │   ├── roles.ts        # Role-based restriction middleware
│   │   ├── errorHandler.ts # Global Express exception catcher
│   │   └── validate.ts     # Request validation with Zod
│   ├── controllers/        # Express handlers
│   ├── services/           # DB queries, storage, and checkout logic
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TS global types & interfaces
│   └── utils/
├── package.json
├── tsconfig.json
├── .env
└── Dockerfile

streamlit/
├── app.py                  # Main entry point (Login/Signup, status)
├── pages/
│   ├── 1_patient.py        # Patient: profile, addresses, prescriptions, orders
│   ├── 2_doctor.py         # Doctor: credentials upload, clinic configuration
│   ├── 3_retailer.py       # Retailer: merchant info, stock file uploads
│   └── 4_orders.py         # Marketplace: shopping carts, checkout, histories
├── requirements.txt
└── Dockerfile

database.sql                # Extra tables DDL (run in Supabase Editor)
docker-compose.yml          # Container configuration
med_india_postman_collection.json # API collection for Postman
```

---

## Getting Started

### Prerequisites
1. Node.js (v18+)
2. Python (v3.9+)
3. Docker & Docker Compose (Optional, for containerized run)

### Database Setup
1. Log in to your [Supabase Console](https://supabase.com/dashboard).
2. Go to your project and open the **SQL Editor**.
3. Copy the contents of the [database.sql](file:///c:/Users/SUDIP%20MANNA/OneDrive/Desktop/Med%20India/database.sql) file at the root of the workspace.
4. Execute the SQL query to create the necessary tables, indexes, and triggers.

### Environment Setup
Create a file named `.env` in the `backend/` directory with the following variables:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

---

## Running the Project

### Option A: Running Locally (Recommended for development)

#### 1. Start the Express.js Backend
```bash
cd backend
npm install
npm run dev
```
The backend will compile TypeScript and listen on port `5000`. Storage buckets will be checked and created automatically on startup.

#### 2. Start the Streamlit Dashboard
```bash
cd streamlit
pip install -r requirements.txt
streamlit run app.py
```
The interface will be served at `http://localhost:8501`.

---

### Option B: Running with Docker Compose

Ensure Docker is running on your machine, then execute:
```bash
docker-compose up --build
```
*   Backend: accessible at `http://localhost:5000`
*   Streamlit Dashboard: accessible at `http://localhost:8501`

---

## API Documentation

All request bodies must be in JSON format. Authenticated requests require the header: `Authorization: Bearer <your_supabase_jwt>`.

### Auth Endpoints
*   `POST /api/auth/signup/patient` - Register a patient profile.
*   `POST /api/auth/signup/doctor` - Register a doctor profile.
*   `POST /api/auth/signup/retailer` - Register a retailer/merchant profile.
*   `POST /api/auth/login` - Authenticate via email & password. Returns JWT token.
*   `POST /api/auth/logout` - Terminates session.
*   `GET /api/auth/me` - Retrieve profile of the logged-in user.

### Patient Endpoints (Requires `PATIENT` role)
*   `GET /api/patients/me` - View patient profile details.
*   `PUT /api/patients/me` - Update profile details.
*   `DELETE /api/patients/me` - Permanently deletes the account and all associated data.
*   `GET /api/patients/me/addresses` - List delivery addresses.
*   `POST /api/patients/me/addresses` - Save a new delivery address.
*   `DELETE /api/patients/me/addresses/:id` - Delete a saved address.

### Doctor Endpoints
*   `GET /api/doctors` - List active doctors. Supports filter query params: `specialization`, `city`, `experience`, `consultation_fee`.
*   `GET /api/doctors/search` - Alternate alias for doctor listing & filters.
*   `GET /api/doctors/:id` - Get doctor details by ID (including signed document URLs).
*   `POST /api/doctors/profile` - Set clinic details and upload degree/registration certificates (multipart form).
*   `PUT /api/doctors/profile` - Update textual clinic/scheduling data.

### Retailer Endpoints
*   `GET /api/retailers` - List active merchant stores.
*   `GET /api/retailers/:id` - View single store info (including signed license URLs).
*   `POST /api/retailers/profile` - Upload business license, medical license, and stock inventory CSV (multipart form).
*   `PUT /api/retailers/profile` - Update shop name or address details.

### Prescription Endpoints (Requires `PATIENT` role)
*   `POST /api/prescriptions/upload` - Upload a prescription file (PDF/Image) with notes and diagnosis (multipart form).
*   `GET /api/prescriptions` - List patient's uploaded prescriptions (with signed URLs).
*   `DELETE /api/prescriptions/:id` - Delete a prescription record.

### Cart Endpoints (Requires `PATIENT` role)
*   `GET /api/cart` - View shopping cart items.
*   `POST /api/cart` or `POST /api/cart/items` - Add/increment item in cart.
*   `DELETE /api/cart/items/:id` - Delete item from cart.

### Order Endpoints
*   `POST /api/orders/checkout` - Placed an order using items in the cart. Requires `address_id` (Requires `PATIENT` role).
*   `GET /api/orders` - History of orders (Patients see their purchases, Retailers see items bought from their store).
*   `GET /api/orders/:id` - View details of a single order.
