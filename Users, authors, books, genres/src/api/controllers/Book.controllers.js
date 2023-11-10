//?------------------------ modelos ------------------------------
const User = require('../models/User.models');
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const Genre = require('../models/Genre.model');
const Review = require('../models/Review.model');

//?------------------------- utils -------------------------------

//?----------------------- middleware -----------------------------

//?------------------------ librería ------------------------------

//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------

const setError = require('../../helpers/handleError');

//*-------------------------------- POST ------------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- CREATE ----------------------------------------
//?---------------------------------------------------------------------------------

const createBook = async (req, res, next) => {
  try {
    await Book.syncIndexes();
    console.log(req.body);
    const newBook = new Book(req.body); //nuevo modelo -- nueva instancia
    const savedBook = await newBook.save();

    return res
      .status(savedBook ? 200 : 404)
      .json(savedBook ? savedBook : 'error al postear');
  } catch (error) {
    return next(setError(500, error.message || 'Error to create'));
  }
};

//*------------------------------ READ ------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- GET BY ----------------------------------------
//?---------------------------------------------------------------------------------

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookById = await Book.findById(id);
    if (bookById) {
      return res.status(200).json(bookById);
    } else {
      return res.status(404).json('no se ha encontrado este libro por id');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch de get by id',
      message: error.message,
    });
  }
};

//* ---------------------- get all ---------------------------

const getAllBooks = async (req, res) => {
  try {
    const allBooks = await Book.find();
    if (allBooks.length > 0) {
      return res.status(200).json(allBooks);
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch del get all',
      message: error.message,
    });
  }
};

//* ---------------------- get by name ---------------------------

const getBookByName = async (req, res) => {
  try {
    const { name } = req.params;
    const bookByName = await Book.find({ name }); //el metodo find es con OBJETO
    if (bookByName) {
      return res.status(200).json(bookByName);
    } else {
      return res.status(404).json('no se ha encontrado el libro');
    }
  } catch (error) {
    return res.status(200).json({
      error: 'error en el catch de la busqueda por nombre',
      message: error.message,
    });
  }
};

//?---------------------------------------------------------------------------------
//! -------------------------- GET AUTHORS BY BOOK ---------------------------------
//?---------------------------------------------------------------------------------

const getAuthorsByBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookById = await Book.findById(id);

    if (!bookById) {
      return res.status(404).json('Book not found');
    }

    const authorIds = bookById.authors;
    console.log(authorIds);
    const authors = [];

    for (let id of authorIds) {
      const author = await Author.findById(id);

      if (!author) {
        return res.status(404).json('author not found');
      }

      authors.push(author);
    }

    if (authors.length > 0) {
      return res.status(200).json(authors);
    } else {
      return res.status(404).json('authors not found');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error finding authors'));
  }
};

//?---------------------------------------------------------------------------------
//! --------------------- SORT BY PAGES: SHORTEST TO LONGEST -----------------------
//?---------------------------------------------------------------------------------

