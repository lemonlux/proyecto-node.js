const {
  createGenre,
  getGenreById,
  getAllGenres,
  getGenreByName,
  getGenressAtoZ,
  bookByGenre,
  updateGenre,
  deleteGenre,
  toggleAuthors,
  toggleBooks,
} = require('../controllers/Genre.controllers');
const Genre = require('../models/Genre.model');

const { isAuth, isAuthAsAdmin } = require('../../middleware/auth.middleware');

const GenreRoutes = require('express').Router();

GenreRoutes.get('/:id', getGenreById);
GenreRoutes.get('/', getAllGenres);
GenreRoutes.get('/getByType/:type', getGenreByName);
GenreRoutes.get('/sort/sortAtoZ/', getGenressAtoZ)
GenreRoutes.get('/getBooks/:id', bookByGenre)

//!--------- CON AUTH DE ADMIN---------------------
GenreRoutes.post('/', [isAuthAsAdmin], createGenre);
GenreRoutes.delete('/:id', [isAuthAsAdmin], deleteGenre);
GenreRoutes.patch('/update/:id', [isAuthAsAdmin], updateGenre);
GenreRoutes.patch('/addAuthors/:id', [isAuthAsAdmin], toggleAuthors);
GenreRoutes.patch('/addGenres/:id', [isAuthAsAdmin], toggleBooks)

module.exports = GenreRoutes;
