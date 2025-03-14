#!/bin/bash
# HealthSync Startup Script - Build 1.2.7
# Purpose: Provision a fresh VM with HealthSync Build 1.2.7
sudo apt update && sudo apt install -y curl net-tools  # Tools for debug
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -  # Node 16 source
sudo apt install -y nodejs mongodb  # Core runtime + DB (unused yet)
sudo systemctl enable mongodb  # MongoDB auto-start (for future)
sudo systemctl start mongodb   # Start MongoDB (unused now)
HEALTHSYNC_DIR="/home/$(whoami)/healthsync"  # User’s home dir
sudo mkdir -p "$HEALTHSYNC_DIR"  # Create app dir
sudo chown -R $(whoami):$(whoami) "$HEALTHSYNC_DIR"  # User owns it
git clone https://github.com/rorys32/HealthSync.git "$HEALTHSYNC_DIR"  # Clone repo
cd "$HEALTHSYNC_DIR"
git checkout health-sync-dev-1.3  # Use dev branch
npm install  # Install deps
npm install dotenv jsonwebtoken  # Explicit key deps
touch "$HEALTHSYNC_DIR/data.json"  # Create data file
chmod 666 "$HEALTHSYNC_DIR/data.json"  # Perms for all (temp fix)
echo "PORT=3000" > .env  # Port config
echo "DATA_PATH=$HEALTHSYNC_DIR/data.json" >> .env  # Data file path
echo "JWT_SECRET=your-secret-key" >> .env  # JWT key (temp)
pkill -9 node  # Kill any Node
nohup node server/server.js &  # Run server