# API Gateway

## Purpose
Single HTTP entry point that routes frontend requests to the appropriate microservice via TCP.

## Capabilities

### Map Points Proxy
- Route: `GET /map/points` → TCP `map.findAll`
- Route: `GET /map/points/bounds` → TCP `map.findByBounds`
- Route: `GET /map/points/nearby` → TCP `map.findNearby`
- Route: `GET /map/points/:id` → TCP `map.findOne`
- Route: `POST /map/points` → TCP `map.create`
- Route: `PUT /map/points/:id` → TCP `map.update`
- Route: `DELETE /map/points/:id` → TCP `map.remove`

### Profile Proxy
- Route: `GET /profiles/:userId/preferences` → TCP `get_user_preferences`
- Route: `PUT /profiles/:userId/preferences` → TCP `update_user_preferences`
- Route: `GET /profiles/:userId/history` → TCP `get_user_history`
- Route: `POST /profiles/:userId/history` → TCP `add_history_entry`
- Route: `DELETE /profiles/:userId/history/:entryId` → TCP `delete_history_entry`
- Route: `GET /profiles/:userId/history/stats` → TCP `get_user_history_stats`

### Auth Proxy
- Route: `POST /auth/register` → TCP `auth.register`
- Route: `POST /auth/login` → TCP `auth.login`

## Non-Functional Requirements
- CORS enabled for `localhost:5173`, `127.0.0.1:5173`
- Global ValidationPipe (whitelist + forbidNonWhitelisted + transform)
- Default port: 3000
