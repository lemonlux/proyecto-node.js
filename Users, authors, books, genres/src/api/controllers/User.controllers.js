//?------------------------ modelos ------------------------------
const User = require('../models/User.models');
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const Genre = require('../models/Genre.model');
const Review = require('../models/Review.model');

//?------------------------- utils --------------------------------
const randomCode = require('../../utils/randomCode');
// randomCode(100000, 999999)
const sendEmail = require('../../utils/sendEmail');
const { generateToken } = require('../../utils/token');
const randomPasswordGenerator = require('../../utils/randomPassword');
const { validEnumGender } = require('../../utils/validEnum');

//?----------------------- middleware -----------------------------
const { deleteImgCloudinary } = require('../../middleware/files.middleware');

//?------------------------ librería ------------------------------
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const validator = require('validator');

//?------------------------- estados ------------------------------
const { setSendEmail, getSendEmail } = require('../../state/state.data');

//?------------------------- helpers ------------------------------

const setError = require('../../helpers/handleError');

//* ________________________________ READ _________________________________________

//?---------------------------------------------------------------------------------
//! --------------------------- GET BY ID, EMAIL -----------------------------------
//?---------------------------------------------------------------------------------

//* ---------------------- get by id ---------------------------

const userById = async (req, res) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json('Usuario no encontrado');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch',
      message: error.message,
    });
  }
};

//* ---------------------- get by email ---------------------------

const userByEmail = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const userByEmail = await User.findOne({ userEmail });

    if (userByEmail) {
      return res.status(200).json({
        userByEmail,
        message: 'user found',
      });
    } else {
      return res.status(404).json({
        userEmail,
        message: 'user not found',
      });
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch',
      message: error.message,
    });
  }
};

//* ---------------------- get by userName ---------------------------

const userByUserName = async (req, res) => {
  try {
    const { userName } = req.body;
    const userByUserName = await User.findOne({ userName });

    if (userByUserName) {
      return res.status(200).json({
        userByUserName,
        message: 'user found',
      });
    } else {
      return res.status(404).json({
        userByUserName,
        message: 'user not found',
      });
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error en el catch',
      message: error.message,
    });
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- GET READ BOOKS ---------------------------------
//?---------------------------------------------------------------------------------

const getReadBooks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);

    if (userById) {
      let booksArray = [];
      const booksReadIds = userById.readBooks;

      Promise.all(
        booksReadIds.map(async (bookId) => {
          try {
            const book = await Book.findById(bookId);
            const bookName = book.name;
            console.log(book.name);
            booksArray.push(bookName);
          } catch (error) {
            return res.status(404).json('no se ha encontrado');
          }
        })
      ).then(async () => {
        return res.status(200).json(booksArray);
      });
    } else {
      return res.status(404).json('user not found');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error finding read books'));
  }
};

//* ________________________________ POST _________________________________________

//?---------------------------------------------------------------------------------
//! --------------------------- REGISTER LARGO -------------------------------------
//?---------------------------------------------------------------------------------

