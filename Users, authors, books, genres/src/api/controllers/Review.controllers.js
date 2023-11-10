//?------------------------ modelos ------------------------------
const User = require('../models/User.models');
const Book = require('../models/Book.model');
const Review = require('../models/Review.model');

//?------------------------- utils -------------------------------
// const { validEnumRating } = require('../../utils/validEnum');
//?----------------------- middleware -----------------------------

//?------------------------ librería ------------------------------

//?------------------------- estados ------------------------------

//?------------------------- helpers ------------------------------

const setError = require('../../helpers/handleError');

//?---------------------------------------------------------------------------------
//! ---------------------- SORT BY DATE: NEWEST TO OLDEST --------------------------
//?---------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! ----------------------------- SORT BY RATING -----------------------------------
//?---------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! ------------------------------- SORT BY LIKES -----------------------------------
//?---------------------------------------------------------------------------------

//*-----------------------------------------------------------------------------------------
//todo--------------------------------------------------------------------------------------
//todo--------------------------------------------------------------------------------------
//!-------------------------- controladores con AUTENTICACIÓN ------------------------------
//todo--------------------------------de usuario--------------------------------------------
//todo--------------------------------------------------------------------------------------
//*-----------------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- CREATE ----------------------------------------
//?---------------------------------------------------------------------------------
// la reseña no es independiente, tengo que crearla directamente metiendola en el populate de los books- es un toggle y create

const createReview = async (req, res, next) => {
  try {
    const { idBook } = req.params; //id del LIBRO!!!!!!!
    const book = await Book.findById(idBook);
    if (book) {
      try {
        await Review.syncIndexes();
        const newReview = new Review(req.body);
        const savedReview = await newReview.save();

        if (savedReview) {
          console.log(savedReview);
          if (!book.reviews.includes(savedReview)) {
            try {
              await Book.findByIdAndUpdate(idBook, {
                $push: { reviews: savedReview },
              });

              try {
                const { _id } = req.user;
                await User.findByIdAndUpdate(_id, {
                  $push: { reviews: savedReview },
                });

                try {
                  await Review.findByIdAndUpdate(savedReview._id, {
                    $push: { books: book },
                  });
                  try {
                    await Review.findByIdAndUpdate(savedReview._id, {
                      $push: { postedBy: _id },
                    });

                    try {
                      return res.status(200).json({
                        reviewCreated: await Review.findById(
                          savedReview._id
                        ).populate('books'),
                      });
                    } catch (error) {
                      return (
                        res.status(404).json({
                          error: 'error returning response',
                          message: error.message,
                        }) && next(error)
                      );
                    }
                  } catch (error) {
                    return (
                      res.status(404).json({
                        error: 'error saving user into review',
                        message: error.message,
                      }) && next(error)
                    );
                  }
                } catch (error) {
                  return (
                    res.status(404).json({
                      error: 'error saving  book into review',
                      message: error.message,
                    }) && next(error)
                  );
                }
              } catch (error) {
                return (
                  res.status(404).json({
                    error: 'error savingreview into user',
                    message: error.message,
                  }) && next(error)
                );
              }
            } catch (error) {
              return (
                res.status(404).json({
                  error: 'error saving review into book',
                  message: error.message,
                }) && next(error)
              );
            }
          } else {
            return res.status(404).json('this review already exists');
          }
        } else {
          return res.status(404).json('could not save review');
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error saving review',
          message: error.message,
        });
      }
    } else {
      return res.status(404).json('book not found');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to create'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- UPDATE -----------------------------------------
//?---------------------------- rating y review ------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params; // id de la REVIEW
    const reviewToDelete = await Review.findById(id);
    console.log(reviewToDelete.postedBy);
    if (reviewToDelete.postedBy.includes(req.user?._id)) {
      try {
        await Review.findByIdAndDelete(id);

        try {
          await Book.updateMany({ reviews: id }, { $pull: { reviews: id } });

          try {
            await User.updateMany({ reviews: id }, { $pull: { reviews: id } });

            try {
              await User.updateMany(
                { likedReviews: id },
                { $pull: { likedReviews: id } }
              );

              const deletedReview = await Review.findById(id);
              return res
                .status(deletedReview ? 404 : 200)
                .json(deletedReview ? deletedReview : 'borrado correctamente');
            } catch (error) {
              return res.status(404).json({
                error: 'error catch updating user',
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: 'error catch updating user',
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
    } else {
      return res.status(404).json('esta review no pertenece a este usuario');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error finding review'));
  }
};

module.exports = { createReview, deleteReview };
