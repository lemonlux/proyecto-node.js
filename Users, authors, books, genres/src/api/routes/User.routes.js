//*--------------------- MIDDLEWARE ----------------------------
const { upload } = require('../../middleware/files.middleware')
const { isAuth, isAuthAsAdmin  } = require('../../middleware/auth.middleware')

//*--------------------- CONTROLLERS ----------------------------

const {
  getReadBooks,
  userRegister,
  stateRegister,
  redirectRegister,
  sendCode,
  login,
  autoLogin,
  resendCode,
  userById,
  verifyCode,
  changePassword,
  sendNewPassword,
  modifyPassword,
  userByEmail,
  deleteUser,
  updateUser,
  addFavouriteBook,
  addReadBook,
  addFavouriteAuthor,
  addFavouriteGenre,
  followUser
} = require('../controllers/User.controllers');

//*--------------------- ROUTER ----------------------------

const UserRoutes = require('express').Router();




//?-------------------------  rutas ---------------------------------



//*---- post
UserRoutes.post('/registerLong', upload.single('image'), userRegister);
UserRoutes.post('/registerState', upload.single('image'), stateRegister);
UserRoutes.post('/redirectRegister', upload.single('image'), redirectRegister);
UserRoutes.post('/login', login);
UserRoutes.post('/login/autoLogin', autoLogin);
UserRoutes.post('/resend', resendCode);
UserRoutes.post('/verify', verifyCode); //es el mismo que el checkNewUser de clase

//*----- patch
UserRoutes.patch('/password/setNewPassword', changePassword); //EN LA RUTA PONEMOS DOS / / PORQUE SE CRUZA CON LA OTRA DEL PATCH

//*----- get

UserRoutes.get('/:id', userById);
UserRoutes.get('/findByEmail/find', userByEmail);
UserRoutes.get('/readBooks/:id', getReadBooks)

//!---------- controladores autenticados
UserRoutes.patch('/modifyPassword', [isAuth], modifyPassword);
UserRoutes.delete('/', [isAuth], deleteUser);
UserRoutes.patch(
  '/update/updateUser',
  [isAuth],
  upload.single('image'),
  updateUser
);
UserRoutes.patch('/addBook/:idBook', [isAuth], addFavouriteBook)
UserRoutes.patch('/addReading/:idBook', [isAuth], addReadBook)
UserRoutes.patch('/addAuthor/:idAuthor', [isAuth], addFavouriteAuthor)
UserRoutes.patch('/addGenre/:idGenre', [isAuth], addFavouriteGenre)
UserRoutes.patch('/follow/:idUser', [isAuth], followUser)
//el middleware NUESTRO (personalizado) se mete entre corchetes. podemos meter varios pero el orden importa

//!---------- controladores de redirect
//'/redirect/sendMail/:id'
UserRoutes.post('/register/sendMail/:id', sendCode);
UserRoutes.patch('/sendPassword/:id', sendNewPassword);







module.exports = UserRoutes;
