//! importaciones
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

//!----- FUNCIONES

//* necesitamos dos funciones -> la que genera el token y la que lo verifica

const generateToken = (id, email) => {
  //el generado lo necesitamos en la funcion del LOGIN

  if (!id || !email) {
    //tenemos que tener uno de los dos para poder generar el token
    throw new Error('Email or id are missing');
  }
  // jwt.sign({ user: user }, "secretkey", (err, token)
  // jwt.sign (payload, secretOrPrivateKey, options?)
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

//* cuando nos logamos se nos crea un token con generateToken, y tenemos que verificarlo y sacar la info - email, id

const verifyToken = (token, secretOrPublicKey) => {
  //el verificar lo necesitamos en el middleware de autenticacion

  if (!token) {
    throw new Error('Token is missing');
  }
  //jwt.verify(token, secretOrPrivateKey, options)

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
