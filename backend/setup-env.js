const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment...');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Read current .env if exists
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file exists');
} else {
  console.log('📄 Creating .env file from .env.example...');
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created from .env.example');
  } else {
    console.log('❌ .env.example not found, creating basic .env file...');
    envContent = `# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:8081

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=car_service_station_database
DB_USER=w3-93109
DB_PASS=omkarkar

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# App Configuration
APP_NAME="Car Service Station"
APP_URL=http://localhost:5000`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Basic .env file created');
  }
}

// Check if JWT_SECRET is set
if (!envContent.includes('JWT_SECRET=')) {
  console.log('🔑 Adding JWT_SECRET to .env file...');
  fs.appendFileSync(envPath, '\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-change-in-production\nJWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production');
  console.log('✅ JWT_SECRET added');
}

// Check if it's the default secret (needs to be changed)
if (envContent.includes('your-super-secret-jwt-key-change-in-production')) {
  console.log('\n⚠️  WARNING: Using default JWT secrets!');
  console.log('   For production, please change:');
  console.log('   - JWT_SECRET');
  console.log('   - JWT_REFRESH_SECRET');
  console.log('\n   You can generate strong secrets using:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

console.log('\n✅ Environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file if needed');
console.log('2. Restart the server: npm run dev');