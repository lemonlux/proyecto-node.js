const {
  createBook,
  toggleAuthors,
  getBookById,
  getAllBooks,
  getBookByName,
  updateBooks,
  deleteBooks,
} = require('../controllers/Book.controllers');

const BookRoutes = require('express').Router();

BookRoutes.post('/', createBook);
BookRoutes.get('/:id', getBookById);
BookRoutes.get('/', getAllBooks);
BookRoutes.get('/byName/:name', getBookByName);
BookRoutes.patch('/add/:id', toggleAuthors);
BookRoutes.patch('/update/:id', updateBooks);
BookRoutes.delete('/:id', deleteBooks);

module.exports = BookRoutes;
