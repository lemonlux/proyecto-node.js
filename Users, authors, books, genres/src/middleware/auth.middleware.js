//vamos a crear otro middleware para comprobar que el usuario que entra a las rutas autenticadas está autorizado

//el metodo que utiliza para ello es un token generado por la librería jsonwebtoken --> creamos token en utils

//!- importaciones

const { Error } = require('mongoose');
const User = require('../api/models/User.models');
const dotenv = require('dotenv');
dotenv.config();
const { verifyToken } = require('../utils/token');

//?---------------------------------------------------------------------------------
//! --------------------------- USER IS AUTHORIZED? --------------------------------
//?---------------------------------------------------------------------------------

const isAuth = async (req, res, next) => {
  /* cada user tiene un token y se envia por los HEADERS de la peticion, como BEARER TOKEN (se pone asi automaticamente)
hay que remplazar esta palabra Bearer por un espacio vacío para que JSON WEB TOKEN me lo reconozca */
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    //si no tengo token hay un error y lo voy a mandar del middleware al user
    return next(new Error('Unauthorized'));
  }

  try {
    //si no hay token -- unauthorized. si sí hay --- se verifica
    // podriamos hacer jwt.verify(token, jwt_secret)

    const decoded = verifyToken(token, process.env.JWT_SECRET);
    // el decoded nos da { id, email } porque al generar el token (en la funcion generateToken) damos id y email

    req.user = await User.findById(decoded.id); //esto es id y no _id pq viene asi del token!!
    //! --- ???? no entiendo el req.user
    next();
  } catch (error) {
    return next(error);
  }
};

const isAuthAsAdmin = async (req, res, next) => {
  //necesitamos el token de igual manera
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    //si no tengo token hay un error y lo voy a mandar del middleware al user
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (req.user.rol !== 'admin') {
      return next(new Error('Not admin, unauthorized'));
    }

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { isAuth, isAuthAsAdmin };