const userRegister = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes(); //como es un post hay que sincronizar los indexes
    let confirmationCode = randomCode(100000, 999999);
    const { userEmail, userName } = req.body;

    const userExists = await User.findOne(
      //ahora encuentra el username con estos parametros
      //se ponen por separado porque ambos son unique
      { userEmail: req.body.userEmail },
      { userName: req.body.userName }
    );
    //*findOne() --- conditions
    //*The conditions are cast to their respective SchemaTypes before the command is sent
    if (!userExists) {
      // si no existe nuevo user -nueva instancia
      const newUser = new User({ ...req.body, confirmationCode });

      req.file
        ? (newUser.image = req.file.path)
        : (newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png');

      try {
        //guardamos el user
        const userSave = await newUser.save();
        //si se ha guardado --- enviamos email de confirmacion
        if (userSave) {
          const emailSave = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            //metodo de nodemailer
            service: 'gmail',
            auth: {
              user: emailSave,
              pass: password,
            },
          });

          const mailInfo = {
            from: emailSave, //de mi email
            to: userEmail,
            subject: 'Confirmation code',
            text: `Hola ${userName}! Tu código de confirmación es ${confirmationCode}`, //al del usuario
          };

          transporter.sendMail(mailInfo, function (error) {
            //esta es la estructura segun la libreria
            if (error) {
              //el user está guardado pero el código no se ha enviado
              return res.status(404).json({
                user: userSave,
                confirmationCode: 'error, resend code', //esto es para el frontend
              });
            } else {
              //tiene que tener la misma estructura para estar igual en el front end
              return res.status(200).json({
                user: userSave,
                confirmationCode,
              });
            }
          });
        }
      } catch (error) {
        req.file?.path && deleteImgCloudinary(catchImg);
        return (
          res.status(404).json({
            error: 'error en el catch del save',
            message: error.message,
          }) && next(error)
        );
      }
    } else {
      //el user ya existe -- borramos imagen y enviamos error
      req.file?.path && deleteImgCloudinary(catchImg);
      return res.status(409).json('this user already exists');
    }
  } catch (error) {
    req.file?.path && deleteImgCloudinary(catchImg); //!--??
    return next(setError(500, error.message || 'Error general to register'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------ REGISTER CON EL ESTADO --------------------------------
//?---------------------------------------------------------------------------------
//
/* antes de hacer el register necesitamos crear el state.data.js para establecer el estado del email
con el set y el get, y hacer una función externa de sendEmail que ubicaremos en utils */

//* va a ser igual que el otro

const stateRegister = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await User.syncIndexes();
    let confirmationCode = randomCode(100000, 999999);
    const { userName, userEmail } = req.body;
    console.log(userEmail, userName); //del model

    const userExists = await User.findOne(
      { userEmail }, //ambas son unique por eso se ponen en objetos separados
      { userName }
    );

    if (!userExists) {
      const newUser = new User({ ...req.body, confirmationCode });

      req.file
        ? (newUser.image = req.file.path)
        : (newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png');

      try {
        //como vamos a usar otro await - otro trycatch     //?...-----!! EL RANDOM CODE TIENE PARAMETROS
        const userSaved = await newUser.save();
        if (userSaved) {
          //si el usuario se ha guardado enviamos el email

          sendEmail(userEmail, userName, confirmationCode);
          console.log('entrooooo donde el email');
          /* no tenemos acceso a la librería, la asincronia no es nuestra, por lo que vamos a usar
            un timeout */

          setTimeout(() => {
            if (getSendEmail()) {
              //si es true (devuelve un boolean)
              setSendEmail(false); //lo reseteamos a false por si hay que volver a mandarlo
              res.status(200).json({
                user: userSaved,
                confirmationCode,
              });
            } else {
              setSendEmail(false);
              return res.status(404).json({
                user: userSaved,
                confirmationCode: 'error, resend code', //para el front end
              });
            }
          }, 2000);
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: 'error en el catch del save',
          message: error.message,
        });
      }
    } else {
      req.file?.path && deleteImgCloudinary(catchImg);
      return res.status(409).json('this user already exists');
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImg);
    return next(setError(500, error.message || 'Error general to register'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------ REGISTER CON REDIRECT ---------------------------------
//?---------------------------------------------------------------------------------
//* es igual que anteriormente pero cuando comprobemos que el usuario este guardado redirigimos a una pagina que nos envie el codigo
//necesitamos de la funcion sendCode

const redirectRegister = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await User.syncIndexes(); //sincronizamos indexes
    let confirmationCode = randomCode(100000, 999999); //creamos el codigo de confirmacion
    const { userEmail, userName } = req.body;
    const userExist = await User.findOne(
      //buscamos el usuario
      { userEmail }
    );
    if (!userExist) {

          try {
            const userNameExists = await User.findOne({ userName })

            if(!userNameExists){
        
      //si el usuario no existe hay que hacer uno nuevo
      const newUser = new User({ ...req.body, confirmationCode });

      req.file
        ? (newUser.image = req.file.path)
        : (newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png');

      //para guardar tenemos q hacer un await --- trycatch
      try {
        const userSaved = await newUser.save();

        if (userSaved) {
          //!--- aqui viene lo diferente del redirect

          return res.redirect(
            307,
            `http://localhost:8080/api/v1/users/register/sendMail/${userSaved._id}`
          );

          //*esta ruta tiene que ser la misma que especifiquemos en user routes para la funcion send mail
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return (
          res.status(404).json(error.message) && next(error)
        );
      }

    }else{
      req.file && deleteImgCloudinary(catchImg);
      return res.status(409).json('this username already exists');
    }

    } catch (error){
      return res.status(404).json({
        error: 'error en el trycatch buscando userName',
        message: error.message
      })
    }


    } else {
      //si el user ya existe hay que borrar la imagen del cloudinary y decir q ya existe
      req.file && deleteImgCloudinary(catchImg);
      return res.status(409).json('this email already exists');
    }
  } catch (error) {
    //da feedback al usuario y a nosotros
    req.file && deleteImgCloudinary(catchImg);
    return next('soy el catch');
  }
};

//?---------------------------------------------------------------------------------
//todo ------------------------ SEND CODE del redirect -----------------------------
//------

const sendCode = async (req, res, next) => {
  try {
    //hemos guardado el user y nos ha redireccionado
    // queremos: -el id para la busqueda del user -los parametros del env
    //* vamos a hacer: transporter, mailInfo y enviar con sendEmail

    const { id } = req.params;
    const findUser = await User.findById(id);

    const myEmail = process.env.EMAIL;
    const myPassword = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: myEmail,
        pass: myPassword,
      },
    });

    const mailInfo = {
      from: myEmail,
      to: findUser.userEmail,
      subject: 'Confirmation code',
      text: `Hi ${findUser.userName}, your confirmation code is ${findUser.confirmationCode}`,
    };

    transporter.sendMail(mailInfo, function (error, info) {
      if (error) {
        console.log('hay un error!!!', error);
        return res.status(404).json({
          user: findUser,
          confirmationCode: 'error, resend code', //para el front
        });
      } else {
        console.log(info.response);
        return res.status(200).json({
          user: findUser,
          confirmationCode: findUser.confirmationCode,
        });
      }
    });
  } catch (error) {
    return next(setError(500, error.message || 'General error to send mail'));
  }
};

//?---------------------------------------------------------------------------------
//! --------------------------------- LOGIN ----------------------------------------
//?---------------------------------------------------------------------------------

const login = async (req, res, next) => {
  //no hay imagen que cachear ni que sincronizar indexes (no estamos metiendo info nueva)
  try {
    //ya tenemos usuario registrado tenemos que ver si existe
    const { userEmail, password } = req.body;
    const userDB = await User.findOne({ userEmail });

    if (userDB) {
      //comparamos la contraseña encriptada para ver si es la misma

      if (bcrypt.compareSync(password, userDB.password)) {
        //metodo que devuelve un boolean (password, hash)
        // hay que hacerlo con el metodo porque la que viene por el body no está encriptada y la guardada si

        //*generamos un token si las dos contraseñas coinciden
        const token = generateToken(userDB._id, userEmail);

        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        //si las password no matchean
        return res.status(404).json('Wrong password');
      }
    } else {
      return res.status(404).json('This user is not registered');
    }
  } catch (error) {
    return next(setError(500, error.message || 'General error to login'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- AUTOLOGIN --------------------------------------
//?---------------------------------------------------------------------------------
//* -- CUANDO HAGAMOS AUTOLOGIN tenemos que meter por insomnia la contraseña encriptada que nos da el login
//* -- lo metemos por JSON y el token que nos devuelve lo tenemos que copiar y pegar encima del token anterior
//* guardado en las variables de entorno

const autoLogin = async (req, res, next) => {
  try {
    const { userEmail, password } = req.body;
    const userDB = await User.findOne({ userEmail });

    if (userDB) {
      if (password === userDB.password) {
        //la password es la YA GUARDADA (AUTOLOGIN), y la userDB.password es la registrada
        //cada vez que el usuario se logea se genera un nuevo token
        const token = generateToken(userDB._id, userEmail);

        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json('Wrong password');
      }
    } else {
      return res.status(404).json('This user does not exist');
    }
  } catch (error) {
    return next(setError(500, error.message || 'General error to auto log'));
  }
};

//?---------------------------------------------------------------------------------
//! ----------------------------- RESEND CODE --------------------------------------
//?---------------------------------------------------------------------------------

const resendCode = async (req, res, next) => {
  try {
    const { userEmail } = req.body;
    const userExists = await User.findOne({ userEmail });

    const myEmail = process.env.EMAIL;
    const myPassword = process.env.PASSWORD;

    if (userExists) {
      //esto en el sendCode no lo hacemos porque para que se redirija la pag
      // el usuario ya tiene que existir, aqui en cambio es un boton independiente

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: myEmail,
          pass: myPassword,
        },
      });

      const mailInfo = {
        from: myEmail,
        to: userExists.userEmail,
        subject: 'Confirmation code',
        text: `Hi ${userExists.userName}, your confirmation code is ${userExists.confirmationCode}`,
      };

      transporter.sendMail(mailInfo, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          console.log(info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json('This user does not exist');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general to resendCode'));
  }
};

//?---------------------------------------------------------------------------------
//! ----------------------------- VERIFY CODE --------------------------------------
//?---------------------------------------------------------------------------------
/*tenemos que verificar que el codigo que nos devuelve el usuario es el mismo que el que le hemos dado
 si no lo es --> eliminamos el usuario de la base de datos --- 
 si sí lo es --> hacemos check: true (ESTÁ VERIFICADO) */

//* necesitamos el email del usuario y el código de confirmacion

const verifyCode = async (req, res, next) => {
  try {
    const { userEmail, confirmationCode } = req.body; //! por qué nos llega el userEmail cuando hace el verify?
    const userExists = await User.findOne({ userEmail });
    if (userExists) {
      //- el guardado cuando hizo login === el que nos llega por el body (el que mete)
      if (userExists.confirmationCode === confirmationCode) {
        //- si coinciden hacemos check: true porque está verificado
        try {
          await userExists.updateOne({ check: true });

          //lo volvemos a buscar para ver si se ha cambiado bien

          const updatedUser = await User.findOne({ userEmail });

          if (updatedUser.check) {
            //esto lo hemos puesto a true
            return res.status(200).json({
              updatedUser,
              testCheckUser: true,
            });
          } else {
            return res.status(404).json({
              updatedUser,
              testCheckUser: false,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch del update',
            message: error.message,
          });
        }
      } else {
        //lo borramos de la base de datos

        await User.findByIdAndDelete(userExists._id);

        //! tenemos que borrar tb la imagen del cloudinary!!
        deleteImgCloudinary(userExists.image);

        //ahora un status de que el usuario se ha borrado
        const deletedUser = await User.findById(userExists._id);

        if (deletedUser) {
          return res.status(409).json({
            userExists,
            check: false,
            delete:
              'confirmation code does not match but there has been an error deleting the user',
          });
        } else {
          return res.status(404).json({
            userExists,
            check: false,
            delete:
              'confirmation code does not match, this user has been deleted',
          });
        }
      }
    } else {
      return res.status(200).json('This user does not exist');
    }
  } catch (error) {
    return next(setError(500, error.message || 'General error to verify code'));
  }
};

//* ________________________________ PATCH _________________________________________

//?---------------------------------------------------------------------------------
//! -------------------------- CAMBIO DE CONTRASEÑA --------------------------------
//?-------------------------- cuando no estás logado -------------------------------
/* vamos a hacerlo con un redirect.  FUNCION 1 comprueba  email y redirige
 ----------------------------------- FUNCION 2 envia la contraseña random y test
necesitamos el email del usuario, redirigirlo
funciones de crear transporte, mailInfo y enviarlo.
y una funcion de creación de contraseñas random--- randomPasswordGenerator en utils */

const changePassword = async (req, res, next) => {
  try {
    const { userEmail } = req.body;
    const userExists = await User.findOne({ userEmail });

    if (userExists) {
      return res.redirect(
        307,
        `http://localhost:8080/api/v1/users/sendPassword/${userExists._id}` //esto es lo que vamos a poner en las routes
      );
    } else {
      return res.status(404).json('This user does not exist');
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error general to sendResendCode')
    );
  }
};

//?---------------------------------------------------------------------------------
//todo --------------------- SEND NEW PASSWORD del change --------------------------

const sendNewPassword = async (req, res, next) => {
  let newPassword = randomPasswordGenerator();
  try {
    // queremos: -el id para la busqueda del user -los parametros del env
    //* vamos a hacer: transporter, mailInfo y enviar con sendEmail

    const { id } = req.params;
    const userDB = await User.findById(id);

    const myEmail = process.env.EMAIL;
    const myPassword = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: myEmail,
        pass: myPassword,
      },
    });

    const mailInfo = {
      from: myEmail,
      to: userDB.userEmail,
      subject: 'New password',
      text: `Hi ${userDB.userName}! Your new password is ${newPassword}. Please don't share this with anyone.`,
    };

    transporter.sendMail(mailInfo, async function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          send: false,
          updatedUser: false,
          message: error.message,
        });
      } else {
        console.log('Email sent', info.response);
        // si se ha enviado una nueva contraseña la tenemos que hasear

        const newPasswordHash = bcrypt.hashSync(newPassword, 10);
        //  hay que actualizar el user --- await --- trycatch
        try {
          await User.findByIdAndUpdate(id, { password: newPasswordHash });

          //todo ----------- TESTING -----------------------------
          /* como es un update tenemos que comprobar que se ha actualizado correctamente-> 
        contraseña que mete por el body y la hasheada */

          const userPasswordUpdated = await User.findById(id);
          if (newPasswordHash === userPasswordUpdated.password) {
            // if (bcrypt.compareSync(newPassword, userPasswordUpdated.password)) {
            //se podria comparar la hasheada con la del body y ya?

            return res.status(200).json({
              updatedUser: true,
              passwordSent: true,
            });
          } else {
            return res.status(404).json({
              updatedUser: false,
              passwordSent: true,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch al actualizar la contraseña',
            message: error.message,
          });
        }
      }
    });
  } catch (error) {
    return (
      res.status(404).json({
        error: 'error en el envío',
        message: error.message,
      }) && next(error)
    );
  }
};

//*-----------------------------------------------------------------------------------------
//todo--------------------------------------------------------------------------------------
//todo--------------------------------------------------------------------------------------
//!-------------------------- controladores con AUTENTICACIÓN ------------------------------
//todo--------------------------------------------------------------------------------------
//todo--------------------------------------------------------------------------------------
//*-----------------------------------------------------------------------------------------

//?---------------------------------------------------------------------------------
//! -------------------------- CAMBIO DE CONTRASEÑA --------------------------------
//?-------------------------- cuando YA ESTÁS LOGADO -------------------------------

/*ya estás logado por lo que no se te tiene que enviar ningun mail. necesitamos por el body la contraseña
antigua y la actual, comparar la antigua a la guardada y validar que la nueva sea segura. entonces findByIdAndUpdate.
también vamos a hacer un test para comprobar que se ha modificado correctamente */

const modifyPassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const validPassword = validator.isStrongPassword(newPassword);

    if (validPassword) {
      //vamos a sacar la información de usuario del TOKEN por lo que necesitamos la req.user
      const { _id } = req.user; //viene de la información de mongodb por eso es _id

      if (bcrypt.compareSync(password, req.user.password)) {
        //compara la guardada con la que hemos metido (no la nueva)
        //si matchean -- vamos a encriptar la nueva y guardarla

        const newPasswordHashed = bcrypt.hashSync(newPassword, 10);

        try {
          await User.findOneAndUpdate(_id, { password: newPasswordHashed });

          //todo----------------- TESTING PARA VER SI SE HA GUARDADO CORRECTAMENTE
          //* comparamos LAS CONTRASEÑAS

          //vamos a buscar el usuario recien guardado

          const updatedUser = await User.findById(_id);

          if (bcrypt.compareSync(newPassword, updatedUser.password)) {
            //CON EL METODO compareSync () !!!!!!
            return res.status(200).json({
              updatedUser,
              update: true,
            });
          } else {
            return res.status(200).json({
              updatedUser,
              update: false,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error en el guardado',
            message: error.message,
          });
        }
      } else {
        return res.status(404).json('Passwords do not match');
      }
    } else {
      return res.status(404).json('Password is not strong enough');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general modifyPassword'));
  }
};

//?---------------------------------------------------------------------------------
//! ----------------------------- GENERAL UPDATE -----------------------------------
//?---------------------------------------------------------------------------------

const updateUser = async (req, res, next) => {
  //si hay subida imagen siempre se captura por si hay un error borrarla --> upload en la ruta
  let catchImg = req.file?.path;

  try {
    //vamos a potencialmente actualizar elementos UNIQUE ---> syncIndexes()
    await User.syncIndexes();

    //instanciamos nuevo user

    const updating = new User(req.body);

    // console.log(updating)

    if (req.file) {
      updating.image = catchImg;
    }

    //!--- info que el usuario NO puede cambiar!!

    updating._id = req.user._id;
    updating.password = req.user.password;
    updating.check = req.user.check;
    updating.rol = req.user.rol;
    updating.email = req.user.email;
    updating.confirmationCode = req.user.confirmationCode;

    //!
    //el genero es un enum, y el enum solo funciona bien cuando hacemos save(), asiq tenemos que meterle una condicion

    if (req.body?.gender) {
      /*si por el body me quiere cambiar el genero, tendrá que ser de los disponibles
      esto tb se puede asegurar por el front end pero lo mejor es hacerlo por los dos lados */

      //necesitamos una funcion que solo nos permita meter un genero de los de la enum -- en utils
      const genderOk = validEnumGender(req.body?.gender);
      if (genderOk) {
        updating.gender = req.body?.gender;
      } else {
        updating.gender = req.user.gender;
      }
    }

    //--- ahora a ACTUALIZAR ----- trycatch

    try {
      await User.findByIdAndUpdate(req.user._id, updating);
      if (req.file) deleteImgCloudinary(req.user.image);

      //todo-------- TESTING

      //hacemos la constante del usuario actualizado

      const updatedUser = await User.findById(req.user._id);
      //necesitamos tambien LAS KEYS del objeto del req.body para ver qué se ha actualizado
      const updatedKeys = Object.keys(req.body);

      const test = []; //vamos a meter los testing aqui

      /*recorremos el string que nos devuelve el Object.keys comparando las que nos llegan del body
        con las que tenemos guardadas en el update, y las de antes (del user antes de ser actualizado)*/

      updatedKeys.forEach((key) => {
        if (updatedUser[key] === req.body[key]) {
          if (updatedUser[key] != req.user[key]) {
            test.push({ [key]: true }); //si coincide el body con la actualizada y es diferente a la de antes, true
          } else {
            test.push({ [key]: 'same old info' }); //si no es diferente a la de antes, es la misma info
          }
        } else {
          test.push({ [key]: false }); //si no coinciden, no se ha guardado bien
        }

        //!!   tambien tenemos que asegurarnos de la foto

        if (req.file) {
          updatedUser.image === catchImg
            ? test.push({ [key]: true })
            : test.push({ [key]: false });
        }

        //una vez hecho el testing enviamos la res con el usuario actualizado y el test
      });

      return res.status(200).json({
        updatedUser,
        test,
      });
    } catch (error) {
      return res.status(404).json({
        error: 'error en el catch del update',
        message: error.message,
      });
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general updateUser'));
  }
};

//?---------------------------------------------------------------------------------
//! -------------------------- ADD FAVOURITE BOOK -----------------------------------
//?---------------------------------------------------------------------------------
//vamos a sacar el book por los params y la info del usuario (fav Books, id) por el token-- req.user

const addFavouriteBook = async (req, res, next) => {
  try {
    const { _id, favBooks } = req.user;
    const { idBook } = req.params;

    //si en el usuario no se encuentra esa movie la metemos, si sí se encuentra la sacamos --- TOGGLE

    if (favBooks.includes(idBook)) {
      // TENEMOS QUE SACAR EL LIBRO DE LOS LIKES EL USUARIO, Y EL USUARIO DEL REGISTRO DE LIKES DEL LIBRO
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { favBooks: idBook },
        });

        try {
          await Book.findByIdAndUpdate(idBook, {
            $pull: { likes: _id },
          });

          //!------- respuesta ------------- dentro de este try si todo ha salido bien
          const bookUpdated = await Book.findById(idBook);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favBooks'),
            bookUpdated,
            update: `pulled ${bookUpdated.name} from User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch pull user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch pull book',
          message: error.message,
        });
      }
    } else {
      //lo sacamos
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { favBooks: idBook },
        });

        try {
          await Book.findByIdAndUpdate(idBook, {
            $push: { likes: _id },
          });

          //!------- respuesta ------------- dentro de este try si todo ha salido bien

          const bookUpdated = await Book.findById(idBook);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favBooks'),
            bookUpdated,
            update: `pushed ${bookUpdated.name} to User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch push user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch push book',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error general addFavouriteBook')
    );
  }
};

