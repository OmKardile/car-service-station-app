const jwt = require('jsonwebtoken');

class JWTService {
  static generateAccessToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      // Fallback for development only
      const fallbackSecret = 'development-fallback-secret-key-do-not-use-in-production';
      console.warn('⚠️ Using development fallback secret');
      return jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        fallbackSecret,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
      );
    }
    
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      secret,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
  }

  static generateRefreshToken(user) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      console.error('❌ JWT_REFRESH_SECRET is not set in environment variables');
      // Fallback for development only
      const fallbackSecret = 'development-fallback-refresh-secret-key-do-not-use-in-production';
      console.warn('⚠️ Using development fallback refresh secret');
      return jwt.sign(
        { userId: user.id },
        fallbackSecret,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
      );
    }
    
    return jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
  }

  static verifyAccessToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'development-fallback-secret-key-do-not-use-in-production';
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  }

  static verifyRefreshToken(token) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'development-fallback-refresh-secret-key-do-not-use-in-production';
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  }

  static getTokenFromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }
}

module.exports = JWTService;