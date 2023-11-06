const {
  createBook,
  toggleAuthors,
  toggleGenres,
  getBookById,
  getAllBooks,
  getBookByName,
  updateBooks,
  getAuthorsByBook,
  deleteBooks,
} = require('../controllers/Book.controllers');
const { isAuth, isAuthAsAdmin } = require('../../middleware/auth.middleware')





const BookRoutes = require('express').Router();


BookRoutes.get('/:id', getBookById);
BookRoutes.get('/', getAllBooks);
BookRoutes.get('/byName/:name', getBookByName);
BookRoutes.get('/findAuthor/:id', getAuthorsByBook)

//!--------- CON AUTH DE ADMIN---------------------

BookRoutes.post('/',[isAuthAsAdmin], createBook);
BookRoutes.patch('/addAuthors/:id', [isAuthAsAdmin], toggleAuthors);
BookRoutes.patch('/addGenres/:id', [isAuthAsAdmin], toggleGenres)
BookRoutes.patch('/update/:id', [isAuthAsAdmin], updateBooks);
BookRoutes.delete('/:id', [isAuthAsAdmin], deleteBooks);

module.exports = BookRoutes;
