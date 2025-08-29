# API Documentation Template

## Overview

This template provides a comprehensive structure for API documentation that meets quality gate requirements.

## Table of Contents

1. [Authentication](#authentication)
2. [Base URL](#base-url)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
6. [Data Models](#data-models)
7. [Examples](#examples)

## Authentication

### Bearer Token Authentication

All API requests require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <your-api-token>
```

### Getting an API Token

1. Register your application
2. Obtain client credentials
3. Exchange credentials for an access token

```bash
curl -X POST https://api.example.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'
```

## Base URL

```
https://api.example.com/v1
```

All API endpoints are relative to this base URL.

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1638360000
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request parameters are invalid",
    "details": {
      "field": "email",
      "reason": "must be a valid email address"
    }
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

## Endpoints

### Users

#### Get User Profile

Retrieve the profile of the authenticated user.

**GET** `/users/profile`

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2023-01-20T14:45:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

#### Update User Profile

Update the profile of the authenticated user.

**PUT** `/users/profile`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "updated_at": "2023-01-20T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing token
- `409 Conflict`: Email already in use

### Products

#### List Products

Retrieve a paginated list of products.

**GET** `/products`

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search query

**Response (200):**
```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "Wireless Headphones",
      "price": 99.99,
      "category": "Electronics",
      "in_stock": true,
      "created_at": "2023-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### Create Product

Create a new product.

**POST** `/products`

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "name": "Bluetooth Speaker",
  "price": 79.99,
  "category": "Electronics",
  "description": "Portable wireless speaker with excellent sound quality",
  "sku": "SPKR-BT-001"
}
```

**Response (201):**
```json
{
  "id": "prod_456",
  "name": "Bluetooth Speaker",
  "price": 79.99,
  "category": "Electronics",
  "description": "Portable wireless speaker with excellent sound quality",
  "sku": "SPKR-BT-001",
  "in_stock": false,
  "created_at": "2023-01-25T11:30:00Z"
}
```

## Data Models

### User

```json
{
  "id": "string",
  "email": "string (email)",
  "name": "string",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Product

```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "category": "string",
  "description": "string",
  "sku": "string",
  "in_stock": "boolean",
  "created_at": "string (ISO 8601)"
}
```

### Error

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

## Examples

### Complete API Workflow

```javascript
// 1. Get access token
const tokenResponse = await fetch('https://api.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret'
  })
});

const { access_token } = await tokenResponse.json();

// 2. Get user profile
const profileResponse = await fetch('https://api.example.com/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const profile = await profileResponse.json();
console.log('User profile:', profile);

// 3. List products
const productsResponse = await fetch('https://api.example.com/v1/products?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const products = await productsResponse.json();
console.log('Products:', products);
```

### Python Example

```python
import requests
from typing import Dict, List

class APIClient:
    def __init__(self, base_url: str, client_id: str, client_secret: str):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None

    def authenticate(self) -> None:
        """Authenticate and get access token."""
        response = requests.post(f"{self.base_url}/oauth/token", json={
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        })
        response.raise_for_status()
        self.token = response.json()["access_token"]

    def get_user_profile(self) -> Dict:
        """Get authenticated user's profile."""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/users/profile", headers=headers)
        response.raise_for_status()
        return response.json()

    def list_products(self, page: int = 1, limit: int = 20) -> Dict:
        """List products with pagination."""
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {"page": page, "limit": limit}
        response = requests.get(f"{self.base_url}/products", headers=headers, params=params)
        response.raise_for_status()
        return response.json()

# Usage
client = APIClient("https://api.example.com/v1", "client_id", "client_secret")
client.authenticate()
profile = client.get_user_profile()
products = client.list_products()
```

---

## Changelog

### Version 1.1.0 (2024-01-20)
- Added product search and filtering
- Improved error messages
- Added rate limiting headers

### Version 1.0.0 (2024-01-15)
- Initial API release
- User management endpoints
- Product catalog endpoints
- Authentication system

---

*This documentation is auto-generated and maintained. Last updated: {{timestamp}}*