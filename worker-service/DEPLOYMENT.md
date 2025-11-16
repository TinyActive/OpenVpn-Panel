# Deployment Guide - OpenVPN Panel on Cloudflare Workers

This guide walks you through deploying the migrated OpenVPN Panel to Cloudflare Workers.

## Prerequisites

- Node.js and npm installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Authenticated with Cloudflare (`wrangler login`)

## Step-by-Step Deployment

### Step 1: Create D1 Database

```bash
cd worker-service
wrangler d1 create openvpn_panel
```

**Output example:**
```
✅ Successfully created DB 'openvpn_panel'!

[[d1_databases]]
binding = "DB"
database_name = "openvpn_panel"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "openvpn_panel"
database_id = "YOUR_ACTUAL_DATABASE_ID"  # Replace this
```

### Step 2: Initialize Database Schema

```bash
wrangler d1 execute openvpn_panel --file=src/database/schema.sql
```

Verify tables were created:

```bash
wrangler d1 execute openvpn_panel --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Step 3: Create KV Namespace

```bash
wrangler kv:namespace create CONFIG
```

**Output example:**
```
✅ Successfully created KV namespace 'CONFIG'!

[[kv_namespaces]]
binding = "CONFIG"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Copy the `id` and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CONFIG"
id = "YOUR_ACTUAL_KV_NAMESPACE_ID"  # Replace this
```

### Step 4: Populate KV Configuration

Replace `YOUR_KV_NAMESPACE_ID` with your actual namespace ID from Step 3:

```bash
# Required: Admin credentials
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID ADMIN_USERNAME "admin"
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID ADMIN_PASSWORD "change_this_password"

# Required: JWT secret (generate a strong random string)
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID JWT_SECRET_KEY "$(openssl rand -base64 32)"

# Required: JWT expiry (86400 = 24 hours)
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID JWT_ACCESS_TOKEN_EXPIRES "86400"

# Optional: API key for external integrations
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID API_KEY "$(openssl rand -base64 32)"

# Optional: URL path (default: dashboard)
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID URLPATH "dashboard"

# Optional: Debug level
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID DEBUG "WARNING"

# Optional: API documentation visibility
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID DOC "false"
```

Verify KV keys:

```bash
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID
```

### Step 5: Create R2 Bucket

```bash
wrangler r2 bucket create openvpn-panel-frontend
```

No need to update `wrangler.toml` - the bucket name is already configured.

### Step 6: Build and Upload Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (if not already installed)
npm install

# Build production bundle
npm run build

# Navigate back to worker-service
cd ../worker-service

# Upload frontend files to R2
# Upload index.html
wrangler r2 object put openvpn-panel-frontend/index.html --file=../frontend/dist/index.html

# Upload assets directory (contains JS, CSS, images)
# Note: You may need to upload files individually or use a script
# For each file in frontend/dist/assets:
```

**PowerShell script to upload assets:**

```powershell
# Save this as upload-frontend.ps1
$bucket = "openvpn-panel-frontend"
$distPath = "../frontend/dist"

# Upload index.html
wrangler r2 object put "$bucket/index.html" --file="$distPath/index.html"

# Upload all files in assets directory
Get-ChildItem -Path "$distPath/assets" -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($distPath.Length + 1).Replace('\', '/')
    Write-Host "Uploading $relativePath..."
    wrangler r2 object put "$bucket/$relativePath" --file=$_.FullName
}

Write-Host "Frontend upload complete!"
```

Run the script:

```powershell
.\upload-frontend.ps1
```

Verify upload:

```bash
wrangler r2 object list openvpn-panel-frontend
```

### Step 7: Deploy Worker

```bash
wrangler deploy
```

**Output example:**
```
✨ Successfully deployed to Cloudflare Workers!
🌎 https://openvpn-panel-worker.YOUR_SUBDOMAIN.workers.dev
```

### Step 8: Test Deployment

Test the API:

