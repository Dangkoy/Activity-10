# Deployment Guide

## Production Deployment

### Backend Deployment

1. **Environment Variables**
   - Set production database credentials
   - Use a strong JWT_SECRET
   - Configure CORS for production domains

2. **Build**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

3. **Database Migration**
   - For production, disable `synchronize: true` in TypeORM config
   - Use proper migrations instead

### Frontend Deployment

Each frontend app can be deployed separately:

```bash
cd frontend/admin-app  # or organizer-app / attendee-app
npm run build
# Deploy the dist/ folder to your hosting service
```

### Recommended Hosting

- **Backend**: Railway, Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: AWS RDS, DigitalOcean Managed Database, MySQL on server

## Docker Deployment (Optional)

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/main"]
```

Build and run:
```bash
docker build -t event-registration-backend .
docker run -p 4000:4000 event-registration-backend
```
