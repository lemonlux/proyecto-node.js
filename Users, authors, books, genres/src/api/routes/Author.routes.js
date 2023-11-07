//!----25----- REQUERIMOS UPLOAD DEL MIDDLEWARE Y LAS FUNCIONES DE LOS CONTROLADORES
const { upload } = require('../../middleware/files.middleware');
const {
  create,
  getById,
  getAll,
  getByName,
  getAuthorsAtoZ,
  deleteAuthor,
  bookPublished,
  update,
  toggleBooks,
  toggleGenres,
  getAuthorsByLanguage,
} = require('../controllers/Author.controllers');
const Author = require('../models/Author.model');
const { isAuth, isAuthAsAdmin } = require('../../middleware/auth.middleware')

// en medio de la ruta y de la funcion que es el controlador que se llama create
//  esta el middleware de subida de ficheros a cloudinary----> upload
// Upload tiene un metodo llamado single para subir una imagen en concreto
// y lo va a subir con la clave image

//!--26---- REQUERIMOS EXPRESS ROUTER()

const AuthorRoutes = require('express').Router();

//!--27----- ESTABLECEMOS LAS RUTAS  (ruta, middleware de subida, función del controlador)

AuthorRoutes.get('/:id', getById);
AuthorRoutes.get('/', getAll);
AuthorRoutes.get('/byName/:name', getByName);
AuthorRoutes.get('/sort/sortAtoZ/', getAuthorsAtoZ)
AuthorRoutes.get('/publishedBooks/:id', bookPublished)
AuthorRoutes.get('/sort/sortByGenre/', getAuthorsByLanguage)


//!--------- CON AUTH DE ADMIN---------------------

AuthorRoutes.post('/', [isAuthAsAdmin], upload.single('image'), create);
AuthorRoutes.patch('/:id', [isAuthAsAdmin], upload.single('image'), update);
AuthorRoutes.delete('/:id', [isAuthAsAdmin], deleteAuthor);
AuthorRoutes.patch('/addBooks/:id', [isAuthAsAdmin], toggleBooks)
AuthorRoutes.patch('/addGenres/:id', [isAuthAsAdmin], toggleGenres)

//!--28---- EXPORTAMOS LA FUNCION y la llevamos al index, debajo de las limitaciones del json

module.exports = AuthorRoutes;
