//!--19---- REQUERIMOS MONGOOSE Y LOS SCHEMAS

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//!--20---- CREAMOS EL ESQUEMA DE DATOS

const BookSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    published: {
      type: Number,
      required: false,
    },
    pages: {
      type: Number
    },
    genres: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre'
    },
  ],
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
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
    timestamps: true,
  }
);

//!---21---- CREAMOS EL MODELO DE DATOS Y EXPORTAMOS LA FUNCION
const Book = mongoose.model('Book', BookSchema);

module.exports = Book;

//ahora vamos a empezar con los controladores
