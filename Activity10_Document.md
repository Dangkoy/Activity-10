# Activity 10: Event Registration & Ticket QR Scanner

## Title of Activity
**Event Registration & Ticket QR Scanner Platform**

## Short Description
This application is a comprehensive event management system that allows organizers to create and manage events, while attendees can register online. Each successful registration generates a unique QR code ticket that can be scanned at the venue to verify entry. The platform consists of three separate web applications:

1. **Admin Web App**: Overall system management including event oversight, organizer/staff management, and system-wide reports
2. **Organizer Web App**: Event creation, attendee management, and on-site QR code scanning for check-in
3. **Attendee Web App**: Event discovery, online registration, and ticket management with QR codes

The system enforces capacity limits, prevents duplicate registrations, and provides real-time validation of tickets through QR code scanning.

## Screenshots of Working System

### Backend API Documentation (Swagger)
**URL**: http://localhost:4000/api

![Swagger API Documentation](screenshots/swagger-api.png)
*Figure 1: Swagger API Documentation showing all available endpoints*

### Admin App - Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)
*Figure 2: Admin dashboard showing system statistics and overview*

### Admin App - Events Management
![Admin Events](screenshots/admin-events.png)
*Figure 3: Admin view of all events with search and filter capabilities*

### Organizer App - QR Scanner
![Organizer Scanner](screenshots/organizer-scanner.png)
*Figure 4: QR code scanner interface for on-site check-in*

### Attendee App - Event Registration
![Attendee Registration](screenshots/attendee-registration.png)
*Figure 5: Attendee registration form for events*

### Attendee App - My Tickets with QR Code
![Attendee Tickets](screenshots/attendee-tickets.png)
*Figure 6: Attendee view of tickets with QR codes for check-in*

## Instructions on How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager
- Git (for cloning repository)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Activity10
```

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `backend` directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=event_registration
JWT_SECRET=your-secret-key-change-in-production-use-random-string
```

4. Create MySQL database:
```sql
CREATE DATABASE event_registration;
```

5. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:4000`
The Swagger API documentation will be available at `http://localhost:4000/api`

### Step 3: Frontend Setup

#### Admin App (Port 3000)
1. Open a new terminal and navigate to admin app:
```bash
cd frontend/admin-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the app at: `http://localhost:3000`

#### Organizer App (Port 3001)
1. Open a new terminal and navigate to organizer app:
```bash
cd frontend/organizer-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the app at: `http://localhost:3001`

#### Attendee App (Port 3002)
1. Open a new terminal and navigate to attendee app:
```bash
cd frontend/attendee-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Access the app at: `http://localhost:3002`

### Step 4: Create Initial Admin User

To create the first admin user, you can use the registration endpoint:

**Using Swagger UI:**
1. Navigate to `http://localhost:4000/api`
2. Go to the `auth` section
3. Use the `POST /auth/register` endpoint
4. Use the following body:
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "fullName": "Admin User",
  "role": "admin"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "fullName": "Admin User",
    "role": "admin"
  }'
```

### Step 5: Access the Applications

1. **Admin App**: `http://localhost:3000`
   - Login with admin credentials
   - Manage events, organizers, and view reports

2. **Organizer App**: `http://localhost:3001`
   - Login with organizer credentials (create via Admin app)
   - Create events and use QR scanner for check-in

3. **Attendee App**: `http://localhost:3002`
   - No login required
   - Browse events and register
   - View tickets by entering email address

4. **API Documentation**: `http://localhost:4000/api`
   - Interactive Swagger UI
   - Test all API endpoints
   - View request/response schemas

## API Testing Example

### Example: Register for an Event

