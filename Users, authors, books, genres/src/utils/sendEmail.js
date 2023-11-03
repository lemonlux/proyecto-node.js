//! primero hacemos las importaciones - necesitamos dotenv, el nodemailer y el set de state.data
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const { setSendEmail } = require('../state/state.data');

//vamos a hacer una funcion que requiere el email del user, el nombre del user y el codigo de confirmacion para enviar el email
//* esto es igual que hacerlo largo pero componetizando las funciones

const sendEmail = async (userEmail, userName, confirmationCode) => {
  setSendEmail(false); // era una funcion con parametro (data) que es boolean. lo hacemos false pq no se ha enviado

  const myEmail = process.env.EMAIL; //mis variables para poder enviar el correo
  const myPassword = process.env.PASSWORD;
  //creamos el transporter ---- metodo de nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: myEmail,
      pass: myPassword,
    },
  });
  const mailInfo = {
    from: myEmail,
    to: userEmail, //el userEmail, confirmationCode y userName estarán en la función principal (hemos hecho destructuring)
    subject: 'Confirmation code',
    text: `Hola ${userName}! Tu código de confirmación es ${confirmationCode}`,
  };

  transporter.sendMail(mailInfo, function (error, info) {
    //esta es la estructura segun la libreria
    if (error) {
      console.log(error);
      setSendEmail(false);
    } else {
      console.log(`Email sent ${info.response}`);
      setSendEmail(true);
    }
  });
};

module.exports = sendEmail;
