# API Documentation

## Base URL
```
http://localhost:4000
```

## Swagger UI
Interactive API documentation is available at:
```
http://localhost:4000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

Tokens are obtained through the login endpoint and expire after 7 days.

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "company": "ABC Company", // optional
  "role": "admin" // or "organizer" or "attendee"
}
```

**Response:** 201 Created
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "company": "ABC Company",
  "role": "admin",
  "isActive": true,
  "accessToken": "jwt-token-here",
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "admin",
  "accessToken": "jwt-token-here"
}
```

---

### Events

#### GET /events
Get all events with optional filters.

**Query Parameters:**
- `search` (optional): Search by title or location
- `upcoming` (optional): Filter upcoming events only (true/false)
- `organizerId` (optional): Filter by organizer ID
- `isActive` (optional): Filter by active status (true/false)

**Response:** 200 OK
```json
[
  {
    "id": "event-uuid",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "location": "Convention Center",
    "startDate": "2024-06-15T09:00:00.000Z",
    "endDate": "2024-06-15T17:00:00.000Z",
    "capacity": 500,
    "registeredCount": 250,
    "isActive": true,
    "organizerId": "organizer-uuid",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

#### GET /events/:id
Get event by ID.

**Response:** 200 OK
```json
{
  "id": "event-uuid",
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "location": "Convention Center",
  "startDate": "2024-06-15T09:00:00.000Z",
  "endDate": "2024-06-15T17:00:00.000Z",
  "capacity": 500,
  "registeredCount": 250,
  "isActive": true,
  "organizer": {
    "id": "organizer-uuid",
    "fullName": "Organizer Name"
  },
  "tickets": [...]
}
```

#### POST /events
Create a new event. (Admin/Organizer only)

**Request Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "location": "Convention Center",
  "startDate": "2024-06-15T09:00:00.000Z",
  "endDate": "2024-06-15T17:00:00.000Z",
  "capacity": 500,
  "imageUrl": "https://example.com/image.jpg" // optional
}
```

**Response:** 201 Created

#### PATCH /events/:id
Update event. (Owner or Admin only)

**Request Body:**
```json
{
  "title": "Updated Title", // optional
  "description": "Updated description", // optional
  "capacity": 600, // optional
  "isActive": false // optional
}
```

**Response:** 200 OK

#### DELETE /events/:id
Delete event. (Owner or Admin only)

**Response:** 200 OK

---

### Tickets

#### POST /tickets
Register for an event (create ticket).

**Request Body:**
```json
{
  "eventId": "event-uuid",
  "email": "attendee@example.com",
  "fullName": "John Doe",
  "company": "ABC Company" // optional
}
```

**Response:** 201 Created
```json
{
  "id": "ticket-uuid",
  "ticketCode": "EVENT-ABC123-20240101",
  "status": "confirmed",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "eventId": "event-uuid",
  "attendeeId": "attendee-uuid",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "event": {...},
  "attendee": {...}
}
```

**Error Responses:**
- 400: Event full or already registered
- 409: Already registered for this event

#### GET /tickets
Get all tickets with optional filters.

**Query Parameters:**
- `eventId` (optional): Filter by event ID
- `attendeeId` (optional): Filter by attendee ID

**Response:** 200 OK
```json
[
  {
    "id": "ticket-uuid",
    "ticketCode": "EVENT-ABC123-20240101",
    "status": "confirmed",
    "qrCode": "data:image/png;base64,...",
    "eventId": "event-uuid",
    "attendeeId": "attendee-uuid",
    "event": {...},
    "attendee": {...},
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

#### GET /tickets/:id
Get ticket by ID.

**Response:** 200 OK

#### GET /tickets/code/:ticketCode
Get ticket by ticket code. (Organizer/Admin only)

**Response:** 200 OK

#### GET /tickets/verify/:ticketCode
Verify and check-in a ticket. (Organizer/Admin only)

**Response:** 200 OK
```json
{
  "id": "ticket-uuid",
  "ticketCode": "EVENT-ABC123-20240101",
  "status": "checked_in",
  "checkedInAt": "2024-06-15T14:30:00.000Z",
  "event": {
    "id": "event-uuid",
    "title": "Tech Conference 2024"
  },
  "attendee": {
    "id": "attendee-uuid",
    "fullName": "John Doe",
    "email": "attendee@example.com"
  }
}
```

**Error Responses:**
- 400: Ticket already checked in or event not started
- 404: Ticket not found

#### PATCH /tickets/:id
Update ticket status.

**Request Body:**
```json
{
  "status": "cancelled" // or "confirmed" or "checked_in"
}
```

**Response:** 200 OK

---

### Users (Admin only)

#### GET /users
Get all users. (Admin only)

**Query Parameters:**
- `role` (optional): Filter by role
- `isActive` (optional): Filter by active status

**Response:** 200 OK

#### GET /users/:id
Get user by ID. (Admin only)

**Response:** 200 OK

#### GET /users/profile
Get current user profile.

**Response:** 200 OK

#### POST /users
Create user. (Admin only)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "company": "ABC Company", // optional
  "role": "organizer",
  "isActive": true // optional
}
```

**Response:** 201 Created

#### PATCH /users/:id
Update user. (Admin only)

**Request Body:**
```json
{
  "fullName": "Updated Name", // optional
  "company": "New Company", // optional
  "isActive": false, // optional
  "password": "newpassword" // optional
}
```

**Response:** 200 OK

#### DELETE /users/:id
Delete user. (Admin only)

**Response:** 200 OK

---

### Reports

#### GET /reports/overview
Get system overview statistics. (Admin only)

**Response:** 200 OK
```json
{
  "totalEvents": 50,
  "activeEvents": 25,
  "totalTickets": 5000,
  "checkedInTickets": 3000,
  "totalUsers": 1000,
  "organizers": 50,
  "attendees": 950
}
```

#### GET /reports/events/:eventId/statistics
Get event statistics. (Admin/Organizer only)

**Response:** 200 OK
```json
{
  "eventId": "event-uuid",
  "eventTitle": "Tech Conference 2024",
  "capacity": 500,
  "totalRegistered": 450,
  "confirmed": 420,
  "checkedIn": 350,
  "cancelled": 30,
  "remainingCapacity": 80,
  "checkInRate": "83.33"
}
```

#### GET /reports/events/:eventId/attendees/csv
Export attendees list as CSV. (Admin/Organizer only)

**Response:** 200 OK (CSV file download)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Already registered for this event",
  "error": "Conflict"
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider implementing rate limiting middleware.

## Pagination

Currently, all list endpoints return all results. For production with large datasets, consider implementing pagination.

## Testing the API

You can test all endpoints using:
1. **Swagger UI**: `http://localhost:4000/api` (Recommended)
2. **Postman**: Import the collection or use the examples above
3. **cURL**: Use the examples provided in this documentation
4. **Frontend Apps**: The React applications serve as functional API clients

---

For more details and interactive testing, visit the Swagger UI at `http://localhost:4000/api`
