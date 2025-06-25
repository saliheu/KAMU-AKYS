const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate access token
const generateToken = (user) => {
  const payload = {
    sub: user.id,
    tcKimlikNo: user.tcKimlikNo,
    email: user.email,
    ad: user.ad,
    soyad: user.soyad,
    rol: user.rol,
    sessionId: crypto.randomBytes(16).toString('hex'),
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'mahkeme-randevu',
    audience: 'mahkeme-randevu-api'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Generate refresh token
const generateRefreshToken = (user) => {
  const payload = {
    sub: user.id,
    tokenId: crypto.randomBytes(16).toString('hex'),
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    algorithm: 'HS256',
    issuer: 'mahkeme-randevu',
    audience: 'mahkeme-randevu-refresh'
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

// Verify access token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mahkeme-randevu',
      audience: 'mahkeme-randevu-api'
    });

    return decoded;
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ['HS256'],
      issuer: 'mahkeme-randevu',
      audience: 'mahkeme-randevu-refresh'
    });

    return decoded;
  } catch (error) {
    logger.error('Refresh token verification failed', { error: error.message });
    return null;
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Generate temporary token (for email verification, password reset, etc.)
const generateTemporaryToken = (data, expiresIn = '1h') => {
  const payload = {
    ...data,
    tokenId: crypto.randomBytes(16).toString('hex'),
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn,
    algorithm: 'HS256',
    issuer: 'mahkeme-randevu'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Generate API key
const generateAPIKey = () => {
  const prefix = 'mrs'; // Mahkeme Randevu Sistemi
  const key = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${key}`;
};

// Hash API key for storage
const hashAPIKey = (apiKey) => {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
};

// Create secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Create OTP token
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

// Sign data with secret (for webhooks, etc.)
const signData = (data, secret = JWT_SECRET) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
};

// Verify signed data
const verifySignature = (data, signature, secret = JWT_SECRET) => {
  const message = typeof data === 'string' ? data : JSON.stringify(data);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Generate tokens for password reset
const generatePasswordResetTokens = (userId) => {
  // Public token (sent to user)
  const publicToken = generateSecureToken();
  
  // Private token (stored in database)
  const privateToken = crypto
    .createHash('sha256')
    .update(publicToken)
    .digest('hex');
  
  return {
    publicToken,
    privateToken
  };
};

// Token blacklist check (requires Redis)
const isTokenBlacklisted = async (token, cache) => {
  const blacklistKey = `token_blacklist:${token}`;
  return await cache.exists(blacklistKey);
};

// Add token to blacklist
const blacklistToken = async (token, cache, expiresIn = 86400) => {
  const blacklistKey = `token_blacklist:${token}`;
  await cache.set(blacklistKey, true, expiresIn);
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
};

// Token rotation helper
const rotateTokens = async (user, oldRefreshToken, cache) => {
  // Generate new tokens
  const newAccessToken = generateToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  // Blacklist old refresh token
  await blacklistToken(oldRefreshToken, cache);
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

// Validate token age (for extra security)
const isTokenFresh = (token, maxAgeSeconds = 300) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.payload.iat) {
    return false;
  }
  
  const tokenAge = Math.floor(Date.now() / 1000) - decoded.payload.iat;
  return tokenAge <= maxAgeSeconds;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  generateTemporaryToken,
  generateAPIKey,
  hashAPIKey,
  generateSecureToken,
  generateOTP,
  signData,
  verifySignature,
  generatePasswordResetTokens,
  isTokenBlacklisted,
  blacklistToken,
  extractTokenFromHeader,
  rotateTokens,
  isTokenFresh
};