const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'Poesía',
        'Teatro',
        'Cuento',
        'Novela ciencia ficción',
        'Novela romántica',
        'Novela policíaca',
        'Novela fantasía',
        'Novela intimista',
        'Novela ilustrada',
        'Novela histórica',
        'Ensayo',
        'Biografía',
        'Ciencia/Divulgación',
        'Cómic'
      ],
    },
    books: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
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

const Genre = mongoose.model('Genre', GenreSchema);

module.exports = Genre;
