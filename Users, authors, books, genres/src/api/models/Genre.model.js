const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    genre: {
      type: String,
      enum: [
        'Narrativo',
        'Didáctico',
        'Dramático/Teatral',
        'Lírico',
        'Poético',
      ],
      required: true,
    },
    subgenre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
      },
    ],
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
