-- OpenVPN Panel D1 Database Schema
-- Migrated from SQLite/SQLAlchemy models

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    expiry_date DATE NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    owner TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    tunnel_address TEXT,
    protocol TEXT NOT NULL,
    ovpn_port INTEGER NOT NULL,
    port INTEGER NOT NULL,
    key TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,
    is_healthy INTEGER NOT NULL DEFAULT 1,
    last_health_check DATETIME,
    response_time REAL,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    last_sync_time DATETIME,
    sync_status TEXT NOT NULL DEFAULT 'synced'
);

CREATE INDEX IF NOT EXISTS idx_nodes_address ON nodes(address);
CREATE INDEX IF NOT EXISTS idx_nodes_is_healthy ON nodes(is_healthy);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_sync_status ON nodes(sync_status);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tunnel_address TEXT,
    port INTEGER NOT NULL DEFAULT 1194,
    protocol TEXT NOT NULL DEFAULT 'tcp'
);



