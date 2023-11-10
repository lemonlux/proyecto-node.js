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

const { isAuthAsAdmin } = require('../../middleware/auth.middleware');

const GenreRoutes = require('express').Router();

GenreRoutes.get('/:id', getGenreById);
GenreRoutes.get('/', getAllGenres);
GenreRoutes.get('/get/getByType', getGenreByName);
GenreRoutes.get('/sort/sortAtoZ/', getGenressAtoZ);
GenreRoutes.get('/getBooks/:id', bookByGenre);

//!--------- CON AUTH DE ADMIN---------------------
GenreRoutes.post('/', [isAuthAsAdmin], createGenre);
GenreRoutes.delete('/:id', [isAuthAsAdmin], deleteGenre);
GenreRoutes.patch('/update/:id', [isAuthAsAdmin], updateGenre);
GenreRoutes.patch('/addAuthors/:id', [isAuthAsAdmin], toggleAuthors);
GenreRoutes.patch('/addGenres/:id', [isAuthAsAdmin], toggleBooks);

module.exports = GenreRoutes;
