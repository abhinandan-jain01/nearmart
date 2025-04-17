#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check for required tools
echo "🔍 Checking for required tools..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "pm2 is required but not installed. Installing..."; npm install -g pm2; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set environment to production
echo "⚙️ Setting up production environment..."
export NODE_ENV=production

# Update MongoDB URI for production
echo "🔑 Updating MongoDB configuration..."
read -p "Enter MongoDB Atlas connection string (or press Enter to use local): " mongodb_uri
if [ ! -z "$mongodb_uri" ]; then
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=$mongodb_uri|" .env
fi

# Update email configuration
echo "📧 Updating email configuration..."
read -p "Enter production email address: " email
read -p "Enter email app password: " email_pass
if [ ! -z "$email" ] && [ ! -z "$email_pass" ]; then
    sed -i "s|SMTP_USER=.*|SMTP_USER=$email|" .env
    sed -i "s|SMTP_PASS=.*|SMTP_PASS=$email_pass|" .env
fi

# Update payment gateway configuration
echo "💳 Updating payment gateway configuration..."
read -p "Enter Razorpay Key ID: " razorpay_key
read -p "Enter Razorpay Key Secret: " razorpay_secret
if [ ! -z "$razorpay_key" ] && [ ! -z "$razorpay_secret" ]; then
    sed -i "s|RAZORPAY_KEY_ID=.*|RAZORPAY_KEY_ID=$razorpay_key|" .env
    sed -i "s|RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=$razorpay_secret|" .env
fi

# Update AWS configuration
echo "☁️ Updating AWS configuration..."
read -p "Enter AWS Access Key ID: " aws_key
read -p "Enter AWS Secret Access Key: " aws_secret
read -p "Enter AWS Region: " aws_region
read -p "Enter AWS Bucket Name: " aws_bucket
if [ ! -z "$aws_key" ] && [ ! -z "$aws_secret" ] && [ ! -z "$aws_region" ] && [ ! -z "$aws_bucket" ]; then
    sed -i "s|AWS_ACCESS_KEY_ID=.*|AWS_ACCESS_KEY_ID=$aws_key|" .env
    sed -i "s|AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=$aws_secret|" .env
    sed -i "s|AWS_REGION=.*|AWS_REGION=$aws_region|" .env
    sed -i "s|AWS_BUCKET_NAME=.*|AWS_BUCKET_NAME=$aws_bucket|" .env
fi

# Update CORS configuration
echo "🌐 Updating CORS configuration..."
read -p "Enter production domain (e.g., https://your-domain.com): " domain
if [ ! -z "$domain" ]; then
    sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$domain|" .env
fi

# Start the server
echo "🚀 Starting the server..."
pm2 start src/server.js --name "business-back" --time

# Save PM2 process list
pm2 save

# Setup PM2 to start on system reboot
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📝 Server is running at http://localhost:3001"
echo "📚 API documentation is available at http://localhost:3001/api-docs" 