# Event Registration & Ticket QR Scanner Platform

A comprehensive event registration system where organizers can create events, attendees can register online, and each registration generates a unique QR code ticket that can be scanned at the venue for check-in verification.

## 🚀 Features

### Backend (NestJS + MySQL)
- ✅ JWT Authentication & Authorization (Admin, Organizer, Attendee roles)
- ✅ Event Management (CRUD operations with capacity limits)
- ✅ Registration System with unique ticket IDs and QR code generation
- ✅ Duplicate registration prevention
- ✅ Capacity limit enforcement
- ✅ Ticket validation and scanning API
- ✅ CSV Export functionality for attendees
- ✅ Statistics and reporting endpoints
- ✅ Swagger API Documentation (built-in with NestJS)

### Frontend - Admin App (React + Vite)
- ✅ Login with Admin role authentication
- ✅ Dashboard with system overview statistics
- ✅ Events List with search and filter
- ✅ Event Details with full information
- ✅ Organizer & Staff Management (create, activate/deactivate)
- ✅ Reports & Exports (CSV download, attendance statistics)

### Frontend - Organizer App (React + Vite)
- ✅ Login with Organizer role authentication
- ✅ Dashboard showing organizer's events and statistics
- ✅ Create/Edit Events with full details
- ✅ View Registered Attendees with search/filter
- ✅ QR Code Scanner using device camera (HTML5-QRCode)
- ✅ Manual ticket verification by code
- ✅ Export Attendee List to CSV

### Frontend - Attendee App (React + Vite)
- ✅ Browse upcoming active events
- ✅ Search events by title/location
- ✅ View detailed event information
- ✅ Register for events (name, email, company)
- ✅ View My Tickets list
- ✅ Display QR code tickets for check-in
- ✅ View ticket details and status

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=event_registration
JWT_SECRET=your-secret-key-change-in-production
```

Start the backend server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:4000`
The Swagger API documentation will be available at `http://localhost:4000/api`

### 2. Frontend Setup

#### Admin App
```bash
cd frontend/admin-app
npm install
npm run dev
```
Runs on `http://localhost:3000`

#### Organizer App
```bash
cd frontend/organizer-app
npm install
npm run dev
```
Runs on `http://localhost:3001`

#### Attendee App
```bash
cd frontend/attendee-app
npm install
npm run dev
```
Runs on `http://localhost:3002`

## 🗄️ Database

The application uses TypeORM with MySQL. The database schema will be automatically created when you first run the backend server (due to `synchronize: true` in the configuration).

### Entities:
- **User**: id, email, password, fullName, company, role, isActive
- **Event**: id, title, description, location, startDate, endDate, capacity, registeredCount, isActive, organizerId
- **Ticket**: id, ticketCode, status, qrCode, checkedInAt, eventId, attendeeId

## 🔐 Default Users

You'll need to create users through the registration endpoint or directly in the database. Here's how to create an admin user via API:

```bash
POST http://localhost:4000/auth/register
{
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "Admin User",
  "role": "admin"
}
```

## 📱 Usage

### Admin Flow:
1. Login at `http://localhost:3000/login`
2. View dashboard with system statistics
3. Manage events (view, edit, delete)
4. Create and manage organizers/staff
5. View reports and export data

### Organizer Flow:
1. Login at `http://localhost:3001/login`
2. Create events with details (title, description, location, date, capacity)
3. View registered attendees for your events
4. Use QR Scanner to check-in attendees at the venue
5. Export attendee lists to CSV

### Attendee Flow:
1. Browse events at `http://localhost:3002`
2. Search for events by title or location
3. View event details
4. Register for events (email, name, company optional)
5. View tickets with QR codes in "My Tickets"
6. Present QR code at event for check-in

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Events
- `GET /events` - List all events (with query params: search, upcoming, organizerId, isActive)
- `GET /events/:id` - Get event details
- `POST /events` - Create event (Organizer/Admin only)
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Tickets
- `POST /tickets` - Register for event (create ticket)
- `GET /tickets` - List tickets (with query params: eventId, attendeeId)
- `GET /tickets/:id` - Get ticket details
- `GET /tickets/code/:ticketCode` - Get ticket by code
- `GET /tickets/verify/:ticketCode` - Verify and check-in ticket (Organizer/Admin only)
- `PATCH /tickets/:id` - Update ticket status

### Users (Admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Reports
- `GET /reports/overview` - System overview statistics (Admin only)
- `GET /reports/events/:eventId/statistics` - Event statistics
- `GET /reports/events/:eventId/attendees/csv` - Export attendees CSV

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Prevent duplicate registrations for same event
- Capacity limit enforcement
- Ticket validation before check-in

## 🎨 Tech Stack

### Backend
- NestJS (Node.js framework)
- TypeORM (ORM)
- MySQL (Database)
- JWT (Authentication)
- Passport.js (Strategy pattern)
- QRCode library (QR generation)
- UUID (Unique ticket codes)

### Frontend
- React 18
- TypeScript
- Vite (Build tool)
- React Router (Routing)
- Axios (HTTP client)
- HTML5-QRCode (QR Scanner)
- qrcode.react (QR Display)

## 📝 Notes

- The QR scanner requires camera permissions in the browser
- Email notifications are mentioned but not implemented (can be added using Nodemailer)
- The system automatically creates attendee accounts when registering with an email
- Cancelled tickets can be reactivated
- Ticket status: pending → confirmed → checked_in / cancelled

## 🐛 Troubleshooting

1. **Database connection error**: Ensure MySQL is running and credentials in `.env` are correct
2. **CORS errors**: Check that the frontend URLs are added to CORS configuration in `backend/src/main.ts`
3. **QR Scanner not working**: Ensure camera permissions are granted and using HTTPS (or localhost)
4. **Token expired**: Login again to get a new token (tokens expire after 7 days)

## 📄 License

MIT License

## 👥 Contributing

This is a laboratory activity project. Feel free to extend and improve it!
