//!--15---- REQUERIMOS MONGOOSE Y LOS SCHEMAS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//!--16---- CREAMOS EL ESQUEMA DE DATOS

const AuthorSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: false,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    secondLastName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      required: false,
      enum: ['hombre', 'mujer', 'no binario'],
    },
    yearBorn: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      default: false,
    },
    language: {
      type: String,
      enum: ['español', 'inglés', 'francés', 'alemán', 'italiano', 'portugués'],
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    //esto es para guardar las fechas de creación y actualización de documentos
    timestamps: true,
  }
);

//!--17 --- CREAMOS EL MODELO DE DATOS

const Author = mongoose.model('Author', AuthorSchema);

//!--18 --- EXPORTAMOS LA FUNCION PARA QUE LA UTILICEN LOS CONTROLADORES--
// hacemos lo mismo con los book models

module.exports = Author;
