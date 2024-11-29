# AshChat API Endpoints Documentation

This document provides detailed information about the API endpoints available in the AshChat application. It includes the request format, response format, possible errors, and status codes for each endpoint.

## Table of Contents
1. [User Registration](#user-registration)
2. [User Login](#user-login)
3. [Confirm New Device](#confirm-new-device)
4. [Confirm Email Code](#confirm-email-code)
5. [Change User Password](#change-user-password)
6. [Confirm Change User Password](#confirm-change-user-password)

## User Registration

### Endpoint
`POST /api/user/register`

### Request
```json
{
    "nickname": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "preferredLanguage": "en"
}
```

### Response
#### Success (202 Created)
```json
{
    "message": "Verification email is being processed"
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `409 Conflict`: User already exists
- `500 Internal Server Error`: Server error

### Status Codes
- `202 Created`: Verification email is being processed
- `400 Bad Request`: Invalid input data
- `409 Conflict`: User already exists
- `500 Internal Server Error`: Server error

## Confirm Email Code

### Endpoint
`POST /api/user/confirm-email`

### Request
```json
{
    "email": "john@example.com",
    "emailCode": "123456",
    "deviceOS": "iOS",
    "deviceUniqueToken": "unique_device_token",
    "deviceNotificationToken": "uniquedeviceToken"
}
```

### Response
#### Success (201 OK)
```json
{
    "message": "Email confirmed successfully, user created successfully"
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `505 Internal Server Error`: Server error

### Status Codes
- `201 Created`: Email confirmed successfully
- `400 Bad Request`: Invalid input data
- `505 Internal Server Error`: Server error

## User Login

### Endpoint
`POST /api/user/login`

### Request
```json
{
    "email": "john@example.com",
    "password": "password123",
    "deviceUniqueToken": "unique_device_token",
}
```

### Response
#### Success (200 OK)
```json
{
    "token": "jwt_token",
    "user_id": "user_id",
}
```

#### Forbidden (403 Forbidden)
```json
{
    "error": "New device trying to log in",
    "message": "A new device is trying to log in. Check your email to allow it.",
    "info": "To allow the new device, use the JWT temporary token and the code sent to your email to endpoit /api/user/confirm-new-device",
    "token": "jwt_temporary_token"
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: User device not verified

### Status Codes
- `200 OK`: Login successful
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: User device not verified


## Confirm New Device

### Endpoint
`PATCH /api/user/confirm-new-device`

### Request
```json
{
    "emailCode": "123456",
    "deviceUniqueToken": "unique_device_token",
    "deviceNotificationToken": "uniqueNotificationToken",
    "deviceOS": "iOS",
    // Add JWT temporary token in the Authorization header Bearer token
}
```

### Response
#### Success (204 No Content)

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: User device not verified
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Status Codes
- `204 No Content`: New device confirmed successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: User device not verified
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Change User Password

### Endpoint
`POST /api/user/change-password`

### Request
```json
{
    "email": "john@example.com"
}
```

### Response
#### Success (202 Accepted)
```json
{
    "message": "Verification email is being processed",
    "temporaryToken": "jwt_temporary_token"
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Status Codes
- `200 OK`: Password change request successful
- `400 Bad Request`: Invalid input data
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

## Confirm Change User Password

### Endpoint
`PATCH /api/user/confirm-change-password`

### Request
```json
{
    "emailCode": "123456",
    "newPassword": "newpassword123",
    // Add JWT temporary token in the Authorization header Bearer token
}
```

### Response
#### Success (204 No Content)

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

### Status Codes
- `204 No Content`: Password changed successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

# Chat Service Endpoints - http://localhost:4000/

## Create Chat
`POST /api/chat`
```json
{
  "receiver_tag": "user_tag"
}
// Add JWT token in the Authorization header Bearer token
```

### Response
#### Success (201 Created)
```json
{
    "message": "Chat created successfully",
    "chat_id": "chat.id",
    "messages": [],
    "nickname": "receiver.nickname" // Name of the receiver to use for cache
}
```

#### Errors
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `409 Conflict`: Chat already exists
- `500 Internal Server Error`: Server error

### Status Codes
- `201 Created`: Chat created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found
- `409 Conflict`: Chat already exists
- `500 Internal Server Error`: Server error