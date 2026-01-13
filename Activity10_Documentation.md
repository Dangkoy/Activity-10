# Activity 10: Event Registration & Ticket QR Scanner Platform

## Description
Make a comprehensive event management system with three separate applications for different user roles (Admin, Organizer, Attendee). The system allows organizers to create events, attendees to register online, and generates unique QR code tickets for each registration that can be scanned at the venue for check-in verification.

- **Backend**: CRUD for events, tickets, users; JWT authentication with role-based access control; QR code generation; capacity validation; duplicate registration prevention.
- **Frontend**: Three separate React applications - Admin app for system management, Organizer app for event creation and QR scanning, Attendee app for event discovery and registration.

## Application Description
The Event Registration & Ticket QR Scanner Platform is a multi-role event management system that streamlines the entire event lifecycle from creation to check-in. Organizers can create and manage events with capacity limits, attendees can browse and register for events online, and each registration automatically generates a unique QR code ticket. At the venue, organizers can scan these QR codes using the built-in scanner to verify and check-in attendees. The system includes comprehensive admin tools for managing users, viewing reports, and exporting data.

## Application URLs & Ports

### Backend API
- **Base URL**: `http://localhost:4000`
- **Port**: `4000`
- **Swagger API Documentation**: `http://localhost:4000/api`
- **API Endpoints Base**: `http://localhost:4000`

### Frontend Applications

#### Admin App
- **URL**: `http://localhost:3000`
- **Port**: `3000`
- **Login Page**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Events**: `http://localhost:3000/events`
- **Organizers**: `http://localhost:3000/organizers`
- **Reports**: `http://localhost:3000/reports`

#### Organizer App
- **URL**: `http://localhost:3001`
- **Port**: `3001`
- **Login Page**: `http://localhost:3001/login`
- **Register Page**: `http://localhost:3001/register`
- **Dashboard**: `http://localhost:3001/dashboard`
- **Events**: `http://localhost:3001/events`
- **Create Event**: `http://localhost:3001/events/create`
- **Attendees**: `http://localhost:3001/attendees`
- **Scanner**: `http://localhost:3001/scanner`

#### Attendee App
- **URL**: `http://localhost:3002`
- **Port**: `3002`
- **Landing Page (Events)**: `http://localhost:3002/`
- **Login Page**: `http://localhost:3002/login`
- **Register Page**: `http://localhost:3002/register`
- **Event Details**: `http://localhost:3002/events/:id`
- **My Tickets**: `http://localhost:3002/tickets`
- **Ticket Detail**: `http://localhost:3002/tickets/:id`

### Database
- **Type**: MySQL
- **Default Port**: `3306`
- **Database Name**: `event_registration`

### Quick Reference Table

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| Backend API | `http://localhost:4000` | 4000 | NestJS REST API |
| Swagger Docs | `http://localhost:4000/api` | 4000 | API Documentation |
| Admin App | `http://localhost:3000` | 3000 | Admin Dashboard |
| Organizer App | `http://localhost:3001` | 3001 | Organizer Dashboard |
| Attendee App | `http://localhost:3002` | 3002 | Attendee Portal |
| MySQL Database | `localhost` | 3306 | Database Server |

## Features

### Backend (NestJS + MySQL)
- **Authentication & Authorization**: JWT-based authentication with three roles (Admin, Organizer, Attendee)
- **Event Management**: Full CRUD operations for events with capacity limits and status tracking
- **Ticket System**: Automatic ticket generation with unique codes and QR codes for each registration
- **Registration Validation**: Prevents duplicate registrations and enforces capacity limits
- **QR Code Generation**: Automatic QR code generation for all tickets using QRCode library
- **Ticket Verification**: API endpoint for scanning and verifying tickets at check-in
- **CSV Export**: Export attendee lists and event statistics to CSV format
- **Statistics & Reports**: System-wide and event-specific statistics and analytics
- **Swagger API Documentation**: Complete API documentation available at `/api`

