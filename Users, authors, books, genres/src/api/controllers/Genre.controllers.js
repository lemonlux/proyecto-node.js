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







//*--------------------------------- PATCH ---------------------------------

//?---------------------------------------------------------------------------------
//! ---------------------------- GENERAL UPDATE ------------------------------------
//?---------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! ---------------------------- TOGGLE BOOKS --------------------------------------
//?-------------------------------- update -----------------------------------------

//*------------------------------- delete ---------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------

module.exports = { 
    createGenre,
    getGenreById,
    getAllGenres,
    getGenreByName
};
