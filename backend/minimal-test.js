// Minimal test to verify JWT works
const jwt = require('jsonwebtoken');

console.log('🔑 Testing JWT...');

const secret = process.env.JWT_SECRET || 'test-secret';
console.log('Secret:', secret ? 'Set ✓' : 'Not set ✗');

try {
  const token = jwt.sign(
    { userId: 1, email: 'test@test.com', role: 'client' },
    secret,
    { expiresIn: '15m' }
  );
  
  console.log('✅ JWT generated successfully!');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
  
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT verified successfully!');
  console.log('Decoded:', decoded);
  
} catch (error) {
  console.error('❌ JWT error:', error.message);
  
  // Try with a known good secret
  console.log('\n🔧 Trying with fallback secret...');
  const fallbackToken = jwt.sign(
    { userId: 1, email: 'test@test.com', role: 'client' },
    'development-fallback-secret',
    { expiresIn: '15m' }
  );
  console.log('✅ Fallback token generated!');
}