import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { userModel } from '../models/user.model.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import 'dotenv/config';

// Extractor personalizado para leer el JWT desde la cookie httpOnly 'currentUser'
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['currentUser'];
  }
  return token;
};

const initializePassport = () => {
  // 1. ESTRATEGIA DE REGISTRO ('register')
  passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password'
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name } = req.body;

          if (!first_name || !last_name || !email || !password) {
            return done(null, false, {
              statusCode: 400,
              message: 'Faltan campos obligatorios'
            });
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return done(null, false, {
              statusCode: 400,
              message: 'Formato de email inválido'
            });
          }

          const emailNormalizado = email.trim().toLowerCase();

          const existeUsuario = await userModel.findOne({ email: emailNormalizado });
          if (existeUsuario) {
            return done(null, false, {
              statusCode: 409,
              message: 'El email ya está registrado'
            });
          }

          const newUser = await userModel.create({
            first_name,
            last_name,
            email: emailNormalizado,
            password: createHash(password),
            role: 'user'
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 2. ESTRATEGIA DE LOGIN ('login')
  passport.use(
    'login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        badRequestMessage: 'Faltan credenciales'
      },
      async (email, password, done) => {
        try {
          if (!email || !password) {
            return done(null, false, {
              statusCode: 400,
              message: 'Faltan credenciales'
            });
          }

          const user = await userModel.findOne({ email: email.trim().toLowerCase() });

          if (!user || !isValidPassword(password, user.password)) {
            return done(null, false, {
              statusCode: 401,
              message: 'Credenciales inválidas'
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 3. ESTRATEGIA DE USUARIO ACTUAL ('current')
  passport.use(
    'current',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
      },
      async (jwt_payload, done) => {
        try {
          // Devuelve el payload decodificado (id, email, role) sin password y lo asigna a req.user
          return done(null, jwt_payload);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // =========================================================================
  // ESPACIO PREPARADO PARA FUTURAS ESTRATEGIAS EXTERNAS (Google, GitHub, etc.)
  //
  // =========================================================================
};

export default initializePassport;