nano /home/user/healthsync/scripts/auto-pull.sh
# Replace with:
#!/bin/bash
# HealthSync Auto-Pull Script - Build 1.3.003
HEALTHSYNC_DIR="/home/user/healthsync"
echo "Starting pull at $(date)" >> /tmp/pull.log
sudo chown -R $(whoami):$(whoami) "$HEALTHSYNC_DIR" || echo "Chown failed" >> /tmp/pull.log
cd "$HEALTHSYNC_DIR" || echo "Cd failed" >> /tmp/pull.log
git config --global --add safe.directory "$HEALTHSYNC_DIR" || echo "Git config failed" >> /tmp/pull.log
git fetch origin || echo "Fetch failed" >> /tmp/pull.log
git reset --hard origin/health-sync-1.3 || echo "Reset failed" >> /tmp/pull.log
git clean -fd || echo "Clean failed" >> /tmp/pull.log
npm install || echo "Npm install failed" >> /tmp/pull.log
touch "$HEALTHSYNC_DIR/data.json" || echo "Touch failed" >> /tmp/pull.log
chmod 666 "$HEALTHSYNC_DIR/data.json" || echo "Chmod failed" >> /tmp/pull.log
pkill -9 -f node || echo "Pkill failed" >> /tmp/pull.log
nohup node server/server.js & || echo "Nohup failed" >> /tmp/pull.log
echo "Pull complete at $(date)" >> /tmp/pull.log
# Save: Ctrl+O, Enter, Ctrl+X