```bash
# Get your worker URL from the deploy output
WORKER_URL="https://openvpn-panel-worker.YOUR_SUBDOMAIN.workers.dev"

# Test login
curl -X POST "$WORKER_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"change_this_password"}'

# Should return:
# {"success":true,"msg":"Login successful","data":{"access_token":"...","token_type":"bearer"}}
```

Test the frontend:

```bash
# Open in browser
open "$WORKER_URL/dashboard"
```

### Step 9: Configure Custom Domain (Optional)

Add a custom domain in Cloudflare Dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" tab
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `panel.yourdomain.com`)
6. Cloudflare will automatically configure DNS

## Post-Deployment

### Monitor Logs

View real-time logs:

```bash
wrangler tail
```

View logs with formatting:

```bash
wrangler tail --format=pretty
```

### Verify Cron Triggers

Check cron trigger status:

```bash
wrangler deployments list
```

Manually trigger a cron job (for testing):

```bash
# This will be available in Cloudflare Dashboard under Workers & Pages > Your Worker > Triggers
```

### Database Management

Query database:

```bash
# List all users
wrangler d1 execute openvpn_panel --command="SELECT * FROM users;"

# List all nodes
wrangler d1 execute openvpn_panel --command="SELECT * FROM nodes;"

# Check settings
wrangler d1 execute openvpn_panel --command="SELECT * FROM settings;"
```

### Update Configuration

Update KV values:

```bash
# Change admin password
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID ADMIN_PASSWORD "new_password"

# Update JWT expiry
wrangler kv:key put --namespace-id=YOUR_KV_NAMESPACE_ID JWT_ACCESS_TOKEN_EXPIRES "172800"
```

## Troubleshooting

### Issue: "Database not found"

**Solution:** Ensure database ID in `wrangler.toml` matches the created database:

```bash
wrangler d1 list
```

### Issue: "KV namespace not found"

**Solution:** Ensure KV namespace ID in `wrangler.toml` matches:

```bash
wrangler kv:namespace list
```

### Issue: "Frontend not loading"

**Solution:** Verify R2 bucket has files:

```bash
wrangler r2 object list openvpn-panel-frontend
```

If empty, re-upload frontend files (Step 6).

### Issue: "Unauthorized" errors

**Solution:** Check KV configuration:

```bash
wrangler kv:key list --namespace-id=YOUR_KV_NAMESPACE_ID
```

Ensure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `JWT_SECRET_KEY` are set.

### Issue: Cron triggers not running

**Solution:** Check deployment status:

```bash
wrangler deployments list
```

Cron triggers should show in the output. If not, redeploy:

```bash
wrangler deploy
```

## Rollback

If you need to rollback to a previous version:

```bash
# List deployments
wrangler deployments list

# Rollback to specific deployment
wrangler rollback [DEPLOYMENT_ID]
```

## Cleanup (if needed)

To remove all resources:

```bash
# Delete worker
wrangler delete

# Delete D1 database
wrangler d1 delete openvpn_panel

# Delete KV namespace
wrangler kv:namespace delete --namespace-id=YOUR_KV_NAMESPACE_ID

# Delete R2 bucket (must be empty first)
wrangler r2 object delete openvpn-panel-frontend --all
wrangler r2 bucket delete openvpn-panel-frontend
```

## Next Steps

1. **Add Nodes**: Use the panel UI to add your OpenVPN nodes
2. **Create Users**: Create users through the panel - they will be synced to all healthy nodes
3. **Monitor Health**: Health checks run automatically every minute
4. **Configure Settings**: Update tunnel address and protocol settings as needed

## Security Recommendations

1. **Change Default Password**: Immediately change the admin password after first login
2. **Rotate JWT Secret**: Periodically rotate the JWT secret key
3. **Use Strong API Key**: If using API key authentication, generate a strong random key
4. **Enable HTTPS**: Always use HTTPS (Cloudflare Workers provide this by default)
5. **Restrict Access**: Consider using Cloudflare Access to restrict who can access the panel

## Support

For issues or questions:
- Check the logs: `wrangler tail`
- Review the README.md for architecture details
- Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/



