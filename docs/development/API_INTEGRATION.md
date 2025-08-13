# AGENT API Integration Documentation

## Overview

This document describes the API contracts and integration points between the Python backend and TypeScript frontend of the AGENT system. The API follows REST conventions and uses JSON for request/response payloads.

## Base URL

All API endpoints are prefixed with `/api`. In development, the API is typically available at `http://localhost:8000/api`. In production, it's available at the deployed domain with the `/api` prefix.

## Authentication

Most admin endpoints require authentication via a session token passed in the request headers:

```http
Authorization: Bearer <session_token>
```

## Core API Endpoints

### Health and Status

- `GET /api/health` - System health check
- `GET /api/status` - Detailed system status
- `GET /api/models/status` - Status of all AI models

### Query Processing

- `POST /api/query` - Process simple queries
- `POST /api/multi-model-query` - Process queries using the multi-model AI router

### Spline 3D Training

- `POST /api/agent/spline/start-training` - Start a new Spline training session
- `POST /api/agent/spline/process-notes` - Process Spline course notes
- `POST /api/agent/spline/analyze-screenshot` - Analyze a Spline screenshot
- `POST /api/agent/spline/generate-scene` - Generate a 3D scene from description
- `GET /api/agent/spline/training-progress` - Get current training progress
- `GET /api/agent/spline/capabilities` - Get Spline development capabilities

## Admin API Endpoints

All admin endpoints are prefixed with `/api/admin` and require authentication.

### User Management

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create a new user
- `PUT /api/admin/users/{user_id}` - Update a user
- `DELETE /api/admin/users/{user_id}` - Delete a user

### Group Management

- `GET /api/admin/groups` - Get all groups
- `POST /api/admin/groups` - Create a new group
- `PUT /api/admin/groups/{group_id}` - Update a group
- `DELETE /api/admin/groups/{group_id}` - Delete a group

### Mode Configuration

- `GET /api/admin/modes` - Get all modes
- `POST /api/admin/modes` - Create a new mode
- `PUT /api/admin/modes/{mode_id}` - Update a mode
- `DELETE /api/admin/modes/{mode_id}` - Delete a mode

### LLM Management

- `GET /api/admin/llm-models` - Get all LLM models
- `POST /api/admin/llm-models` - Create a new LLM model
- `PUT /api/admin/llm-models/{model_id}` - Update an LLM model
- `DELETE /api/admin/llm-models/{model_id}` - Delete an LLM model

### System Settings

- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

### Admin Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Get current admin info

## Request/Response Format

All API requests and responses use JSON format. Successful responses follow this structure:

```json
{
  "success": true,
  "result": { ... },
  "timestamp": "2023-05-15T14:30:00Z"
}
```

Error responses follow this structure:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2023-05-15T14:30:00Z"
}
```

## Cross-Language Integration Points

### Frontend Integration

The TypeScript frontend integrates with the Python backend through:

1. **API Service Layer** - A dedicated service module that handles all HTTP requests to the backend
2. **State Management** - Integration with frontend state management (e.g., Redux, Zustand) to store API responses
3. **Authentication Context** - Session management and token storage
4. **Error Handling** - Consistent error handling for API failures
5. **Type Safety** - TypeScript interfaces that match the Pydantic models used in the backend

### Backend Integration

The Python backend integrates with the frontend through:

1. **CORS Configuration** - Proper CORS headers to allow frontend requests
2. **Static File Serving** - Serving the compiled frontend application
3. **Session Management** - Authentication token validation
4. **Data Validation** - Pydantic models for request/response validation
5. **Error Handling** - Consistent error responses that the frontend can handle

## Example Usage

### Simple Query

```javascript
// Frontend
const response = await fetch('/api/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'What is the weather today?',
    domain: 'general'
  })
});

const data = await response.json();
console.log(data.result.answer);
```

### Admin Login

```javascript
// Frontend
const response = await fetch('/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const data = await response.json();
localStorage.setItem('session_token', data.session_token);
```

### Get Users (Admin)

```javascript
// Frontend
const token = localStorage.getItem('session_token');
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const users = await response.json();
```

## Best Practices

1. **Error Handling** - Always check the `success` field in responses
2. **Authentication** - Store session tokens securely (HttpOnly cookies or secure storage)
3. **Type Safety** - Use TypeScript interfaces that match backend models
4. **Caching** - Implement appropriate caching for non-sensitive data
5. **Rate Limiting** - Be mindful of API rate limits in production

## Versioning

The API version is specified in the OpenAPI documentation available at `/api/docs`.
