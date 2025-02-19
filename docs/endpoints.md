# AshChat API Endpoints Documentation

This document provides detailed information about the API endpoints available in the AshChat application. It includes the request format, response format, possible errors, and status codes for each endpoint.

<!-- ## Table of Contents
1. [User Registration](#user-registration)
2. [User Login](#user-login)
3. [Confirm New Device](#confirm-new-device)
4. [Confirm Email Code](#confirm-email-code)
5. [Change User Password](#change-user-password)
6. [Confirm Change User Password](#confirm-change-user-password) -->

# Authentication Service Endpoints - http://localhost:3005/swagger-ui/index.html
All endpoints related to user authentication are available in the Authentication Service Swagger UI.
Just run the service and navigate to the Swagger UI to view the endpoints.
1. [User Registration]()
2. [User Login]()
3. [Confirm New Device]()
4. [Confirm Email Code]()
5. [Refresh Token]()

# Chat Service Endpoints - http://localhost:4000/
(IMPORTANT: add JWT token in the Authorization header Bearer token and device_token to the http header)
## Change User Nickname
`PATCH - /api/user/nickname`
```json
{
    "nickname": "new_nickname"
}
// Add JWT token in the Authorization header Bearer token
```

### Response
#### Success (200 Ok)
```json
{
    "message": "User updated successfully"
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Status Codes
- `204 No Content`: Nickname changed successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Change User Profile Picture - Multipart Form Data
`PATCH - /api/user/photo`
```json
{
    "photo": "photo.img" // Image file with field name photo
}
```

### Response
#### Success (200 Ok)
```json
{
	"message": "Upload successful",
	"url": "http://localhost:3000/files/uuid.img"
}

```

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Status Codes
- `200 Ok`: Profile picture changed successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error