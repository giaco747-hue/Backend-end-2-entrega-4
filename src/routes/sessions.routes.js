import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  currentUser,
  logoutUser
} from '../controllers/sessions.controller.js';

const router = Router();

// Registro delegando validación y creación en la estrategia 'register'
router.post('/register', (req, res, next) => {
  passport.authenticate('register', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Error en registro:', err);
      return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
    if (!user) {
      const statusCode = info?.statusCode || 400;
      const message =
        info?.message === 'Missing credentials'
          ? 'Faltan campos obligatorios'
          : info?.message || 'Error en el registro';
      return res.status(statusCode).json({ status: 'error', message });
    }
    req.user = user;
    return registerUser(req, res, next);
  })(req, res, next);
});

// Login delegando validación de credenciales en la estrategia 'login'
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
    if (!user) {
      const statusCode =
        info?.message === 'Faltan credenciales' ? 400 : info?.statusCode || 401;
      const message = info?.message || 'Credenciales inválidas';
      return res.status(statusCode).json({ status: 'error', message });
    }
    req.user = user;
    return loginUser(req, res, next);
  })(req, res, next);
});

// Ruta protegida delegando extracción y verificación de JWT en la estrategia 'current'
router.get('/current', (req, res, next) => {
  passport.authenticate('current', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ status: 'error', message: 'No autenticado' });
    }
    req.user = user;
    return currentUser(req, res, next);
  })(req, res, next);
});

// Logout directo sin Passport
router.post('/logout', logoutUser);

export default router;