const getBookByPages = async (req, res, next) => {
  try {
    const allBooks = await Book.find();

    if (allBooks.length > 0) {
      allBooks.sort((a, b) => a.pages - b.pages);
      console.log(allBooks);

      return res.status(200).json({
        allBooks,
      });
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};

//?---------------------------------------------------------------------------------
//! ---------------------- SORT BY DATE: NEWEST TO OLDEST --------------------------
//?---------------------------------------------------------------------------------

const getBooksByDate = async (req, res, next) => {
  try {
    const allBooks = await Book.find();
    if (allBooks.length > 0) {
      allBooks.sort((a, b) => b.published - a.published);
      console.log(allBooks);

      return res.status(200).json({
        allBooks,
      });
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};
//?---------------------------------------------------------------------------------
//! ------------------------------- SORT BY A-Z ------------------------------------
//?---------------------------------------------------------------------------------

const getBooksAtoZ = async (req, res, next) => {
  try {
    const allBooks = await Book.find();
    if (allBooks.length > 0) {
      allBooks.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
      console.log(allBooks);

      return res.status(200).json({
        allBooks,
      });
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};

//?---------------------------------------------------------------------------------
//! --------------------------- SORT BY MOST LIKED ---------------------------------
//?---------------------------------------------------------------------------------

const getBooksMoreLiked = async (req, res, next) => {
  try {
    const allBooks = await Book.find();
    if (allBooks.length > 0) {
      allBooks.sort((a, b) => b.likes.length - a.likes.length);

      console.log(allBooks);

      return res.status(200).json({
        allBooks,
      });
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};

//*    ----------------------------------------------------------------------------------
//todo ------------------------------- CON AUTH -----------------------------------------
//todo -------------------------------DE ADMIN  -----------------------------------------
//*    ----------------------------------------------------------------------------------

//*-------------------------------- PATCH -----------------------------------------

//?---------------------------------------------------------------------------------
//! --------------------------- TOGGLE AUTORES -------------------------------------
//?-------------------------------- update -----------------------------------------

//dentro de cada book hay un array en el que se pueden meter autores ocn un toggle

const toggleAuthors = async (req, res, next) => {
  //lo vamos a localizar con un id
  const { id } = req.params; // BOOK
  const { authors } = req.body; //esto crea un string separado por comas de los autores
  const bookById = await Book.findById(id);
  if (bookById) {
    const arrayIdAuthors = authors.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    // console.log(bookById);
    Promise.all(
      arrayIdAuthors.map(async (author) => {
        console.log(author);
        if (bookById.authors.includes(author)) {
          try {
            await Book.findByIdAndUpdate(id, {
              $pull: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(author, {
                $pull: { books: id },
              });
            } catch (error) {
              return (
                res.status(404).json({
                  error: 'error al actualizar el escritor',
                  message: error.message,
                }) && next(error)
              );
            }
          } catch (error) {
            return (
              res.status(404).json({
                error: 'error al actualizar el libro',
                message: error.message,
              }) && next(error)
            );
          }
        } else {
          try {
            await Book.findByIdAndUpdate(id, {
              $push: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(author, {
                $push: { books: id },
              });
            } catch (error) {
              return (
                res.status(404).json({
                  error: 'error al actualizar el escritor',
                  message: error.message,
                }) && next(error)
              );
            }
          } catch (error) {
            return (
              res.status(404).json({
                error: 'error al actualizar el libro',
                message: error.message,
              }) && next(error)
            );
          }
        }
      })
    ).then(async () => {
      return res.status(200).json({
        dataUpdate: await Book.findById(id).populate('authors'),
      });
    });
  } else {
    return res.status(404).json('este libro no existe');
  }
};

//?---------------------------------------------------------------------------------
//! --------------------------- TOGGLE GENRES -------------------------------------
//?-------------------------------- update -----------------------------------------

const toggleGenres = async (req, res, next) => {
  //lo vamos a localizar con un id
  const { id } = req.params; // BOOK
  const { genres } = req.body; //esto crea un string separado por comas de los autores
  const bookById = await Book.findById(id);
  if (bookById) {
    const arrayIdGenres = genres.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    // console.log(bookById);
    Promise.all(
      arrayIdGenres.map(async (genre) => {
        console.log(genre);
        if (bookById.genres.includes(genre)) {
          try {
            await Book.findByIdAndUpdate(id, {
              $pull: { genres: genre },
            });
            try {
              await Genre.findByIdAndUpdate(genre, {
                $pull: { books: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error al actualizar el escritor',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error al actualizar el libro',
              message: error.message,
            }) && next(error);
          }
        } else {
          try {
            await Book.findByIdAndUpdate(id, {
              $push: { genres: genre },
            });
            try {
              await Genre.findByIdAndUpdate(genre, {
                $push: { books: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error al actualizar el escritor',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error al actualizar el libro',
              message: error.message,
            }) && next(error);
          }
        }
      })
    ).then(async () => {
      return res.status(200).json({
        dataUpdate: await Book.findById(id).populate('genres'),
      });
    });
  } else {
    return res.status(404).json('este libro no existe');
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- UPDATE -----------------------------------------
//?--------------------------- name, year y genre ----------------------------------

const updateBooks = async (req, res) => {
  await Book.syncIndexes(); //syncIndexes en update y post
  try {
    const { id } = req.params;
    const bookById = await Book.findById(id);
    if (bookById) {
      const customBookBody = {
        _id: bookById._id,
        name: req.body?.name ? req.body?.name : bookById.name,
        published: req.body?.published
          ? req.body?.published
          : bookById.published,
        genres: bookById.genres,
        authors: bookById.authors,
        likes: bookById.likes,
        readings: bookById.readings,
        reviews: bookById.reviews,
      };
      try {
        await Book.findByIdAndUpdate(id, customBookBody);
        const newBookUpdate = await Book.findById(id);

        //todo -------TESTING---------
        const bookUpdate = Object.keys(req.body);
        console.log(bookUpdate);

        let test = {};
        let acc = 0;

        bookUpdate.forEach((item) => {
          console.log(req.body[item]);
          console.log(newBookUpdate[item]);
          req.body[item] === newBookUpdate[item]
            ? (test[item] = true)
            : (test[item] = false);
        });

        for (let key in test) {
          test[key] == false && acc++;
        }

        if (acc > 0) {
          return res.status(404).json({
            dataTest: test,
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: test,
            update: true,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch actualizando el book',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch del update',
      message: error.message,
    });
  }
};

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------

const deleteBooks = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);

    try {
      await Author.updateMany({ books: id }, { $pull: { books: id } });
      try {
        await Genre.updateMany({ books: id }, { $pull: { books: id } });
        try {
          await User.updateMany({ favBooks: id }, { $pull: { favBooks: id } });

          try {
            await User.updateMany(
              { readBooks: id },
              { $pull: { readBooks: id } }
            );

            try {
              await Review.updateMany({ books: id }, { $pull: { books: id } });

              const bookDeleted = await Book.findById(id);
              return res
                .status(bookDeleted ? 404 : 200)
                .json(
                  bookDeleted
                    ? 'error deleting book'
                    : 'this book no longer exists'
                );
            } catch (error) {
              return res.status(404).json({
                error: 'error catch updating reviews',
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: 'error catch updating user',
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error catch updating user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error catch updating genres',
          message: error.message,
        });
      }
    } catch (error) {
      return res.status(404).json({
        error: 'error catch updating author',
        message: error.message,
      });
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to delete'));
  }
};

module.exports = {
  createBook,
  toggleAuthors,
  toggleGenres,
  getBookById,
  getAllBooks,
  getBookByName,
  getAuthorsByBook,
  getBookByPages,
  getBooksByDate,
  getBooksAtoZ,
  getBooksMoreLiked,
  updateBooks,
  deleteBooks,
};
