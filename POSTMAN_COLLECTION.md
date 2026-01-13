# Postman Collection Instructions

## Import Postman Collection

You can create a Postman collection by importing the API endpoints using the Swagger specification:

1. Open Postman
2. Click **Import**
3. Enter the Swagger JSON URL: `http://localhost:4000/api-json`
   - Or download from Swagger UI: `http://localhost:4000/api-json`
4. Import the collection

Alternatively, you can manually create a Postman collection using the API documentation provided in `API_DOCUMENTATION.md`.

## Postman Environment Setup

Create a Postman Environment with the following variables:

- `baseUrl`: `http://localhost:4000`
- `token`: (will be set automatically after login)

## Testing Workflow

1. **Register/Login** to get JWT token
2. Set the token in environment variables
3. Use the token in Authorization header for protected endpoints
4. Test all CRUD operations
5. Test QR code scanning flow

## Collection Structure

The Postman collection should be organized as follows:

- **Authentication**
  - POST /auth/register
  - POST /auth/login

- **Events**
  - GET /events
  - GET /events/:id
  - POST /events
  - PATCH /events/:id
  - DELETE /events/:id

- **Tickets**
  - POST /tickets
  - GET /tickets
  - GET /tickets/:id
  - GET /tickets/verify/:ticketCode

- **Users** (Admin only)
  - GET /users
  - POST /users
  - PATCH /users/:id
  - DELETE /users/:id

- **Reports**
  - GET /reports/overview
  - GET /reports/events/:eventId/statistics
  - GET /reports/events/:eventId/attendees/csv

For interactive testing, we recommend using the Swagger UI at `http://localhost:4000/api` which provides a built-in testing interface.
