//?------------------------ modelos ------------------------------


//?------------------------- utils -------------------------------

//?----------------------- middleware -----------------------------


//?------------------------ librería ------------------------------


//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------



const Author = require('./../models/Author.model');
const Book = require('../models/Book.model');

//!---------- POST ----------

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
    return (
      res.status(404).json({
        error: 'error en el catch del post',
        message: error.message,
      }) && next(error)
    ); //para mandarlo al siguiente
  }
};

//!------------------ READ ------------------

//* ---------------------- get by id ---------------------------

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

//!---------- PATCH ----------
//* ---------------------- toggle  PARA LOS AUTHORS ---------------------------

//dentro de cada book hay un array en el que se pueden meter autores ocn un toggle

const toggleAuthors = async (req, res, next) => {
  //lo vamos a localizar con un id
  const { id } = req.params;
  const { authors } = req.body; //esto crea un string separado por comas de los autores
  const bookById = await Book.findById(id);
  if (bookById) {
    const arrayIdBooks = authors.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    console.log(bookById);
    Promise.all(
      arrayIdBooks.map(async (author) => {
        if (bookById.authors.includes(author)) {
          try {
            await Book.findByIdAndUpdate(id, {
              $pull: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(id, {
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
              $push: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(id, {
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
      return res.status(404).json({
        dataUpdate: await Book.findById(id),
      });
    });
  } else {
    return res.status(404).json('este libro no existe');
  }
};

//* ---------------------- update PARA NAME, YEAR Y GENRE ---------------------------

const updateBooks = async (req, res) => {
  await Book.syncIndexes(); //syncIndexes en update y post
  try {
    const { id } = req.params;
    const bookById = await Book.findById(id);
    if (bookById) {
      const customBookBody = {
        _id: bookById._id,
        name: req.body?.name ? req.body?.name : bookById.name,
        year: req.body?.year ? req.body?.year : bookById.year,
        genre: req.body?.genre ? req.body?.genre : bookById.genre,
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

//!----- DELETE----

const deleteBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const bookToDelete = await Book.findByIdAndDelete(id);
    // se ha elimiando??
    if (bookToDelete) {
      //lo buscamos una vez borrado a ver si se ha elimnado
      const bookById = await Book.findById(id);
      try {
        const test = await Author.updateMany(
          { books: id },
          { $pull: { books: id } }
        );

        return res
          .status(bookById ? 404 : 200)
          .json({ deleteTest: bookById ? false : true });
      } catch (error) {
        return res.status(404).json({
          error: 'no se ha podido borrar',
          message: error.message,
        });
      }
    } else {
      return res.status(404).json('no se ha encontrado este libro');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch del delete',
      message: error.message,
    });
  }
};

module.exports = {
  createBook,
  toggleAuthors,
  getBookById,
  getAllBooks,
  getBookByName,
  updateBooks,
  deleteBooks,
};
