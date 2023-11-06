const { createGenre, getGenreById, getAllGenres, getGenreByName, deleteGenre } = require('../controllers/Genre.controllers')
const Genre = require('../models/Genre.model')

const { isAuth, isAuthAsAdmin } = require('../../middleware/auth.middleware')


const GenreRoutes = require('express').Router()




GenreRoutes.get('/:id', getGenreById)
GenreRoutes.get('/', getAllGenres)
GenreRoutes.get('/getByType/:type', getGenreByName)


//!--------- CON AUTH DE ADMIN---------------------
GenreRoutes.post('/', [isAuthAsAdmin], createGenre)
GenreRoutes.delete('/:id', [isAuthAsAdmin], deleteGenre)






module.exports = GenreRoutes