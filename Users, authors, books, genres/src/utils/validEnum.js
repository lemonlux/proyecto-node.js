const validEnumGender = (gender) => {
  console.log('hola');
  const enumGender = ['hombre', 'mujer', 'no binario'];
  if (enumGender.includes(gender)) {
    return true;
  } else {
    return false;
  }
};


const validEnumLanguage = (language) => {
  const enumLanguage = ['español', 'inglés', 'francés', 'alemán', 'italiano', 'portugués']
  if (enumLanguage.includes(language)){
    return true
  }else{
    return false
  }
}

const validEnumGenre = (genre) =>{
  const enumGenre = [
    'Poesía',
    'Teatro',
    'Cuento',
    'Novela ciencia ficción',
    'Novela romántica',
    'Novela policíaca',
    'Novela fantasía',
    'Novela intimista',
    'Novela ilustrada',
    'Novela histórica',
    'Ensayo',
    'Biografía',
    'Ciencia/Divulgación',
    'Cómic'
  ]
  if (enumGenre.includes(genre)){
    return true
  }else{
    return false
  }
}




module.exports = { validEnumGender, validEnumLanguage, validEnumGenre };



