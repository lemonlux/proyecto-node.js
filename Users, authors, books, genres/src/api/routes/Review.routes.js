
//*--------------------- MIDDLEWARE ----------------------------
const { isAuth, isAuthAsAdmin  } = require('../../middleware/auth.middleware')

//*--------------------- CONTROLLERS ----------------------------
const { createReview, deleteReview } = require('../controllers/Review.controllers')

//*--------------------- ROUTER ----------------------------
const ReviewRoutes = require('express').Router()




//?-------------------------  rutas ---------------------------------







//! ------ con AUTH --------- de user

ReviewRoutes.post('/create/:idBook', [isAuth], createReview)
ReviewRoutes.delete('/:id',[isAuth], deleteReview)





module.exports = ReviewRoutes