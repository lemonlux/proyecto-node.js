
//*--------------------- MIDDLEWARE ----------------------------
const { isAuth, isAuthAsAdmin  } = require('../../middleware/auth.middleware')

//*--------------------- CONTROLLERS ----------------------------
const { createReview } = require('../controllers/Review.controllers')

//*--------------------- ROUTER ----------------------------
const ReviewRoutes = require('express').Router()




//?-------------------------  rutas ---------------------------------







//! ------ con AUTH --------- de user

ReviewRoutes.post('/create/:idBook', [isAuth], createReview)





module.exports = ReviewRoutes