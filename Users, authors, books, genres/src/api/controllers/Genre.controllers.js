//?------------------------ modelos ------------------------------
const Genre = require('../models/Genre.model');
const Author = require('../models/Author.model');
const Book = require('../models/Book.model');
const User = require('../models/User.models');

//?------------------------- utils -------------------------------
const { validEnumGenre } = require('../../utils/validEnum');

//?----------------------- middleware -----------------------------

//?------------------------ librería ------------------------------

//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------
const setError = require('../../helpers/handleError');

//*-------------------------------- POST ------------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- CREATE ----------------------------------------
//?---------------------------------------------------------------------------------

const createGenre = async (req, res, next) => {
  try {
    await Genre.syncIndexes();
    const newGenre = new Genre(req.body);
    const saveGenre = await newGenre.save();

if(saveGenre){
    return res.status(200).json(saveGenre)
}else{
    return res.status(404).json('Couldnt create genre')
}
  } catch (error) {
    return next(setError(500, error.message || 'Error to create'));
  }
};

//*---------------------------------- read ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- GET BY ----------------------------------------
//?---------------------------------------------------------------------------------

//* ---------------------- get by id ---------------------------

const getGenreById = async (req,res,next) =>{

    try {
        const { id } = req.params
        const genreById = await Genre.findById(id)

        return res.status( genreById ? 200 : 404).json( genreById ? genreById : 'no se ha encontrado este género')
        
    } catch (error) {
        return res.status(404).json({
            error: 'error en el catch de get by id',
            message: error.message,
          });
    }


}





//* ------------------------- get all ---------------------------

const getAllGenres = async (req,res,next) =>{
    try {
        const allGenres = await Genre.find()

        if(allGenres.length > 0){
            return res.status(200).json(allGenres)

        }else{
            return res.status(404).json('no se encontraron géneros')
        }


    } catch (error) {
        return res.status(404).json({
            error: 'error en el catch de get by id',
            message: error.message,
          });
    }
}


//* ------------------------- get by name ---------------------------

const getGenreByName = async (req,res,next) =>{
try {
    const { type } = req.params
    console.log(req.body)

    const genreByType = await Genre.find({ type })

    return res.status( genreByType ? 200 : 404).json( genreByType ? genreByType : 'no se ha encontrado el género')
    
} catch (error) {
    return res.status(404).json({
        error: 'error en el catch de get by id',
        message: error.message,
      });
}

}

//*    ----------------------------------------------------------------------------------
//todo ------------------------------- CON AUTH -----------------------------------------
//todo -------------------------------DE ADMIN  -----------------------------------------
//*    ----------------------------------------------------------------------------------





//*--------------------------------- PATCH ---------------------------------

