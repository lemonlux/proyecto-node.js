//!--22----- IMPORTAMOS LA FUNCION deleteImgCloudinary Y LA FUNCION CORRESPONDIENTE DE LOS MODALES

//?------------------------ modelos ------------------------------
const User = require('../models/User.models');
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const Genre = require('../models/Genre.model');

//?------------------------- utils -------------------------------
const { validEnumGender, validEnumLanguage } = require('../../utils/validEnum');
const normalizeFunction = require('../../utils/normalize');

//?----------------------- middleware -----------------------------
const { deleteImgCloudinary } = require('../../middleware/files.middleware');

//?------------------------ librería ------------------------------

//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------

const setError = require('../../helpers/handleError');

//?---------------------------------------------------------------------------------
//! --23----------------------------- CREATE ----------------------------------------
//?---------------------------------------------------------------------------------

const create = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    // actualizamos los indexes, que se forman cuando una parte del objeto es unique
    //se puede modificar el modelo después de la creación del controlador
    await Author.syncIndexes();
    const newAuthor = new Author(req.body);
    if (req.file) {
      //si esto existe
      newAuthor.image = catchImg;
    } else {
      newAuthor.image =
        'https://res.cloudinary.com/daxddugwt/image/upload/v1698162119/5770f01a32c3c53e90ecda61483ccb08_xabcjt.jpg';
    }

    const saveAuthor = await newAuthor.save();

    if (saveAuthor) {
      //si se ha guardado
      return res.status(200).json(newAuthor);
    } else {
      return res.status(404).json('no se ha guardado el nuevo autos');
    }
  } catch (error) {
    // si hay un error, hay que borrar la imagen en el cloudinary
    req.file?.path && deleteImgCloudinary(catchImg);
    return next(setError(500, error.message || 'Error general to create'));
  }
};
//*---------------------------------- read ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- GET BY ----------------------------------------
//?---------------------------------------------------------------------------------

//* ---------------------- get by id ---------------------------

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const authorById = await Author.findById(id);

    if (authorById) {
      return res.status(200).json(authorById);
    } else {
      return res.status(404).json('no se ha encontrado este autor');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en la busqueda por id',
      message: error.message,
    });
  }
};

//* ------------------------- get all ---------------------------

const getAll = async (req, res) => {
  try {
    const allAuthors = await Author.find();
    //el find nos devuelve un array
    if (allAuthors.length > 0) {
      return res.status(200).json(allAuthors);
    } else {
      return res.status(404).json('no se han encontrado autores');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch del get all',
      message: error.message,
    });
  }
};

//* ------------------------- get by name ---------------------------

