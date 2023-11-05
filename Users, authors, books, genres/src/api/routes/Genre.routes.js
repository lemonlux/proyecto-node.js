const { createGenre } = require('../controllers/Genre.controllers')


const GenreRoutes = require('express').Router()



GenreRoutes.post('/', createGenre)






module.exports = GenreRoutes