### Frontend - Admin App (React + Vite)
- **Dashboard**: System overview with statistics, charts, and analytics
- **Event Management**: View, search, filter, and manage all events in the system
- **User Management**: Create, activate/deactivate organizers and staff members
- **Reports & Exports**: View system statistics and export data to CSV
- **Event Details**: View detailed information about any event including registered attendees

### Frontend - Organizer App (React + Vite)
- **Dashboard**: Personal dashboard showing organizer's events and statistics
- **Event Creation**: Create and edit events with full details (title, description, location, dates, capacity)
- **Attendee Management**: View registered attendees for your events with search and filter
- **QR Code Scanner**: Real-time QR code scanner using device camera (HTML5-QRCode library)
- **Manual Verification**: Verify tickets manually by entering ticket codes
- **CSV Export**: Export attendee lists for your events to CSV

### Frontend - Attendee App (React + Vite)
- **Event Discovery**: Browse all available active events with search functionality
- **Event Details**: View comprehensive event information before registering
- **Registration**: Register for events with name, email, and optional company information
- **My Tickets**: View all registered tickets with QR codes for check-in
- **Ticket Status**: Track ticket status (pending, confirmed, checked_in, cancelled)
- **QR Code Display**: Display QR codes for easy scanning at event venues

## Screenshots

### 1. Swagger API Documentation

**GET /events**
Retrieve the list of all available events with optional filters (search, upcoming, organizerId, isActive).

![Swagger - GET Events](screenshots/swagger-get-events.png)

**POST /events**
Create a new event by providing title, description, location, startDate, endDate, and capacity. Requires Organizer or Admin role.

![Swagger - POST Events](screenshots/swagger-post-events.png)

**PATCH /events/{id}**
Update event information such as title, description, location, dates, or capacity.

![Swagger - PATCH Events](screenshots/swagger-patch-events.png)

**DELETE /events/{id}**
Delete an event using its ID. Requires Admin role.

![Swagger - DELETE Events](screenshots/swagger-delete-events.png)

**POST /tickets**
Register for an event by creating a ticket. Requires eventId, attendee email, fullName, and optional company.

![Swagger - POST Tickets](screenshots/swagger-post-tickets.png)

**GET /tickets**
Retrieve all tickets with optional filters (eventId, attendeeId).

![Swagger - GET Tickets](screenshots/swagger-get-tickets.png)

**GET /tickets/verify/{ticketCode}**
Verify and check-in a ticket using its QR code. Updates ticket status to "checked_in" and records check-in time.

![Swagger - Verify Ticket](screenshots/swagger-verify-ticket.png)

**POST /auth/login**
Login user with email and password. Returns JWT token for authenticated requests.

![Swagger - Login](screenshots/swagger-login.png)

**GET /reports/overview**
Get system-wide statistics including total events, active events, total tickets, checked-in tickets, and user counts. Admin only.

![Swagger - Reports Overview](screenshots/swagger-reports-overview.png)

### 2. Admin App - Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)
*Admin dashboard showing system statistics, charts, and recent events*

### 3. Admin App - Events Management

![Admin Events](screenshots/admin-events.png)
*Admin view of all events with search functionality and action buttons*

### 4. Admin App - Organizers & Staff Management

![Admin Organizers](screenshots/admin-organizers.png)
*Admin interface for creating and managing organizers and staff members*

### 5. Admin App - Reports & Exports

![Admin Reports](screenshots/admin-reports.png)
*Admin reports page with system overview and event-specific statistics with CSV export*

### 6. Organizer App - Dashboard

![Organizer Dashboard](screenshots/organizer-dashboard.png)
*Organizer dashboard showing personal event statistics and recent events*

### 7. Organizer App - Create Event

![Organizer Create Event](screenshots/organizer-create-event.png)
*Organizer interface for creating new events with all required details*

### 8. Organizer App - QR Code Scanner

![Organizer Scanner](screenshots/organizer-scanner.png)
*QR code scanner interface for on-site check-in using device camera*

### 9. Organizer App - Attendees List

![Organizer Attendees](screenshots/organizer-attendees.png)
*Organizer view of registered attendees for their events with search and filter*

