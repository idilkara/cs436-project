#!/bin/bash
set -euxo pipefail

# 1. Add MongoDB 6.0 GPG key (non-interactive)
curl -fsSL https://pgp.mongodb.com/server-6.0.asc \
  | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# 2. Add the apt repo
sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list << 'EOF'
deb [arch=amd64,signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse
EOF

# 3. Install & pin the package
sudo apt-get update
sudo apt-get install -y mongodb-org
echo "mongodb-org hold" | sudo dpkg --set-selections

# 4. Enable & start MongoDB
sudo systemctl enable --now mongod

# 5. Bind to all internal IPs
sudo sed -i 's/^  bindIp:.*/  bindIp: 0.0.0.0/' /etc/mongod.conf
sudo systemctl restart mongod
