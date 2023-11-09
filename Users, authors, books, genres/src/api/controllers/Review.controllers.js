//?------------------------ modelos ------------------------------
const User = require('../models/User.models');
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const Genre = require('../models/Genre.model');
const Review = require('../models/Review.model')

//?------------------------- utils -------------------------------
const { validEnumRating } = require('../../utils/validEnum')
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


const createReview = async (req,res,next) =>{
   
    try {
        const { idBook } = req.params //id del LIBRO!!!!!!!
        const book = await Book.findById(idBook)
        if(book){
          try {
            await Review.syncIndexes()
            const newReview = new Review(req.body)
            const savedReview = await newReview.save()
            
            if(savedReview){
                console.log(savedReview)
                if (!book.reviews.includes(savedReview)){
                    try {
                        await Book.findByIdAndUpdate(idBook, {
                            $push: { reviews: savedReview }
                        })

                       try {
                        const { _id } = req.user
                                await User.findByIdAndUpdate(_id, {
                                    $push: { reviews: savedReview }
                                })

                            try {
                                await Review.findByIdAndUpdate(savedReview._id, {
                                $push: { books: book }
                            })
                            try{ 
                                 await Review.findByIdAndUpdate(savedReview._id, {
                                $push: { postedBy: _id }
                                 })


                                try {
                                    const bookWithReview = await Book.findById(idBook)
                                    const reviewWithBook = await Review.findById(savedReview._id)
                                    const userReviewed = await User.findById(_id)
        
                                        return res.status(200).json({
                                            bookWithReview,
                                            reviewWithBook,
                                            userReviewed
                                        })
                                } catch (error) {
                                    return res.status(404).json({
                                        error: 'error returning response',
                                        message: error.message
                                    })
                                }
                            }catch (error){
                                return res.status(404).json({
                                    error: 'error saving user into review',
                                    message: error.message
                                })
                            }
                            

                            } catch (error) {
                                return res.status(404).json({
                                    error: 'error saving  book into review',
                                    message: error.message
                                })
                            }

                        
                       } catch (error) {
                        return res.status(404).json({
                            error: 'error savingreview into user',
                            message: error.message
                        })
                       }


                    } catch (error) {
                        return res.status(404).json({
                            error: 'error saving review into book',
                            message: error.message
                        })
                    }
                }else{
                    return res.status(404).json('this review already exists')
                }

            }else{
                return res.status(404).json('could not save review')
            }
    
    
    
         } catch (error) {
            return res.status(404).json({
                error: 'error saving review',
                message: error.message
            })
         }
     }else{
        return res.status(404).json('book not found')
    }

    } catch (error) {
        return next(setError(500, error.message || 'Error to create')); 
    }
  

}








//?---------------------------------------------------------------------------------
//! ------------------------------- UPDATE -----------------------------------------
//?---------------------------- rating y review ------------------------------------






//?---------------------------------------------------------------------------------
//! -------------------------------- DELETE ----------------------------------------
//?---------------------------------------------------------------------------------


const deleteReview = async (req,res,next) =>{
    try {
        const { id } = req.params
        await Review.findByIdAndDelete(id)

    } catch (error) {
        return next(
            setError(500, error.message || 'Error to delete')
          );
    }
}






module.exports = { createReview }