const getByName = async (req, res) => {
  try {
    const { name } = req.params;
    // console.log(name)
    const authorsByName = await Author.find({ name });
    console.log(authorsByName);
    // en el find({name}) el name coincide en clave y valor y por eso solo ponemos name, y no name[name]
    // nos devuelve un array
    if (authorsByName.length > 0) {
      return res.status(200).json(authorsByName);
    } else {
      return res
        .status(404)
        .json('no se ha encontrado a este autor por nombre');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en la busqueda por nombre',
      message: error.message,
    });
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- SORT BY A-Z ------------------------------------
//?---------------------------------------------------------------------------------

const getAuthorsAtoZ = async (req, res, next) => {
  try {
    const allAuthors = await Author.find();
    if (allAuthors.length > 0) {
      allAuthors.sort((a, b) => {
        if (a.lastName > b.lastName) {
          return 1;
        }
        if (a.lastName < b.lastName) {
          return -1;
        }
        return 0;
      });
      console.log(allAuthors);

      return res.status(200).json({
        allAuthors,
      });
    } else {
      return res.status(404).json('no se han encontrado libros');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- SORT BY LANGUAGE ---------------------------------
//?-----------------------------------------------------------------------------------

const getAuthorsByLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;
    const validLanguage = normalizeFunction(
      language.trim().toLowerCase().toString()
    );

    const allAuthors = await Author.find();
    const languageOk = validEnumLanguage(validLanguage);
    console.log(languageOk);
    if (languageOk) {
      let arrAuthors = [];
      Promise.all(
        allAuthors.map(async (author) => {
          const authorValidLanguage = normalizeFunction(author.language);
          // if (authorValidLanguage.startsWith(validLanguage)) {
          if (authorValidLanguage === validLanguage) {
            arrAuthors.push(author);
            console.log(author);
          }
        })
      ).then(async () => {
        if (arrAuthors.length > 0) {
          arrAuthors.sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            return 0;
          });
        }
        console.log(arrAuthors);
        return res.status(200).json(arrAuthors);
      });
    } else {
      return res.status(404).json('error en la busqueda');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to find'));
  }
};

//?---------------------------------------------------------------------------------
//! -------------------------------- SEARCH BY NAME ---------------------------------
//?-----------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! --------------------------- GET PUBLISHED BOOKS --------------------------------
//?---------------------------------------------------------------------------------

const bookPublished = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    if (author) {
      let publishedArr = [];
      const booksPublished = author.books;

      Promise.all(
        booksPublished.map(async (booksId) => {
          console.log('entro');
          try {
            const book = await Book.findById(booksId);
            publishedArr.push(book);
          } catch (error) {
            return res.status(404).json('no se ha encontrado');
          }
        })
      ).then(async () => {
        return res.status(200).json(publishedArr);
      });
    } else {
      return res.status(404).json('author not found');
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error finding published books')
    );
  }
};

//*    ----------------------------------------------------------------------------------
//todo ------------------------------- CON AUTH -----------------------------------------
//todo -------------------------------DE ADMIN  -----------------------------------------
//*    ----------------------------------------------------------------------------------

//*--------------------------------- PATCH ---------------------------------

//?---------------------------------------------------------------------------------
//! ---------------------------- GENERAL UPDATE ------------------------------------
//?---------------------------------------------------------------------------------

