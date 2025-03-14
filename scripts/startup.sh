#!/bin/bash
# HealthSync Startup Script - Build 1.3.000
sudo apt update && sudo apt install -y curl net-tools
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb
HEALTHSYNC_DIR="/home/$(whoami)/healthsync"
sudo mkdir -p "$HEALTHSYNC_DIR"
sudo chown -R $(whoami):$(whoami) "$HEALTHSYNC_DIR"
git clone https://github.com/rorys32/HealthSync.git "$HEALTHSYNC_DIR"
cd "$HEALTHSYNC_DIR"
git checkout health-sync-dev-1.3
npm install
npm install dotenv jsonwebtoken cors  # Added cors per your package.json
touch "$HEALTHSYNC_DIR/data.json"
chmod 666 "$HEALTHSYNC_DIR/data.json"
echo "PORT=3000" > .env
echo "DATA_PATH=$HEALTHSYNC_DIR/data.json" >> .env
echo "JWT_SECRET=your-secret-key" >> .env
pkill -9 node
nohup node server/server.js &