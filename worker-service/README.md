# OpenVPN Panel - Cloudflare Workers Migration

This directory contains the migrated OpenVPN Panel system running on Cloudflare Workers.

## Architecture

- **Python Workers**: API service and business logic
- **D1 Database**: User, node, admin, and settings data
- **KV Storage**: Configuration and environment variables
- **R2 Bucket**: Frontend static assets
- **Cron Triggers**: Scheduled tasks (health checks, sync, user expiry)

## Project Structure

```
worker-service/
├── src/
│   ├── api/              # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── users.py      # User management endpoints
│   │   ├── nodes.py      # Node management endpoints
│   │   ├── admins.py     # Admin management endpoints
│   │   └── settings.py   # Settings endpoints
│   ├── auth/             # Authentication logic
│   │   └── auth.py       # JWT and API key authentication
│   ├── database/         # D1 database operations
│   │   ├── schema.sql    # Database schema
│   │   └── operations.py # CRUD operations
│   ├── models/           # Data models
│   │   └── schemas.py    # Pydantic models
│   ├── node/             # Node management
│   │   ├── requests.py   # Node API communication
│   │   ├── health_check.py # Health check service
│   │   ├── sync.py       # Sync service
│   │   └── task.py       # Task handlers
│   ├── operations/       # Business logic
│   │   └── scheduled_tasks.py # Cron trigger handlers
│   └── utils/            # Utility functions
│       └── frontend.py   # Frontend serving utilities
├── wrangler.toml         # Cloudflare Workers configuration
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create D1 Database

```bash
wrangler d1 create openvpn_panel
```

Copy the database ID and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openvpn_panel"
database_id = "YOUR_DATABASE_ID"
```

### 4. Initialize Database Schema

```bash
wrangler d1 execute openvpn_panel --file=src/database/schema.sql
```

### 5. Create KV Namespace

```bash
wrangler kv:namespace create CONFIG
```

Copy the namespace ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CONFIG"
id = "YOUR_KV_NAMESPACE_ID"
```

### 6. Populate KV Configuration

```bash
# Set admin credentials
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID ADMIN_USERNAME "admin"
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID ADMIN_PASSWORD "your_password"

# Set JWT secret (generate a strong random string)
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID JWT_SECRET_KEY "your_jwt_secret_key"

# Set JWT expiry (in seconds)
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID JWT_ACCESS_TOKEN_EXPIRES "86400"

# Optional: Set API key for external integrations
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID API_KEY "your_api_key"

# Set URL path
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID URLPATH "dashboard"

# Set debug level
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID DEBUG "WARNING"

# Set doc visibility
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID DOC "false"
```

### 7. Create R2 Bucket

```bash
wrangler r2 bucket create openvpn-panel-frontend
```

### 8. Build and Upload Frontend

```bash
# Build React frontend
cd ../frontend
npm install
npm run build

# Upload to R2
cd ../worker-service
wrangler r2 object put openvpn-panel-frontend/index.html --file=../frontend/dist/index.html
wrangler r2 object put openvpn-panel-frontend/assets --file=../frontend/dist/assets --recursive
```

### 9. Deploy Worker

```bash
wrangler deploy
```

## Key Differences from Original System

### What Changed:

1. **No Local OpenVPN**: The panel server no longer runs OpenVPN locally. All user creation/deletion happens on remote nodes only.

2. **No Local File System**: OVPN files are downloaded directly from nodes, not stored locally.

3. **Stateless Architecture**: Workers are stateless; all state is in D1/KV/R2.

4. **Cron Limitations**: Minimum 1-minute intervals (vs 10-second health checks in original).

5. **No SQLAlchemy**: Raw SQL queries with D1 instead of ORM.

6. **Async/Await**: Native async instead of ThreadPoolExecutor.

### What Stayed the Same:

1. **API Contract**: Same endpoints and request/response formats.

2. **Node Communication**: Same node API protocol.

3. **Business Logic**: User management, node health checks, sync operations.

4. **Frontend**: Same React UI (served from R2 instead of backend).

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password

### Users
- `GET /api/user/all` - List all users
- `POST /api/user/create` - Create user
- `PUT /api/user/update` - Update user
- `DELETE /api/user/delete/{name}` - Delete user

### Nodes
- `POST /api/node/add` - Add node
- `PUT /api/node/update/{address}` - Update node
- `DELETE /api/node/delete/{address}` - Delete node
- `GET /api/node/list` - List all nodes
- `GET /api/node/list/healthy` - List healthy nodes
- `GET /api/node/download/ovpn/{address}/{name}` - Download from specific node
- `GET /api/node/download/ovpn/best/{name}` - Download from best node
- `POST /api/node/health-check/all` - Health check all
- `POST /api/node/health-check/{address}` - Health check specific
- `POST /api/node/sync/all` - Sync all nodes
- `POST /api/node/sync/{address}` - Sync specific node

### Admins
- `GET /api/admin/all` - List all admins

### Settings
- `GET /api/settings/` - Get settings
- `PUT /api/settings/update` - Update settings

## Scheduled Tasks

### Cron Triggers (configured in wrangler.toml)

1. **Daily User Expiry Check** (`0 0 * * *`)
   - Runs at midnight UTC
   - Deactivates expired users

2. **Health Check** (`*/1 * * * *`)
   - Runs every minute
   - Checks all node health
   - Auto-recovers unhealthy nodes

3. **Sync Operations** (`*/5 * * * *`)
   - Runs every 5 minutes
   - Syncs pending nodes
   - Performs full system sync

## Development

### Local Development

```bash
wrangler dev
```

This starts a local development server with:
- Local D1 database
- Local KV storage
- Local R2 bucket

### Testing

Test API endpoints:

```bash
# Login
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# List users (with JWT token)
curl http://localhost:8787/api/user/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List users (with API key)
curl http://localhost:8787/api/user/all \
  -H "key: YOUR_API_KEY"
```

## Monitoring

View logs:

```bash
wrangler tail
```

View cron trigger logs:

```bash
wrangler tail --format=pretty
```

## Troubleshooting

### Database Issues

Reset database:

```bash
wrangler d1 execute openvpn_panel --command="DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS admins; DROP TABLE IF EXISTS nodes; DROP TABLE IF EXISTS settings;"
wrangler d1 execute openvpn_panel --file=src/database/schema.sql
```

### KV Issues

List all keys:

```bash
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID
```

### R2 Issues

List objects:

```bash
wrangler r2 object list openvpn-panel-frontend
```

## Migration Notes

- The original system's `backend/operations/user_management.py` functions (`create_user_on_server`, `delete_user_on_server`, `download_ovpn_file`) have been removed as they relied on local OpenVPN installation.

- All user operations now go directly to nodes via their APIs.

- The frontend must be rebuilt and uploaded to R2 whenever changes are made.

- Cron triggers have a minimum interval of 1 minute, so health checks run less frequently than the original 10-second interval.