### 10. Attendee App - Events List (Landing Page)

![Attendee Events](screenshots/attendee-events.png)
*Attendee landing page showing all available events with search functionality*

**Description**: The attendee landing page is the main entry point where users can discover and browse all upcoming active events. It features an animated hero section with a prominent search bar, followed by a responsive grid of event cards displaying key information.

**Key Functions**:
- **Event Discovery**: Browse all upcoming active events in a visually appealing card-based grid layout
- **Real-time Search**: Search events by title or location with instant filtering as you type
- **Event Cards Display**: Each card shows event title, location, date, time, capacity status, and availability
- **Capacity Indicators**: Visual capacity bars and badges showing "SOLD OUT" or "FEW LEFT" warnings
- **Quick Navigation**: Click "View Details" on any event card to see full event information and register
- **Responsive Design**: Fully responsive layout that adapts to mobile, tablet, and desktop screens
- **Animated Background**: Engaging animated gradient background with particle effects for visual appeal
- **Empty State Handling**: User-friendly message when no events match the search criteria

### 11. Attendee App - Event Registration

![Attendee Registration](screenshots/attendee-registration.png)
*Attendee registration form for events with name, email, and company fields*

### 12. Attendee App - My Tickets with QR Code

![Attendee Tickets](screenshots/attendee-tickets.png)
*Attendee view of all registered tickets with QR codes for check-in*

## How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Backend (NestJS):

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following content:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=event_registration
JWT_SECRET=your-secret-key-change-in-production
```

4. Start the backend server:
```bash
npm run start:dev
```

5. The backend will run on `http://localhost:4000`
6. Swagger API documentation will be available at `http://localhost:4000/api`

### Frontend - Admin App (React):

1. Open a new terminal and navigate to the admin app directory:
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

4. The admin app will run on `http://localhost:3000`
5. Open the app in your browser and login with admin credentials

### Frontend - Organizer App (React):

1. Open a new terminal and navigate to the organizer app directory:
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

4. The organizer app will run on `http://localhost:3001`
5. Open the app in your browser and login with organizer credentials

### Frontend - Attendee App (React):

1. Open a new terminal and navigate to the attendee app directory:
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

4. The attendee app will run on `http://localhost:3002`
5. Open the app in your browser to browse and register for events

## Default Users Setup

To create an admin user, you can use the registration endpoint or create one directly via API:

```bash
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "Admin User",
  "role": "admin"
}
```

For organizers and attendees, you can register through the frontend applications or use the same registration endpoint with `"role": "organizer"` or `"role": "attendee"`.

## Usage Flow

### Admin Flow:
1. Login at `http://localhost:3000/login`
2. View dashboard with system-wide statistics and charts
3. Manage all events (view, search, delete)
4. Create and manage organizers/staff members
5. View reports and export data to CSV

### Organizer Flow:
1. Login at `http://localhost:3001/login`
2. View dashboard with personal event statistics
3. Create new events with details (title, description, location, dates, capacity)
4. View registered attendees for your events
5. Use QR Scanner to check-in attendees at the venue
6. Export attendee lists to CSV

### Attendee Flow:
1. Browse events at `http://localhost:3002`
2. Search for events by title or location
3. View detailed event information
4. Register for events (provide name, email, optional company)
5. View tickets with QR codes in "My Tickets" section
6. Present QR code at event venue for check-in

## Key API Endpoints

### Authentication
- `POST /auth/register` - Register new user (email, password, fullName, role)
- `POST /auth/login` - Login user (email, password) → returns JWT token

### Events
- `GET /events` - List all events (query params: search, upcoming, organizerId, isActive)
- `GET /events/:id` - Get event details
- `POST /events` - Create event (Organizer/Admin only)
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event (Admin only)

### Tickets
- `POST /tickets` - Register for event (creates ticket with QR code)
- `GET /tickets` - List tickets (query params: eventId, attendeeId)
- `GET /tickets/:id` - Get ticket details
- `GET /tickets/code/:ticketCode` - Get ticket by code
- `GET /tickets/verify/:ticketCode` - Verify and check-in ticket (Organizer/Admin only)
- `PATCH /tickets/:id` - Update ticket status

