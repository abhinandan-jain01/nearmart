@echo off
echo 🚀 Starting deployment process...

REM Check for Node.js and npm
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is required but not installed. Aborting.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is required but not installed. Aborting.
    exit /b 1
)

REM Check for PM2
where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PM2 is required but not installed. Installing...
    npm install -g pm2
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Set environment to production
echo ⚙️ Setting up production environment...
set NODE_ENV=production

REM Update MongoDB URI for production
echo 🔑 Updating MongoDB configuration...
set /p mongodb_uri="Enter MongoDB Atlas connection string (or press Enter to use local): "
if not "%mongodb_uri%"=="" (
    powershell -Command "(Get-Content .env) -replace 'MONGODB_URI=.*', 'MONGODB_URI=%mongodb_uri%' | Set-Content .env"
)

REM Update email configuration
echo 📧 Updating email configuration...
set /p email="Enter production email address: "
set /p email_pass="Enter email app password: "
if not "%email%"=="" if not "%email_pass%"=="" (
    powershell -Command "(Get-Content .env) -replace 'SMTP_USER=.*', 'SMTP_USER=%email%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace 'SMTP_PASS=.*', 'SMTP_PASS=%email_pass%' | Set-Content .env"
)

REM Update payment gateway configuration
echo 💳 Updating payment gateway configuration...
set /p razorpay_key="Enter Razorpay Key ID: "
set /p razorpay_secret="Enter Razorpay Key Secret: "
if not "%razorpay_key%"=="" if not "%razorpay_secret%"=="" (
    powershell -Command "(Get-Content .env) -replace 'RAZORPAY_KEY_ID=.*', 'RAZORPAY_KEY_ID=%razorpay_key%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace 'RAZORPAY_KEY_SECRET=.*', 'RAZORPAY_KEY_SECRET=%razorpay_secret%' | Set-Content .env"
)

REM Update AWS configuration
echo ☁️ Updating AWS configuration...
set /p aws_key="Enter AWS Access Key ID: "
set /p aws_secret="Enter AWS Secret Access Key: "
set /p aws_region="Enter AWS Region: "
set /p aws_bucket="Enter AWS Bucket Name: "
if not "%aws_key%"=="" if not "%aws_secret%"=="" if not "%aws_region%"=="" if not "%aws_bucket%"=="" (
    powershell -Command "(Get-Content .env) -replace 'AWS_ACCESS_KEY_ID=.*', 'AWS_ACCESS_KEY_ID=%aws_key%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace 'AWS_SECRET_ACCESS_KEY=.*', 'AWS_SECRET_ACCESS_KEY=%aws_secret%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace 'AWS_REGION=.*', 'AWS_REGION=%aws_region%' | Set-Content .env"
    powershell -Command "(Get-Content .env) -replace 'AWS_BUCKET_NAME=.*', 'AWS_BUCKET_NAME=%aws_bucket%' | Set-Content .env"
)

REM Update CORS configuration
echo 🌐 Updating CORS configuration...
set /p domain="Enter production domain (e.g., https://your-domain.com): "
if not "%domain%"=="" (
    powershell -Command "(Get-Content .env) -replace 'ALLOWED_ORIGINS=.*', 'ALLOWED_ORIGINS=%domain%' | Set-Content .env"
)

REM Start the server
echo 🚀 Starting the server...
call pm2 start src/server.js --name "business-back" --time

REM Save PM2 process list
call pm2 save

echo ✅ Deployment completed successfully!
echo 📝 Server is running at http://localhost:3001
echo 📚 API documentation is available at http://localhost:3001/api-docs

pause 