//?---------------------------------------------------------------------------------
//! ---------------------------- GENERAL UPDATE ------------------------------------
//?---------------------------------------------------------------------------------
const updateGenre = async (req, res) => {
  await Genre.syncIndexes();
  try {
    const { id } = req.params; //hacemos la const del id y lo buscamos con findById
    const genreById = await Genre.findById(id);
    //si ese autor existiese
    if (genreById) {

      const customBody = {
        subgenre: req.body?.subgenre ? req.body?.subgenre : genreById.subgenre,
        description: req.body?.description ? req.body?.description : genreById.description
      };

      if (req.body?.genre){
        const genreValid = validEnumGenre(req.body?.gender)
        customBody.genre = genreValid ? req.body?.genre : genreById.genre
      }


      try {
        await Genre.findByIdAndUpdate(id, customBody);
     
        //todo----- VAMOS A HACER EL TESTING -------

        const genreByIdUpdate = await Genre.findById(id);
        const elementUpdate = Object.keys(req.body);

        let test = {};
        //si el elemento existe
        elementUpdate.forEach((item) => {
          if (req.body[item] === genreByIdUpdate[item]) {
            if (req.body[item] != genreByIdUpdate[item]){   //si no es la misma que la antigua
            test[item] = true;
            }else{
              test[item] = 'same old info'
            }
          } else {
            test[item] = false;
          }
        });

        let acc = 0;
        for (let clave in test) {
          test[clave] == false && acc++;
        }
        if (acc > 0) {
          return res.status(404).json({
            genreByIdUpdate,
            update: test,
          });
        } else {
          return res.status(200).json({
            genreByIdUpdate,
            update: test,
          });
        }
      } catch (error) {
        res.status(404).json({
          error: 'genre not found',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'General error to update')
    );
  }
};
//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE BOOKS --------------------------------------
//?-------------------------------- update -----------------------------------------


const toggleBooks = async (req, res, next) => {
 
  const { id } = req.params;   // id del autor
  const { books } = req.body; //esto crea un string separado por comas de los books
  const genreById = await Genre.findById(id);
  if (genreById) {
    const arrayIdBooks = books.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    Promise.all(
      arrayIdBooks.map(async (book) => {
        if (genreById.books.includes(book)) {
          try {
            await Genre.findByIdAndUpdate(id, {
              $pull: { books: book },
            });
            try {
              await Book.findByIdAndUpdate(book, {
                $pull: { genres: id },
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
            await Genre.findByIdAndUpdate(id, {
              $push: { books: book },
            });
            try {
              await Book.findByIdAndUpdate(book, {
                $push: { genres: id },
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
        dataUpdate: await Genre.findById(id).populate('books'),
      });
    });
  } else {
    return next(
      setError(500, error.message || 'General error to update')
    );
  }
};






//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE AUTHORS ------------------------------------
//?-------------------------------- update -----------------------------------------


const toggleAuthors = async (req, res, next) => {
  //lo vamos a localizar con un id
  const { id } = req.params;   // GENRE
  const { authors } = req.body; //esto crea un string separado por comas de los autores
  const genreById = await Genre.findById(id);
  if (genreById) {
    const arrayIdAuthors = authors.split(',');
    //recorremos el array creado con un mapeo y dentro de una promesa para manejar asincronías
    // console.log(bookById);
    Promise.all(
      arrayIdAuthors.map(async (author) => {
        console.log(author)
        if (genreById.authors.includes(author)) {
          try {
            await Genre.findByIdAndUpdate(id, {
              $pull: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(author, {
                $pull: { genres: id },
              });
            } catch (error) {
              res.status(404).json({
                error: 'error al actualizar el escritor',
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: 'error al actualizar el genero',
              message: error.message,
            }) && next(error);
          }
        } else {
          try {
            await Genre.findByIdAndUpdate(id, {
              $push: { authors: author },
            });
            try {
              await Author.findByIdAndUpdate(author, {
                $push: { genres: id },
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
        dataUpdate: await Genre.findById(id).populate('authors'),
      });
    });
  } else {
    return res.status(404).json('este libro no existe');
  }
};






//*------------------------------- delete ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------

const deleteGenre = async (req, res) => {

    try {
      const { id } = req.params;
      await Genre.findByIdAndDelete(id);
  
      try {
          await Book.updateMany(
            { authors: id },
            { $pull: { authors: id } }
          )
        try {
            await Author.updateMany(
              { genres: id },
              { $pull: { genres: id }}
            )
            try {
              await User.updateMany(
                { favGenres: id },
                { $pull: { favGenres: id } }
              )
  
              const genreDeleted = await Genre.findById(id)
                return res.status( genreDeleted ? 404 : 200).json( genreDeleted ? 'error deleting genre' : 'this genre no longer exists')
  
              
            } catch (error) {
              return res.status(404).json({
                error: 'error catch updating user',
                message: error.message,
              });
            }
        } catch (error) {
          return res.status(404).json({
            error: 'error catch updating authors',
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
      return next(
        setError(500, error.message || 'Error to delete')
      );
    }
  };






module.exports = { 
    createGenre,
    getGenreById,
    getAllGenres,
    getGenreByName,
    updateGenre,
    toggleAuthors,
    toggleBooks,
    deleteGenre
};