### Users (Admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PATCH /users/:id` - Update user (activate/deactivate)
- `DELETE /users/:id` - Delete user

### Reports
- `GET /reports/overview` - System overview statistics (Admin only)
- `GET /reports/events/:eventId/statistics` - Event-specific statistics
- `GET /reports/events/:eventId/attendees/csv` - Export attendees CSV

## Security Features

- **JWT Authentication**: Secure token-based authentication for all API requests
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Role-Based Access Control (RBAC)**: Different permissions for Admin, Organizer, and Attendee roles
- **Duplicate Prevention**: System prevents users from registering for the same event twice
- **Capacity Enforcement**: Registration is blocked when event reaches capacity limit
- **Ticket Validation**: Tickets are validated before check-in to prevent fraud

## Tech Stack

### Backend
- **NestJS**: Progressive Node.js framework for building efficient server-side applications
- **TypeORM**: Object-Relational Mapping for database operations
- **MySQL**: Relational database for data storage
- **JWT (jsonwebtoken)**: Token-based authentication
- **Passport.js**: Authentication middleware
- **QRCode**: Library for generating QR codes
- **UUID**: Generating unique ticket codes
- **Swagger/OpenAPI**: API documentation

### Frontend
- **React 18**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Vite**: Fast build tool and development server
- **React Router**: Declarative routing for React
- **Axios**: HTTP client for API requests
- **HTML5-QRCode**: QR code scanning library
- **qrcode.react**: QR code display component
- **Recharts**: Charting library for analytics

## Database Schema

The application uses TypeORM with MySQL. The database schema includes:

- **User**: id, email, password, fullName, company, role, isActive, createdAt, updatedAt
- **Event**: id, title, description, location, startDate, endDate, capacity, registeredCount, isActive, organizerId, createdAt, updatedAt
- **Ticket**: id, ticketCode, status, qrCode, checkedInAt, eventId, attendeeId, createdAt, updatedAt

The database schema is automatically created when you first run the backend server.

## Notes

- The QR scanner requires camera permissions in the browser
- QR codes are generated automatically when a ticket is created
- Ticket status flow: `pending` → `confirmed` → `checked_in` or `cancelled`
- Cancelled tickets can be reactivated by updating the status
- The system automatically creates attendee accounts when registering with an email
- All timestamps are stored in UTC format
- JWT tokens expire after 7 days (configurable)

## Troubleshooting

1. **Database connection error**: Ensure MySQL is running and credentials in `.env` are correct
2. **CORS errors**: Check that frontend URLs are added to CORS configuration in `backend/src/main.ts`
3. **QR Scanner not working**: Ensure camera permissions are granted and using HTTPS (or localhost)
4. **Token expired**: Login again to get a new token
5. **Port already in use**: Change the port in `vite.config.ts` or stop the process using that port
6. **Module not found errors**: Run `npm install` in the respective directory

## Project Structure

```
Activity10/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module (login, register)
│   │   ├── users/             # User management (CRUD operations)
│   │   ├── events/            # Event management (CRUD operations)
│   │   ├── tickets/           # Ticket & registration system
│   │   ├── reports/           # Reports & CSV exports
│   │   └── main.ts            # Application entry point
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── admin-app/             # Admin React app (Port 3000)
│   │   ├── src/
│   │   │   ├── pages/         # Page components
│   │   │   ├── components/    # Reusable components
│   │   │   └── config/       # API configuration
│   │   └── package.json
│   ├── organizer-app/         # Organizer React app (Port 3001)
│   │   ├── src/
│   │   │   ├── pages/         # Page components
│   │   │   ├── components/    # Reusable components
│   │   │   └── config/       # API configuration
│   │   └── package.json
│   └── attendee-app/          # Attendee React app (Port 3002)
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # Reusable components
│       │   └── config/       # API configuration
│       └── package.json
└── README.md
```