//?---------------------------------------------------------------------------------
//! ----------------------------- ADD READ BOOK ------------------------------------
//?---------------------------------------------------------------------------------

const addReadBook = async (req, res, next) => {
  try {
    const { _id, readBooks } = req.user;
    const { idBook } = req.params;

    if (readBooks.includes(idBook)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { readBooks: idBook },
        });

        try {
          await Book.findByIdAndUpdate(idBook, {
            $pull: { readings: _id },
          });

          //!------- respuesta -------------
          const bookUpdated = await Book.findById(idBook);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('readBooks'),
            bookUpdated,
            update: `pulled ${bookUpdated.name} from User's readings`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch pull user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch pull book',
          message: error.message,
        });
      }
    } else {
      //lo sacamos
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { readBooks: idBook },
        });

        try {
          await Book.findByIdAndUpdate(idBook, {
            $push: { readings: _id },
          });

          //!------- respuesta ------------- dentro de este try si todo ha salido bien

          const bookUpdated = await Book.findById(idBook);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('readBooks'),
            bookUpdated,
            update: `pushed ${bookUpdated.name} to User's readings`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch push user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch push book',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error general addFavouriteBook')
    );
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------- ADD FAVOURITE AUTHOR ---------------------------------
//?---------------------------------------------------------------------------------

