#!/bin/bash
# HealthSync Auto-Pull Script - Build 1.3.002
HEALTHSYNC_DIR="/home/user/healthsync"
sudo chown -R $(whoami):$(whoami) "$HEALTHSYNC_DIR"
cd "$HEALTHSYNC_DIR"
git config --global --add safe.directory "$HEALTHSYNC_DIR"
git fetch origin
git reset --hard origin/health-sync-1.3
npm install
touch "$HEALTHSYNC_DIR/data.json"
chmod 666 "$HEALTHSYNC_DIR/data.json"
pkill -9 node
nohup node server/server.js &