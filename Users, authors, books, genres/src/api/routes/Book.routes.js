const {
  createBook,
  toggleAuthors,
  toggleGenres,
  getBookById,
  getAllBooks,
  getBookByName,
  updateBooks,
  getAuthorsByBook,
  getBookByPages,
  getBooksByDate,
  getBooksAtoZ,
  getBooksMoreLiked,
  deleteBooks,
} = require('../controllers/Book.controllers');
const { isAuth, isAuthAsAdmin } = require('../../middleware/auth.middleware')





const BookRoutes = require('express').Router();


BookRoutes.get('/:id', getBookById);
BookRoutes.get('/', getAllBooks);
BookRoutes.get('/byName/:name', getBookByName);
BookRoutes.get('/findAuthor/:id', getAuthorsByBook)
BookRoutes.get('/sort/sortByLength/', getBookByPages)
BookRoutes.get('/sort/sortByDate/', getBooksByDate)
BookRoutes.get('/sort/sortAtoZ/', getBooksAtoZ)
BookRoutes.get('/sort/mostLiked/', getBooksMoreLiked)

//!--------- CON AUTH DE ADMIN---------------------

BookRoutes.post('/',[isAuthAsAdmin], createBook);
BookRoutes.patch('/addAuthors/:id', [isAuthAsAdmin], toggleAuthors);
BookRoutes.patch('/addGenres/:id', [isAuthAsAdmin], toggleGenres)
BookRoutes.patch('/update/:id', [isAuthAsAdmin], updateBooks);
BookRoutes.delete('/:id', [isAuthAsAdmin], deleteBooks);

module.exports = BookRoutes;
