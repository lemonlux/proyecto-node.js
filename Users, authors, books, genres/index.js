//!-1--- IMPORTACIONES

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

//!----- conexion con la db

const connect = require('./src/utils/db');
connect();

//!--2--- CONEXION CON CLOUDINARY --

const { configCloudinary } = require('./src/middleware/files.middleware');
configCloudinary();

//!--3--- VARIABLES CONSTANTES - PORT

const PORT = process.env.PORT;

//!--4--- SERVIDOR WEB Y CORS
const app = express();

//npm i cors

const cors = require('cors');
app.use(cors());

//!--5---- LÍMITES JSON EN EL BACK END

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: false }));

//!----- importación de rutas

const UserRoutes = require('./src/api/routes/User.routes');
app.use('/api/v1/users/', UserRoutes);

const AuthorRoutes = require('./src/api/routes/Author.routes');
app.use('/api/v1/authors/', AuthorRoutes);

const BookRoutes = require('./src/api/routes/Book.routes');
app.use('/api/v1/books/', BookRoutes);

const GenreRoutes = require('./src/api/routes/Genre.routes');
app.use('/api/v1/genres/', GenreRoutes);

const ReviewRoutes = require('./src/api/routes/Review.routes');
app.use('/api/v1/reviews/', ReviewRoutes);

//!---6---- ERRORES DE RUTA Y CRASH

app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  return next(error);
});

app.use((error, req, res) => {
  return res
    .status(error.status || 500)
    .json(error.message || 'unexpected error');
});

//!------ escuchar el puerto

app.disable('x-powered-by');
app.listen(PORT, () => {
  console.log(`💻 Server listening on port: 📍http://localhost:${PORT}`);
});