const update = async (req, res, next) => {
  await Author.syncIndexes();
  //siempre sincronizamos indices
  let catchImg = req.file?.path;
  try {
    //igual que en get by id porque queremos apuntar al objeto
    const { id } = req.params; //hacemos la const del id y lo buscamos con findById
    const authorById = await Author.findById(id);
    //si ese autor existiese
    if (authorById) {
      //guardamos la imagen antigua
      const oldImg = authorById.image;

      const customBody = {
        _id: authorById._id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : authorById.name,
        lastName: req.body?.lastName ? req.body?.lastName : authorById.lastName,
        secondLastName: req.body?.secondLastName
          ? req.body?.secondLastName
          : authorById.secondLastName,
        yearBorn: req.body?.yearBorn ? req.body?.yearBorn : authorById.yearBorn,
        books: authorById.books,
        genres: authorById.genres,
        likes: authorById.likes,
      };

      if (req.body?.gender) {
        const genderValid = validEnumGender(req.body?.gender);
        customBody.gender = genderValid ? req.body?.gender : authorById.gender;
      }

      if (req.body?.language) {
        const languageValid = validEnumLanguage(req.body?.language);
        customBody.language = languageValid
          ? req.body?.language
          : authorById.language;
      }

      try {
        await Author.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }
        //todo----- VAMOS A HACER EL TESTING -------

        const authorByIdUpdate = await Author.findById(id);
        const elementUpdate = Object.keys(req.body);

        let test = {};
        //si el elemento existe
        elementUpdate.forEach((item) => {
          if (req.body[item] === authorByIdUpdate[item]) {
            if (req.body[item] != authorById[item]) {
              //si no es la misma que la antigua
              test[item] = true;
            } else {
              test[item] = 'same old info';
            }
          } else {
            test[item] = false;
          }
        });
        //si la imagen existe, añade al objeto del test
        if (catchImg) {
          authorByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }
        // si hay un false en algunos de esos test vamos a localizar el error

        let acc = 0;
        for (let clave in test) {
          test[clave] == false && acc++;
        }
        if (acc > 0) {
          return res.status(404).json({
            authorByIdUpdate,
            update: test,
          });
        } else {
          return res.status(200).json({
            authorByIdUpdate,
            update: test,
          });
        }
      } catch (error) {
        res.status(404).json({
          error: 'no se ha encontrado el character',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'General error to update'));
  }
};

//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE BOOKS --------------------------------------
//?-------------------------------- update -----------------------------------------

const toggleBooks = async (req, res, next) => {
  const { id } = req.params; // id del autor
  const { books } = req.body; //esto crea un string separado por comas de los books
  const authorById = await Author.findById(id);
  if (authorById) {
    const arrayIdBooks = books.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    Promise.all(
      arrayIdBooks.map(async (book) => {
        if (authorById.books.includes(book)) {
          try {
            await Author.findByIdAndUpdate(id, {
              $pull: { books: book },
            });
            try {
              await Book.findByIdAndUpdate(book, {
                $pull: { authors: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error al actualizar el libro',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error al actualizar el autor',
              message: error.message,
            }) && next(error);
          }
        } else {
          try {
            await Author.findByIdAndUpdate(id, {
              $push: { books: book },
            });
            try {
              await Book.findByIdAndUpdate(book, {
                $push: { authors: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error al actualizar el libro',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error al actualizar el autor',
              message: error.message,
            }) && next(error);
          }
        }
      })
    ).then(async () => {
      return res.status(200).json({
        dataUpdate: await Author.findById(id).populate('books'),
      });
    });
  } else {
    return res.status(404).json('author not found');
  }
};

//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE GENRES -------------------------------------
//?-------------------------------- update -----------------------------------------

const toggleGenres = async (req, res, next) => {
  const { id } = req.params; // id del autor
  const { genres } = req.body; //esto crea un string separado por comas de los books
  const authorById = await Author.findById(id);
  if (authorById) {
    const arrayIdGenres = genres.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    Promise.all(
      arrayIdGenres.map(async (genre) => {
        if (authorById.genres.includes(genre)) {
          try {
            await Author.findByIdAndUpdate(id, {
              $pull: { genres: genre },
            });
            try {
              await Genre.findByIdAndUpdate(genre, {
                $pull: { authors: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error updating genre',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error updating author',
              message: error.message,
            }) && next(error);
          }
        } else {
          try {
            await Author.findByIdAndUpdate(id, {
              $push: { genres: genre },
            });
            try {
              await Genre.findByIdAndUpdate(genre, {
                $push: { genres: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error updating genre',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error updating author',
              message: error.message,
            }) && next(error);
          }
        }
      })
    ).then(async () => {
      return res.status(200).json({
        dataUpdate: await Author.findById(id).populate('genres'),
      });
    });
  } else {
    return res.status(404).json('author not found');
  }
};

//*------------------------------- delete ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------
const deleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Author.findByIdAndDelete(id);

    try {
      await Book.updateMany({ authors: id }, { $pull: { authors: id } });
      try {
        await Genre.updateMany({ books: id }, { $pull: { books: id } });
        try {
          await User.updateMany(
            { favAuthors: id },
            { $pull: { favAuthors: id } }
          );

          const authorDeleted = await Author.findById(id);
          return res
            .status(authorDeleted ? 404 : 200)
            .json(
              authorDeleted
                ? 'error deleting author'
                : 'this author no longer exists'
            );
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
        error: 'error catch updating book',
        message: error.message,
      });
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to delete'));
  }
};

//!---24----- EXPORTAMOS LA FUNCION ENTRE {} (VA A HABER MAS) Y LA IMPORTAMOS EN RUTAS
module.exports = {
  create,
  getById,
  getAll,
  getByName,
  getAuthorsAtoZ,
  bookPublished,
  update,
  toggleBooks,
  toggleGenres,
  getAuthorsByLanguage,
  deleteAuthor,
};
