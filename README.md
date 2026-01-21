# SIEM - Security Information and Event Management

A full-stack Security Information and Event Management (SIEM) system for centralized log collection, analysis, and threat detection.

## Overview

This SIEM platform provides real-time security monitoring, automated threat detection, and comprehensive log management capabilities. Built with a modern tech stack, it offers multi-tenancy support, role-based access control, and intelligent alerting.

## Features

### Core Capabilities
- **Log Ingestion**: REST API endpoint for collecting logs from multiple sources
- **Real-time Monitoring**: Live dashboard with security metrics and statistics
- **Alert Management**: Automated threat detection with customizable rules
- **User Management**: Multi-tenant architecture with role-based permissions
- **API Key Authentication**: Secure log ingestion with API key management
- **Search and Filter**: Advanced log querying and filtering capabilities

### Security Features
- **Brute Force Detection**: Automatically detects and alerts on failed login patterns
- **JWT Authentication**: Secure user authentication with token-based sessions
- **Rate Limiting**: Protection against API abuse
- **Admin Controls**: Comprehensive user and tenant management

## Architecture

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB for log storage and persistence
- **Authentication**: JWT tokens and API keys
- **Validation**: express-validator for input sanitization

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router for SPA navigation
- **State Management**: Context API for authentication state
- **Styling**: Custom CSS with responsive design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

#### Backend Setup
```bash
cd SIEM-backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siem
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Start the backend server:
```bash
npm start
```

#### Frontend Setup
```bash
cd SIEM-frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Log Management
- `GET /api/logs` - Retrieve logs (authenticated)
- `POST /api/ingest` - Ingest new logs (API key required)

### Alert Management
- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/:id` - Update alert status

### User Management (Admin only)
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### API Keys
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create new API key
- `DELETE /api/api-keys/:id` - Revoke API key

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Log Ingestion

Send logs to the SIEM using the ingest endpoint:

```bash
curl -X POST http://localhost:5000/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "source": "web-app",
    "eventType": "LOGIN_FAILED",
    "message": "Invalid credentials",
    "level": "warn",
    "ip": "192.168.1.100",
    "user": "admin"
  }'
```

### Log Schema
- `source` (required): Log source identifier
- `eventType` (optional): Event classification
- `message` (optional): Descriptive message
- `level` (optional): info, warn, error, critical
- `ip` (optional): Source IP address
- `user` (optional): Associated username
- `ts` (optional): Timestamp (ISO 8601)

### Stored Log Structure

Once ingested, logs are stored in MongoDB with the following structure:

```json
{
  "_id": "ObjectId",
  "tenantId": "ObjectId",
  "ts": "2026-01-21T15:08:11.742Z",
  "source": "web-app",
  "eventType": "LOGIN_FAILED",
  "message": "Invalid credentials for user admin",
  "level": "warn",
  "ip": "192.168.1.100",
  "user": "admin",
  "raw": {
    "source": "web-app",
    "eventType": "LOGIN_FAILED",
    "message": "Invalid credentials for user admin",
    "level": "warn",
    "ip": "192.168.1.100",
    "user": "admin"
  },
  "createdAt": "2026-01-21T15:08:11.742Z",
  "updatedAt": "2026-01-21T15:08:11.742Z"
}
```

**Field Descriptions:**
- `_id`: Unique MongoDB identifier
- `tenantId`: Multi-tenant isolation identifier
- `ts`: Event timestamp (when the event occurred)
- `source`: Origin system or application
- `eventType`: Categorized event type for filtering and alerting
- `message`: Human-readable description of the event
- `level`: Severity level (info, warn, error, critical)
- `ip`: Source IP address (if applicable)
- `user`: Associated user identifier (if applicable)
- `raw`: Original ingested payload preserved for audit purposes
- `createdAt`: Database insertion timestamp
- `updatedAt`: Last modification timestamp

## Alert Rules

### Brute Force Detection
Automatically triggers when 5 or more `LOGIN_FAILED` events occur from the same IP address within 60 seconds.

**Alert Details:**
- Severity: High
- Rule Name: Brute Force Detection
- Deduplication: Prevents duplicate alerts for the same IP

## Project Structure

```
SIEM/
├── SIEM-backend/
│   ├── app.js              # Express application entry point
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Authentication and validation
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   └── utils/              # Alert rules and utilities
└── SIEM-frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # Auth context
    │   ├── services/       # API service layer
    │   └── styles/         # CSS styles
    └── index.html
```

## Security Considerations

- Always use strong JWT secrets in production
- Enable HTTPS for production deployments
- Regularly rotate API keys
- Implement proper network segmentation
- Monitor rate limiting thresholds
- Keep dependencies updated

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# Backend
cd SIEM-backend
npm start

# Frontend
cd SIEM-frontend
npm run build
```

## License

This project is for educational and internal use.

## Copyright

Copyright (c) 2026 Yuval Ifraimov, David Levi, and Dudu Faruk. All rights reserved.

## Support

For issues or questions, please contact the development team or create an issue in the repository.