import { generateToken } from '../utils/jwt.js';

// REGISTRO DE USUARIO (El usuario validado y creado llega en req.user desde Passport)
export const registerUser = (req, res) => {
  const userResponse = req.user.toObject();
  delete userResponse.password;

  return res.status(201).json({
    status: 'success',
    message: 'Usuario registrado exitosamente',
    user: userResponse
  });
};

// LOGIN DE USUARIO (Passport valida credenciales; el controller genera JWT y setea la cookie)
export const loginUser = (req, res) => {
  try {
    const token = generateToken(req.user);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('currentUser', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 3600000 // Expira en 1 hora
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login correcto'
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

// RUTA PROTEGIDA (CURRENT) - req.user proviene de la estrategia 'current' de Passport
export const currentUser = (req, res) => {
  return res.status(200).json({
    status: 'success',
    payload: req.user
  });
};

// LOGOUT (Elimina la cookie; no requiere pasar por Passport)
export const logoutUser = (req, res) => {
  res.clearCookie('currentUser');
  return res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada'
  });
};