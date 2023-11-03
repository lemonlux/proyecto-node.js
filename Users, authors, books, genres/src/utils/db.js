//!--- requerir dotenv y express

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

//!--mongo_uri

const MONGO_URI = process.env.MONGO_URI;

//!--- FUNCION CONNECT

// async function connectFunc () {

// }

const connect = async () => {
  try {
    const db = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const { name, host } = db.connection;
    console.log(
      `Conexión a la DB establecida en el puerto ${host} con el nombre ${name}✅`
    );
  } catch (error) {
    console.log('Error en la conexión con la db❌', error);
  }
};

module.exports = connect;