const addFavouriteAuthor = async (req, res, next) => {
  try {
    const { _id, favAuthors } = req.user;
    const { idAuthor } = req.params;

    if (favAuthors.includes(idAuthor)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { favAuthors: idAuthor },
        });

        try {
          await Author.findByIdAndUpdate(idAuthor, {
            $pull: { likes: _id },
          });

          const authorUpdated = await Author.findById(idAuthor);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favAuthors'),
            authorUpdated,
            update: `pulled ${authorUpdated.name} from User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch pull user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch pull author',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { favAuthors: idAuthor },
        });

        try {
          await Author.findByIdAndUpdate(idAuthor, {
            $push: { likes: _id },
          });

          const authorUpdated = await Author.findById(idAuthor);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favAuthors'),
            authorUpdated,
            update: `pushed ${authorUpdated.name} to User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch push user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch push author',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error to add favourite author')
    );
  }
};

//?---------------------------------------------------------------------------------
//! --------------------------- ADD FAVOURITE GENRE --------------------------------
//?---------------------------------------------------------------------------------

const addFavouriteGenre = async (req, res, next) => {
  try {
    const { _id, favGenres } = req.user;
    const { idGenre } = req.params;

    if (favGenres.includes(idGenre)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { favGenres: idGenre },
        });

        try {
          await Genre.findByIdAndUpdate(idGenre, {
            $pull: { likes: _id },
          });

          const genreUpdated = await Genre.findById(idGenre);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favGenres'),
            genreUpdated,
            update: `pulled ${genreUpdated.type} from User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch pull user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch pull genre',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { favGenres: idGenre },
        });

        try {
          await Genre.findByIdAndUpdate(idGenre, {
            $push: { likes: _id },
          });

          const genreUpdated = await Genre.findById(idGenre);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('favGenres'),
            genreUpdated,
            update: `pushed ${genreUpdated.type} to User's likes`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch push user',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch push genre',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to add favourite genre'));
  }
};

