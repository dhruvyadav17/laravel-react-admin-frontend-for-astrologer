#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  EC2 Ubuntu 22.04 — one-time server setup
#  Run as ubuntu user after first SSH login:
#    bash scripts/ec2-setup.sh
# ─────────────────────────────────────────────────────────────────
set -e

echo "Installing Docker..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group (no sudo needed)
sudo usermod -aG docker ubuntu
newgrp docker

echo "Installing Node.js 20 (for frontend builds on EC2)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing git..."
sudo apt-get install -y git

echo ""
echo "Done! Log out and back in for docker group to take effect."
echo "Then: git clone your-repo && bash scripts/aws-deploy.sh"
