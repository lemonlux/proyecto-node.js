const normalizeFunction = require('../utils/normalize')



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
  const enumStringNormalize = normalizeFunction(enumLanguage.toString())
  const arrayLanguageNormalized = enumStringNormalize.split(',')
  if (arrayLanguageNormalized.includes(language)){
    return true
  }else{
    return false
  }
}

const validEnumGenre = (genre) =>{
  const enumGenre = [
    'Narrativo', 'Didáctico', 'Dramático/Teatral', 'Lírico', 'Poético'
  ]
  if (enumGenre.includes(genre)){
    return true
  }else{
    return false
  }
}

const validEnumRating = (rating) =>{
  const enumRating = [ 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  if (enumRating.includes(rating)){
    return true
  }else{
    return false
  }
}


module.exports = { validEnumGender, validEnumLanguage, validEnumGenre, validEnumRating };



