#!/bin/bash
# HealthSync Auto-Pull Script - Build 1.3.000
HEALTHSYNC_DIR="/home/user/healthsync"  # Fixed path
cd "$HEALTHSYNC_DIR"
git fetch origin
git reset --hard origin/health-sync-dev-1.3
npm install
touch "$HEALTHSYNC_DIR/data.json"
chmod 666 "$HEALTHSYNC_DIR/data.json"
pkill -9 node
nohup node server/server.js &