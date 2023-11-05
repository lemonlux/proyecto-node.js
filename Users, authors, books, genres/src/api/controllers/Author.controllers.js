//!--22----- IMPORTAMOS LA FUNCION deleteImgCloudinary Y LA FUNCION CORRESPONDIENTE DE LOS MODALES

//?------------------------ modelos ------------------------------
const Author = require('../models/Author.model');
const Book = require('../models/Book.model');

//?------------------------- utils -------------------------------
const { validEnumGender, validEnumLanguage } = require('../../utils/validEnum')

//?----------------------- middleware -----------------------------
const { deleteImgCloudinary } = require('../../middleware/files.middleware');

//?------------------------ librería ------------------------------


//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------





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
    next(error); // pasa el error al siguiente controlador o middleware
    return res.status(404).json({
      error: 'no se ha podido crear el elemento',
      message: error.message,
    });
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

//*--------------------------------- PATCH ---------------------------------


//?---------------------------------------------------------------------------------
//! ---------------------------- GENERAL UPDATE ------------------------------------
//?---------------------------------------------------------------------------------

const update = async (req, res) => {
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
        yearBorn: req.body?.yearBorn ? req.body?.yearBorn : authorById.yearBorn
      };

      if (req.body?.gender){
        const genderValid = validEnumGender(req.body?.gender)
        customBody.gender = genderValid ? req.body?.gender : authorById.gender
      }

      if(req.body?.language){
        const languageValid = validEnumLanguage(req.body?.language)
        customBody.language = languageValid ? req.body?.language : authorById.language
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
            if (req.body[item] != authorById[item]){   //si no es la misma que la antigua
            test[item] = true;
            }else{
              test[item] = 'same old info'
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
    res.status(404).json({
      error: 'error en el update',
      message: error.message,
    });
  }
};

//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE BOOKS --------------------------------------
//?-------------------------------- update -----------------------------------------



const toggleBooks = async (req, res, next) => {
 
  const { id } = req.params;   // id del autor
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
        dataUpdate: await Author.findById(id),
      });
    });
  } else {
    return res.status(404).json({
      error: 'este autor no existe',
      message: error.message
    });
  }
};










//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE GENRES -------------------------------------
//?-------------------------------- update -----------------------------------------






//*------------------------------- delete ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------

const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByIdAndDelete(id);
    deleteImgCloudinary(req.file?.path)

    if (author) {
      //lo ha borrado, pero ahora vamos a hacer el TESTING--- EXISTE?
      const findByIdAuthor = await Author.findById(id);
      // si existe... ERROR ---- hay que borrar los libros de dentro
      try {
        const test = await Book.updateMany(
          { authors: id },
          { $pull: { authors: id } }
        );
        console.log(test);

        return res.status(findByIdAuthor ? 404 : 200).json({
          deleteTest: findByIdAuthor ? false : true,
        });
      } catch (error) {
        return res.status(404).json({
          error: 'no se ha podido borrar',
          message: error.message,
        });
      }
    } else {
      return res.status(404).json('este autor no existe');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'no se ha podido borrar',
      message: error.message,
    });
  }
};

//!---24----- EXPORTAMOS LA FUNCION ENTRE {} (VA A HABER MAS) Y LA IMPORTAMOS EN RUTAS
module.exports = {
  create,
  getById,
  getAll,
  getByName,
  deleteAuthor,
  update,
  toggleBooks,
};
