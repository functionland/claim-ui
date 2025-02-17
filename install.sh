#!/bin/bash

# Default values
DOMAIN=""
APP_DIR="/home/nodejs/claim-ui"
SERVICE_NAME="claim-ui"
NODE_VERSION="20.x"

# Function to print usage
print_usage() {
    echo "Usage: $0 --domain <domain_name>"
    echo "Example: $0 --domain claim.fx.land"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        *)
            print_usage
            ;;
    esac
done

# Check if domain is provided
if [ -z "$DOMAIN" ]; then
    print_usage
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js if not present
install_nodejs() {
    if ! command_exists node; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
}

# Function to install required packages
install_dependencies() {
    echo "Installing required packages..."
    sudo apt-get update
    sudo apt-get install -y nginx certbot python3-certbot-nginx
}

# Function to setup the application
setup_application() {
    echo "Setting up application..."
    
    # Create app directory if it doesn't exist
    sudo mkdir -p $APP_DIR
    
    # Copy application files
    sudo cp -r ./* $APP_DIR/
    
    # Install dependencies and build
    cd $APP_DIR || exit
    sudo npm install
    sudo npm run build

    # Create the production directory structure
    sudo mkdir -p ${APP_DIR}
    sudo cp -r .next/standalone/* ${APP_DIR}/
    sudo cp -r .next/static ${APP_DIR}/.next/
    sudo cp -r public ${APP_DIR}/

    # Set proper permissions
    sudo chown -R nodejs:nodejs ${APP_DIR}
}

# Function to create systemd service
create_service() {
    echo "Creating systemd service..."
    
    sudo tee /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=FULA Claim UI
After=network.target

[Service]
Type=simple
User=nodejs
Group=nodejs
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node .next/standalone/server.js
EnvironmentFile=${APP_DIR}/.env.local
Restart=on-failure
RestartSec=120
StartLimitInterval=1200
StartLimitBurst=10

# Security measures
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ReadWritePaths=${APP_DIR}

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    sudo systemctl start ${SERVICE_NAME}
}

# Function to setup Nginx
setup_nginx() {
    echo "Setting up Nginx..."
    
    sudo tee /etc/nginx/sites-available/$DOMAIN << EOF
server {
    server_name ${DOMAIN};
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Create symlink and remove default site
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
}

# Function to setup SSL
setup_ssl() {
    echo "Setting up SSL certificate..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email hi@${DOMAIN} --redirect
}

# Main execution
echo "Starting setup for $DOMAIN..."

sudo useradd -r -s /bin/false nodejs

# Install required software
install_nodejs
install_dependencies

# Setup application
setup_application

# Create and enable service
create_service

# Setup Nginx and SSL
setup_nginx
setup_ssl

echo "Setup completed successfully!"
echo "You can check the service status with: sudo systemctl status ${SERVICE_NAME}"
echo "The application should be accessible at https://${DOMAIN}"