//?---------------------------------------------------------------------------------
//! ------------------------------- FOLLOW USER ------------------------------------
//?---------------------------------------------------------------------------------

const followUser = async (req, res, next) => {
  try {
    const { _id, following } = req.user;
    const { idUser } = req.params;

    if (following.includes(idUser)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { following: idUser },
        });

        try {
          await User.findByIdAndUpdate(idUser, {
            $pull: { followers: _id },
          });

          const userFollowed = await User.findById(idUser);

          return res.status(200).json({
            userUpdated: await User.findById(_id).populate('followers'),
            userFollowed,
            update: `pulled ${userFollowed.userName} from User's following`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch pull user followers',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch pull user following',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { following: idUser },
        });

        try {
          await User.findByIdAndUpdate(idUser, {
            $push: { followers: _id },
          });

          const userFollowed = await User.findById(idUser);

          return res.status(200).json({
            userUpdated: await User.findById(_id),
            userFollowed,
            update: `pushed ${userFollowed.userName} to User's following`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch push user followers',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error en el catch push user following',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error to add favourite genre'));
  }
};

//?---------------------------------------------------------------------------------
//! ---------------------------- GET LIKED AUTHORS ---------------------------------
//?---------------------------------------------------------------------------------

// const userLikedAuthors = async (req, res, next) => {
//   const { _id, favAuthors } = req.user;
//   try {
//     const user = await User.findById(_id);
//     console.log(favAuthors);

//     if (user) {
//       let likesArr = [];

//       Promise.all(
//         favAuthors.map(async (authorId) => {
//           console.log('entro');
//           try {
//             const author = await Author.findById(authorId);
//             likesArr.push(author);
//           } catch (error) {
//             return res.status(404).json('no se ha encontrado');
//           }
//         })
//       ).then(async () => {
//         return res.status(200).json(likesArr);
//       });
//     } else {
//       return res.status(404).json('user not found');
//     }
//   } catch (error) {
//     return next(setError(500, error.message || 'Error finding liked authors'));
//   }
// };

//?---------------------------------------------------------------------------------
//! ----------------------------- GET LIKES SWITCH ---------------------------------
//?---------------------------------------------------------------------------------

const likes = async (favItem, mongooseItem, res) => {
  let likesArr = [];

  Promise.all(
    favItem.map(async (itemId) => {
      try {
        const item = await mongooseItem.findById(itemId);
        likesArr.push(item);
      } catch (error) {
        return res.status(404).json(error.message);
      }
    })
  ).then(async () => {
    return res.status(200).json(likesArr);
  });
};

const userLikes = async (req, res, next) => {
  const { element } = req.params;
  const { _id, favAuthors, favBooks, favGenres } = req.user;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json('user not found');
    }

    switch (element) {
      case 'authors':
        likes(favAuthors, Author, res);
        break;

      case 'books':
        likes(favBooks, Book, res);
        break;

      case 'genres':
        likes(favGenres, Genre, res);
        break;
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error finding likes'));
  }
};

//* ________________________________ delete _________________________________________

//?---------------------------------------------------------------------------------
//! --------------------------------- DELETE ---------------------------------------
//?---------------------------------------------------------------------------------

const deleteUser = async (req, res, next) => {
  //aquí NO hay que hacer destructuring porque la info la vamos a sacar del req.user
  try {
    await User.findByIdAndDelete(req.user?._id);
    deleteImgCloudinary(req.user?.image);

    //*----- TENEMOS QUE BORRAR TODO CON LO QUE SE RELACIONA EN EL MODELO -----------------

    try {
      await Author.updateMany(
        //metodo .updateMany(filter, update, options)  segun mongoDB
        { likes: req.user?._id },
        { $pull: { likes: req.user?._id } }
      );
      try {
        await Book.updateMany(
          { likes: req.user?._id },
          { $pull: { likes: req.user?._id } }
        );

        try {
          await Genre.updateMany(
            { likes: req.user?._id },
            { $pull: { likes: req.user?._id } }
          );

          try {
            await Book.updateMany(
              { readings: req.user?._id },
              { $pull: { readings: req.user?._id } }
            );

            try {
              await Review.updateMany(
                { postedBy: req.user?._id },
                { $pull: { postedBy: req.user?._id } }
              );

              try {
                await Review.updateMany(
                  { likes: req.user?._id },
                  { $pull: { likes: req.user?._id } }
                );

                try {
                  await User.updateMany(
                    { followers: req.user?._id },
                    { $pull: { followers: req.user?._id } }
                  );

                  //lo buscamos pa ver si se ha borrado correctamente
                  const userTest = await User.findById(req.user?._id);
                  return res
                    .status(userTest ? 404 : 200)
                    .json({ deleteTest: userTest ? false : true });
                } catch (error) {
                  return res.status(404).json({
                    error: 'error catch updating users',
                    message: error.message,
                  });
                }
              } catch (error) {
                return res.status(404).json({
                  error: 'error catch updating reviews',
                  message: error.message,
                });
              }
            } catch (error) {
              return res.status(404).json({
                error: 'error catch updating reviews',
                message: error.message,
              });
            }
          } catch (error) {
            return res.status(404).json({
              error: 'error catch updating books',
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error catch updating genres',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error catch updating books',
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
    return next(setError(500, error.message || 'Error general to DELETE'));
  }
};

module.exports = {
  getReadBooks,
  userRegister,
  stateRegister,
  redirectRegister,
  sendCode,
  login,
  autoLogin,
  resendCode,
  userById,
  userByUserName,
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
  followUser,
  userLikes,
};