**Endpoint**: `POST /tickets`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "eventId": "event-uuid-here",
  "email": "attendee@example.com",
  "fullName": "John Doe",
  "company": "ABC Company"
}
```

**Response (201 Created)**:
```json
{
  "id": "ticket-uuid",
  "ticketCode": "EVENT-ABC123-20240101",
  "status": "confirmed",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "eventId": "event-uuid",
  "attendeeId": "attendee-uuid",
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### Example: Verify Ticket (Check-in)

**Endpoint**: `GET /tickets/verify/{ticketCode}`

**Request Headers**:
```
Authorization: Bearer {jwt-token}
```

**Response (200 OK)**:
```json
{
  "id": "ticket-uuid",
  "ticketCode": "EVENT-ABC123-20240101",
  "status": "checked_in",
  "checkedInAt": "2024-01-15T14:30:00.000Z",
  "event": {
    "id": "event-uuid",
    "title": "Tech Conference 2024",
    "location": "Convention Center"
  },
  "attendee": {
    "id": "attendee-uuid",
    "fullName": "John Doe",
    "email": "attendee@example.com"
  }
}
```

## Project Structure

```
Activity10/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── events/        # Event management
│   │   ├── tickets/       # Ticket & registration
│   │   └── reports/       # Reports & exports
│   ├── package.json
│   └── .env
├── frontend/
│   ├── admin-app/         # Admin React app (Port 3000)
│   ├── organizer-app/     # Organizer React app (Port 3001)
│   └── attendee-app/      # Attendee React app (Port 3002)
└── README.md
```

## Key Features Implemented

### Backend Features
- ✅ JWT Authentication with role-based access control
- ✅ Event CRUD operations with capacity management
- ✅ Unique ticket generation with QR codes (UUID + QRCode library)
- ✅ Duplicate registration prevention
- ✅ Capacity limit enforcement
- ✅ Ticket validation and scanning API
- ✅ CSV export functionality
- ✅ Swagger API documentation
- ✅ Statistics and reporting endpoints

### Admin App Features
- ✅ Dashboard with system overview
- ✅ Events list with search and filter
- ✅ Event details with edit/delete
- ✅ Organizer and staff management
- ✅ Reports and CSV exports

### Organizer App Features
- ✅ Dashboard with event statistics
- ✅ Create and edit events
- ✅ View registered attendees
- ✅ QR code scanner using device camera
- ✅ Manual ticket verification
- ✅ Export attendee lists to CSV

### Attendee App Features
- ✅ Browse upcoming events
- ✅ Search events by title/location
- ✅ Event registration
- ✅ View tickets with QR codes
- ✅ Ticket status tracking

## Technologies Used

**Backend:**
- NestJS (Node.js framework)
- TypeScript
- TypeORM (ORM)
- MySQL (Database)
- JWT (Authentication)
- Passport.js (Strategy pattern)
- Swagger/OpenAPI (API Documentation)
- QRCode library (QR generation)
- UUID (Unique ticket codes)

**Frontend:**
- React 18
- TypeScript
- Vite (Build tool)
- React Router (Routing)
- Axios (HTTP client)
- HTML5-QRCode (QR Scanner)
- qrcode.react (QR Display)

## Database Schema

The application uses three main entities:

1. **Users** - Stores user information (Admin, Organizer, Attendee)
2. **Events** - Stores event details and capacity information
3. **Tickets** - Stores registration tickets with QR codes

Relationships:
- Event belongs to Organizer (User)
- Ticket belongs to Event
- Ticket belongs to Attendee (User)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Prevent duplicate registrations
- Capacity limit enforcement
- Secure ticket validation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Verify credentials in `.env` file
   - Check database exists: `CREATE DATABASE event_registration;`

2. **CORS Errors**
   - Verify frontend URLs are in CORS configuration in `backend/src/main.ts`

3. **QR Scanner Not Working**
   - Ensure camera permissions are granted in browser
   - Use HTTPS or localhost (camera requires secure context)

4. **Token Expired**
   - Tokens expire after 7 days
   - Login again to get a new token

5. **Port Already in Use**
   - Change port in `vite.config.ts` for frontend apps
   - Change port in `backend/src/main.ts` for backend

## Notes

- The QR scanner requires camera permissions in the browser
- Email notifications are mentioned but not fully implemented (can be added using Nodemailer)
- The system automatically creates attendee accounts when registering
- Cancelled tickets can be reactivated
- Ticket status flow: pending → confirmed → checked_in / cancelled

## Conclusion

This project demonstrates a full-stack event registration system with three distinct user interfaces, comprehensive backend API, QR code generation and scanning, and proper authentication/authorization. The system is production-ready with proper error handling, validation, and security measures.
