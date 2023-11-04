//! realizamos las importaciones
const bcrypt = require('bcrypt');
const validator = require('validator');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      trim: true, //elimina los espacios en blanco de ambos extremos del string
      unique: true,
      validate: [validator.isEmail, 'Email is not valid'], // check if the string is an email.
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword], // check if the string can be considered a strong password or not
    },
    gender: {
      type: String,
      required: true,
      enum: ['hombre', 'mujer', 'no binario'],
    },
    rol: {
      type: String,
      enum: ['admin', 'user', 'superadmin'],
      default: 'user',
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    check: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: false,
    },
    favBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    favAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }],
    favGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10); //hash(password, cuantas veces)
    next();
  } catch (error) {
    next('Error hasing password', error);
  }
});

//!--- modelo de datos

const User = mongoose.model('User', userSchema);

//! exportamos

module.exports = User;
