const { createGenre, getGenreById, getAllGenres, getGenreByName } = require('../controllers/Genre.controllers')


const GenreRoutes = require('express').Router()



GenreRoutes.post('/', createGenre)
GenreRoutes.get('/:id', getGenreById)
GenreRoutes.get('/', getAllGenres)
GenreRoutes.get('/getByType/:type', getGenreByName)






module.exports = GenreRoutes