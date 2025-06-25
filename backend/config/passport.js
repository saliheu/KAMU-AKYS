const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const { query } = require('./database');
const logger = require('../utils/logger');

// JWT Strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
  algorithms: ['HS256'],
  passReqToCallback: true
};

// JWT Strategy
passport.use('jwt', new JwtStrategy(jwtOptions, async (req, payload, done) => {
  try {
    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return done(null, false, { message: 'Token süresi dolmuş' });
    }

    // Find user by ID
    const result = await query(
      'SELECT id, tc_kimlik_no, email, ad, soyad, rol, aktif FROM kullanicilar WHERE id = $1',
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return done(null, false, { message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.aktif) {
      return done(null, false, { message: 'Kullanıcı hesabı aktif değil' });
    }

    // Add user to request
    done(null, user);
  } catch (error) {
    logger.error('JWT doğrulama hatası:', error);
    done(error, false);
  }
}));

// Local Strategy for TC Kimlik No login
passport.use('local-tc', new LocalStrategy({
  usernameField: 'tcKimlikNo',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, tcKimlikNo, password, done) => {
  try {
    // Validate TC Kimlik No format
    if (!/^\d{11}$/.test(tcKimlikNo)) {
      return done(null, false, { message: 'Geçersiz TC Kimlik Numarası' });
    }

    // Find user by TC Kimlik No
    const result = await query(
      'SELECT id, tc_kimlik_no, email, ad, soyad, rol, sifre_hash, aktif FROM kullanicilar WHERE tc_kimlik_no = $1',
      [tcKimlikNo]
    );

    if (result.rows.length === 0) {
      return done(null, false, { message: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.aktif) {
      return done(null, false, { message: 'Kullanıcı hesabı aktif değil' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.sifre_hash);
    if (!isValidPassword) {
      // Log failed attempt
      await query(
        'INSERT INTO giris_denemeleri (kullanici_id, ip_adresi, basarili) VALUES ($1, $2, $3)',
        [user.id, req.ip, false]
      );
      return done(null, false, { message: 'Hatalı şifre' });
    }

    // Log successful login
    await query(
      'INSERT INTO giris_denemeleri (kullanici_id, ip_adresi, basarili) VALUES ($1, $2, $3)',
      [user.id, req.ip, true]
    );

    // Update last login
    await query(
      'UPDATE kullanicilar SET son_giris = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Remove password hash from user object
    delete user.sifre_hash;

    done(null, user);
  } catch (error) {
    logger.error('Local authentication hatası:', error);
    done(error, false);
  }
}));

// E-Devlet Strategy (Mock for development, replace with actual integration)
passport.use('e-devlet', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
  secretOrKey: process.env.EDEVLET_SECRET || 'e-devlet-secret',
  algorithms: ['RS256'],
  passReqToCallback: true
}, async (req, payload, done) => {
  try {
    // Validate E-Devlet token with actual E-Devlet service
    // This is a mock implementation
    if (!payload.tckn || !payload.ad || !payload.soyad) {
      return done(null, false, { message: 'Geçersiz E-Devlet token' });
    }

    // Check if user exists
    let result = await query(
      'SELECT id, tc_kimlik_no, email, ad, soyad, rol, aktif FROM kullanicilar WHERE tc_kimlik_no = $1',
      [payload.tckn]
    );

    let user;
    
    if (result.rows.length === 0) {
      // Create new user from E-Devlet data
      const insertResult = await query(
        `INSERT INTO kullanicilar (tc_kimlik_no, ad, soyad, email, rol, aktif, e_devlet_dogrulama) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, tc_kimlik_no, email, ad, soyad, rol, aktif`,
        [payload.tckn, payload.ad, payload.soyad, payload.email || null, 'vatandas', true, true]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
      
      // Update E-Devlet verification status
      await query(
        'UPDATE kullanicilar SET e_devlet_dogrulama = true WHERE id = $1',
        [user.id]
      );
    }

    done(null, user);
  } catch (error) {
    logger.error('E-Devlet authentication hatası:', error);
    done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await query(
      'SELECT id, tc_kimlik_no, email, ad, soyad, rol, aktif FROM kullanicilar WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return done(null, false);
    }
    
    done(null, result.rows[0]);
  } catch (error) {
    done(error, false);
  }
});

// Role-based access control middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    if (roles.length && !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    next();
  };
};

module.exports = {
  passport,
  authorize
};