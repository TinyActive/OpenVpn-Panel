# Quick Start Guide

Get your OpenVPN Panel running on Cloudflare Workers in minutes.

## Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## 5-Minute Setup

### 1. Create Resources

```bash
cd worker-service

# Create D1 database
wrangler d1 create openvpn_panel

# Create KV namespace
wrangler kv:namespace create CONFIG

# Create R2 bucket
wrangler r2 bucket create openvpn-panel-frontend
```

### 2. Update wrangler.toml

Copy the IDs from step 1 output into `wrangler.toml`:

```toml
[[d1_databases]]
database_id = "YOUR_D1_DATABASE_ID"

[[kv_namespaces]]
id = "YOUR_KV_NAMESPACE_ID"
```

### 3. Initialize Database

```bash
wrangler d1 execute openvpn_panel --file=src/database/schema.sql
```

### 4. Configure KV (Replace YOUR_KV_NAMESPACE_ID)

```bash
KV_ID="YOUR_KV_NAMESPACE_ID"

wrangler kv:key put --namespace-id=$KV_ID ADMIN_USERNAME "admin"
wrangler kv:key put --namespace-id=$KV_ID ADMIN_PASSWORD "admin123"
wrangler kv:key put --namespace-id=$KV_ID JWT_SECRET_KEY "change-this-to-random-string"
wrangler kv:key put --namespace-id=$KV_ID JWT_ACCESS_TOKEN_EXPIRES "86400"
```

### 5. Upload Frontend

```bash
# Build frontend
cd ../frontend
npm install
npm run build

# Upload to R2
cd ../worker-service
wrangler r2 object put openvpn-panel-frontend/index.html --file=../frontend/dist/index.html

# Upload assets (manually or with script)
# See DEPLOYMENT.md for the PowerShell script
```

### 6. Deploy

```bash
wrangler deploy
```

## Test It

```bash
# Get your worker URL from deploy output
WORKER_URL="https://openvpn-panel-worker.YOUR_SUBDOMAIN.workers.dev"

# Test login
curl -X POST "$WORKER_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Open in browser
open "$WORKER_URL/dashboard"
```

## What's Next?

1. **Change Password**: Login and change the default admin password
2. **Add Nodes**: Add your OpenVPN nodes through the UI
3. **Create Users**: Create users - they'll sync to all nodes automatically
4. **Monitor**: Check logs with `wrangler tail`

## Need Help?

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Architecture details: [README.md](README.md)
- Migration summary: [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)

## Common Issues

**"Database not found"**: Update `database_id` in `wrangler.toml`

**"KV namespace not found"**: Update `id` in `wrangler.toml`

**"Frontend not loading"**: Re-upload frontend files to R2

**"Unauthorized"**: Check KV configuration has all required keys



